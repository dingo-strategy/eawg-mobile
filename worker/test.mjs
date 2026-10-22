// Test voor de accountserver. Eerst lokaal starten:
//   npx wrangler d1 execute eawg-accounts --local --file=worker/schema.sql
//   npx wrangler dev --local --port 8788
// Daarna: node worker/test.mjs   (optioneel: BASE=http://localhost:8788)
//
// Opmerking: Node's fetch bewaart geen cookies. Het script leest Set-Cookie zelf
// en stuurt de cookie handmatig mee (ook de Secure-cookie over http://localhost).

import { execSync } from "node:child_process";

const BASE = process.env.BASE || "http://localhost:8788";
const ORIGIN = new URL(BASE).origin;
const RUN = Date.now().toString(36).slice(-5);
let pass = 0, failN = 0;
const results = [];

function check(name, cond, extra = "") {
  if (cond) pass++; else failN++;
  const line = `${cond ? "PASS" : "FAIL"}  ${name}${!cond && extra ? "  -> " + extra : ""}`;
  results.push(line);
  console.log(line);
}

// Elke groep krijgt een eigen IP, zodat de beperkingen elkaar niet storen.
let ipCounter = 0;
const newIp = () => `10.${(Date.now() >> 8) & 255}.${(Date.now() >> 16) & 255}.${++ipCounter}`;

async function req(method, path, { body, cookie, origin = ORIGIN, ct = "application/json", ip, raw } = {}) {
  const headers = {};
  if (origin) headers["Origin"] = origin;
  if (ct && (body !== undefined || raw !== undefined)) headers["Content-Type"] = ct;
  if (cookie) headers["Cookie"] = cookie;
  if (ip) headers["CF-Connecting-IP"] = ip;
  const res = await fetch(BASE + path, {
    method, headers,
    body: raw !== undefined ? raw : body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  const setCookie = res.headers.get("set-cookie") || "";
  const m = setCookie.match(/eawg_sid=([^;]*)/);
  return { status: res.status, data, text, headers: res.headers, setCookie, cookie: m && m[1] ? `eawg_sid=${m[1]}` : null };
}

function d1(sql) {
  const out = execSync(`npx wrangler d1 execute eawg-accounts --local --json --command "${sql}"`, {
    encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
  });
  const parsed = JSON.parse(out.slice(out.indexOf("[")));
  return parsed[0].results;
}

const IP = newIp();
const user = `Speler_${RUN}`;
const pw = "geheim-wachtwoord-1";

// 1. Account maken
let r = await req("POST", "/api/register", { body: { username: user, password: pw }, ip: IP });
check("account maken geeft 201", r.status === 201, `${r.status} ${r.text}`);
check("herstelcode is 4 groepjes van 4 leesbare tekens", /^[2-9A-HJKMNP-Z]{4}(-[2-9A-HJKMNP-Z]{4}){3}$/.test(r.data?.recoveryCode || ""), r.data?.recoveryCode);
check("oorspronkelijke schrijfwijze teruggegeven", r.data?.username === user);
let session1 = r.cookie;
let recoveryCode = r.data?.recoveryCode;
check("cookie heeft HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age 30 dagen",
  /HttpOnly/i.test(r.setCookie) && /Secure/i.test(r.setCookie) && /SameSite=Lax/i.test(r.setCookie) &&
  /Path=\//.test(r.setCookie) && /Max-Age=2592000/.test(r.setCookie), r.setCookie);
check("antwoord heeft Cache-Control no-store en nosniff",
  r.headers.get("cache-control") === "no-store" && r.headers.get("x-content-type-options") === "nosniff");
const rows0 = d1(`SELECT pw_iter, length(pw_salt) AS sl, rc_hash FROM users WHERE username_lc = '${user.toLowerCase()}'`);
check("database: 100000 rondes en eigen zout opgeslagen, herstelcode niet leesbaar",
  rows0[0]?.pw_iter === 100000 && rows0[0]?.sl === 24 && !String(rows0[0]?.rc_hash).includes(recoveryCode.replace(/-/g, "")), JSON.stringify(rows0));
const sess0 = d1(`SELECT token_hash FROM sessions s JOIN users u ON u.id = s.user_id WHERE u.username_lc = '${user.toLowerCase()}'`);
check("database: sessietoken alleen als hash opgeslagen", sess0.length === 1 && sess0[0].token_hash !== session1.split("=")[1]);

// 2. Dubbele naam
r = await req("POST", "/api/register", { body: { username: user, password: pw }, ip: IP });
check("dubbele naam geweigerd (409)", r.status === 409, `${r.status}`);
r = await req("POST", "/api/register", { body: { username: user.toUpperCase(), password: pw }, ip: IP });
check("dubbele naam met andere hoofdletters geweigerd (409)", r.status === 409, `${r.status}`);

// 3. Invoercontrole
r = await req("POST", "/api/register", { body: { username: `kort_${RUN}`, password: "1234567" }, ip: IP });
check("te kort wachtwoord geweigerd (400)", r.status === 400 && !!r.data?.error, `${r.status}`);
r = await req("POST", "/api/register", { body: { username: `wwgelijk${RUN}`, password: `WWGELIJK${RUN}` }, ip: IP });
check("wachtwoord gelijk aan gebruikersnaam geweigerd (400)", r.status === 400, `${r.status}`);
for (const bad of ["ab", "naam met spatie", "a".repeat(21), "speler<script>", "émile"]) {
  r = await req("POST", "/api/register", { body: { username: bad, password: pw }, ip: IP });
  check(`ongeldige gebruikersnaam "${bad.slice(0, 15)}" geweigerd (400)`, r.status === 400, `${r.status}`);
}

// 4. Login
r = await req("POST", "/api/login", { body: { username: user.toLowerCase(), password: pw }, ip: IP });
check("juiste login (andere hoofdletters) geeft 200 en cookie", r.status === 200 && !!r.cookie && r.data?.username === user, `${r.status}`);
const session2 = r.cookie;
const wrongPw = await req("POST", "/api/login", { body: { username: user, password: "fout-wachtwoord" }, ip: IP });
check("fout wachtwoord geeft 401", wrongPw.status === 401, `${wrongPw.status}`);
const unknown = await req("POST", "/api/login", { body: { username: `bestaatniet_${RUN}`, password: "fout-wachtwoord" }, ip: IP });
check("onbekende gebruiker geeft 401", unknown.status === 401, `${unknown.status}`);
check("zelfde foutmelding bij onbekende gebruiker en fout wachtwoord", wrongPw.data?.error === unknown.data?.error, `${wrongPw.data?.error} / ${unknown.data?.error}`);

// Rekentijd vergelijken (gemiddelde van 3)
async function timeIt(username) {
  const t = [];
  for (let i = 0; i < 3; i++) {
    const s = performance.now();
    await req("POST", "/api/login", { body: { username, password: "nog-een-fout" }, ip: newIp() });
    t.push(performance.now() - s);
  }
  return t.reduce((a, b) => a + b) / t.length;
}
const tKnown = await timeIt(user), tUnknown = await timeIt(`onbekend_${RUN}`);
check(`vergelijkbare rekentijd (bestaand ${tKnown.toFixed(0)} ms, onbekend ${tUnknown.toFixed(0)} ms)`,
  Math.abs(tKnown - tUnknown) < Math.max(tKnown, tUnknown) * 0.5);

// 5. /me
r = await req("GET", "/api/me", { cookie: session1 });
check("/me met sessie geeft gebruikersnaam", r.status === 200 && r.data?.username === user, `${r.status}`);
r = await req("GET", "/api/me");
check("/me zonder sessie geeft 401", r.status === 401, `${r.status}`);
r = await req("GET", "/api/me", { cookie: "eawg_sid=" + "A".repeat(43) });
check("/me met verzonnen token geeft 401", r.status === 401, `${r.status}`);
r = await req("GET", "/api/save");
check("GET /save zonder sessie geeft 401", r.status === 401, `${r.status}`);

// 6. Opslag
r = await req("GET", "/api/save", { cookie: session1 });
check("lege opslag geeft data null", r.status === 200 && r.data?.data === null, r.text);
const save = JSON.stringify({ seizoen: 3, team: "EAWG", spelers: [1, 2, 3] });
r = await req("PUT", "/api/save", { cookie: session1, body: { data: save } });
check("opslag schrijven geeft ok en updated", r.status === 200 && r.data?.ok === true && typeof r.data?.updated === "number", r.text);
const updated = r.data?.updated;
r = await req("GET", "/api/save", { cookie: session2 });
check("opslag lezen (andere sessie) geeft dezelfde data", r.data?.data === save && r.data?.updated === updated, r.text);
const big = JSON.stringify({ x: "a".repeat(200000) });
r = await req("PUT", "/api/save", { cookie: session1, body: { data: big } });
check("te grote opslag geeft 413", r.status === 413, `${r.status}`);
const huge = "x".repeat(2 * 1024 * 1024);
r = await req("PUT", "/api/save", { cookie: session1, raw: JSON.stringify({ data: huge }) });
check("te groot verzoek (2 MB) geeft 413", r.status === 413, `${r.status}`);
r = await req("PUT", "/api/save", { cookie: session1, body: { data: "{niet: geldig" } });
check("opslag met ongeldige JSON geweigerd (400)", r.status === 400, `${r.status}`);
r = await req("PUT", "/api/save", { cookie: session1, raw: "{dit is geen json" });
check("verzoek dat zelf geen JSON is geweigerd (400)", r.status === 400, `${r.status}`);
r = await req("PUT", "/api/save", { body: { data: save } });
check("PUT /save zonder sessie geeft 401", r.status === 401, `${r.status}`);

// 7. Origin en Content-Type
r = await req("POST", "/api/login", { body: { username: user, password: pw }, origin: "https://kwaadaardig.example", ip: IP });
check("POST met verkeerde Origin geeft 403", r.status === 403, `${r.status}`);
r = await req("POST", "/api/login", { body: { username: user, password: pw }, origin: null, ip: IP });
check("POST zonder Origin geeft 403", r.status === 403, `${r.status}`);
r = await req("POST", "/api/login", { raw: `{"username":"${user}","password":"${pw}"}`, ct: "text/plain", ip: IP });
check("POST zonder JSON-type geeft 403 of 415", r.status === 403 || r.status === 415, `${r.status}`);
r = await req("POST", "/api/login", { raw: "username=a&password=b", ct: "application/x-www-form-urlencoded", ip: IP });
check("POST als formulier geeft 403 of 415", r.status === 403 || r.status === 415, `${r.status}`);

// 8. Uitloggen
r = await req("POST", "/api/logout", { cookie: session2, body: {} });
check("uitloggen geeft ok en wist de cookie", r.status === 200 && /Max-Age=0/.test(r.setCookie), r.setCookie);
r = await req("GET", "/api/me", { cookie: session2 });
check("sessie na uitloggen ongeldig (401)", r.status === 401, `${r.status}`);
r = await req("GET", "/api/me", { cookie: session1 });
check("andere sessie blijft geldig na uitloggen", r.status === 200, `${r.status}`);

// 9. Herstel
const IP2 = newIp();
r = await req("POST", "/api/recover", { body: { username: user, recoveryCode: "AAAA-BBBB-CCCC-DDDD", newPassword: "nieuw-wachtwoord-2" }, ip: IP2 });
check("herstel met foute code geeft 401", r.status === 401, `${r.status}`);
r = await req("POST", "/api/login", { body: { username: user, password: pw }, ip: IP2 });
check("na foute herstelcode werkt het oude wachtwoord nog", r.status === 200, `${r.status}`);
const session3 = r.cookie;
r = await req("POST", "/api/recover", { body: { username: user.toUpperCase(), recoveryCode: recoveryCode.toLowerCase(), newPassword: "nieuw-wachtwoord-2" }, ip: IP2 });
check("herstel met goede code (kleine letters) geeft 200 en nieuwe code", r.status === 200 && /^[2-9A-Z]{4}(-[2-9A-Z]{4}){3}$/.test(r.data?.recoveryCode || "") && r.data.recoveryCode !== recoveryCode, r.text);
const newCode = r.data?.recoveryCode;
const session4 = r.cookie;
r = await req("GET", "/api/me", { cookie: session1 });
check("oude sessie 1 werkt niet meer na herstel", r.status === 401, `${r.status}`);
r = await req("GET", "/api/me", { cookie: session3 });
check("oude sessie 3 werkt niet meer na herstel", r.status === 401, `${r.status}`);
r = await req("GET", "/api/me", { cookie: session4 });
check("nieuwe sessie na herstel werkt", r.status === 200, `${r.status}`);
r = await req("POST", "/api/login", { body: { username: user, password: pw }, ip: IP2 });
check("oud wachtwoord werkt niet meer na herstel", r.status === 401, `${r.status}`);
r = await req("POST", "/api/recover", { body: { username: user, recoveryCode, newPassword: "nog-een-ander-3" }, ip: IP2 });
check("oude herstelcode is ongeldig na gebruik", r.status === 401, `${r.status}`);
r = await req("GET", "/api/save", { cookie: session4 });
check("opslag blijft bewaard na herstel", r.data?.data === save, r.text);

// 10. Wachtwoord wijzigen
r = await req("POST", "/api/login", { body: { username: user, password: "nieuw-wachtwoord-2" }, ip: IP2 });
const session5 = r.cookie;
check("login met hersteld wachtwoord", r.status === 200, `${r.status}`);
r = await req("POST", "/api/password", { cookie: session4, body: { oldPassword: "fout-oud", newPassword: "derde-wachtwoord-4" }, ip: IP2 });
check("wachtwoord wijzigen met fout oud wachtwoord geeft 401", r.status === 401, `${r.status}`);
r = await req("POST", "/api/password", { cookie: session4, body: { oldPassword: "nieuw-wachtwoord-2", newPassword: "kort" }, ip: IP2 });
check("wachtwoord wijzigen naar te kort wachtwoord geeft 400", r.status === 400, `${r.status}`);
r = await req("POST", "/api/password", { cookie: session4, body: { oldPassword: "nieuw-wachtwoord-2", newPassword: "derde-wachtwoord-4" }, ip: IP2 });
check("wachtwoord wijzigen geeft ok", r.status === 200, r.text);
r = await req("GET", "/api/me", { cookie: session4 });
check("huidige sessie blijft geldig na wijzigen", r.status === 200, `${r.status}`);
r = await req("GET", "/api/me", { cookie: session5 });
check("andere sessie gewist na wijzigen", r.status === 401, `${r.status}`);
r = await req("POST", "/api/login", { body: { username: user, password: "derde-wachtwoord-4" }, ip: IP2 });
check("login met nieuw wachtwoord", r.status === 200, `${r.status}`);
r = await req("POST", "/api/password", { body: { oldPassword: "a", newPassword: "derde-wachtwoord-4" }, ip: IP2 });
check("wachtwoord wijzigen zonder sessie geeft 401", r.status === 401, `${r.status}`);

// 11. Beperking van pogingen: login
const IP3 = newIp();
const rlUser = `slot_${RUN}`;
r = await req("POST", "/api/register", { body: { username: rlUser, password: pw }, ip: IP3 });
const statuses = [];
for (let i = 1; i <= 9; i++) {
  r = await req("POST", "/api/login", { body: { username: rlUser, password: "fout-" + i + "-xxxx" }, ip: IP3 });
  statuses.push(r.status);
}
check(`8 foute logins geven 401, de 9e geeft 429 (${statuses.join(",")})`,
  statuses.slice(0, 8).every((s) => s === 401) && statuses[8] === 429);
check("429 heeft een Retry-After", Number(r.headers.get("retry-after")) > 0, r.headers.get("retry-after"));
r = await req("POST", "/api/login", { body: { username: rlUser, password: pw }, ip: IP3 });
check("ook het juiste wachtwoord is tijdelijk geblokkeerd (429)", r.status === 429, `${r.status}`);
r = await req("POST", "/api/login", { body: { username: rlUser, password: pw }, ip: newIp() });
check("vanaf een ander IP lukt de login wel", r.status === 200, `${r.status}`);

// Beperking: herstel
const IP4 = newIp();
const rs = [];
for (let i = 1; i <= 9; i++) {
  r = await req("POST", "/api/recover", { body: { username: rlUser, recoveryCode: "2222-3333-4444-555" + (i % 9 + 1), newPassword: "nieuw-wachtwoord-x" }, ip: IP4 });
  rs.push(r.status);
}
check(`herstel: 9e foute poging geeft 429 (${rs.join(",")})`, rs.slice(0, 8).every((s) => s === 401) && rs[8] === 429);

// Beperking: 30 per uur per IP (verschillende gebruikersnamen)
const IP5 = newIp();
let first429 = 0;
for (let i = 1; i <= 31; i++) {
  r = await req("POST", "/api/login", { body: { username: `x${i}_${RUN}`, password: "fout-wachtwoord" }, ip: IP5 });
  if (r.status === 429 && !first429) first429 = i;
}
check(`per IP: de 31e foute login geeft 429 (eerste 429 bij poging ${first429})`, first429 === 31);

// Beperking: register
const IP6 = newIp();
const regs = [];
for (let i = 1; i <= 11; i++) {
  r = await req("POST", "/api/register", { body: { username: `reg${i}_${RUN}`, password: pw }, ip: IP6 });
  regs.push(r.status);
}
check(`register: 10 accounts per uur per IP, 11e geeft 429 (${regs.join(",")})`, regs.slice(0, 10).every((s) => s === 201) && regs[10] === 429);

// 12. Statische bestanden
r = await req("GET", "/index.html", { origin: null });
check("statische /index.html wordt geserveerd", r.status === 200 && /<html/i.test(r.text), `${r.status}`);
r = await req("GET", "/", { origin: null });
check("statische / wordt geserveerd", r.status === 200 && /<html/i.test(r.text), `${r.status}`);
r = await req("GET", "/roster.json", { origin: null });
check("statische /roster.json wordt geserveerd", r.status === 200, `${r.status}`);
r = await req("GET", "/api/bestaatniet");
check("onbekend /api/-pad geeft JSON 404", r.status === 404 && !!r.data?.error, `${r.status}`);

// 13. Account verwijderen
r = await req("DELETE", "/api/account", { cookie: session4, body: { password: "fout-wachtwoord" }, ip: IP2 });
check("verwijderen met fout wachtwoord geeft 401", r.status === 401, `${r.status}`);
r = await req("DELETE", "/api/account", { cookie: session4, body: { password: "derde-wachtwoord-4" }, origin: "https://kwaadaardig.example", ip: IP2 });
check("verwijderen met verkeerde Origin geeft 403", r.status === 403, `${r.status}`);
r = await req("DELETE", "/api/account", { cookie: session4, body: { password: "derde-wachtwoord-4" }, ip: IP2 });
check("verwijderen geeft ok en wist de cookie", r.status === 200 && /Max-Age=0/.test(r.setCookie), r.text);
r = await req("GET", "/api/me", { cookie: session4 });
check("sessie na verwijderen ongeldig", r.status === 401, `${r.status}`);
const lc = user.toLowerCase();
const left = d1(
  `SELECT (SELECT COUNT(*) FROM users WHERE username_lc = '${lc}') AS u, ` +
  `(SELECT COUNT(*) FROM sessions WHERE user_id NOT IN (SELECT id FROM users)) AS s, ` +
  `(SELECT COUNT(*) FROM saves WHERE user_id NOT IN (SELECT id FROM users)) AS v, ` +
  `(SELECT COUNT(*) FROM attempts WHERE key = '${lc}') AS a`
)[0];
check(`database: geen rijen over na verwijderen (users ${left.u}, sessies ${left.s}, saves ${left.v}, pogingen ${left.a})`,
  left.u === 0 && left.s === 0 && left.v === 0 && left.a === 0);
r = await req("POST", "/api/login", { body: { username: user, password: "derde-wachtwoord-4" }, ip: newIp() });
check("login na verwijderen lukt niet", r.status === 401, `${r.status}`);

console.log(`\nTotaal: ${pass} PASS, ${failN} FAIL`);
process.exit(failN ? 1 : 0);
