// EAWG Mobile: accountserver (Cloudflare Worker + D1).
// Alleen paden onder /api/ worden hier behandeld; al de rest gaat naar de statische bestanden.
// Geen npm-pakketten: alleen WebCrypto (crypto.subtle) en de D1-binding DB.
// Belangrijk: nooit wachtwoorden, herstelcodes of tokens loggen.

export { Room } from "./room.js";

const PBKDF2_ITER = 100000;                // maximum dat Workers toelaat
const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
const COOKIE = "eawg_sid";
const MAX_BODY = 16 * 1024;                 // gewone verzoeken
const MAX_BODY_SAVE = 1024 * 1024;          // opslag: 200000 tekens kan als JSON-tekst groter uitvallen in bytes
const MAX_SAVE_CHARS = 200000;
const RC_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // geen 0, O, 1, I, L
const USERNAME_RE = /^[A-Za-z0-9._-]{3,20}$/;

const MIN = 60 * 1000;
const LIMIT_USER_FAILS = 8;    // per IP + gebruikersnaam per 15 minuten
const LIMIT_IP_FAILS = 30;     // per IP per uur
const LIMIT_REGISTER = 10;     // nieuwe accounts per IP per uur

const enc = new TextEncoder();

// ---------- antwoorden ----------

function json(status, body, extraHeaders = {}) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  for (const [k, v] of Object.entries(extraHeaders)) {
    if (k.toLowerCase() === "set-cookie") headers.append("Set-Cookie", v);
    else headers.set(k, v);
  }
  return new Response(JSON.stringify(body), { status, headers });
}
const fail = (status, error, extra) => json(status, { error }, extra);

function sessionCookie(token) {
  return `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}`;
}
function clearCookie() {
  return `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

class HttpError extends Error {
  constructor(status, message, headers) {
    super(message);
    this.status = status;
    this.headers = headers || {};
  }
}

// ---------- hulpjes voor bytes ----------

function b64(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function unb64(str) {
  const s = atob(str);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
function b64url(bytes) {
  return b64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomBytes(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}
// Vergelijking in constante tijd: loopt altijd over alle bytes.
function safeEqual(a, b) {
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a[i % a.length] | 0) ^ (b[i % b.length] | 0);
  return diff === 0;
}

// ---------- hashen ----------

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return new Uint8Array(bits);
}
async function sha256(bytes) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}
async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await pbkdf2(password, salt, PBKDF2_ITER);
  return { pw_hash: b64(hash), pw_salt: b64(salt), pw_iter: PBKDF2_ITER };
}
async function verifyPassword(password, user) {
  const hash = await pbkdf2(password, unb64(user.pw_salt), user.pw_iter);
  return safeEqual(hash, unb64(user.pw_hash));
}
// Nep-hash bij een onbekende gebruiker, zodat de rekentijd gelijk blijft.
const DUMMY_SALT = new Uint8Array(16);
async function dummyPasswordWork(password) {
  const h = await pbkdf2(password, DUMMY_SALT, PBKDF2_ITER);
  safeEqual(h, new Uint8Array(32));
  return false;
}

// Herstelcode: 16 tekens uit een leesbaar alfabet (31 tekens, ongeveer 79 bits).
// Omdat de code zelf willekeurig en lang is, volstaat SHA-256 met een eigen zout.
function newRecoveryCode() {
  let code = "";
  while (code.length < 16) {
    for (const b of randomBytes(32)) {
      if (b < 248 && code.length < 16) code += RC_ALPHABET[b % RC_ALPHABET.length]; // 248 = 8 x 31, geen voorkeur
    }
  }
  return code;
}
function formatCode(code) {
  return code.match(/.{4}/g).join("-");
}
function normalizeCode(input) {
  return String(input).toUpperCase().replace(/[\s-]/g, "");
}
async function hashRecovery(code, salt) {
  const c = enc.encode(code);
  const buf = new Uint8Array(salt.length + c.length);
  buf.set(salt, 0);
  buf.set(c, salt.length);
  return sha256(buf);
}
async function makeRecovery() {
  const code = newRecoveryCode();
  const salt = randomBytes(16);
  const hash = await hashRecovery(code, salt);
  return { code, rc_hash: b64(hash), rc_salt: b64(salt) };
}

// ---------- sessies ----------

async function tokenHash(token) {
  return b64url(await sha256(enc.encode(token)));
}
async function createSession(env, userId) {
  const token = b64url(randomBytes(32));
  const now = Date.now();
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires, created) VALUES (?, ?, ?, ?)")
    .bind(await tokenHash(token), userId, now + SESSION_MS, now).run();
  return token;
}
function readCookie(request) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === COOKIE) {
      const v = part.slice(i + 1).trim();
      return /^[A-Za-z0-9_-]{43}$/.test(v) ? v : null;
    }
  }
  return null;
}
async function getSession(request, env) {
  const token = readCookie(request);
  if (!token) return null;
  const th = await tokenHash(token);
  const row = await env.DB.prepare(
    "SELECT s.token_hash, s.user_id, u.username, u.username_lc, u.pw_hash, u.pw_salt, u.pw_iter " +
    "FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires > ?"
  ).bind(th, Date.now()).first();
  return row || null;
}
async function requireSession(request, env) {
  const s = await getSession(request, env);
  if (!s) throw new HttpError(401, "Niet ingelogd.");
  return s;
}

// ---------- beperking van pogingen ----------

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || "onbekend";
}
function tooMany(retryMs) {
  const sec = Math.max(1, Math.ceil(retryMs / 1000));
  return new HttpError(429, "Te veel pogingen. Probeer het later opnieuw.", { "Retry-After": String(sec) });
}
// Kijkt of login of herstel nog mag voor deze IP en gebruikersnaam.
async function checkFailLimits(env, ip, key) {
  const now = Date.now();
  const r1 = await env.DB.prepare(
    "SELECT COUNT(*) AS n, MIN(ts) AS first FROM attempts WHERE ip = ? AND key = ? AND kind IN ('login','recover') AND ts > ?"
  ).bind(ip, key, now - 15 * MIN).first();
  if (r1.n >= LIMIT_USER_FAILS) throw tooMany(r1.first + 15 * MIN - now);
  const r2 = await env.DB.prepare(
    "SELECT COUNT(*) AS n, MIN(ts) AS first FROM attempts WHERE ip = ? AND kind IN ('login','recover') AND ts > ?"
  ).bind(ip, now - 60 * MIN).first();
  if (r2.n >= LIMIT_IP_FAILS) throw tooMany(r2.first + 60 * MIN - now);
}
async function recordFail(env, kind, ip, key) {
  await env.DB.prepare("INSERT INTO attempts (kind, ip, key, ts) VALUES (?, ?, ?, ?)")
    .bind(kind, ip, key, Date.now()).run();
}
async function clearFails(env, ip, key) {
  await env.DB.prepare("DELETE FROM attempts WHERE ip = ? AND key = ? AND kind IN ('login','recover')")
    .bind(ip, key).run();
}

// Opruimen bij gelegenheid: verlopen sessies en oude pogingen.
async function cleanup(env) {
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires <= ?").bind(now),
    env.DB.prepare("DELETE FROM attempts WHERE ts < ?").bind(now - 2 * 60 * MIN),
  ]);
}

// ---------- invoer ----------

async function readJson(request, maxBytes) {
  const len = Number(request.headers.get("Content-Length") || "0");
  if (len > maxBytes) throw new HttpError(413, "Verzoek is te groot.");
  const buf = await request.arrayBuffer();
  if (buf.byteLength > maxBytes) throw new HttpError(413, "Verzoek is te groot.");
  let body;
  try {
    body = JSON.parse(new TextDecoder().decode(buf));
  } catch {
    throw new HttpError(400, "Ongeldige JSON.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "Ongeldige invoer.");
  return body;
}
function str(v) {
  return typeof v === "string" ? v : null;
}
function checkUsername(u) {
  if (u === null || !USERNAME_RE.test(u)) {
    throw new HttpError(400, "Gebruikersnaam: 3 tot 20 tekens, alleen letters, cijfers, punt, streepje en underscore.");
  }
}
function checkNewPassword(pw, username) {
  if (pw === null || pw.length < 8) throw new HttpError(400, "Wachtwoord moet minstens 8 tekens hebben.");
  if (pw.length > 128) throw new HttpError(400, "Wachtwoord mag maximaal 128 tekens hebben.");
  if (username && pw.toLowerCase() === username.toLowerCase()) {
    throw new HttpError(400, "Wachtwoord mag niet gelijk zijn aan de gebruikersnaam.");
  }
}
// Schrijvende verzoeken: eigen Origin en JSON verplicht.
function checkWriteRequest(request, url) {
  const origin = request.headers.get("Origin");
  if (!origin || origin !== url.origin) throw new HttpError(403, "Verzoek van een andere herkomst geweigerd.");
  const ct = (request.headers.get("Content-Type") || "").toLowerCase();
  if (!ct.startsWith("application/json")) throw new HttpError(415, "Content-Type moet application/json zijn.");
}

// ---------- routes ----------

async function register(request, env) {
  const ip = clientIp(request);
  const body = await readJson(request, MAX_BODY);
  const username = str(body.username);
  const password = str(body.password);
  checkUsername(username);
  checkNewPassword(password, username);

  const now = Date.now();
  const r = await env.DB.prepare(
    "SELECT COUNT(*) AS n, MIN(ts) AS first FROM attempts WHERE ip = ? AND kind = 'register' AND ts > ?"
  ).bind(ip, now - 60 * MIN).first();
  if (r.n >= LIMIT_REGISTER) throw tooMany(r.first + 60 * MIN - now);

  const lc = username.toLowerCase();
  const exists = await env.DB.prepare("SELECT 1 FROM users WHERE username_lc = ?").bind(lc).first();
  if (exists) throw new HttpError(409, "Deze gebruikersnaam is al in gebruik.");

  const pw = await hashPassword(password);
  const rc = await makeRecovery();
  let userId;
  try {
    const row = await env.DB.prepare(
      "INSERT INTO users (username, username_lc, pw_hash, pw_salt, pw_iter, rc_hash, rc_salt, created) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id"
    ).bind(username, lc, pw.pw_hash, pw.pw_salt, pw.pw_iter, rc.rc_hash, rc.rc_salt, now).first();
    userId = row.id;
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE")) throw new HttpError(409, "Deze gebruikersnaam is al in gebruik.");
    throw e;
  }
  await env.DB.prepare("INSERT INTO attempts (kind, ip, key, ts) VALUES ('register', ?, '', ?)").bind(ip, now).run();
  const token = await createSession(env, userId);
  return json(201, { ok: true, username, recoveryCode: formatCode(rc.code) }, { "Set-Cookie": sessionCookie(token) });
}

async function login(request, env) {
  const ip = clientIp(request);
  const body = await readJson(request, MAX_BODY);
  const username = str(body.username);
  const password = str(body.password);
  const WRONG = "Gebruikersnaam of wachtwoord klopt niet.";
  if (username === null || password === null || username.length > 64 || password.length > 128) {
    throw new HttpError(400, "Vul gebruikersnaam en wachtwoord in.");
  }
  const lc = username.toLowerCase();
  await checkFailLimits(env, ip, lc);

  const user = await env.DB.prepare(
    "SELECT id, username, pw_hash, pw_salt, pw_iter FROM users WHERE username_lc = ?"
  ).bind(lc).first();
  const ok = user ? await verifyPassword(password, user) : await dummyPasswordWork(password);
  if (!ok) {
    await recordFail(env, "login", ip, lc);
    throw new HttpError(401, WRONG);
  }
  await clearFails(env, ip, lc);
  // Rondes verhoogd sinds het account gemaakt werd? Dan nu opnieuw hashen.
  if (user.pw_iter < PBKDF2_ITER) {
    const pw = await hashPassword(password);
    await env.DB.prepare("UPDATE users SET pw_hash = ?, pw_salt = ?, pw_iter = ? WHERE id = ?")
      .bind(pw.pw_hash, pw.pw_salt, pw.pw_iter, user.id).run();
  }
  const token = await createSession(env, user.id);
  return json(200, { ok: true, username: user.username }, { "Set-Cookie": sessionCookie(token) });
}

async function logout(request, env) {
  await readJson(request, MAX_BODY);
  const token = readCookie(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await tokenHash(token)).run();
  return json(200, { ok: true }, { "Set-Cookie": clearCookie() });
}

async function me(request, env) {
  const s = await requireSession(request, env);
  return json(200, { username: s.username });
}

async function getSave(request, env) {
  const s = await requireSession(request, env);
  const row = await env.DB.prepare("SELECT data, updated FROM saves WHERE user_id = ?").bind(s.user_id).first();
  return json(200, { data: row ? row.data : null, updated: row ? row.updated : null });
}

async function putSave(request, env) {
  const s = await requireSession(request, env);
  const body = await readJson(request, MAX_BODY_SAVE);
  const data = str(body.data);
  if (data === null) throw new HttpError(400, "Veld data moet een tekst zijn.");
  if (data.length > MAX_SAVE_CHARS) throw new HttpError(413, "Opslag is te groot (maximaal 200000 tekens).");
  try {
    JSON.parse(data);
  } catch {
    throw new HttpError(400, "Opslag is geen geldige JSON.");
  }
  const updated = Date.now();
  await env.DB.prepare(
    "INSERT INTO saves (user_id, data, updated) VALUES (?, ?, ?) " +
    "ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated = excluded.updated"
  ).bind(s.user_id, data, updated).run();
  return json(200, { ok: true, updated });
}

async function recover(request, env) {
  const ip = clientIp(request);
  const body = await readJson(request, MAX_BODY);
  const username = str(body.username);
  const code = str(body.recoveryCode);
  const newPassword = str(body.newPassword);
  const WRONG = "Gebruikersnaam of herstelcode klopt niet.";
  if (username === null || code === null || username.length > 64 || code.length > 64) {
    throw new HttpError(400, "Vul gebruikersnaam en herstelcode in.");
  }
  checkNewPassword(newPassword, username);
  const lc = username.toLowerCase();
  await checkFailLimits(env, ip, lc);

  const user = await env.DB.prepare("SELECT id, username, rc_hash, rc_salt FROM users WHERE username_lc = ?")
    .bind(lc).first();
  const norm = normalizeCode(code);
  let ok = false;
  if (user) {
    const h = await hashRecovery(norm, unb64(user.rc_salt));
    ok = safeEqual(h, unb64(user.rc_hash));
  } else {
    safeEqual(await hashRecovery(norm, DUMMY_SALT), new Uint8Array(32));
  }
  if (!ok) {
    await recordFail(env, "recover", ip, lc);
    throw new HttpError(401, WRONG);
  }
  await clearFails(env, ip, lc);
  const pw = await hashPassword(newPassword);
  const rc = await makeRecovery();
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET pw_hash = ?, pw_salt = ?, pw_iter = ?, rc_hash = ?, rc_salt = ? WHERE id = ?")
      .bind(pw.pw_hash, pw.pw_salt, pw.pw_iter, rc.rc_hash, rc.rc_salt, user.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(user.id),
  ]);
  const token = await createSession(env, user.id);
  return json(200, { ok: true, username: user.username, recoveryCode: formatCode(rc.code) },
    { "Set-Cookie": sessionCookie(token) });
}

async function changePassword(request, env) {
  const s = await requireSession(request, env);
  const ip = clientIp(request);
  const body = await readJson(request, MAX_BODY);
  const oldPassword = str(body.oldPassword);
  const newPassword = str(body.newPassword);
  if (oldPassword === null || oldPassword.length > 128) throw new HttpError(400, "Vul je huidige wachtwoord in.");
  checkNewPassword(newPassword, s.username);
  await checkFailLimits(env, ip, s.username_lc);
  if (!(await verifyPassword(oldPassword, s))) {
    await recordFail(env, "login", ip, s.username_lc);
    throw new HttpError(401, "Huidig wachtwoord klopt niet.");
  }
  const pw = await hashPassword(newPassword);
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET pw_hash = ?, pw_salt = ?, pw_iter = ? WHERE id = ?")
      .bind(pw.pw_hash, pw.pw_salt, pw.pw_iter, s.user_id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").bind(s.user_id, s.token_hash),
  ]);
  return json(200, { ok: true });
}

async function deleteAccount(request, env) {
  const s = await requireSession(request, env);
  const ip = clientIp(request);
  const body = await readJson(request, MAX_BODY);
  const password = str(body.password);
  if (password === null || password.length > 128) throw new HttpError(400, "Vul je wachtwoord in.");
  await checkFailLimits(env, ip, s.username_lc);
  if (!(await verifyPassword(password, s))) {
    await recordFail(env, "login", ip, s.username_lc);
    throw new HttpError(401, "Wachtwoord klopt niet.");
  }
  await env.DB.batch([
    env.DB.prepare("DELETE FROM saves WHERE user_id = ?").bind(s.user_id),
    env.DB.prepare("DELETE FROM redeemed WHERE user_id = ?").bind(s.user_id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(s.user_id),
    env.DB.prepare("DELETE FROM attempts WHERE key = ?").bind(s.username_lc),
    env.DB.prepare("DELETE FROM users WHERE id = ?").bind(s.user_id),
  ]);
  return json(200, { ok: true }, { "Set-Cookie": clearCookie() });
}

// ---------- muntcodes inwisselen (POST /api/redeem) ----------
// Een code ziet er zo uit: <bedrag>.<uitgiftedatum JJJJMMDD>.<nonce>.<handtekening>
// Handtekening = eerste 10 bytes van HMAC-SHA256(REDEEM_SECRET, "<bedrag>.<datum>.<nonce>"), in base32 (16 tekens).
// Hoofdletterongevoelig (alles wordt naar hoofdletters gezet). Eenmalig per account, max 500 munten, 30 dagen geldig.
// Maak codes met: node tools/maak_muntcode.mjs <bedrag>   (geheim in de omgevingsvariabele REDEEM_SECRET)

const REDEEM_MAX = 500;
const REDEEM_DAYS = 30;
const LIMIT_REDEEM_FAILS = 10;   // foute codes per account per uur
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const REDEEM_RE = /^([1-9][0-9]{0,3})\.(\d{8})\.([A-Z2-7]{6,12})\.([A-Z2-7]{16})$/;

function base32(bytes) {
  let bits = 0, val = 0, out = "";
  for (const b of bytes) {
    val = (val << 8) | b; bits += 8;
    while (bits >= 5) { out += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(val << (5 - bits)) & 31];
  return out;
}
async function redeemSig(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
  return base32(sig.slice(0, 10));
}
function parseDay(s) {
  const y = +s.slice(0, 4), m = +s.slice(4, 6), d = +s.slice(6, 8), t = Date.UTC(y, m - 1, d);
  const dt = new Date(t);
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? t : NaN;
}

async function redeem(request, env) {
  if (!env.REDEEM_SECRET) throw new HttpError(503, "Codes inwisselen staat nog niet aan.");
  const s = await requireSession(request, env);
  const ip = clientIp(request);
  const now = Date.now();
  const lim = await env.DB.prepare(
    "SELECT COUNT(*) AS n, MIN(ts) AS first FROM attempts WHERE kind = 'redeem' AND key = ? AND ts > ?"
  ).bind(s.username_lc, now - 60 * MIN).first();
  if (lim.n >= LIMIT_REDEEM_FAILS) throw tooMany(lim.first + 60 * MIN - now);
  const body = await readJson(request, MAX_BODY);
  const raw = str(body.code);
  if (raw === null || raw.length > 64) throw new HttpError(400, "Vul een code in.");
  const code = raw.toUpperCase().replace(/\s+/g, "");
  const bad = async () => {
    await recordFail(env, "redeem", ip, s.username_lc);
    return new HttpError(400, "Deze code klopt niet.");
  };
  const m = code.match(REDEEM_RE);
  if (!m) throw await bad();
  const [, amountS, dayS, nonce, sig] = m;
  const amount = Number(amountS);
  const want = await redeemSig(env.REDEEM_SECRET, `${amountS}.${dayS}.${nonce}`);
  if (!safeEqual(enc.encode(want), enc.encode(sig))) throw await bad();
  // vanaf hier is de code echt door ons uitgegeven
  if (amount < 1 || amount > REDEEM_MAX) throw new HttpError(400, `Een code is hoogstens ${REDEEM_MAX} munten waard.`);
  const issued = parseDay(dayS);
  if (!isFinite(issued) || issued > now + 24 * 60 * MIN) throw new HttpError(400, "Deze code klopt niet.");
  if (now - issued > REDEEM_DAYS * 24 * 60 * MIN) throw new HttpError(410, "Deze code is verlopen (langer dan 30 dagen geleden gemaakt).");
  const key = `${amountS}.${dayS}.${nonce}`;
  const row = await env.DB.prepare(
    "INSERT INTO redeemed (user_id, code, amount, ts) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, code) DO NOTHING RETURNING code"
  ).bind(s.user_id, key, amount, now).first();
  if (!row) throw new HttpError(409, "Deze code heb je al ingewisseld.");
  return json(200, { ok: true, amount, key });
}

// ---------- online kamers (Durable Object ROOM, zie room.js) ----------

const ROOM_CODE_LEN = 6;
const ROOM_CODE_RE = /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/;
const LIMIT_ROOMS = 20;        // nieuwe kamers per gebruiker per uur
const ROOM_RESERVED = new Set(["CREATE"]); // botst met het pad /api/room/create

function newRoomCode() {
  let code = "";
  while (code.length < ROOM_CODE_LEN) {
    for (const b of randomBytes(16)) {
      if (b < 248 && code.length < ROOM_CODE_LEN) code += RC_ALPHABET[b % RC_ALPHABET.length];
    }
  }
  return code;
}

async function createRoom(request, env) {
  const s = await requireSession(request, env);
  await readJson(request, MAX_BODY);
  const now = Date.now();
  const r = await env.DB.prepare(
    "SELECT COUNT(*) AS n, MIN(ts) AS first FROM attempts WHERE kind = 'room' AND key = ? AND ts > ?"
  ).bind(s.username_lc, now - 60 * MIN).first();
  if (r.n >= LIMIT_ROOMS) {
    const sec = Math.max(1, Math.ceil((r.first + 60 * MIN - now) / 1000));
    throw new HttpError(429, "Te veel nieuwe kamers. Probeer het later opnieuw.", { "Retry-After": String(sec) });
  }
  for (let i = 0; i < 5; i++) {
    const code = newRoomCode();
    if (ROOM_RESERVED.has(code)) continue;
    const stub = env.ROOM.get(env.ROOM.idFromName(code));
    const res = await stub.fetch("https://room/init", { method: "POST", headers: { "X-EAWG-User": s.username } });
    if (res.status === 201) {
      await env.DB.prepare("INSERT INTO attempts (kind, ip, key, ts) VALUES ('room', ?, ?, ?)")
        .bind(clientIp(request), s.username_lc, now).run();
      return json(201, { code });
    }
    if (res.status !== 409) throw new Error("kamer-init");
  }
  throw new HttpError(503, "Geen vrije kamercode gevonden. Probeer opnieuw.");
}

// GET /api/room/<code> met Upgrade: websocket.
async function joinRoom(request, env, url, rawCode) {
  if (request.method !== "GET") return fail(405, "Methode niet toegestaan.", { Allow: "GET" });
  const origin = request.headers.get("Origin");
  if (!origin || origin !== url.origin) return fail(403, "Verzoek van een andere herkomst geweigerd.");
  const s = await getSession(request, env);
  if (!s) return fail(401, "Niet ingelogd.");
  const code = String(rawCode).toUpperCase();
  if (!ROOM_CODE_RE.test(code) || ROOM_RESERVED.has(code)) return fail(404, "Kamer bestaat niet.");
  const stub = env.ROOM.get(env.ROOM.idFromName(code));
  // Nieuwe kopjes: de gebruikersnaam komt van de server, nooit van de speler zelf.
  const headers = new Headers();
  headers.set("X-EAWG-User", s.username);
  const up = request.headers.get("Upgrade");
  if (up) headers.set("Upgrade", up);
  for (const h of ["Sec-WebSocket-Key", "Sec-WebSocket-Version", "Sec-WebSocket-Extensions", "Sec-WebSocket-Protocol", "Connection"]) {
    const v = request.headers.get(h);
    if (v) headers.set(h, v);
  }
  const res = await stub.fetch("https://room/connect", { method: "GET", headers });
  if (res.status === 101) return res;
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

const ROUTES = {
  "/api/room/create": { POST: createRoom },
  "/api/register": { POST: register },
  "/api/login": { POST: login },
  "/api/logout": { POST: logout },
  "/api/me": { GET: me },
  "/api/save": { GET: getSave, PUT: putSave },
  "/api/recover": { POST: recover },
  "/api/password": { POST: changePassword },
  "/api/account": { DELETE: deleteAccount },
  "/api/redeem": { POST: redeem },
};

async function handleApi(request, env, ctx, url) {
  const route = ROUTES[url.pathname];
  if (!route) {
    const m = url.pathname.match(/^\/api\/room\/([^/]{1,16})$/);
    if (m) {
      try {
        return await joinRoom(request, env, url, m[1]);
      } catch (e) {
        if (e instanceof HttpError) return fail(e.status, e.message, e.headers);
        console.error("api-fout", "/api/room", e && e.name);
        return fail(500, "Serverfout. Probeer het later opnieuw.");
      }
    }
    return fail(404, "Onbekend adres.");
  }
  const handler = route[request.method];
  if (!handler) return fail(405, "Methode niet toegestaan.", { Allow: Object.keys(route).join(", ") });
  try {
    if (request.method !== "GET" && request.method !== "HEAD") checkWriteRequest(request, url);
    if (Math.random() < 0.05 && ctx && ctx.waitUntil) ctx.waitUntil(cleanup(env).catch(() => {}));
    return await handler(request, env);
  } catch (e) {
    if (e instanceof HttpError) return fail(e.status, e.message, e.headers);
    // Alleen het soort fout loggen, nooit de invoer.
    console.error("api-fout", url.pathname, e && e.name);
    return fail(500, "Serverfout. Probeer het later opnieuw.");
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      return handleApi(request, env, ctx, url);
    }
    return env.ASSETS.fetch(request);
  },
};
