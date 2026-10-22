// Test voor de online kamers (Durable Object Room). Eerst lokaal starten:
//   npx wrangler d1 execute eawg-accounts --local --file=worker/schema.sql
//   npx wrangler dev --local --port 8795
// Daarna: node worker/test_room.mjs   (optioneel: BASE=http://localhost:8795)
//
// Node 24 heeft een ingebouwde WebSocket (undici). Die laat via de tweede parameter
// { headers: {...} } eigen kopjes toe, zodat Cookie en Origin gewoon meegaan.

const BASE = process.env.BASE || "http://localhost:8795";
const ORIGIN = new URL(BASE).origin;
const WS_BASE = BASE.replace(/^http/, "ws");
const RUN = Date.now().toString(36).slice(-5);
const PW = "geheim-wachtwoord-1";
let pass = 0, failN = 0;

function check(name, cond, extra = "") {
  if (cond) pass++; else failN++;
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${!cond && extra ? "  -> " + extra : ""}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ipN = 0;
const newIp = () => `10.77.${(Date.now() >> 10) & 255}.${++ipN}`;

async function req(method, path, { body, cookie, origin = ORIGIN, ip } = {}) {
  const headers = {};
  if (origin) headers["Origin"] = origin;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookie) headers["Cookie"] = cookie;
  if (ip) headers["CF-Connecting-IP"] = ip;
  const res = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  const m = (res.headers.get("set-cookie") || "").match(/eawg_sid=([^;]*)/);
  return { status: res.status, data, text, headers: res.headers, cookie: m && m[1] ? `eawg_sid=${m[1]}` : null };
}

// WebSocket met berichtenlijst en wachtfunctie.
function connect(code, cookie, origin = ORIGIN) {
  const headers = {};
  if (cookie) headers["Cookie"] = cookie;
  if (origin) headers["Origin"] = origin;
  const ws = new WebSocket(`${WS_BASE}/api/room/${code}`, { headers });
  const c = { ws, msgs: [], opened: false, closeCode: null, closed: null, waiters: [] };
  c.closed = new Promise((resolve) => {
    ws.addEventListener("close", (e) => { c.closeCode = e.code; resolve(e.code); c.waiters.forEach((w) => w()); });
  });
  ws.addEventListener("open", () => { c.opened = true; });
  ws.addEventListener("error", () => {});
  ws.addEventListener("message", (e) => {
    let m = null;
    try { m = JSON.parse(e.data); } catch {}
    c.msgs.push({ m, at: performance.now(), raw: e.data });
    c.waiters.forEach((w) => w());
  });
  c.send = (obj) => ws.send(typeof obj === "string" ? obj : JSON.stringify(obj));
  // Wacht op een bericht dat aan de voorwaarde voldoet (vanaf index 'from').
  c.wait = (pred, ms = 3000, from = 0) => new Promise((resolve) => {
    const look = () => {
      for (let i = from; i < c.msgs.length; i++) if (c.msgs[i].m && pred(c.msgs[i].m)) return c.msgs[i].m;
      return null;
    };
    const hit = look();
    if (hit) return resolve(hit);
    const t = setTimeout(() => { c.waiters = c.waiters.filter((w) => w !== fn); resolve(null); }, ms);
    const fn = () => { const h = look(); if (h) { clearTimeout(t); c.waiters = c.waiters.filter((w) => w !== fn); resolve(h); } };
    c.waiters.push(fn);
  });
  c.waitOpen = (ms = 3000) => Promise.race([
    new Promise((r) => { if (c.opened) r(true); else ws.addEventListener("open", () => r(true)); }),
    c.closed.then(() => false),
    sleep(ms).then(() => false),
  ]);
  c.waitClose = (ms = 3000) => Promise.race([c.closed, sleep(ms).then(() => null)]);
  return c;
}

// ---------- accounts ----------
const users = [`Host_${RUN}`, `Gast_${RUN}`, `Derde_${RUN}`];
const cookies = [];
for (const u of users) {
  const r = await req("POST", "/api/register", { body: { username: u, password: PW }, ip: newIp() });
  check(`account ${u} maken (201)`, r.status === 201, `${r.status} ${r.text}`);
  const l = await req("POST", "/api/login", { body: { username: u, password: PW }, ip: newIp() });
  check(`inloggen ${u} (200 en cookie)`, l.status === 200 && !!l.cookie, `${l.status}`);
  cookies.push(l.cookie);
}
const [cHost, cGuest, cThird] = cookies;

// ---------- kamer maken ----------
let r = await req("POST", "/api/room/create", { body: {} });
check("kamer maken zonder sessie geeft 401", r.status === 401, `${r.status}`);
r = await req("POST", "/api/room/create", { body: {}, cookie: cHost, origin: "https://kwaadaardig.example" });
check("kamer maken met verkeerde Origin geeft 403", r.status === 403, `${r.status}`);
r = await req("POST", "/api/room/create", { body: {}, cookie: cHost });
const code = r.data?.code;
check("kamer maken geeft 201 en een code van 6 tekens uit het alfabet", r.status === 201 && /^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/.test(code || ""), `${r.status} ${r.text}`);

// ---------- foute toegang (gewone GET, zonder upgrade) ----------
r = await req("GET", `/api/room/${code}`);
check("verbinden zonder sessie geeft 401", r.status === 401, `${r.status}`);
r = await req("GET", `/api/room/${code}`, { cookie: cHost, origin: "https://kwaadaardig.example" });
check("verbinden met verkeerde Origin geeft 403", r.status === 403, `${r.status}`);
r = await req("GET", `/api/room/${code}`, { cookie: cHost, origin: null });
check("verbinden zonder Origin geeft 403", r.status === 403, `${r.status}`);
r = await req("GET", `/api/room/ZZZZZZ`, { cookie: cHost });
check("onbekende code geeft 404 (JSON)", r.status === 404 && !!r.data?.error, `${r.status} ${r.text}`);
r = await req("GET", `/api/room/abc`, { cookie: cHost });
check("ongeldige code geeft 404", r.status === 404, `${r.status}`);
r = await req("GET", `/api/room/${code}`, { cookie: cHost });
check("bestaande kamer zonder WebSocket-upgrade geeft 426", r.status === 426, `${r.status}`);

// Ook via echte WebSocket: verkeerde Origin en onbekende code openen niet.
let bad = connect(code, cHost, "https://kwaadaardig.example");
check("WebSocket met verkeerde Origin wordt geweigerd", (await bad.waitOpen()) === false);
bad = connect("ZZZZZZ", cHost);
check("WebSocket naar onbekende code wordt geweigerd", (await bad.waitOpen()) === false);
bad = connect(code, null);
check("WebSocket zonder sessie wordt geweigerd", (await bad.waitOpen()) === false);

// ---------- host en gast ----------
let host = connect(code, cHost);
check("host verbindt", await host.waitOpen());
let m = await host.wait((x) => x.t === "hello");
check("host krijgt hello met rol host", m?.role === "host" && m?.you === users[0] && m?.peer === null, JSON.stringify(m));

let guest = connect(code.toLowerCase(), cGuest);
check("gast verbindt met de code (kleine letters mag)", await guest.waitOpen());
m = await guest.wait((x) => x.t === "hello");
check("gast krijgt hello met rol guest en naam van de host", m?.role === "guest" && m?.peer === users[0] && m?.peerOnline === true, JSON.stringify(m));
m = await host.wait((x) => x.t === "peer-join");
check("host krijgt peer-join met naam van de gast", m?.name === users[1], JSON.stringify(m));

// ---------- doorsturen ----------
host.send({ t: "snap", f: 1, p: [[1, 2], [3, 4]], b: [5, 6], s: [0, 0], k: 90 });
m = await guest.wait((x) => x.t === "snap");
check("momentopname van host komt bij gast aan (ongewijzigd)", m?.f === 1 && m?.k === 90 && m?.b?.[1] === 6, JSON.stringify(m));
guest.send({ t: "input", x: 0.5, y: -1, b: 3, seq: 7 });
m = await host.wait((x) => x.t === "input");
check("invoer van gast komt bij host aan", m?.seq === 7 && m?.x === 0.5, JSON.stringify(m));
check("host krijgt zijn eigen bericht niet terug", !host.msgs.some((x) => x.m?.t === "snap"));

// ---------- ping en pong ----------
const ts = performance.now();
guest.send({ t: "ping", ts });
m = await guest.wait((x) => x.t === "pong");
check("ping geeft pong met dezelfde ts", m?.ts === ts && typeof m?.st === "number", JSON.stringify(m));
check("ping wordt niet doorgestuurd naar de ander", !host.msgs.some((x) => x.m?.t === "ping"));
guest.send('{"t":"ka"}');
m = await guest.wait((x) => x.t === "ka", 2000);
check("keepalive {t:'ka'} krijgt automatisch antwoord", m?.t === "ka");

// ---------- resync (beide richtingen, ongewijzigd doorgestuurd) ----------
let fromR = host.msgs.length;
guest.send({ t: "resync", why: "terug" });
m = await host.wait((x) => x.t === "resync", 2000, fromR);
check("resync van gast komt ongewijzigd bij host aan", m?.why === "terug", JSON.stringify(m));
fromR = guest.msgs.length;
host.send({ t: "resync" });
m = await guest.wait((x) => x.t === "resync", 2000, fromR);
check("resync van host komt bij gast aan", m?.t === "resync", JSON.stringify(m));

// ---------- verboden types en rommel ----------
let from = guest.msgs.length;
guest.send({ t: "snap", f: 99 });
m = await guest.wait((x) => x.t === "error", 2000, from);
check("gast mag geen snap sturen (error forbidden-type)", m?.code === "forbidden-type", JSON.stringify(m));
from = host.msgs.length;
host.send({ t: "hello", role: "host" });
m = await host.wait((x) => x.t === "error", 2000, from);
check("niemand mag servertypes zoals hello sturen", m?.code === "forbidden-type", JSON.stringify(m));
from = host.msgs.length;
host.send("dit is geen json");
m = await host.wait((x) => x.t === "error", 2000, from);
check("geen JSON geeft error bad-message (verbinding blijft open)", m?.code === "bad-message" && host.ws.readyState === 1, JSON.stringify(m));

// ---------- derde speler ----------
const third = connect(code, cThird);
await third.waitOpen();
await third.waitClose();
const t3 = third.msgs.find((x) => x.m?.t === "error")?.m;
check(`derde speler krijgt room-full en sluitcode 4003 (kreeg ${third.closeCode})`, t3?.code === "room-full" && third.closeCode === 4003, JSON.stringify(t3));
check("host en gast blijven verbonden na de derde", host.ws.readyState === 1 && guest.ws.readyState === 1);

// ---------- vertraging host naar gast (200 berichten, 50 per seconde) ----------
await sleep(1100);
const lat = [];
for (let i = 0; i < 200; i++) {
  const start = guest.msgs.length;
  const sent = performance.now();
  host.send({ t: "evt", k: "lat", i, ts: sent });
  const got = await guest.wait((x) => x.t === "evt" && x.i === i, 2000, start);
  if (got) lat.push(guest.msgs.find((x) => x.m?.t === "evt" && x.m?.i === i).at - sent);
  await sleep(Math.max(0, 20 - (performance.now() - sent)));
}
const avg = lat.reduce((a, b) => a + b, 0) / (lat.length || 1);
const sorted = [...lat].sort((a, b) => a - b);
const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
const worst = sorted[sorted.length - 1] || 0;
console.log(`      vertraging host->gast lokaal: ${lat.length}/200 aangekomen, gemiddeld ${avg.toFixed(2)} ms, p95 ${p95.toFixed(2)} ms, slechtste ${worst.toFixed(2)} ms`);
check("200 berichten host naar gast allemaal aangekomen", lat.length === 200, `${lat.length}`);

// ---------- meer dan 60 per seconde ----------
await sleep(1100);
from = guest.msgs.length;
const hostFrom = host.msgs.length;
for (let i = 0; i < 100; i++) host.send({ t: "evt", k: "flood", i });
await sleep(1500);
const floodGot = guest.msgs.slice(from).filter((x) => x.m?.k === "flood").length;
const rateErr = host.msgs.slice(hostFrom).find((x) => x.m?.t === "error")?.m;
check(`100 berichten in 1 burst: gast krijgt er hoogstens 60 (kreeg ${floodGot})`, floodGot > 0 && floodGot <= 60);
check("host krijgt error rate-limited", rateErr?.code === "rate-limited", JSON.stringify(rateErr));
check("verbinding blijft open bij 100 per seconde", host.ws.readyState === 1);
await sleep(1100);
from = guest.msgs.length;
host.send({ t: "evt", k: "na-flood" });
check("na 1 seconde gaan berichten weer door", !!(await guest.wait((x) => x.k === "na-flood", 2000, from)));

// ---------- gast weg en terug ----------
from = host.msgs.length;
guest.ws.close(1000);
m = await host.wait((x) => x.t === "peer-left", 3000, from);
check("gast sluit: host krijgt peer-left met respijt 30000 ms", m?.role === "guest" && m?.graceMs === 30000, JSON.stringify(m));
await sleep(1000);
from = host.msgs.length;
guest = connect(code, cGuest);
check("gast komt binnen 30 s terug", await guest.waitOpen());
m = await guest.wait((x) => x.t === "hello");
check("teruggekeerde gast krijgt opnieuw rol guest", m?.role === "guest", JSON.stringify(m));
m = await host.wait((x) => x.t === "peer-back", 3000, from);
check("host krijgt peer-back", m?.role === "guest", JSON.stringify(m));

// ---------- te groot bericht ----------
from = host.msgs.length;
guest.send({ t: "input", pad: "x".repeat(5000) });
const bigCode = await guest.waitClose();
check(`bericht boven 4 KB sluit de verbinding met code 1009 (kreeg ${bigCode})`, bigCode === 1009);
check("te groot bericht kwam niet bij de host aan", !host.msgs.slice(from).some((x) => x.m?.pad));
m = await host.wait((x) => x.t === "peer-left", 3000, from);
check("host krijgt peer-left na het sluiten van de gast", !!m);
guest = connect(code, cGuest);
await guest.waitOpen();
m = await host.wait((x) => x.t === "peer-back", 3000, from);
check("gast verbindt opnieuw na sluiten: host krijgt peer-back", !!m);
from = guest.msgs.length;
host.send({ t: "evt", k: "precies" , pad: "y".repeat(3900) });
check("bericht net onder 4 KB komt wel aan", !!(await guest.wait((x) => x.k === "precies", 2000, from)));

// ---------- tweede verbinding van dezelfde speler vervangt de eerste ----------
from = guest.msgs.length;
const host2 = connect(code, cHost);
check("host verbindt een tweede keer", await host2.waitOpen());
const oldCode = await host.waitClose();
check(`oude hostverbinding wordt gesloten met 4001 (kreeg ${oldCode})`, oldCode === 4001);
await sleep(300);
check("gast krijgt geen peer-left bij vervangen", !guest.msgs.slice(from).some((x) => x.m?.t === "peer-left"));
host = host2;

// ---------- verbinding verdwijnt zonder close (zoals iOS bij achtergrond of slot) ----------
// De gast zit in een apart Node-proces dat hard gestopt wordt: er gaat geen close-frame naar de server.
{
  const { spawn } = await import("node:child_process");
  from = host.msgs.length;
  guest.ws.close(1000); // de huidige gastverbinding netjes weg, zodat het kindproces de gast is
  await host.wait((x) => x.t === "peer-left", 3000, from);
  const childCode = `
    const ws = new WebSocket(process.env.U, { headers: { Cookie: process.env.C, Origin: process.env.O } });
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.t === "hello") console.log("HELLO " + m.role); };
    setInterval(() => {}, 1000);`;
  const child = spawn(process.execPath, ["-e", childCode], {
    env: { ...process.env, U: `${WS_BASE}/api/room/${code}`, C: cGuest, O: ORIGIN }, stdio: ["ignore", "pipe", "ignore"],
  });
  const childHello = await new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), 8000);
    child.stdout.on("data", (d) => { const s = String(d); if (s.includes("HELLO")) { clearTimeout(t); resolve(s.trim()); } });
  });
  check("gast in apart proces verbindt (rol guest)", childHello === "HELLO guest", String(childHello));
  await host.wait((x) => x.t === "peer-back", 3000, from);
  from = host.msgs.length;
  child.kill("SIGKILL");
  await sleep(300);
  guest = connect(code, cGuest);
  check("na harde stop: dezelfde gast komt meteen terug", await guest.waitOpen());
  m = await guest.wait((x) => x.t === "hello" || x.t === "error");
  check("teruggekeerde gast krijgt rol guest, geen room-full", m?.t === "hello" && m?.role === "guest", JSON.stringify(m));
  const fromG = guest.msgs.length;
  host.send({ t: "snap", f: 2 });
  check("momentopname bereikt de nieuwe gastverbinding", !!(await guest.wait((x) => x.t === "snap" && x.f === 2, 2000, fromG)));
  await sleep(500);
  const leftAfter = host.msgs.slice(from).filter((x) => x.m?.t === "peer-left").length;
  const backAfter = host.msgs.slice(from).filter((x) => x.m?.t === "peer-back").length;
  console.log(`      na harde stop zag de host: ${leftAfter} x peer-left, ${backAfter} x peer-back`);
  check("host heeft geen peer-left zonder bijhorende peer-back", leftAfter <= backAfter, `${leftAfter}/${backAfter}`);
  check("host kreeg geen peer-gone", !host.msgs.slice(from).some((x) => x.m?.t === "peer-gone"));
}

// ---------- gast komt niet terug: na 30 s peer-gone en plaats vrij ----------
from = host.msgs.length;
guest.ws.close(1000);
await host.wait((x) => x.t === "peer-left", 3000, from);
m = await host.wait((x) => x.t === "peer-gone", 36000, from);
check("na 30 s respijt krijgt de host peer-gone", m?.role === "guest", JSON.stringify(m));
const newGuest = connect(code, cThird);
check("vrijgekomen plaats: een nieuwe gast mag erin", await newGuest.waitOpen());
m = await newGuest.wait((x) => x.t === "hello");
check("nieuwe gast krijgt rol guest", m?.role === "guest", JSON.stringify(m));
newGuest.ws.close(1000);

// ---------- host weg zonder terugkomen: kamer gesloten ----------
// (alleen de korte versie: host sluit, er is geen gast meer; na 30 s is de kamer weg)
await sleep(500);
host.ws.close(1000);
await sleep(31500);
r = await req("GET", `/api/room/${code}`, { cookie: cHost });
check(`host 30 s weg: kamer is opgeruimd en geeft 404 (kreeg ${r.status})`, r.status === 404, r.text);

// ---------- 20 kamers per uur per gebruiker ----------
const rs = [];
for (let i = 0; i < 20; i++) {
  r = await req("POST", "/api/room/create", { body: {}, cookie: cGuest });
  rs.push(r.status);
}
check(`20 kamers per uur toegestaan, de 21e geeft 429 (${rs.filter((s) => s === 201).length} x 201, daarna ${r.status})`,
  rs.every((s) => s === 201) && (await req("POST", "/api/room/create", { body: {}, cookie: cGuest })).status === 429);

// ---------- opruimen ----------
for (let i = 0; i < users.length; i++) {
  r = await req("DELETE", "/api/account", { body: { password: PW }, cookie: cookies[i], ip: newIp() });
  check(`account ${users[i]} verwijderd`, r.status === 200, `${r.status} ${r.text}`);
}

console.log(`\nVERTRAGING lokaal: gemiddeld ${avg.toFixed(2)} ms, p95 ${p95.toFixed(2)} ms, slechtste ${worst.toFixed(2)} ms (${lat.length} berichten)`);
console.log(`Totaal: ${pass} PASS, ${failN} FAIL`);
process.exit(failN ? 1 : 0);
