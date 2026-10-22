(() => {
'use strict';
let W = 1500, H = 600, GW = 100; const VH = 600;
const cv = document.getElementById('c'), cx = cv.getContext('2d');
let Q = 0, dprCap = 2, qN = 0, qT = 0, DPR = 1, bgk = 1, scale = 1, oy = 0, SW = 1000, bg = null, vig = null, shade = null;
const SYF = 190, SYN = 590, SF = 0.66, SN = 1.22;
let camX = W / 2, zoom = 1.4, tNow = 0, shakeT = 0, goalT = 0;
let court = null, curKey = 'veld', koiUser = 0, inStreet = false, stSel = 0;
let kitSlot = 0, formIdx = [0, 0], FORM = [3, 2, 2], ATTFROM = 5, vSelF = -1, vSelB = -1;
// toeval voor de spelsimulatie: vaste seed per match (mulberry32), zodat een match herhaalbaar is (voorbereiding online spelen).
// Tekenen, menu's en effecten gebruiken gewoon Math.random.
let matchSeed = 20261022, simS = matchSeed;
function simSeed(s) { simS = (s >>> 0) || 1; }
function srnd() { simS = simS + 0x6D2B79F5 | 0; let t = Math.imul(simS ^ simS >>> 15, 1 | simS); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
// meetscherm (#debug of OPTIES, WEERGAVE): kost niets als het uit staat
let DBG = false; try { DBG = localStorage.getItem('eawg-debug') === '1'; } catch (e) {}
const dbgHash = () => /(^#|&)debug(&|$)/.test(location.hash || ''); if (dbgHash()) DBG = true;
addEventListener('hashchange', () => { if (dbgHash()) DBG = true; });
const DT = { bg: 0, vloer: 0, lijn: 0, spel: 0, hud: 0, upd: 0 }, DA = { bg: 0, vloer: 0, lijn: 0, spel: 0, hud: 0, upd: 0 }, dbgW = new Float32Array(60);
let dbgWi = 0, dbgFps = 0, dbgFc = 0, dbgF0 = 0;

// ---------- scherm + achtergrond ----------
function resize() {
  const dpr = DPR = Math.min(dprCap, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  cv.style.width = w + 'px'; cv.style.height = h + 'px';
  scale = Math.min(cv.width / 800, cv.height / VH);
  SW = cv.width / scale; oy = (cv.height - VH * scale) / 2;
  buildBG();
  vig = cx.createRadialGradient(SW / 2, VH * 0.55, VH * 0.4, SW / 2, VH * 0.55, SW * 0.62);
  vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,.55)');
  shade = cx.createLinearGradient(0, SYF, 0, SYF + 170);
  shade.addColorStop(0, 'rgba(0,10,0,.35)'); shade.addColorStop(1, 'rgba(0,10,0,0)');
}
function buildBG() {
  const w = Math.ceil(SW + 360), h = SYF + 10; bgk = Q >= 1 ? 1 : Math.max(1, Math.min(2, scale));
  if (bg) bg.width = bg.height = 0;
  bg = document.createElement('canvas'); bg.width = Math.ceil(w * bgk); bg.height = Math.ceil(h * bgk);
  const g = bg.getContext('2d'); g.scale(bgk, bgk);
  let seed = 7;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, court ? court.sky[0] : '#05070f'); sky.addColorStop(1, court ? court.sky[1] : '#121c38');
  g.fillStyle = sky; g.fillRect(0, 0, w, h);
  if (court && court.crowd === 'skyline') { skyline(g, w, h, rnd); return; }
  if (court && court.crowd === 'mural') { mural(g, w, h, rnd); return; }
  if (court && court.crowd === 'tunnel') { tunnelBG(g, w, h, rnd); return; }
  if (court && court.crowd === 'carpark') { carparkBG(g, w, h, rnd); return; }
  if (court && court.crowd === 'beach') { beachBG(g, w, h, rnd); return; }
  if (court && court.crowd === 'world') { worldBG(g, w, h, rnd, court); return; }
  const pal = (court && court.pal) || ['#d9e8f5', '#8fb8e0', '#e8e8ea', '#1d2a52', '#c0392b', '#2c3e66', '#f4d03f', '#ffffff', '#3c4a6b', '#9b2d2d'];
  const skinT = ['#f1c9a5', '#d9a273', '#a8744a', '#6b4428'];
  const tmp = document.createElement('canvas'); tmp.width = Math.ceil(w * bgk); tmp.height = Math.ceil(h * bgk); const t2 = tmp.getContext('2d'); t2.scale(bgk, bgk);
  for (let y = 46; y < h - 28; y += 6) {
    const k = (y - 46) / (h - 76), br = 0.35 + 0.65 * k;
    for (let x = -3; x < w; x += 6) {
      const xx = x + rnd() * 3, yy = y + rnd() * 2;
      t2.globalAlpha = 1; t2.fillStyle = pal[(rnd() * pal.length) | 0]; t2.fillRect(xx, yy + 2.6, 5, 7);
      t2.fillStyle = skinT[(rnd() * 4) | 0]; t2.beginPath(); t2.arc(xx + 2.5, yy + 1.6, 2.2, 0, 7); t2.fill();
      t2.globalAlpha = 1 - br; t2.fillStyle = '#04070f'; t2.fillRect(xx - 0.5, yy - 1, 6, 11);
    }
    if (((y - 46) / 6) % 8 === 7) { t2.globalAlpha = 0.55; t2.fillStyle = '#05080f'; t2.fillRect(0, y + 8, w, 2); }
  }
  t2.globalAlpha = 1;
  if ('filter' in g) g.filter = 'blur(' + (0.7 * bgk) + 'px)';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(tmp, 0, 0); g.restore(); g.filter = 'none'; tmp.width = tmp.height = 0;
  g.globalAlpha = 1;
  if (!court || court.indoor) {
  const roof = g.createLinearGradient(0, 0, 0, 70); roof.addColorStop(0, '#03050a'); roof.addColorStop(0.7, 'rgba(8,12,22,.92)'); roof.addColorStop(1, 'rgba(8,12,22,0)');
  g.fillStyle = roof; g.fillRect(0, 0, w, 70);
  g.strokeStyle = 'rgba(70,85,120,.45)'; g.lineWidth = 1;
  for (let x = -40; x < w; x += 70) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 45, 52); g.moveTo(x + 70, 0); g.lineTo(x + 25, 52); g.stroke(); }
  for (let x = 30; x < w; x += 70) {
    const y = 22 + ((x / 70) | 0) % 2 * 8;
    g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.2; g.beginPath();
    g.moveTo(x - 11, y); g.lineTo(x + 11, y); g.moveTo(x, y - 11); g.lineTo(x, y + 11); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill();
  }
  }
  const lip = g.createLinearGradient(0, h - 32, 0, h); lip.addColorStop(0, '#0c1424'); lip.addColorStop(1, '#04060c');
  g.fillStyle = lip; g.fillRect(0, h - 32, w, 32);
}
addEventListener('resize', resize);

// ---------- camera ----------
function P(x, y, z) {
  const t = y / H, s = (SF + (SN - SF) * t) * zoom;
  return [SW / 2 + (x - camX) * s, SYF + (SYN - SYF) * t - (z || 0) * s, s];
}

// ---------- geluid ----------
let AC = null, crowdG = null;
// menumuziek: speelt public/menu.mp3 als dat bestand er staat; anders een eigen, originele synth-loop (geen bestand, geen rechten, gratis)
const MUS = new Audio('menu.mp3'); MUS.loop = true; MUS.volume = 0.55; MUS.preload = 'none'; let musFile = null;
fetch('menu.mp3', { method: 'HEAD' }).then(r => { musFile = r.ok && /audio|mpeg|octet/.test(r.headers.get('content-type') || ''); }).catch(() => { musFile = false; });
let mG = null, mNext = 0, mStep = 0, mNoise = null;
const MS = 60 / 104 / 4, MROOT = [48, 43, 45, 41], MTRI = [[0, 4, 7], [0, 4, 7], [0, 3, 7], [0, 4, 7]];
const MLEAD = [[76, 0, 79, 76, 74, 0, 72, 0], [74, 0, 79, 74, 71, 0, 74, 0], [72, 0, 76, 81, 79, 0, 76, 0], [77, 0, 81, 77, 76, 74, 72, 0]];
const mf = n => 440 * Math.pow(2, (n - 69) / 12);
function mTone(f, t, d, type, v) {
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(mG); o.start(t); o.stop(t + d + 0.05);
}
function mNoiseHit(t, d, v, ftype, ff) {
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = mNoise; f.type = ftype; f.frequency.value = ff;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(mG); s.start(t, Math.random() * 0.4); s.stop(t + d + 0.02);
}
function mStepPlay(st, t) {
  const bar = (st >> 4) & 3, k = st & 15, root = MROOT[bar];
  if (k % 4 === 0) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); g.gain.setValueAtTime(0.9, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18); o.connect(g); g.connect(mG); o.start(t); o.stop(t + 0.2); }
  if (k === 4 || k === 12) mNoiseHit(t, 0.14, 0.55, 'bandpass', 1600);
  if (k % 2 === 1) mNoiseHit(t, 0.04, 0.12, 'highpass', 7500);
  if (k === 0 || k === 6 || k === 8 || k === 14) mTone(mf(root - 12), t, MS * 2.4, 'triangle', 0.5);
  if (k === 0 || k === 8) MTRI[bar].forEach(i => mTone(mf(root + 12 + i), t, MS * 6, 'sawtooth', 0.07));
  if (k % 2 === 0) { const n = MLEAD[bar][k >> 1]; if (n) mTone(mf(n), t, MS * 1.8, 'square', 0.1); }
}
function synthTick(want) {
  if (!mG) {
    mG = AC.createGain(); mG.gain.value = 0; mG.connect(AC.destination); mNext = AC.currentTime + 0.1;
    mNoise = AC.createBuffer(1, AC.sampleRate * 0.5, AC.sampleRate); const d = mNoise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  mG.gain.setTargetAtTime(want ? 0.3 : 0, AC.currentTime, 0.15);
  if (!want) { mNext = AC.currentTime + 0.1; return; }
  if (mNext < AC.currentTime - 0.3) mNext = AC.currentTime + 0.05;
  while (mNext < AC.currentTime + 0.25) { mStepPlay(mStep, mNext); mNext += MS; mStep = (mStep + 1) & 63; }
}
function musicTick() {
  if (!AC || musFile === null) return;
  const want = !muted && state !== 'play' && state !== 'goal' && state !== 'pause' && state !== 'end' && state !== 'sp';
  if (musFile) {
    if (want && MUS.paused) { const r = MUS.play(); if (r && r.catch) r.catch(() => {}); } else if (!want && !MUS.paused) MUS.pause();
  } else synthTick(want);
}
function initAudio() {
  // iOS: 'suspended' of 'interrupted' na scherm op slot, hervatten zonder fout in de console
  if (AC) { if (AC.state !== 'running' && AC.state !== 'closed') { try { const r = AC.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {} } return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
    const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800;
    crowdG = AC.createGain(); crowdG.gain.value = muted ? 0 : 0.1;
    src.connect(f); f.connect(crowdG); crowdG.connect(AC.destination); src.start();
  } catch (e) { AC = null; }
}
function swell(v, t) {
  if (!AC || muted) return; const g = crowdG.gain, n = AC.currentTime;
  g.cancelScheduledValues(n); g.setValueAtTime(g.value, n); g.linearRampToValueAtTime(v, n + 0.2); g.linearRampToValueAtTime(0.1, n + t);
}
function thud(v) {
  if (!AC || muted) return; const n = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(190, n); o.frequency.exponentialRampToValueAtTime(55, n + 0.12);
  g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.001, n + 0.16);
  o.connect(g); g.connect(AC.destination); o.start(n); o.stop(n + 0.17);
}
function whistle(len) {
  if (!AC || muted) return; const n = AC.currentTime, o = AC.createOscillator(), l = AC.createOscillator(), lg = AC.createGain(), g = AC.createGain();
  o.type = 'square'; o.frequency.value = 2700; l.frequency.value = 34; lg.gain.value = 90;
  l.connect(lg); lg.connect(o.frequency);
  g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(0.1, n + 0.03);
  g.gain.setValueAtTime(0.1, n + len - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, n + len);
  o.connect(g); g.connect(AC.destination); o.start(n); l.start(n); o.stop(n + len + 0.02); l.stop(n + len + 0.02);
}

// ---------- input ----------
const keys = {};
['gesturestart', 'gesturechange'].forEach(g => document.addEventListener(g, e => e.preventDefault(), { passive: false }));
let koi = 0, pLab = 'PASS', bsV = 0, wl = null; function wake() { try { if (navigator.wakeLock && !wl) navigator.wakeLock.request('screen').then(l => { wl = l; l.addEventListener('release', () => { wl = null; }); }, () => {}); } catch (e) {} }
document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0, vx: 0, vy: 0 };
addEventListener('keydown', e => {
  if (e.target && /^(TEXTAREA|INPUT)$/.test(e.target.tagName)) return;
  keys[e.code] = 1; initAudio();
  if (state === 'sp') { if (!e.repeat) spKey(e.code, 1); if (e.code === 'Space' || e.code === 'Tab' || /^Arrow/.test(e.code)) e.preventDefault(); return; }
  if (e.code === 'Escape' && state === 'play') state = 'pause';
  else if (state !== 'play' && state !== 'goal') { if (!e.repeat) uiKey(e.code); }
  else if (e.code === 'Space' && state === 'play' && !e.repeat) shootDown();
  if (e.code === 'KeyX' || e.code === 'KeyC') doPass();
});
addEventListener('keyup', e => { if (e.target && /^(TEXTAREA|INPUT)$/.test(e.target.tagName)) return; keys[e.code] = 0; if (state === 'sp') { spKey(e.code, 0); return; } if (e.code === 'Space') shootUp(); });
cv.addEventListener('pointerdown', e => {
  initAudio(); wake();
  { const d = DPR; if (uiTap(e.clientX * d / scale, (e.clientY * d - oy) / scale)) return; }
  if (state === 'sp') { const d = DPR; spDown(e.clientX * d / scale, (e.clientY * d - oy) / scale, e.pointerId); try { cv.setPointerCapture(e.pointerId); } catch (er) {} return; }
  if (state !== 'play') return;
  if (e.clientX > 24 && e.clientX < innerWidth * 0.55 && joy.id === null) {
    joy.id = e.pointerId; joy.ox = joy.x = e.clientX; joy.oy = joy.y = e.clientY; joy.vx = joy.vy = 0;
    cv.setPointerCapture(e.pointerId);
  }
});
cv.addEventListener('pointermove', e => {
  if (state === 'sp') { const d = DPR; spMove(e.clientX * d / scale, (e.clientY * d - oy) / scale, e.pointerId); return; }
  if (e.pointerId !== joy.id) return;
  let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const m = Math.hypot(dx, dy), max = 55;
  if (m > max) { dx *= max / m; dy *= max / m; }
  joy.x = joy.ox + dx; joy.y = joy.oy + dy; joy.vx = dx / max; joy.vy = dy / max; if (Math.hypot(joy.vx, joy.vy) < 0.1) joy.vx = joy.vy = 0;
});
const upJoy = e => { if (state === 'sp') spUp(e.pointerId); if (e.pointerId === joy.id) { joy.id = null; joy.vx = joy.vy = 0; } };
cv.addEventListener('pointerup', upJoy); cv.addEventListener('pointercancel', upJoy);
const bS = document.getElementById('bShoot'), bP = document.getElementById('bPass');
bS.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); shootDown(); });
bS.addEventListener('pointerup', e => { e.preventDefault(); shootUp(); });
bS.addEventListener('pointercancel', () => shootUp());
bP.addEventListener('pointerdown', e => { e.preventDefault(); initAudio(); doPass(); });
document.addEventListener('contextmenu', e => e.preventDefault());

function inputVec() {
  let x = joy.vx, y = joy.vy;
  if (keys.ArrowLeft || keys.KeyA) x -= 1; if (keys.ArrowRight || keys.KeyD) x += 1;
  if (keys.ArrowUp || keys.KeyW) y -= 1; if (keys.ArrowDown || keys.KeyS) y += 1;
  const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  return [x, y];
}

// ---------- spel ----------
const TEAMS = [
  { code: 'GFC', trim: '#ffffff', shirt: '#63b6f2', shorts: '#f3f3f3', sock: '#63b6f2', gk: '#d8ff2a', gkShorts: '#111', gkSock: '#111' },
  { code: 'RSH', trim: '#16224a', shirt: '#f4f4f4', shorts: '#16224a', sock: '#f4f4f4', gk: '#ff7a1a', gkShorts: '#222', gkSock: '#222' }
];
let NP = 8;
const NAMES = [['VERBIST', 'DE SMET', 'JANSSENS', 'PEETERS', 'WILLEMS', 'MAES', 'WOUTERS', 'JACOBS'], ['CLAES', 'HERMANS', 'GOOSSENS', 'LAMBERT', 'DUBOIS', 'MARTENS', 'AERTS', 'SMETS']];
const NUMS = [[1, 2, 4, 5, 8, 6, 10, 9], [1, 3, 5, 4, 6, 8, 7, 11]];
const SKIN = ['#f1c9a5', '#d9a273', '#a8744a', '#6b4428', '#3e2a1c'];
const HAIR = ['#1a1209', '#3a2a14', '#7b5a2a', '#0e0e0e', '#a0522d'];
const BOOT = ['#ff8a1f', '#ffe14a', '#ff4fa3', '#37e6c8', '#c6ff2a', '#fff'];
const HOME8 = [[40, 300], [330, 130], [330, 300], [330, 470], [660, 200], [660, 400], [980, 220], [980, 380]];
const HOME5 = [[34, 220], [200, 130], [200, 310], [380, 150], [380, 290]];
let HOME = HOME8;

let state = 'menu', players = [], ball, score = [0, 0], timeLeft = 120, msg = '', msgT = 0, goalBy = 0, lastKicker = null;
let ctrl = null, charge = 0, charging = false, parts = [];

let SQUADS = null, selV = -1;
const PART = /^(de|van|von|den|der|ten|ter|el|al|di|da|dos|le|la|du|het|\u0027t)$/i;
function surname(n) {
  const t = String(n || '').trim().split(/\s+/); if (t.length > 1 && t[0].length <= 2 && /^[A-Za-z]\.?$/.test(t[0])) t.shift();
  let k = t.length - 1; while (k > 0 && PART.test(t[k - 1])) k--; while (k > 0 && t.length - k < 2 && t.length > 2 && /^(jr|sr)\.?$/i.test(t[t.length - 1])) k--;
  return t.slice(k).join(' ').toUpperCase().slice(0, 14);
}
function squadOf(name) { const q = SQUADS && SQUADS[name]; return Array.isArray(q) ? q.filter(p => p && typeof p.name === 'string') : []; }
function lineup(name, nd, nm, na) {
  nd = nd || 3; nm = nm == null ? 2 : nm; na = na || 2; const need = nd + nm + na;
  const q = squadOf(name); if (q.length < need + 1) return null;
  const used = new Set(), pick = f => { const p = q.find(x => !used.has(x) && f(x)); if (p) used.add(p); return p; };
  const gk = pick(x => x.pos === 'GK' && x.st) || pick(x => x.pos === 'GK') || pick(x => x.n === 1) || pick(() => true);
  const out = q.filter(x => x !== gk && x.pos !== 'GK').sort((a, b) => (b.st ? 1 : 0) - (a.st ? 1 : 0) || (a.n || 99) - (b.n || 99));
  const df = out.filter(x => x.pos === 'DF'), mf = out.filter(x => x.pos === 'MF'), fw = out.filter(x => x.pos === 'FW');
  let c;
  if (df.length || mf.length || fw.length) { const take = (arr, n) => { const r = arr.slice(0, n); while (r.length < n) r.push(null); return r; }; c = [...take(df, nd), ...take(mf, nm), ...take(fw, na)]; }
  else if (out.some(x => x.st)) c = out.slice(0, need);
  else { const n = out.length; c = Array.from({ length: need }, (_, i) => out[Math.min(n - 1, Math.floor(n * (i / need) * 0.9))]); }
  const rest = out.filter(x => !c.includes(x)); c = c.map(x => x || rest.shift()).filter(Boolean);
  if (!gk || c.length < need) return null;
  return [gk, ...c].map(p => ({ name: surname(p.name), num: p.n || 0, sk: p.sk, hr: p.hr, hs: p.hs, bt: p.bt }));
}
function applyLineups() {
  for (let t = 0; t < 2; t++) { const L = lineup(TEAMS[t] && TEAMS[t].name, FORM[0], FORM[1], FORM[2]); if (!L) continue; players.filter(p => p.t === t).forEach(p => { const e = L[p.i]; if (e) { p.name = e.name; p.num = e.num || p.num; if (e.sk >= 0 && e.sk < SKIN.length) p.skin = SKIN[e.sk]; if (e.hr >= 0 && e.hr < HAIR.length) p.hair = HAIR[e.hr]; if (e.hs >= 0 && e.hs < 4) p.hs = e.hs; if (e.bt >= 0 && e.bt < BOOT.length) p.boot = BOOT[e.bt]; } }); }
}
function mk() {
  players = []; HOME = makeHome();
  for (let t = 0; t < 2; t++) for (let i = 0; i < NP; i++) {
    const hx = t ? W - HOME[i][0] : HOME[i][0], k = t * NP + i;
    players.push({
      t, i, x: hx, y: HOME[i][1], vx: 0, vy: 0, hx, hy: HOME[i][1], fx: t ? -1 : 1, fy: 0, cd: 0, hold: 0,
      ph: srnd() * 6, face: t ? -1 : 1, kk: 0, name: NAMES[t][i], num: NUMS[t][i], rate: 62 + (k * 7) % 30,
      hs: (k * 5) % 4, skin: SKIN[(k * 3 + 1) % 5], hair: HAIR[(k * 2) % 5], boot: BOOT[k % 6]
    });
  }
  ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, owner: null, z: 0, vz: 0, rot: 0, trail: [] };
}
function reset(kickTeam) {
  for (const p of players) { p.x = p.hx; p.y = p.hy; p.vx = p.vy = 0; p.cd = 0; p.hold = 0; p.fx = p.t ? -1 : 1; p.fy = 0; p.kk = 0; }
  const k = players.find(p => p.t === kickTeam && p.i === NP - 1);
  k.x = W / 2 + (kickTeam ? 20 : -20); k.y = H / 2; k.hold = -0.8;
  ball.owner = k; ball.vx = ball.vy = 0; ball.x = k.x; ball.y = k.y; ball.z = ball.vz = 0; ball.trail = [];
  charging = false;
}
// bal uit: inworp, doelschop of hoekschop (spel hervat met de andere ploeg)
function restartOut(kind) {
  const lt = ball.lt === 0 || ball.lt === 1 ? ball.lt : 0, nt = 1 - lt;
  let who, bx, by;
  if (kind === 'side') {
    by = ball.y < H / 2 ? 14 : H - 14; bx = Math.max(60, Math.min(W - 60, ball.x));
    let bd = 1e9;
    for (const p of players) { if (p.t !== nt || p.i === 0) continue; const d = Math.hypot(p.x - bx, p.y - by); if (d < bd) { bd = d; who = p; } }
    who.x = bx; who.y = by + (by < H / 2 ? 12 : -12);
  } else {
    const left = ball.x < W / 2, defT = left ? 0 : 1;   // ploeg 0 verdedigt links
    if (nt === defT) {   // doelschop: keeper
      who = players.find(p => p.t === defT && p.i === 0);
      who.x = left ? 60 : W - 60; who.y = H / 2; bx = who.x + (left ? 15 : -15); by = who.y;
    } else {             // hoekschop: dichtste aanvaller
      by = ball.y < H / 2 ? 16 : H - 16; bx = left ? 16 : W - 16;
      let bd = 1e9;
      for (const p of players) { if (p.t !== nt || p.i === 0) continue; const d = Math.hypot(p.x - bx, p.y - by); if (d < bd) { bd = d; who = p; } }
      who.x = bx + (left ? 12 : -12); who.y = by + (by < H / 2 ? 12 : -12);
    }
  }
  who.vx = who.vy = 0; who.cd = 0; who.hold = -0.5;
  who.fx = who.x < W / 2 ? 1 : -1; who.fy = 0;
  ball.owner = who; ball.lt = nt; ball.vx = ball.vy = 0; ball.z = ball.vz = 0; ball.trail = [];
  ball.x = who.x + who.fx * 15; ball.y = who.y; charging = false;
}
const teamHas = t => ball.owner && ball.owner.t === t;

function pickCtrl() {
  const o = ball.owner;
  if (o && o.t === 0) { ctrl = o; return; }
  let best = null, bd = 1e9;
  for (const p of players) {
    if (p.t || p.i === 0) continue;
    const d = Math.hypot(p.x - ball.x, p.y - ball.y) - (p === ctrl ? 40 : 0);
    if (d < bd) { bd = d; best = p; }
  }
  ctrl = best;
}

// trillen alleen na een echte tik (anders meldt Chrome een fout in de console)
function buzz(n) { try { const ua = navigator.userActivation; if (navigator.vibrate && (!ua || ua.hasBeenActive)) navigator.vibrate(n); } catch (e) {} }
function kick(p, dx, dy, pw) {
  if (p === ctrl) buzz(12);
  pw *= Math.max(0.9, Math.min(1.1, 0.94 + ((p.rate || 60) - 60) * 0.004));
  const m = Math.hypot(dx, dy) || 1;
  ball.owner = null; ball.vx = dx / m * pw; ball.vy = dy / m * pw;
  ball.x = p.x + dx / m * 20; ball.y = p.y + dy / m * 20;
  ball.vz = pw >= 600 ? 150 + srnd() * 90 : pw >= 420 ? 55 : 0; ball.z = 0;
  p.cd = 0.4; p.hold = 0; p.kk = 0.25; lastKicker = p;
  if (Math.abs(dx) > 0.2 * m) p.face = dx > 0 ? 1 : -1;
  thud(Math.min(0.5, pw / 1400));
}
function shootDir(p) {
  const gx = p.t ? 0 : W;
  let dx = p.fx, dy = p.fy;
  const ty = H / 2 + (srnd() - 0.5) * GW * 0.7 * (2 - upF(p, 1)), gdx = gx - p.x, gdy = ty - p.y;
  const a = Math.atan2(dy, dx), b = Math.atan2(gdy, gdx);
  const diff = Math.abs(((a - b + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
  if (Math.abs(gx - p.x) < 560 && diff < 0.8) { dx = gdx; dy = gdy; }
  return [dx, dy];
}
function bestPass(p, dx, dy) {
  const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
  let best = null, bs = -1e9;
  for (const q of players) {
    if (q.t !== p.t || q === p) continue;
    const vx = q.x - p.x, vy = q.y - p.y, d = Math.hypot(vx, vy);
    if (d < 60) continue;
    let s = ((vx * dx + vy * dy) / d) * 200 - d * 0.15;
    for (const o of players) if (o.t !== p.t && Math.hypot(o.x - q.x, o.y - q.y) < 50) s -= 80;
    if (q.i === 0) s -= 150;
    if (s > bs) { bs = s; best = q; }
  }
  return best;
}
function passTo(p, q) {
  const d = Math.hypot(q.x - p.x, q.y - p.y);
  kick(p, q.x + q.vx * 0.25 - p.x, q.y + q.vy * 0.25 - p.y, Math.min(750, Math.max(250, d * 1.1 + 100)) * upF(p, 2));
}
function startSlide() {
  const p = ctrl; if (!p || p.sl > 0 || p.slc > 0 || p.i === 0) return;
  const o = ball.owner, tx = o ? o.x : ball.x, ty = o ? o.y : ball.y, d = Math.hypot(tx - p.x, ty - p.y);
  let dx = p.fx, dy = p.fy; if (d < 140 && d > 1) { dx = (tx - p.x) / d; dy = (ty - p.y) / d; } else { const [ix, iy] = inputVec(); if (Math.hypot(ix, iy) > 0.2) { dx = ix; dy = iy; } }
  p.sl = 0.32; p.slc = 1.3; p.slx = dx; p.sly = dy; p.slv = 0;
}
function doPass() {
  if (state === 'play' && ctrl && ball.owner !== ctrl) { startSlide(); return; }
  if (state !== 'play' || !ball.owner || ball.owner !== ctrl) return;
  const p = ctrl; let [dx, dy] = inputVec();
  if (Math.hypot(dx, dy) < 0.2) { dx = p.fx; dy = p.fy; }
  const q = bestPass(p, dx, dy);
  if (q) passTo(p, q); else kick(p, dx, dy, 420);
}
function shootDown() { if (state === 'play' && ball.owner === ctrl && ctrl) { charging = true; charge = 0; } }
function shootUp() {
  if (charging && state === 'play' && ball.owner === ctrl && ctrl) {
    const [dx, dy] = shootDir(ctrl);
    kick(ctrl, dx, dy, (480 + Math.min(charge, 0.7) / 0.7 * 320) * upF(ctrl, 1));
  }
  charging = false;
}

function applyV(p, vx, vy, dt) { const k = Math.min(1, 9 * dt); p.vx += (vx - p.vx) * k; p.vy += (vy - p.vy) * k; }
function steer(p, tx, ty, max, dt) {
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy); let vx = 0, vy = 0;
  if (d > 6) { const s = Math.min(max, d * 5); vx = dx / d * s; vy = dy / d * s; }
  applyV(p, vx, vy, dt);
}

function ai(p, dt, chaser) {
  const own = ball.owner === p, mine = teamHas(p.t), gx = p.t ? 0 : W, dm = (p.t && !cur && !fr ? DIFFS[dIdx] : 1) * rf(p), sp = 178 * dm;
  if (p.i === 0) {
    const lx = p.t ? W - 34 : 34;
    let tx = lx, ty = Math.max(H / 2 - GW / 2 + 12, Math.min(H / 2 + GW / 2 - 12, ball.y));
    if (own) {
      p.hold += dt;
      if (p.hold > 0.7) { const q = bestPass(p, p.t ? -1 : 1, 0); if (q) passTo(p, q); }
      applyV(p, 0, 0, dt); return;
    }
    if (!ball.owner && Math.hypot(ball.x - p.x, ball.y - p.y) < 170 && Math.abs(ball.x - lx) < 200) { tx = ball.x; ty = ball.y; }
    steer(p, tx, ty, 189 * dm, dt); return;
  }
  if (own) {
    p.hold += dt;
    let ax = 0, ay = 0, nearest = 1e9;
    for (const o of players) {
      if (o.t === p.t) continue;
      const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy);
      nearest = Math.min(nearest, d);
      if (d < 90 && d > 0) { ax += dx / d * (90 - d); ay += dy / d * (90 - d); }
    }
    const dx = gx - p.x, dy = H / 2 - p.y, d = Math.hypot(dx, dy) || 1;
    const vx = dx / d * sp + ax * 2.2, vy = dy / d * sp + ay * 2.2, m = Math.hypot(vx, vy) || 1;
    applyV(p, vx / m * sp * 0.92, vy / m * sp * 0.92, dt);
    if (p.hold > 0.3 && Math.abs(gx - p.x) < 340) {
      const ty = H / 2 + (srnd() - 0.5) * GW * Math.max(0.9, 1.5 - ((p.rate || 60) - 50) * 0.01) * (2 - upF(p, 1));
      kick(p, gx - p.x, ty - p.y, (560 + srnd() * 150) * upF(p, 1));
    } else if (p.hold > 1.0 || (nearest < 42 && p.hold > 0.4)) {
      const q = bestPass(p, gx - p.x, 0); if (q) passTo(p, q);
    }
    return;
  }
  let tx, ty;
  if (chaser === p) {
    const o = ball.owner;
    tx = o ? o.x : ball.x + ball.vx * 0.2; ty = o ? o.y : ball.y + ball.vy * 0.2;
    steer(p, tx, ty, 189 * rf(p), dt); return;
  }
  tx = p.hx + (ball.x - W / 2) * 0.35; ty = p.hy + (ball.y - H / 2) * 0.3;
  if (mine && p.i >= ATTFROM) tx += (p.t ? -1 : 1) * (NP > 5 ? 190 : 110);
  tx = Math.max(60, Math.min(W - 60, tx)); ty = Math.max(30, Math.min(H - 30, ty));
  steer(p, tx, ty, sp, dt);
}

function confetti() {
  parts = []; const cols = ['#ffd400', '#63b6f2', '#fff', '#ff3b3b', '#4cd964'];
  for (let i = 0; i < 120; i++) parts.push({ x: Math.random() * SW, y: -20 - Math.random() * 220, vx: (Math.random() - 0.5) * 60, vy: 70 + Math.random() * 150, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 10, c: cols[i % 5], w: 5 + Math.random() * 6 });
}
function goal(t) {
  buzz(t === 0 ? [30, 40, 60] : 40);
  score[t]++; state = 'goal'; goalBy = t; goalT = 0;
  msg = 'GOAL!' + (lastKicker ? '  ' + lastKicker.name + ' ' + (Math.min(90, Math.floor((MATCH - timeLeft) / MATCH * 90) + 1)) + "'" : ''); msgT = 2.2;
  ball.vx = ball.vy = 0; ball.owner = null; charging = false; shakeT = 0.5;
  confetti(); whistle(0.9); swell(t === 0 ? 0.65 : 0.4, 3.5);
}

function update(dt) {
  for (const q of parts) { q.x += q.vx * dt; q.y += q.vy * dt; q.r += q.vr * dt; }
  parts = parts.filter(q => q.y < VH + 30);
  shakeT = Math.max(0, shakeT - dt);
  if (state === 'sp') { spUpdate(dt); return; }
  if (state === 'goal') { goalT += dt; msgT -= dt; for (const p of players) { p.vx *= 0.9; p.vy *= 0.9; p.ph += dt * 3; } if (msgT <= 0) { reset(1 - goalBy); state = 'play'; whistle(0.35); } return; }
  if (state !== 'play') return;
  timeLeft -= dt; if (timeLeft <= 0) { timeLeft = 0; state = 'end'; whistle(1.1); swell(0.5, 3); afterMatch(); return; }
  if (ban) { ban.t -= dt; if (ban.t <= 0) ban = null; }
  pickCtrl();
  if (charging) charge += dt;
  const chasers = [null, null];
  for (let t = 0; t < 2; t++) {
    if (teamHas(t)) continue;
    let bd = 1e9;
    for (const p of players) {
      if (p.t !== t || p.i === 0 || p === ctrl) continue;
      const d = Math.hypot(p.x - ball.x, p.y - ball.y);
      if (d < bd) { bd = d; chasers[t] = p; }
    }
  }
  for (const p of players) {
    p.cd = Math.max(0, p.cd - dt); p.kk = Math.max(0, p.kk - dt);
    p.slc = Math.max(0, (p.slc || 0) - dt);
    if (p === ctrl && p.sl > 0) {
      p.sl -= dt; applyV(p, p.slx * 310, p.sly * 310, dt); p.kk = Math.max(p.kk, 0.2);
      const o = ball.owner;
      if (o && o.t !== p.t && Math.hypot(p.x - o.x, p.y - o.y) < 28) {
        p.sl = 0;
        if (!foulCheck(p, o, true)) { if (srnd() < (0.55 + ((p.rate || 60) - (o.rate || 60)) * 0.01) * (2 - upF(o, 3))) { o.cd = 0.8; o.hold = 0; ball.owner = p; p.hold = 0; p.cd = 0.2; } else { p.cd = 0.5; } }
      } else if (!o && Math.hypot(p.x - ball.x, p.y - ball.y) < 24 && ball.z < 20) { ball.owner = p; p.hold = 0; p.sl = 0; }
    } else if (p === ctrl) {
      const [ix, iy] = inputVec(), max = (ball.owner === p ? 200 : 216) * rf(p);
      applyV(p, ix * max, iy * max, dt);
      if (p.i === 0 && ball.owner === p) { const lim = Math.min(190, W * 0.14), lx = p.t ? W - lim : lim; if (p.t ? p.x < lx : p.x > lx) { p.x = lx; p.vx = 0; } }
    } else ai(p, dt, chasers[p.t]);
  }
  for (const p of players) {
    p.x = Math.max(10, Math.min(W - 10, p.x + p.vx * dt));
    p.y = Math.max(10, Math.min(H - 10, p.y + p.vy * dt));
    const s = Math.hypot(p.vx, p.vy);
    if (s > 30) { p.fx = p.vx / s; p.fy = p.vy / s; }
    if (Math.abs(p.vx) > 25) p.face = p.vx > 0 ? 1 : -1;
    p.ph += s * dt * 0.055;
  }
  for (let a = 0; a < players.length; a++) for (let b = a + 1; b < players.length; b++) {
    const p = players[a], q = players[b], dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
    if (d > 0 && d < 22) { const k = (22 - d) / 2 / d; p.x -= dx * k; p.y -= dy * k; q.x += dx * k; q.y += dy * k; }
  }
  const o = ball.owner;
  if (o) {
    ball.lt = o.t; ball.x = o.x + o.fx * 15; ball.y = o.y + o.fy * 15; ball.vx = o.vx; ball.vy = o.vy; ball.z = 0; ball.vz = 0;
    for (const p of players) {
      if (p.t === o.t || p.cd > 0) continue;
      if (Math.hypot(p.x - ball.x, p.y - ball.y) < 22 && srnd() < 2.8 * dt * (2 - upF(o, 3))) {
        if (foulCheck(p, o)) break;
        o.cd = 0.6; o.hold = 0; ball.owner = p; p.hold = 0; if (charging) charging = false; break;
      }
    }
  } else {
    ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    ball.vz -= 900 * dt; ball.z += ball.vz * dt;
    if (ball.z < 0) { ball.z = 0; ball.vz = Math.abs(ball.vz) * 0.45; if (ball.vz < 25) ball.vz = 0; }
    const f = Math.pow(0.4, dt); ball.vx *= f; ball.vy *= f;
    if (ball.y < 8 || ball.y > H - 8) { if (koi) { ball.y = ball.y < 8 ? 8 : H - 8; ball.vy *= -0.85; } else { restartOut('side'); return; } }
    const inGoal = Math.abs(ball.y - H / 2) < GW / 2;
    if (inGoal && ball.z > 34 && (ball.x < 0 || ball.x > W)) { if (koi) { ball.x = ball.x < 0 ? 0 : W; ball.vx *= -0.85; } else { restartOut('end'); return; } }
    if (ball.x < 0) { if (inGoal) { goal(1); return; } if (koi) { ball.x = 0; ball.vx = Math.abs(ball.vx) * 0.85; } else { restartOut('end'); return; } }
    if (ball.x > W) { if (inGoal) { goal(0); return; } if (koi) { ball.x = W; ball.vx = -Math.abs(ball.vx) * 0.85; } else { restartOut('end'); return; } }
    const sp = Math.hypot(ball.vx, ball.vy);
    for (const p of players) {
      if (p.cd > 0 || ball.z > 22) continue;
      const d = Math.hypot(p.x - ball.x, p.y - ball.y);
      if (sp < 450 && d < 17) { ball.owner = p; p.hold = 0; break; }
      if (sp >= 450 && d < 20) {
        p.cd = 0.3; ball.lt = p.t;
        if (p.i === 0 && srnd() < 0.5) { ball.owner = p; p.hold = 0; break; }
        ball.vx *= p.i === 0 ? -0.5 : 0.5; ball.vy = ball.vy * 0.5 + (srnd() - 0.5) * 200; break;
      }
    }
  }
  ball.rot += ball.vx * dt * 0.06 + ball.vy * dt * 0.02;
}

// ---------- tekenen ----------
function poly(c, pts) {
  cx.fillStyle = c; cx.beginPath();
  pts.forEach((q, i) => i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1])); cx.closePath(); cx.fill();
}
function seg(a, b) { cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); }
function lerp2(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function line(pts) {
  cx.beginPath();
  pts.forEach(([x, y], i) => { const q = P(x, y); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); });
  cx.stroke();
}
function rr(x, y, w, h, r) {
  cx.beginPath(); cx.moveTo(x + r, y); cx.lineTo(x + w - r, y); cx.quadraticCurveTo(x + w, y, x + w, y + r);
  cx.lineTo(x + w, y + h - r); cx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  cx.lineTo(x + r, y + h); cx.quadraticCurveTo(x, y + h, x, y + h - r);
  cx.lineTo(x, y + r); cx.quadraticCurveTo(x, y, x + r, y); cx.closePath();
}
function txt(s, x, y, size, col, align, weight) {
  cx.font = (weight || '800') + ' ' + size + 'px system-ui,-apple-system,Segoe UI,sans-serif';
  cx.fillStyle = col; cx.textAlign = align || 'left'; cx.fillText(s, x, y);
}

// ---------- gras: echte textuur, per schermrij in perspectief ----------
let TXL = 2, GX0 = -340, GX1 = 1840, GY0 = -45, GY1 = 655;
let grass = null;

// ---------- STRAAT: 5 tegen 5 op kleine pleinen (eigen ontwerp, geen merklogo's) ----------
const COURTS = {
  beton: { name: 'BETONPLEIN', sub: 'GRAFFITI, BAKSTEEN EN HEKKEN', floor: '#4a4d52', floor2: '#44474c', line: 'rgba(240,226,200,.88)', sky: ['#171321', '#3a2c30'], crowd: 'mural', wall: 'graffiti', tile: 80, worn: true, puddle: '#6b7a8a', fenceShadow: true, grade: 'rgba(255,190,120,.07)',
    lamps: [{ fx: 0.12, y: 34, r: 60, col: '255,214,150', a: 0.5 }, { fx: 0.5, y: 30, r: 70, col: '255,214,150', a: 0.45 }, { fx: 0.88, y: 34, r: 60, col: '255,214,150', a: 0.5 }] },
  neon: { name: 'NEONHAL', sub: 'BLAUW LICHT EN NEON', floor: '#1138a8', floor2: '#0e2f94', line: 'rgba(224,240,255,.95)', sky: ['#03051a', '#0b1448'], crowd: 'fans', wall: 'boards', indoor: true, tile: 60, glow: true, streaks: true, grade: 'rgba(40,110,255,.08)',
    lamps: [0, 1, 2, 3, 4, 5, 6].map(i => ({ fx: (i + 0.5) / 7, y: 16, r: 54, col: i & 1 ? '255,60,160' : '90,200,255', a: 0.6, flick: i === 3 ? 3 : 0, cone: !(i & 1), spread: 70 })) },
  dak: { name: 'DAKTERRAS', sub: 'DE STAD BIJ SCHEMER', floor: '#8b3a2b', floor2: '#7f3326', line: 'rgba(255,255,255,.94)', sky: ['#2a1b4d', '#f0906c'], crowd: 'skyline', wall: 'parapet', tile: 100, puddle: '#7a6a96', grade: 'rgba(255,140,90,.06)',
    lamps: [0.12, 0.37, 0.63, 0.88].map(fx => ({ fx, y: 26, r: 64, col: '255,238,200', a: 0.8, cone: true, spread: 110 })) },
  kooi: { name: 'KOOIVELD', sub: 'METALEN HEKKEN EN KUNSTGRAS', floor: '#2a5b49', floor2: '#245140', line: 'rgba(250,244,220,.92)', sky: ['#0d1426', '#27304f'], crowd: 'fans', wall: 'cage', tile: 90, worn: true, bare: '#7a6a45', puddle: '#3c5a6a', fenceShadow: true, grade: 'rgba(120,170,255,.05)',
    lamps: [{ fx: 0.25, y: 22, r: 60, col: '255,236,190', a: 0.6, cone: true, spread: 120 }, { fx: 0.75, y: 22, r: 60, col: '255,236,190', a: 0.6, cone: true, spread: 120 }] },
  tunnel: { name: 'ONDERDOORGANG', sub: 'BETON, TL-LICHT EN TAGS', floor: '#5e6166', floor2: '#585b60', line: 'rgba(224,221,206,.85)', sky: ['#16171b', '#4a4d53'], crowd: 'tunnel', wall: 'tunnelwall', tile: 70, worn: true, puddle: '#3f5a6b', streaks: false, grade: 'rgba(80,110,140,.09)',
    lamps: [0, 1, 2, 3, 4, 5, 6].map(i => ({ fx: (i + 0.5) / 7, y: 14, r: 46, col: '255,233,168', a: 0.62, flick: i === 2 ? 2.2 : i === 5 ? 3.1 : 0, cone: i % 2 === 1, spread: 60 })) },
  carpark: { name: 'PARKEERPLAATS', sub: 'AVOND EN LANTAARNS', floor: '#3a3d41', floor2: '#35383c', line: 'rgba(242,242,242,.9)', sky: ['#2a3556', '#7a4a52'], crowd: 'carpark', wall: 'blocks', tile: 90, worn: true, stripes: true, puddle: '#4a5a7a', grade: 'rgba(255,170,90,.07)',
    lamps: [0.2, 0.5, 0.8].map(fx => ({ fx, y: 34, r: 66, col: '255,190,100', a: 0.75, cone: true, spread: 100 })) },
  strand: { name: 'STRANDVELD', sub: 'ZAND, ZEE EN PALMEN', floor: '#e4c88e', floor2: '#dcbe82', line: 'rgba(255,255,255,.95)', sky: ['#3f9be0', '#cdeefa'], crowd: 'beach', wall: 'planks', tile: 110, sand: true, grade: 'rgba(255,220,150,.08)', lamps: [] },
  flagship: { name: 'FLAGSHIP ARENA', sub: 'FEL ORANJE, ZWART GLAS, SPOTLIGHTS', floor: '#ff7300', floor2: '#ff6600', line: 'rgba(255,255,255,.97)', sky: ['#050505', '#17171c'], crowd: 'fans', wall: 'studio', indoor: true, tile: 70, logo: 'logos/veld-flagship.png',
    lamps: [0, 1, 2, 3, 4].map(i => ({ fx: (i + 0.5) / 5, y: 14, r: 52, col: '255,244,225', a: 0.7, cone: true, spread: 80 })) }
};
// eigen logo op het veld: bij een plein staat logo: 'logos/<naam>.png'; het komt in het midden van de vloer en op de keuzekaart
function courtLogo(c) {
  if (!c || !c.logo || c.logoImg || c.logoTry) return; c.logoTry = 1;
  const im = new Image(); im.onload = () => { c.logoImg = im; if (court === c) buildGrass(); }; im.src = c.logo;
}
const TAGWORDS = ['STRAAT', 'EAWG', 'SKILLS', 'GOAL', 'WAASLAND', 'PLEIN', 'NO LOOK', 'TIKI'];
const TAGCOLS = ['#ff4fa3', '#37e6c8', '#ffd400', '#ff7a3d', '#7b5cff', '#c6ff2a', '#3ab0ff'];
function setCourt(id) {
  const key = id && COURTS[id] ? id : 'veld';
  if (key === curKey) return;
  curKey = key;
  if (key !== 'veld') {
    if (!inStreet) { koiUser = koi; inStreet = true; }
    court = COURTS[key]; courtLogo(court); W = 800; H = 440; GW = 90; NP = 5; HOME = HOME5; koi = 1;
    GX0 = -340; GX1 = W + 340; GY0 = -45; GY1 = H + 60;
    if (!court.tags) { let seed = 11; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; court.tags = []; for (let x = -40; x < W + 40; x += 70 + rnd() * 40) court.tags.push({ x, w: 60 + rnd() * 30, col: TAGCOLS[(rnd() * TAGCOLS.length) | 0], word: TAGWORDS[(rnd() * TAGWORDS.length) | 0], rot: rnd() }); }
  } else {
    if (inStreet) { koi = koiUser; inStreet = false; }
    court = null; W = 1500; H = 600; GW = 100; NP = 8; HOME = HOME8; zoom = CAMS[camIdx];
    GX0 = -340; GX1 = 1840; GY0 = -45; GY1 = 655;
  }
  camX = W / 2; buildGrass(); buildBG();
}
// ruis als herhaaltegel in plaats van een lus over miljoenen beeldpunten (getImageData + putImageData).
// Zelfde optelling als vroeger: positieve ruis met 'lighter' (optellen), negatieve met 'difference' (aftrekken, alle vloerkleuren zijn donkerder dan de ruis groot is).
// kr/kg/kb: factor per kleurkanaal, amp: maximale afwijking, rnd: toevalsbron.
function noiseOnto(g, w, h, amp, kr, kg, kb, rnd, size) {
  size = size || 256;
  const pos = document.createElement('canvas'), neg = document.createElement('canvas'); pos.width = neg.width = pos.height = neg.height = size;
  const pg = pos.getContext('2d'), ng = neg.getContext('2d'), pi = pg.createImageData(size, size), ni = ng.createImageData(size, size), pd = pi.data, nd = ni.data;
  for (let i = 0; i < pd.length; i += 4) {
    const n = (rnd() - 0.5) * 2 * amp, a = Math.abs(n), d = n > 0 ? pd : nd;
    d[i] = Math.round(a * kr); d[i + 1] = Math.round(a * kg); d[i + 2] = Math.round(a * kb); pd[i + 3] = nd[i + 3] = 255;
  }
  pg.putImageData(pi, 0, 0); ng.putImageData(ni, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'lighter'; g.fillStyle = g.createPattern(pos, 'repeat'); g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'difference'; g.fillStyle = g.createPattern(neg, 'repeat'); g.fillRect(0, 0, w, h);
  g.restore();
  pos.width = pos.height = neg.width = neg.height = 0;
}
// LCG van rngOf n stappen vooruitzetten zonder n keer te rekenen (zo blijft de rest van de vloer op exact dezelfde plek)
function rngSkip(r, n) {
  let A = 1, C = 0, a = 1664525, c = 1013904223;
  while (n > 0) { if (n & 1) { A = Math.imul(a, A) >>> 0; C = (Math.imul(a, C) + c) >>> 0; } c = (Math.imul(a, c) + c) >>> 0; a = Math.imul(a, a) >>> 0; n = Math.floor(n / 2); }
  return r.jump(A, C);
}
function buildFloor() {
  const c = court, tw = (GX1 - GX0) * TXL, th = (GY1 - GY0) * TXL;
  if (grass) grass.width = grass.height = 0;
  grass = document.createElement('canvas'); grass.width = tw; grass.height = th;
  const g = grass.getContext('2d'), X = x => (x - GX0) * TXL, Y = y => (y - GY0) * TXL, cell = c.tile, rw = rngOf(5 + c.name.length * 7);
  g.fillStyle = c.floor; g.fillRect(0, 0, tw, th);
  for (let wx = Math.floor(GX0 / cell) * cell; wx < GX1; wx += cell) for (let wy = Math.floor(GY0 / cell) * cell; wy < GY1; wy += cell) {
    if (((wx / cell + wy / cell) & 1) === 0) continue; g.fillStyle = c.floor2; g.fillRect(X(wx), Y(wy), cell * TXL, cell * TXL);
  }
  if (c.glow) { const gr = g.createRadialGradient(X(W / 2), Y(H / 2), 10, X(W / 2), Y(H / 2), 460 * TXL); gr.addColorStop(0, 'rgba(120,190,255,.32)'); gr.addColorStop(1, 'rgba(120,190,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, tw, th); }
  noiseOnto(g, tw, th, 7, 1, 1, 1, rngOf(5 + c.name.length * 13), 256); rngSkip(rw, grass.width * grass.height);
  g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2;
  for (let i = 0; i < 26; i++) { g.beginPath(); let x = rw() * tw, y = rw() * th; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (rw() - 0.5) * 120; y += (rw() - 0.5) * 80; g.lineTo(x, y); } g.stroke(); }
  if (c.sand) {
    g.lineWidth = 2 * TXL; for (let i = 0; i < 70; i++) { const x = rw() * tw, y = rw() * th, len = (60 + rw() * 160) * TXL; g.strokeStyle = rw() < 0.5 ? 'rgba(255,245,215,.28)' : 'rgba(150,110,50,.2)'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len * 0.5, y + (rw() - 0.5) * 16 * TXL, x + len, y + (rw() - 0.5) * 8 * TXL); g.stroke(); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = rw() < 0.5 ? 'rgba(255,255,255,.22)' : 'rgba(120,85,40,.22)'; g.fillRect(rw() * tw, rw() * th, 1 + rw() * 1.5, 1 + rw() * 1.5); }
  }
  if (c.speck) for (let i = 0; i < 3000; i++) { g.fillStyle = c.speck[rw() < 0.5 ? 0 : 1]; g.fillRect(rw() * tw, rw() * th, 1 + rw() * 2.5, 1 + rw() * 2.5); }
  if (c.worn) {
    for (let i = 0; i < 30; i++) { const x = rw() * tw, y = rw() * th, w = 40 + rw() * 160, h = 30 + rw() * 90; g.fillStyle = rw() < 0.5 ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.07)'; g.fillRect(x, y, w, h); }
    for (let i = 0; i < 9; i++) { const x = X(rw() * W), y = Y(rw() * H), r = (20 + rw() * 50) * TXL, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 4000; i++) { g.fillStyle = rw() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.18)'; g.fillRect(rw() * tw, rw() * th, 1 + rw() * 2, 1 + rw() * 2); }
    g.fillStyle = 'rgba(0,0,0,.2)'; for (let k = 0; k < 3; k++) { const rx = X(rw() * W * 0.8), ry = Y(rw() * H * 0.7); g.fillRect(rx, ry, (90 + rw() * 120) * TXL, (14 + rw() * 26) * TXL); }
  }
  if (c.bare) for (const [bx, by, br] of [[0, H / 2, 85], [W, H / 2, 85], [W / 2, H / 2, 45]]) { const gr = g.createRadialGradient(X(bx), Y(by), 0, X(bx), Y(by), br * TXL); gr.addColorStop(0, c.bare); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalAlpha = 0.65; g.fillStyle = gr; g.fillRect(X(bx) - br * TXL, Y(by) - br * TXL, 2 * br * TXL, 2 * br * TXL); g.globalAlpha = 1; }
  if (c.stripes) { g.strokeStyle = 'rgba(232,212,77,.42)'; g.lineWidth = 3 * TXL; for (let x = 30; x < W; x += 62) { g.beginPath(); g.moveTo(X(x), Y(0)); g.lineTo(X(x), Y(96)); g.stroke(); } g.beginPath(); g.moveTo(X(0), Y(96)); g.lineTo(X(W), Y(96)); g.stroke(); }
  if (c.streaks) { for (let i = 0; i < 7; i++) { const x = X((i + 0.5) / 7 * W), gr = g.createLinearGradient(0, Y(0), 0, Y(H)); gr.addColorStop(0, 'rgba(180,230,255,.0)'); gr.addColorStop(0.5, 'rgba(180,230,255,.13)'); gr.addColorStop(1, 'rgba(180,230,255,0)'); g.fillStyle = gr; g.fillRect(x - 7 * TXL, Y(0), 14 * TXL, H * TXL); } g.strokeStyle = 'rgba(0,0,20,.16)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = X(rw() * W), y = Y(rw() * H); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y + 8 * (rw() - 0.5), x + (30 + rw() * 40), y + 10 * (rw() - 0.5)); g.stroke(); } }
  if (c.puddle) for (let i = 0; i < 5; i++) {
    const x = X(60 + rw() * (W - 120)), y = Y(40 + rw() * (H - 80)), rx = (34 + rw() * 60) * TXL, ry = rx * 0.34, gr = g.createRadialGradient(x, y, 0, x, y, rx);
    gr.addColorStop(0, c.puddle); gr.addColorStop(0.7, c.puddle); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.save(); g.translate(x, y); g.scale(1, 0.34); g.translate(-x, -y); g.globalAlpha = 0.5; g.fillStyle = gr; g.beginPath(); g.arc(x, y, rx, 0, 6.2832); g.fill(); g.restore(); g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - rx * 0.4, y - ry * 0.2, rx * 0.8, 2 * TXL);
  }
  g.globalCompositeOperation = 'lighter';
  (c.lamps || []).forEach((L, i) => { if (!L.cone) return; const px = X(L.fx * W), py = Y(H * (0.3 + (i % 2) * 0.35)), r = 190 * TXL, gr = g.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, 'rgba(' + L.col + ',.17)'); gr.addColorStop(1, 'rgba(' + L.col + ',0)'); g.fillStyle = gr; g.fillRect(px - r, py - r, 2 * r, 2 * r); });
  g.globalCompositeOperation = 'source-over';
  let gr2 = g.createLinearGradient(0, Y(0), 0, Y(46)); gr2.addColorStop(0, 'rgba(0,0,0,.5)'); gr2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr2; g.fillRect(X(-20), Y(0), (W + 40) * TXL, 46 * TXL);
  gr2 = g.createLinearGradient(X(0), 0, X(46), 0); gr2.addColorStop(0, 'rgba(0,0,0,.5)'); gr2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr2; g.fillRect(X(0), Y(0), 46 * TXL, H * TXL);
  gr2 = g.createLinearGradient(X(W), 0, X(W - 46), 0); gr2.addColorStop(0, 'rgba(0,0,0,.5)'); gr2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr2; g.fillRect(X(W - 46), Y(0), 46 * TXL, H * TXL);
  if (c.fenceShadow) { g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 3 * TXL; for (let x = -30; x < W + 30; x += 70) { g.beginPath(); g.moveTo(X(x), Y(0)); g.lineTo(X(x + 46), Y(62)); g.stroke(); } for (let y = 10; y < H; y += 70) { g.beginPath(); g.moveTo(X(0), Y(y)); g.lineTo(X(56), Y(y + 28)); g.stroke(); g.beginPath(); g.moveTo(X(W), Y(y)); g.lineTo(X(W - 56), Y(y + 28)); g.stroke(); } }
  bakeLines(g, X, Y, tw, th, rw);
  if (c.grade) { g.fillStyle = c.grade; g.fillRect(0, 0, tw, th); }
  const vg = g.createRadialGradient(X(W / 2), Y(H / 2), 80 * TXL, X(W / 2), Y(H / 2), 560 * TXL); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.38)'); g.fillStyle = vg; g.fillRect(0, 0, tw, th);
  g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, X(0), th); g.fillRect(X(W), 0, tw - X(W), th);
}
function bakeLines(g, X, Y, tw, th, rw) {
  const lc = document.createElement('canvas'); lc.width = tw; lc.height = th; const l = lc.getContext('2d');
  l.strokeStyle = court.line; l.fillStyle = court.line; l.lineWidth = 3.2 * TXL; l.lineCap = 'round'; l.lineJoin = 'round';
  l.beginPath(); l.rect(X(0), Y(0), W * TXL, H * TXL); l.stroke();
  l.beginPath(); l.moveTo(X(W / 2), Y(0)); l.lineTo(X(W / 2), Y(H)); l.stroke();
  l.beginPath(); l.arc(X(W / 2), Y(H / 2), 58 * TXL, 0, 6.2832); l.stroke();
  l.beginPath(); l.rect(X(0), Y(H / 2 - 95), 105 * TXL, 190 * TXL); l.stroke(); l.beginPath(); l.rect(X(W - 105), Y(H / 2 - 95), 105 * TXL, 190 * TXL); l.stroke();
  if (!court.logoImg) { l.font = '900 ' + (64 * TXL) + 'px "Arial Black", Impact, sans-serif'; l.textAlign = 'center'; l.textBaseline = 'middle'; l.fillText('EAWG', X(W / 2), Y(H / 2)); }
  l.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 1500; i++) { l.fillStyle = 'rgba(0,0,0,' + (0.35 + rw() * 0.5) + ')'; l.fillRect(rw() * tw, rw() * th, (2 + rw() * 14) * TXL, (1 + rw() * 5) * TXL); }
  for (const [px, py, r] of [[0, H / 2, 70], [W, H / 2, 70], [W / 2, H / 2, 48]]) { const gr = l.createRadialGradient(X(px), Y(py), 0, X(px), Y(py), r * TXL); gr.addColorStop(0, 'rgba(0,0,0,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); l.fillStyle = gr; l.fillRect(X(px) - r * TXL, Y(py) - r * TXL, 2 * r * TXL, 2 * r * TXL); }
  for (let i = 0; i < 12; i++) { l.fillStyle = 'rgba(0,0,0,.92)'; l.beginPath(); l.arc(rw() * tw, rw() * th, (6 + rw() * 14) * TXL, 0, 6.2832); l.fill(); }
  g.drawImage(lc, 0, 0);
  if (court.logoImg) { const lw = 190 * TXL, lh = lw * court.logoImg.height / court.logoImg.width; g.globalAlpha = 0.95; g.drawImage(court.logoImg, X(W / 2) - lw / 2, Y(H / 2) - lh / 2, lw, lh); g.globalAlpha = 1; }
  lc.width = lc.height = 0; // tijdelijk canvas meteen vrijgeven (belangrijk voor de geheugenlimiet van iOS Safari)
}
function drawLinesStreet() { /* de lijnen zitten in de vloertextuur (gebakken met slijtage) */ }
// ---------- licht: gloed, flikkering en lichtkegels (kwaliteit Q0 volledig, Q1 zonder kegels, Q2 uit) ----------
const glowCache = {};
function glowFor(col) {
  if (glowCache[col]) return glowCache[col];
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(' + col + ',1)'); gr.addColorStop(0.25, 'rgba(' + col + ',.45)'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return glowCache[col] = c;
}
function drawLights() {
  if (!court || !court.lamps || Q >= 2 || !bg) return;
  const bx = -180 - (camX - W / 2) * 0.12, bw = bg.width / bgk;
  cx.save(); cx.globalCompositeOperation = 'lighter';
  court.lamps.forEach((L, i) => {
    let a = L.a; if (L.flick) { const ph = (tNow * L.flick + i * 3.7) % 5; a *= ph < 0.18 ? 0.2 : ph < 0.3 ? 0.65 : 1; }
    const x = bx + L.fx * bw, y = L.y, r = L.r;
    cx.globalAlpha = Math.min(1, a); cx.drawImage(glowFor(L.col), x - r, y - r, 2 * r, 2 * r);
    if (L.cone && Q < 1) {
      const gr = cx.createLinearGradient(0, y, 0, SYF + 90), sp = L.spread || 90; gr.addColorStop(0, 'rgba(' + L.col + ',' + (0.2 * a) + ')'); gr.addColorStop(1, 'rgba(' + L.col + ',0)');
      cx.globalAlpha = 1; cx.fillStyle = gr; cx.beginPath(); cx.moveTo(x - 6, y + 4); cx.lineTo(x + 6, y + 4); cx.lineTo(x + sp, SYF + 90); cx.lineTo(x - sp, SYF + 90); cx.closePath(); cx.fill();
    }
  });
  cx.restore();
}
// ---------- graffiti (eigen letters, getekend met code) ----------
function rngOf(seed) { let q = seed >>> 0; const f = () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; f.jump = (A, C) => { q = (Math.imul(A, q) + C) >>> 0; return f; }; return f; }
const GPAL = [['#ffe14a', '#ff7a1a', '#1b1b2a', '#000'], ['#37e6c8', '#2a7bff', '#12122a', '#000'], ['#ff4fa3', '#b13cff', '#1b0f2a', '#000'], ['#c6ff2a', '#1fbf5a', '#0f1d12', '#000'], ['#ffffff', '#9fb4ff', '#14183a', '#000'], ['#ff6b4a', '#ffd400', '#2a0f0f', '#000']];
const GWORDS = ['DINGO', 'EAWG', 'SKILLZ', 'STRAAT', 'WAASLAND', 'PLEIN', 'KING', 'GOAL', 'ONE LOVE', 'NO LOOK', 'KICK', 'TIKI'];
function gStar(g, x, y, r, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++) { const a = i * 0.6283 - 1.5708, rr2 = i & 1 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.fill(); }
function gPiece(g, rnd, word, x, y, size, rot, pal) {
  g.save(); g.translate(x, y); g.rotate(rot); g.font = 'italic 900 ' + size + 'px "Arial Black", Impact, "Segoe UI Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineCap = 'round';
  for (let k = Math.ceil(size * 0.13); k > 0; k--) { g.fillStyle = pal[3]; g.globalAlpha = 0.85; g.fillText(word, k * 1.1, k * 1.1); }
  g.globalAlpha = 1; g.lineWidth = size * 0.17; g.strokeStyle = pal[2]; g.strokeText(word, 0, 0);
  const gr = g.createLinearGradient(0, -size * 0.5, 0, size * 0.5); gr.addColorStop(0, pal[0]); gr.addColorStop(1, pal[1]); g.fillStyle = gr; g.fillText(word, 0, 0);
  g.lineWidth = Math.max(1, size * 0.035); g.strokeStyle = 'rgba(255,255,255,.55)'; g.strokeText(word, -size * 0.025, -size * 0.025);
  const w = g.measureText(word).width;
  for (let i = 0; i < 4; i++) { const dx = (rnd() - 0.5) * w * 0.85, dl = size * (0.12 + rnd() * 0.4); g.strokeStyle = pal[1]; g.lineWidth = Math.max(1.5, size * 0.05); g.beginPath(); g.moveTo(dx, size * 0.4); g.lineTo(dx, size * 0.4 + dl); g.stroke(); g.fillStyle = pal[1]; g.beginPath(); g.arc(dx, size * 0.4 + dl, Math.max(1.2, size * 0.034), 0, 6.2832); g.fill(); }
  g.restore();
  g.fillStyle = pal[0]; g.globalAlpha = 0.5; for (let i = 0; i < 70; i++) { g.fillRect(x + (rnd() - 0.5) * size * word.length * 0.9, y + (rnd() - 0.5) * size * 1.5, 1.2, 1.2); } g.globalAlpha = 1;
}
function sprayTex(w, h, seed, base, blockW) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), rnd = rngOf(seed);
  const n = Math.max(1, Math.round(w / blockW));
  for (let b = 0; b < n; b++) {
    const x0 = b * w / n, bw = w / n; g.fillStyle = base[b % base.length]; g.fillRect(x0, 0, bw + 1, h);
    for (let i = 0; i < 120; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.08)'; g.fillRect(x0 + rnd() * bw, rnd() * h, 2 + rnd() * 10, 1 + rnd() * 5); }
    const pal = GPAL[(rnd() * GPAL.length) | 0], word = GWORDS[(rnd() * GWORDS.length) | 0];
    gPiece(g, rnd, word, x0 + bw / 2, h * 0.48, Math.min(h * 0.62, bw / (word.length * 0.62)), (rnd() - 0.5) * 0.12, pal);
    if (rnd() < 0.7) gStar(g, x0 + bw * (0.1 + rnd() * 0.8), h * (0.15 + rnd() * 0.15), h * 0.09, '#fff');
    if (rnd() < 0.6) { const p2 = GPAL[(rnd() * GPAL.length) | 0]; gPiece(g, rnd, GWORDS[(rnd() * GWORDS.length) | 0], x0 + bw * (0.2 + rnd() * 0.6), h * 0.86, h * 0.18, (rnd() - 0.5) * 0.2, p2); }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x0, 0, 2, h);
  }
  const dg = g.createLinearGradient(0, 0, 0, h); dg.addColorStop(0, 'rgba(255,255,255,.12)'); dg.addColorStop(0.3, 'rgba(0,0,0,0)'); dg.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = dg; g.fillRect(0, 0, w, h);
  return c;
}
function mural(g, w, h, rnd) {
  g.fillStyle = '#3a2420'; g.fillRect(0, 0, w, h);
  for (let y = 0, r = 0; y < h; y += 9, r++) for (let x = -(r & 1) * 11; x < w; x += 22) { const k = 0.7 + rnd() * 0.5; g.fillStyle = 'rgb(' + Math.round(104 * k) + ',' + Math.round(58 * k) + ',' + Math.round(46 * k) + ')'; g.fillRect(x + 1, y + 1, 20, 7); }
  let x = 10; const rs = rngOf(77);
  while (x < w - 60) { const pw = 200 + rs() * 180, ph = 84 + rs() * 22, py = 10 + rs() * 16; const t = sprayTex(Math.round(pw), Math.round(ph), (rs() * 99999) | 0, ['#2b2b34', '#3a3f4a', '#4a3a2e'], pw / 2); g.drawImage(t, x, py); t.width = t.height = 0; g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.strokeRect(x, py, pw, ph); x += pw + 14 + rs() * 30; }
  for (let i = 0; i < 6; i++) { const wx = 40 + rs() * (w - 100), wy = 6 + rs() * 12; g.fillStyle = 'rgba(15,10,14,.9)'; g.fillRect(wx, wy, 26, 34); g.fillStyle = 'rgba(255,205,120,.55)'; g.fillRect(wx + 3, wy + 3, 20, 28); g.fillStyle = 'rgba(20,12,16,.9)'; g.fillRect(wx + 12, wy + 3, 2, 28); }
  g.strokeStyle = 'rgba(255,230,170,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 4); for (let xx = 0; xx <= w; xx += 40) g.lineTo(xx, 4 + Math.sin(xx * 0.05) * 6 + 6); g.stroke();
  for (let xx = 10; xx < w; xx += 40) { g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(xx, 10 + Math.sin(xx * 0.05) * 6, 2.2, 0, 6.2832); g.fill(); }
  const sk = ['#f1c9a5', '#d9a273', '#a8744a', '#6b4428'], cl = ['#d9e8f5', '#c0392b', '#1d2a52', '#f4d03f', '#2c3e66', '#e8e8ea', '#3c4a6b'];
  for (let row = 0; row < 2; row++) for (let px = -6; px < w; px += 15 + rs() * 12) {
    if (rs() < 0.18) continue; const py = h - 78 + row * 14 + rs() * 4, bh = 26 + rs() * 8;
    g.fillStyle = cl[(rs() * cl.length) | 0]; g.fillRect(px, py + 7, 11, bh); g.fillStyle = sk[(rs() * 4) | 0]; g.beginPath(); g.arc(px + 5.5, py + 3.5, 4.4, 0, 6.2832); g.fill();
  }
  const sh = g.createLinearGradient(0, h - 90, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = sh; g.fillRect(0, h - 90, w, 90);
  const lip = g.createLinearGradient(0, h - 26, 0, h); lip.addColorStop(0, '#16151a'); lip.addColorStop(1, '#07070a'); g.fillStyle = lip; g.fillRect(0, h - 26, w, 26);
}

function tunnelBG(g, w, h, rnd) {
  const wall = g.createLinearGradient(0, 0, 0, h); wall.addColorStop(0, '#16171b'); wall.addColorStop(0.3, '#44474d'); wall.addColorStop(1, '#5e6166'); g.fillStyle = wall; g.fillRect(0, 0, w, h);
  const ox = w * 0.5 - 170, oy = 46, ow = 340, oh = h - oy - 28, sk = g.createLinearGradient(0, oy, 0, oy + oh); sk.addColorStop(0, '#1b1f4b'); sk.addColorStop(0.6, '#8a4a5c'); sk.addColorStop(1, '#ff8a5c'); g.fillStyle = sk; g.fillRect(ox, oy, ow, oh);
  for (let x = ox; x < ox + ow;) { const bw = 14 + rnd() * 26, bh = 14 + rnd() * 46; g.fillStyle = '#0d0b16'; g.fillRect(x, oy + oh - bh, Math.min(bw, ox + ow - x), bh); for (let wy = oy + oh - bh + 4; wy < oy + oh - 4; wy += 8) for (let wx = x + 3; wx < x + bw - 4 && wx < ox + ow - 3; wx += 7) if (rnd() < 0.3) { g.fillStyle = rnd() < 0.7 ? '#ffd27a' : '#9fd8ff'; g.fillRect(wx, wy, 2.5, 3.5); } x += bw + 1; }
  g.strokeStyle = '#7a5a3a'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 46); g.lineTo(w, 46); g.stroke(); g.strokeStyle = '#4a4d52'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 56); g.lineTo(w, 56); g.stroke();
  const rs = rngOf(91);
  for (let px = 24; px < w; px += 230) {
    if (px + 40 > ox - 6 && px < ox + ow + 6) continue;
    const gr = g.createLinearGradient(px, 0, px + 40, 0); gr.addColorStop(0, '#4c4f54'); gr.addColorStop(0.5, '#767980'); gr.addColorStop(1, '#484b50'); g.fillStyle = gr; g.fillRect(px, 30, 40, h - 56);
    for (let k = 0; k < 14; k++) { g.fillStyle = 'rgba(0,0,0,' + (0.06 + rs() * 0.1) + ')'; g.fillRect(px + rs() * 36, 30 + rs() * 40, 2 + rs() * 4, 20 + rs() * (h - 90)); }
    g.fillStyle = '#212328'; g.fillRect(px - 3, 28, 46, 7);
    const t = sprayTex(150, 60, (rs() * 99999) | 0, ['#6a6d72', '#62656a'], 150); g.drawImage(t, px + 46, h - 92); t.width = t.height = 0;
  }
  const ce = g.createLinearGradient(0, 0, 0, 38); ce.addColorStop(0, '#0e0f12'); ce.addColorStop(1, '#2a2c31'); g.fillStyle = ce; g.fillRect(0, 0, w, 36);
  for (const L of court.lamps) { const x = L.fx * w; g.fillStyle = '#d8d2b8'; g.fillRect(x - 32, 11, 64, 6); g.fillStyle = '#fff6d0'; g.fillRect(x - 28, 12, 56, 3); }
  const sk2 = ['#f1c9a5', '#d9a273', '#a8744a'];
  for (let i = 0; i < 9; i++) { const x = 30 + rs() * (w - 60); g.fillStyle = ['#1d2230', '#2a2a35', '#3a2a2a'][(rs() * 3) | 0]; g.fillRect(x, h - 52, 12, 22); g.beginPath(); g.arc(x + 6, h - 56, 5, 0, 6.2832); g.fillStyle = sk2[(rs() * 3) | 0]; g.fill(); g.fillStyle = 'rgba(20,20,28,.9)'; g.beginPath(); g.arc(x + 6, h - 58, 5.6, Math.PI, 0); g.fill(); }
  const sh = g.createLinearGradient(0, h - 80, 0, h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.5)'); g.fillStyle = sh; g.fillRect(0, h - 80, w, 80);
  const lip = g.createLinearGradient(0, h - 26, 0, h); lip.addColorStop(0, '#2a2c31'); lip.addColorStop(1, '#0c0d10'); g.fillStyle = lip; g.fillRect(0, h - 26, w, 26);
}
function carparkBG(g, w, h, rnd) {
  skyline(g, w, h, rnd);
  const cols = ['#20242c', '#3a2a2a', '#2a3a4a', '#4a4a52', '#5a1f1f', '#d8d8dc'];
  for (let x = 8; x < w; x += 86 + rnd() * 50) {
    const cw = 66 + rnd() * 22, col = cols[(rnd() * cols.length) | 0], by = h - 46;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 2, by + 14, cw + 4, 6);
    g.fillStyle = col; g.beginPath(); g.moveTo(x, by + 14); g.lineTo(x + 2, by + 2); g.lineTo(x + cw * 0.22, by); g.lineTo(x + cw * 0.34, by - 12); g.lineTo(x + cw * 0.74, by - 12); g.lineTo(x + cw * 0.9, by); g.lineTo(x + cw, by + 3); g.lineTo(x + cw, by + 14); g.closePath(); g.fill();
    g.fillStyle = 'rgba(160,200,235,.38)'; g.fillRect(x + cw * 0.37, by - 10, cw * 0.34, 9);
    g.fillStyle = '#0a0a0e'; g.beginPath(); g.arc(x + cw * 0.22, by + 14, 6, 0, 6.2832); g.arc(x + cw * 0.78, by + 14, 6, 0, 6.2832); g.fill();
    g.fillStyle = 'rgba(255,210,120,.8)'; g.fillRect(x + cw - 3, by + 4, 3, 3);
  }
  for (const L of court.lamps) { const x = L.fx * w; g.fillStyle = '#101218'; g.fillRect(x - 2, L.y + 6, 4, h - L.y - 28); g.fillRect(x - 14, L.y - 3, 22, 6); }
  const lip = g.createLinearGradient(0, h - 26, 0, h); lip.addColorStop(0, '#222428'); lip.addColorStop(1, '#08080a'); g.fillStyle = lip; g.fillRect(0, h - 26, w, 26);
}
function beachBG(g, w, h, rnd) {
  const hy = Math.round(h * 0.42), sh = h - 40;
  const sg = g.createRadialGradient(w * 0.72, hy - 30, 4, w * 0.72, hy - 30, 120); sg.addColorStop(0, 'rgba(255,248,210,.95)'); sg.addColorStop(0.3, 'rgba(255,236,170,.5)'); sg.addColorStop(1, 'rgba(255,236,170,0)'); g.fillStyle = sg; g.fillRect(w * 0.72 - 130, hy - 160, 260, 200);
  for (let i = 0; i < 7; i++) { const cxm = rnd() * w, cy = 24 + rnd() * (hy - 70), cw = 50 + rnd() * 70; g.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(cxm + k * cw * 0.25, cy + (k & 1) * 3, cw * 0.28, 7 + rnd() * 3, 0, 0, 6.2832); g.fill(); } }
  const sea = g.createLinearGradient(0, hy, 0, sh); sea.addColorStop(0, '#2a8fc4'); sea.addColorStop(0.55, '#1fb3c4'); sea.addColorStop(1, '#7fe0d0'); g.fillStyle = sea; g.fillRect(0, hy, w, sh - hy);
  g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(0, hy, w, 1.5);
  for (let y = hy + 6; y < sh - 6; y += 7) for (let x = rnd() * 30; x < w; x += 24 + rnd() * 40) { g.fillStyle = 'rgba(255,255,255,' + (0.12 + rnd() * 0.22) + ')'; g.fillRect(x, y, 8 + rnd() * 16, 1.4); }
  for (let i = 0; i < 3; i++) { const bx = rnd() * w, by = hy + 4 + rnd() * 10; g.fillStyle = '#f4f4f4'; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + 10, by - 16); g.lineTo(bx + 10, by); g.closePath(); g.fill(); g.fillStyle = '#c8344a'; g.fillRect(bx - 4, by, 22, 3); }
  const fo = g.createLinearGradient(0, sh - 10, 0, sh + 6); fo.addColorStop(0, 'rgba(255,255,255,0)'); fo.addColorStop(0.6, 'rgba(255,255,255,.85)'); fo.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = fo; g.fillRect(0, sh - 10, w, 16);
  g.fillStyle = '#e9d29c'; g.fillRect(0, sh + 2, w, h - sh);
  const cols = ['#e8472f', '#ffd400', '#2fb5e8', '#ff7ab0', '#7bd04a', '#ffffff'];
  for (let x = 40 + rnd() * 40; x < w - 30; x += 90 + rnd() * 110) {
    const c = cols[(rnd() * cols.length) | 0], py = sh - 6 + rnd() * 8; g.fillStyle = 'rgba(60,40,20,.5)'; g.fillRect(x + 5, py - 40, 3, 44);
    g.fillStyle = c; g.beginPath(); g.moveTo(x - 24, py - 36); g.quadraticCurveTo(x + 6, py - 66, x + 36, py - 36); g.closePath(); g.fill();
  }
  const sk = ['#f1c9a5', '#d9a273', '#a8744a', '#6b4428'];
  for (let i = 0; i < 18; i++) { const x = rnd() * w, y = sh + 2 + rnd() * (h - sh - 12); if (rnd() < 0.4) { g.fillStyle = cols[(rnd() * cols.length) | 0]; g.fillRect(x, y, 16, 6); g.fillStyle = sk[(rnd() * 4) | 0]; g.beginPath(); g.arc(x + 19, y + 3, 3, 0, 6.2832); g.fill(); } else { g.fillStyle = cols[(rnd() * cols.length) | 0]; g.fillRect(x, y - 8, 6, 9); g.fillStyle = sk[(rnd() * 4) | 0]; g.beginPath(); g.arc(x + 3, y - 11, 3, 0, 6.2832); g.fill(); } }
  for (let x = 20 + rnd() * 60; x < w; x += 150 + rnd() * 120) {
    const ty = h - 18, lean = (rnd() - 0.5) * 30, th = 70 + rnd() * 26; g.strokeStyle = '#6b4a2a'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, ty); g.quadraticCurveTo(x + lean * 0.4, ty - th * 0.5, x + lean, ty - th); g.stroke();
    g.fillStyle = '#2f9a3e'; for (let k = 0; k < 7; k++) { const a = -Math.PI + k * Math.PI / 6 - 0.05, len = 34 + rnd() * 8; g.beginPath(); g.moveTo(x + lean, ty - th); g.quadraticCurveTo(x + lean + Math.cos(a) * len * 0.6, ty - th + Math.sin(a) * len * 0.6 - 10, x + lean + Math.cos(a) * len, ty - th + Math.sin(a) * len * 0.5 + 12); g.quadraticCurveTo(x + lean + Math.cos(a) * len * 0.6, ty - th + Math.sin(a) * len * 0.6 + 2, x + lean, ty - th); g.fill(); }
    g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(x + lean - 3, ty - th + 3, 3, 0, 6.2832); g.arc(x + lean + 3, ty - th + 4, 3, 0, 6.2832); g.fill();
  }
  const lip = g.createLinearGradient(0, h - 26, 0, h); lip.addColorStop(0, '#d8bf86'); lip.addColorStop(1, '#a8905a'); g.fillStyle = lip; g.fillRect(0, h - 26, w, 26);
}
function buildBarrier() { return sprayTex(1840, 140, 31, ['#cdab4e', '#c39f45', '#d4b358', '#bf9b42'], 230); }
function texBack(tex, x0, x1, y, z1) { const a = P(x0, y, z1), b = P(x1, y, 0); cx.drawImage(tex, a[0], a[1], b[0] - a[0], b[1] - a[1]); }
function texSide(tex, x, z1, fromT) {
  const n = 30, sw = tex.width * 0.5 / n;
  for (let i = 0; i < n; i++) {
    const y0 = H * i / n, y1 = H * (i + 1) / n, a0 = P(x, y0, z1), b0 = P(x, y0, 0), a1 = P(x, y1, z1);
    cx.save(); cx.transform((a1[0] - a0[0]) / sw, (a1[1] - a0[1]) / sw, (b0[0] - a0[0]) / tex.height, (b0[1] - a0[1]) / tex.height, a0[0], a0[1]);
    cx.drawImage(tex, (fromT + i / n * 0.5) * tex.width, 0, sw + 0.8, tex.height, 0, 0, sw + 0.8, tex.height); cx.restore();
  }
}
function postFence(x0, y0, x1, y1, zt, braces) {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 70));
  cx.strokeStyle = 'rgba(190,202,220,.3)'; cx.lineWidth = 1;
  for (let i = 0; i < n; i++) { const a = i / n, b = (i + 1) / n, ax = x0 + (x1 - x0) * a, ay = y0 + (y1 - y0) * a, bx = x0 + (x1 - x0) * b, by = y0 + (y1 - y0) * b; for (let k = 0; k < 4; k++) { const t0 = k / 4, t1 = (k + 1) / 4; seg(P(ax + (bx - ax) * t0, ay + (by - ay) * t0, 0), P(ax + (bx - ax) * t1, ay + (by - ay) * t1, zt)); seg(P(ax + (bx - ax) * t0, ay + (by - ay) * t0, zt), P(ax + (bx - ax) * t1, ay + (by - ay) * t1, 0)); } }
  cx.strokeStyle = '#15171c'; cx.lineWidth = 3.2; cx.lineCap = 'round';
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; seg(P(x, y, 0), P(x, y, zt)); if (braces && i % 2 === 0) seg(P(x, y, zt), P(x + (x1 === x0 ? 0 : 14), y + (y1 === y0 ? 0 : 14), zt + 12)); }
  seg(P(x0, y0, zt), P(x1, y1, zt)); cx.lineWidth = 2; seg(P(x0, y0, zt * 0.5), P(x1, y1, zt * 0.5)); cx.lineCap = 'butt';
}
function wallP(x0, y0, x1, y1, z0, z1, f) { poly(f, [P(x0, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y0, z1)]); }
function fenceMesh(x0, y0, x1, y1, zt) {
  cx.lineWidth = 1.5; cx.strokeStyle = 'rgba(190,202,220,.5)'; const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 60));
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; seg(P(x, y, 0), P(x, y, zt)); }
  seg(P(x0, y0, zt), P(x1, y1, zt)); seg(P(x0, y0, zt * 0.5), P(x1, y1, zt * 0.5));
  cx.strokeStyle = 'rgba(190,202,220,.2)'; cx.lineWidth = 1;
  for (let i = 0; i < n; i++) { const a = i / n, b = (i + 1) / n, ax = x0 + (x1 - x0) * a, ay = y0 + (y1 - y0) * a, bx = x0 + (x1 - x0) * b, by = y0 + (y1 - y0) * b; seg(P(ax, ay, 0), P(bx, by, zt)); seg(P(ax, ay, zt), P(bx, by, 0)); }
}
function drawWalls() {
  const c = court, yb = -26;
  if (c.wall === 'graffiti') {
    const tex = c.tex || (c.tex = buildBarrier());
    postFence(-60, yb, W + 60, yb, 78, true); postFence(-8, 0, -8, H, 66, false); postFence(W + 8, 0, W + 8, H, 66, false);
    texBack(tex, -60, W + 60, yb, 28); texSide(tex, -8, 22, 0.1); texSide(tex, W + 8, 22, 0.6);
  } else if (c.wall === 'boards') {
    const wc = c.wc || ['#2a5bff', '#0a1f6a', '#0e2a80'], g = cx.createLinearGradient(0, P(0, yb, 18)[1], 0, P(0, yb, 0)[1]); g.addColorStop(0, wc[0]); g.addColorStop(1, wc[1]);
    wallP(-60, yb, W + 60, yb, 0, 18, g); wallP(-8, 0, -8, H, 0, 14, wc[2]); wallP(W + 8, 0, W + 8, H, 0, 14, wc[2]);
    cx.fillStyle = 'rgba(190,230,255,.8)'; const a = P(-60, yb, 18), b = P(W + 60, yb, 18); cx.fillRect(a[0], a[1] - 1, b[0] - a[0], 2);
    for (let x = -30; x < W + 60; x += 150) { const q = P(x, yb, 6); txt('EAWG STREET', q[0], q[1], 10 * q[2], '#fff', 'center', '900'); }
  } else if (c.wall === 'parapet') {
    const wc = c.wc || ['#9a8f86', '#8a8078']; wallP(-60, yb, W + 60, yb, 0, 16, wc[0]); wallP(-8, 0, -8, H, 0, 14, wc[1]); wallP(W + 8, 0, W + 8, H, 0, 14, wc[1]);
    cx.fillStyle = 'rgba(255,236,190,.55)'; const a = P(-60, yb, 16), b = P(W + 60, yb, 16); cx.fillRect(a[0], a[1] - 1, b[0] - a[0], 2.5);
    cx.strokeStyle = 'rgba(40,30,40,.7)'; cx.lineWidth = 2; for (let x = -40; x < W + 60; x += 120) { seg(P(x, yb, 16), P(x, yb, 46)); } seg(P(-60, yb, 46), P(W + 60, yb, 46));
  } else if (c.wall === 'planks') {
    for (let x = -60; x < W + 60; x += 40) wallP(x, yb, x + 38, yb, 0, 20, ((x / 40) & 1) ? '#b5865a' : '#c3956a');
    for (let y = 0; y < H; y += 40) { wallP(-8, y, -8, y + 38, 0, 16, (y / 40) & 1 ? '#a97a50' : '#b5865a'); wallP(W + 8, y, W + 8, y + 38, 0, 16, (y / 40) & 1 ? '#a97a50' : '#b5865a'); }
    cx.fillStyle = 'rgba(255,230,190,.7)'; const a = P(-60, yb, 20), b = P(W + 60, yb, 20); cx.fillRect(a[0], a[1] - 1, b[0] - a[0], 2.5);
    cx.lineCap = 'round'; cx.strokeStyle = '#5a3d22'; cx.lineWidth = 4; for (let x = -40; x <= W + 60; x += 120) seg(P(x, yb, 20), P(x, yb, 44));
    cx.strokeStyle = 'rgba(245,235,215,.8)'; cx.lineWidth = 2; for (let x = -40; x < W + 60; x += 120) { const p0 = P(x, yb, 42), p1 = P(x + 120, yb, 42); cx.beginPath(); cx.moveTo(p0[0], p0[1]); cx.quadraticCurveTo((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + 6, p1[0], p1[1]); cx.stroke(); } cx.lineCap = 'butt';
  } else if (c.wall === 'studio') {
    const g = cx.createLinearGradient(0, P(0, yb, 18)[1], 0, P(0, yb, 0)[1]); g.addColorStop(0, '#1b1b20'); g.addColorStop(1, '#050507');
    wallP(-60, yb, W + 60, yb, 0, 18, g); wallP(-8, 0, -8, H, 0, 14, '#0b0b0e'); wallP(W + 8, 0, W + 8, H, 0, 14, '#0b0b0e');
    cx.fillStyle = 'rgba(255,255,255,.9)'; const a = P(-60, yb, 18), b = P(W + 60, yb, 18); cx.fillRect(a[0], a[1] - 1, b[0] - a[0], 2);
    for (let x = -30; x < W + 60; x += 200) { const q = P(x, yb, 6); txt('EAWG', q[0], q[1], 9 * q[2], 'rgba(255,255,255,.75)', 'center', '900'); }
  } else if (c.wall === 'tunnelwall') {
    const tex = c.tex || (c.tex = sprayTex(1840, 130, 52, ['#6a6d72', '#62656a', '#707378', '#5e6166'], 260));
    texBack(tex, -60, W + 60, yb, 34); texSide(tex, -8, 30, 0.1); texSide(tex, W + 8, 30, 0.6);
    cx.lineCap = 'round'; cx.strokeStyle = '#6a4a32'; cx.lineWidth = 5; seg(P(-60, yb, 40), P(W + 60, yb, 40)); cx.strokeStyle = '#4a4d52'; cx.lineWidth = 7; seg(P(-60, yb, 50), P(W + 60, yb, 50)); cx.lineCap = 'butt';
  } else if (c.wall === 'blocks') {
    for (let x = -60; x < W + 60; x += 90) { wallP(x, yb, x + 88, yb, 0, 24, ((x / 90) & 1) ? '#8a8d91' : '#93969a'); wallP(x, yb, x + 88, yb, 20, 24, '#6f7276'); if ((((x + 60) / 90) | 0) % 3 === 0) wallP(x + 14, yb, x + 40, yb, 7, 17, '#e0c63a'); }
    for (let y = 0; y < H; y += 90) { wallP(-8, y, -8, y + 88, 0, 20, (y / 90) & 1 ? '#8a8d91' : '#93969a'); wallP(W + 8, y, W + 8, y + 88, 0, 20, (y / 90) & 1 ? '#8a8d91' : '#93969a'); }
    fenceMesh(-60, yb, W + 60, yb, 64);
  } else {
    wallP(-60, yb, W + 60, yb, 0, 9, '#3a4458'); wallP(-8, 0, -8, H, 0, 9, '#3a4458'); wallP(W + 8, 0, W + 8, H, 0, 9, '#3a4458');
    fenceMesh(-60, yb, W + 60, yb, 56); fenceMesh(-8, 0, -8, H, 96); fenceMesh(W + 8, 0, W + 8, H, 96);
    const dx = W * 0.8; wallP(dx, yb, dx + 36, yb, 0, 46, 'rgba(24,28,34,.85)'); cx.strokeStyle = '#c9ced6'; cx.lineWidth = 2; seg(P(dx + 30, yb, 20), P(dx + 30, yb, 26)); wallP(dx + 8, yb, dx + 22, yb, 50, 60, '#e0c63a');
  }
}
function skyline(g, w, h, rnd) {
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.15 + rnd() * 0.4) + ')'; g.fillRect(rnd() * w, rnd() * h * 0.45, 1.4, 1.4); }
  for (let layer = 0; layer < 2; layer++) {
    let x = -20; const base = h - 26;
    while (x < w) {
      const bw = 24 + rnd() * 46, bh = (layer ? 26 : 50) + rnd() * (layer ? 36 : 64);
      g.fillStyle = layer ? '#241a3a' : '#0d0919'; g.fillRect(x, base - bh, bw, bh + 30);
      for (let wy = base - bh + 6; wy < base - 4; wy += 9) for (let wx = x + 4; wx < x + bw - 5; wx += 8) if (rnd() < (layer ? 0.16 : 0.3)) { g.fillStyle = rnd() < 0.7 ? '#ffd27a' : '#9fd8ff'; g.fillRect(wx, wy, 3, 4); }
      x += bw + 2 + rnd() * 6;
    }
  }
  if (court && court.crowd === 'skyline') for (const L of court.lamps) { const x = L.fx * w; g.fillStyle = '#101218'; g.fillRect(x - 2, L.y + 6, 4, h - L.y - 30); g.fillRect(x - 15, L.y - 4, 30, 9); }
  const lip = g.createLinearGradient(0, h - 26, 0, h); lip.addColorStop(0, '#120c20'); lip.addColorStop(1, '#05040a'); g.fillStyle = lip; g.fillRect(0, h - 26, w, 26);
}

// ---------- voor de match: tenue (thuis, uit, speciaal), opstelling en basiself ----------
const FORMS = [[[3, 2, 2], [2, 3, 2], [3, 3, 1], [2, 2, 3]], [[2, 0, 2], [1, 2, 1], [2, 1, 1], [1, 1, 2]]];
function loadVoor() { try { const o = JSON.parse(localStorage.getItem('eawg-voor') || '{}'); if (o.k >= 0 && o.k < 3) kitSlot = o.k; if (o.f && o.f.length === 2) formIdx = [Math.max(0, Math.min(3, o.f[0] | 0)), Math.max(0, Math.min(3, o.f[1] | 0))]; } catch (e) {} }
function saveVoor() { try { localStorage.setItem('eawg-voor', JSON.stringify({ k: kitSlot, f: formIdx })); } catch (e) {} }
function setForm() { const z = NP > 5 ? 0 : 1; FORM = FORMS[z][formIdx[z]]; ATTFROM = 1 + FORM[0] + FORM[1]; }
function makeHome() {
  const big = NP > 5, lines = FORM.filter(n => n > 0).length, xs = big ? [330, 660, 980] : (lines === 3 ? [190, 285, 380] : [200, 380]);
  const out = [big ? [40, 300] : [34, 220]]; let li = 0;
  for (const n of FORM) { if (!n) continue; for (let k = 0; k < n; k++) out.push([xs[li], Math.round(H * (k + 1) / (n + 1))]); li++; }
  return out;
}
function cdist(a, b) { const p = hex2rgb(a), q = hex2rgb(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); }
function kitVariants(b) {
  const dk = '#14171f', away = lumi(b.shirt) > 0.55 ? { shirt: dk, shorts: dk, sock: dk, trim: b.shirt } : { shirt: '#f4f4f4', shorts: '#f4f4f4', sock: '#f4f4f4', trim: b.shirt };
  const pal = ['#ffd400', '#7b5cff', '#00c2a8', '#ff4fa3', '#ff7a1a', '#3ab0ff', '#c6ff2a', '#e03a3a'];
  let best = pal[0], bd = -1; for (const c of pal) { const d = Math.min(cdist(c, b.shirt), cdist(c, away.shirt)); if (d > bd) { bd = d; best = c; } }
  const light = lumi(best) > 0.55, sp = { shirt: best, shorts: light ? '#14171f' : '#f4f4f4', sock: best, trim: light ? '#14171f' : '#ffffff' };
  return [{ shirt: b.shirt, shorts: b.shorts, sock: b.sock, trim: b.trim }, away, sp];
}
function applyKitChoice() {
  for (const t of [0, 1]) if (!TEAMS[t].base) TEAMS[t].base = { shirt: TEAMS[t].shirt, shorts: TEAMS[t].shorts, sock: TEAMS[t].sock, trim: TEAMS[t].trim };
  const mine = kitVariants(TEAMS[0].base)[kitSlot]; Object.assign(TEAMS[0], mine);
  const opts = kitVariants(TEAMS[1].base); let best = opts[0], bd = -1;
  if (cdist(mine.shirt, opts[0].shirt) < 120) { for (const o of opts) { const d = cdist(mine.shirt, o.shirt); if (d > bd) { bd = d; best = o; } } }
  Object.assign(TEAMS[1], best);
}
function jersey(x, y, w, h, k) {
  const m = x + w / 2, u = Math.min(w, h) / 118;
  cx.save(); cx.translate(m, y + 8 * u); cx.scale(u, u);
  cx.fillStyle = k.sock; cx.fillRect(-17, 76, 11, 14); cx.fillRect(6, 76, 11, 14);
  cx.fillStyle = k.shorts; rr(-22, 52, 44, 26, 4); cx.fill();
  cx.fillStyle = k.shirt; cx.beginPath(); cx.moveTo(-26, 4); cx.lineTo(-44, 20); cx.lineTo(-36, 34); cx.lineTo(-26, 26); cx.lineTo(-26, 56); cx.lineTo(26, 56); cx.lineTo(26, 26); cx.lineTo(36, 34); cx.lineTo(44, 20); cx.lineTo(26, 4); cx.lineTo(10, 0); cx.quadraticCurveTo(0, 10, -10, 0); cx.closePath(); cx.fill();
  cx.strokeStyle = k.trim; cx.lineWidth = 5; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(-44, 20); cx.lineTo(-36, 34); cx.moveTo(44, 20); cx.lineTo(36, 34); cx.stroke();
  cx.beginPath(); cx.moveTo(-10, 0); cx.quadraticCurveTo(0, 10, 10, 0); cx.stroke();
  cx.fillStyle = k.trim; cx.fillRect(-26, 46, 52, 4);
  cx.restore();
}
function drawVoor() {
  const X0 = screenBG('VOOR DE MATCH'), vars = kitVariants(TEAMS[0].base || TEAMS[0]), z = NP > 5 ? 0 : 1, sw = 128;
  txt(TEAMS[0].name + '  tegen  ' + TEAMS[1].name, SW / 2, 72, 15, '#8fb0ff', 'center', '800');
  txt('TENUE', X0 + 10, 100, 13, '#8fb0ff', 'left', '800');
  ['THUIS', 'UIT', 'SPECIAAL'].forEach((nm, i) => {
    const x = X0 + 10 + i * sw, y = 108, w = 120, h = 128, sel = kitSlot === i;
    cx.fillStyle = sel ? 'rgba(255,212,0,.16)' : 'rgba(255,255,255,.07)'; rr(x, y, w, h, 8); cx.fill(); cx.strokeStyle = sel ? '#ffd400' : 'rgba(255,255,255,.3)'; cx.lineWidth = sel ? 3 : 1.2; cx.stroke();
    jersey(x, y + 4, w, 104, vars[i]); txt(nm, x + w / 2, y + h - 8, 13, sel ? '#ffd400' : '#fff', 'center', '800');
    hits.push({ x, y, w, h, fn: () => { kitSlot = i; saveVoor(); applyKitChoice(); } });
  });
  txt('OPSTELLING', X0 + 10, 258, 13, '#8fb0ff', 'left', '800');
  FORMS[z].forEach((f, i) => pill(X0 + 10 + i * 96, 266, 90, 36, f.filter(n => n > 0).join('-'), () => { formIdx[z] = i; saveVoor(); prepMatch(); }, formIdx[z] === i, 16));
  const px = X0 + 10, py = 312, pw = 372, ph = 188;
  cx.fillStyle = court ? court.floor : '#2f8a3c'; rr(px, py, pw, ph, 8); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.55)'; cx.lineWidth = 2; cx.strokeRect(px + 6, py + 6, pw - 12, ph - 12); cx.beginPath(); cx.arc(px + pw - 6, py + ph / 2, 30, 1.5708, 4.7124); cx.stroke();
  players.filter(p => p.t === 0).forEach(p => {
    const dx = px + 20 + p.hx / (Math.max(...HOME.map(h => h[0])) * 1.1) * (pw - 70), dy = py + 14 + p.hy / H * (ph - 28);
    cx.fillStyle = p.i === 0 ? '#d8ff2a' : TEAMS[0].shirt; cx.beginPath(); cx.arc(dx, dy, 11, 0, 6.2832); cx.fill(); cx.strokeStyle = '#fff'; cx.lineWidth = 2; cx.stroke();
    txt(String(p.num || ''), dx, dy + 4, 11, p.i === 0 ? '#111' : (lumi(TEAMS[0].shirt) > 0.55 ? '#111' : '#fff'), 'center', '900');
  });
  btn(X0 + 10, 512, 372, 52, 'START MATCH', () => beginMatch(), true);
  const rx = X0 + 408, rw = 382;
  if (!sbench) sbench = buildBench();
  txt('BASISELF: tik een speler, dan een invaller', rx, 100, 13, '#8fb0ff', 'left', '800');
  const role = i => i === 0 ? 'KEE' : i <= FORM[0] ? 'VER' : i <= FORM[0] + FORM[1] ? 'MID' : 'AAN';
  for (let i = 0; i < NP; i++) {
    const p = players.find(q => q.t === 0 && q.i === i); if (!p) continue; const y = 108 + i * 31;
    pill(rx, y, rw, 28, (p.num || '') + '  ' + p.name + '   ' + role(i) + '  ' + Math.round(p.rate || 0), i === 0 ? null : () => { vSelF = vSelF === i ? -1 : i; if (vSelF >= 0 && vSelB >= 0) { selF = vSelF; selB = vSelB; doSub(true); vSelF = vSelB = -1; } }, vSelF === i, 14);
  }
  const by = 108 + NP * 31 + 8;
  txt('BANK', rx, by + 4, 13, '#8fb0ff', 'left', '800');
  sbench.slice(0, 6).forEach((b, k) => pill(rx, by + 12 + k * 31, rw, 28, (b.num || '') + '  ' + b.name + '   ' + Math.round(b.rate || 0), () => { vSelB = vSelB === k ? -1 : k; if (vSelF >= 0 && vSelB >= 0) { selF = vSelF; selB = vSelB; doSub(true); vSelF = vSelB = -1; } }, vSelB === k, 14));
}

// ---------- account: aanmelden, account maken en spelvoortgang in de cloud ----------
// De server (Worker met database) regelt de accounts. Zonder server (lokaal testen) speelt het spel gewoon zonder inlog.
const AUTHKEYS = ['goalrush', 'goalrush2', 'goalrush3', 'goalrush4', 'eawg-voor'];
let authUser = null, authOn = false, authTimer = 0, authMsg = '';
const _setI = Storage.prototype.setItem, _remI = Storage.prototype.removeItem;
const AJ = (url, opt) => fetch(url, Object.assign({ credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } }, opt || {})).then(async r => { let j = null; try { j = await r.json(); } catch (e) {} return { ok: r.ok, status: r.status, j }; });
const LOKAAL = /^(localhost|127\.|192\.168\.|10\.)/.test(location.hostname);
let authLast = '';
function authSnap() { const o = {}; AUTHKEYS.forEach(k => { const v = localStorage.getItem(k); if (v !== null) o[k] = v; }); return JSON.stringify(o); }
function authSave(now) {
  if (!authOn) return Promise.resolve();
  clearTimeout(authTimer);
  const go = () => {
    const snap = authSnap(); if (snap === authLast) return Promise.resolve();
    const body = JSON.stringify({ data: snap });
    return AJ('/api/save', { method: 'PUT', body, keepalive: body.length < 60000 }).then(r => { if (r.ok) { authLast = snap; if (r.j && r.j.updated) _setI.call(localStorage, 'eawg-auth-ts', String(r.j.updated)); } }).catch(() => {});
  };
  if (now) return go();
  authTimer = setTimeout(go, 20000); return Promise.resolve();
}
function authBackup() {
  const snap = authSnap(); if (snap === '{}') return;
  Object.keys(localStorage).forEach(k => { if (k.indexOf('eawg-backup-') === 0) _remI.call(localStorage, k); });
  _setI.call(localStorage, 'eawg-backup-' + new Date().toISOString().slice(0, 10), snap);
}
Storage.prototype.setItem = function (k, v) { _setI.call(this, k, v); if (authOn && this === localStorage && AUTHKEYS.indexOf(k) >= 0) authSave(); };
Storage.prototype.removeItem = function (k) { _remI.call(this, k); if (authOn && this === localStorage && AUTHKEYS.indexOf(k) >= 0) authSave(); };
addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') authSave(true); });
function authWipe() { AUTHKEYS.forEach(k => _remI.call(localStorage, k)); _remI.call(localStorage, 'eawg-auth-ts'); }
function authApply(data, ts) {
  try { const o = JSON.parse(data); AUTHKEYS.forEach(k => { if (typeof o[k] === 'string') _setI.call(localStorage, k, o[k]); else _remI.call(localStorage, k); }); _setI.call(localStorage, 'eawg-auth-ts', String(ts || Date.now())); } catch (e) {}
}
function authOffline() {
  const d = authOverlay(), box = document.createElement('div'); box.style.cssText = LGP; d.appendChild(box);
  const t = document.createElement('div'); t.style.cssText = 'font:900 22px system-ui,sans-serif;text-align:center;margin-bottom:10px'; t.textContent = 'Geen verbinding'; box.appendChild(t);
  const x = document.createElement('div'); x.style.cssText = 'font:500 14px system-ui,sans-serif;line-height:1.45;color:rgba(255,255,255,.85)'; x.textContent = 'We kunnen je account nu niet bereiken. Je voortgang blijft veilig op dit toestel. Probeer het zo opnieuw.'; box.appendChild(x);
  const b = document.createElement('button'); b.type = 'button'; b.style.cssText = LGB; b.textContent = 'OPNIEUW PROBEREN'; b.onclick = () => location.reload(); box.appendChild(b);
}
async function authInit() {
  let r; try { r = await AJ('/api/me'); } catch (e) { if (!LOKAAL) authOffline(); return; }
  if (r.status === 401 && r.j) { authLoginScreen(); return; }
  if (r.ok && r.j && r.j.username) { authUser = r.j.username; await authSyncStart(); return; }
  if (!LOKAAL) authOffline();
}
async function authSyncStart() {
  let r; try { r = await AJ('/api/save'); } catch (e) { authOn = true; return; }
  const lt = +localStorage.getItem('eawg-auth-ts') || 0;
  if (r.ok && r.j && r.j.data && (r.j.updated || 0) > lt) { authBackup(); authApply(r.j.data, r.j.updated); location.reload(); return; }
  authOn = true; if (r.ok && r.j && r.j.data) authLast = r.j.data; else authSave(true);
}
async function authAfterLogin() {
  let r = null; try { r = await AJ('/api/save'); } catch (e) {}
  if (r && r.ok && r.j && r.j.data) { authBackup(); authApply(r.j.data, r.j.updated); }
  else { authOn = true; await authSave(true); }
  location.reload();
}
function authPrivacy() {
  authDialog('Privacy', 'We bewaren alleen je gebruikersnaam, een versleuteld wachtwoord en je spelvoortgang. Geen e-mailadres, geen leeftijd, geen echte naam nodig. Je IP-adres gebruiken we alleen om te veel aanmeldpogingen te stoppen en wissen we na 24 uur. Je gegevens staan bij Cloudflare in de EU. Je kunt je voortgang downloaden en je account altijd zelf verwijderen bij MEER, ACCOUNT. Vergeet je wachtwoord en ben je je herstelcode kwijt, dan kan niemand je account terughalen. Gebruik geen echte naam als gebruikersnaam.' + (typeof PRIVACY_CONTACT === 'string' && PRIVACY_CONTACT ? ' Vragen: ' + PRIVACY_CONTACT : ''), [], 'SLUIT', async () => '');
}
const PRIVACY_CONTACT = '';
const LGI = 'width:100%;box-sizing:border-box;font:600 16px system-ui,sans-serif;padding:13px 14px;margin:5px 0;border-radius:10px;border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);color:#fff;outline:none';
const LGB = 'width:100%;font:800 17px system-ui,sans-serif;padding:14px;margin-top:8px;border-radius:10px;border:0;cursor:pointer;background:#f2f4f8;color:#0b1b4d';
const LGC = 'z-index:50;position:fixed;inset:0;background:linear-gradient(#060c24,#171a48 60%,#0a0722);color:#fff;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;overflow:auto;padding:16px;box-sizing:border-box';
const LGP = 'width:min(400px,100%);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:22px;box-sizing:border-box';
function authOverlay() {
  let d = document.getElementById('authov');
  if (!d) { d = document.createElement('div'); d.id = 'authov'; d.style.cssText = LGC; document.body.appendChild(d); }
  d.innerHTML = ''; return d;
}
function authShowCode(code, done, title) {
  const d = authOverlay(), box = document.createElement('div'); box.style.cssText = LGP; d.appendChild(box);
  const t = document.createElement('div'); t.style.cssText = 'font:900 20px system-ui,sans-serif;text-align:center;margin-bottom:10px'; t.textContent = title || 'Bewaar je herstelcode'; box.appendChild(t);
  const c = document.createElement('div'); c.style.cssText = 'font:900 26px ui-monospace,Consolas,monospace;letter-spacing:2px;text-align:center;background:rgba(0,0,0,.4);border-radius:10px;padding:16px 8px;margin:10px 0;user-select:all'; { const raw = String(code || '').toUpperCase(); c.textContent = raw.indexOf('-') >= 0 ? raw : raw.replace(/(.{4})/g, '$1-').replace(/-$/, ''); } box.appendChild(c);
  const x = document.createElement('div'); x.style.cssText = 'font:500 14px system-ui,sans-serif;line-height:1.45;color:rgba(255,255,255,.85)'; x.textContent = 'Met deze code zet je een nieuw wachtwoord als je het vergeet. Je ziet hem maar een keer. Schrijf hem op of maak een foto.'; box.appendChild(x);
  const b1 = document.createElement('button'); b1.type = 'button'; b1.style.cssText = LGB + ';background:rgba(255,255,255,.14);color:#fff'; b1.textContent = 'KOPIEER'; b1.onclick = () => { try { navigator.clipboard.writeText(String(code || '')); b1.textContent = 'GEKOPIEERD'; } catch (e) {} };
  const b3 = document.createElement('button'); b3.type = 'button'; b3.style.cssText = LGB + ';background:rgba(255,255,255,.14);color:#fff'; b3.textContent = 'DOWNLOAD ALS TEKSTBESTAND';
  b3.onclick = () => { try { const u = URL.createObjectURL(new Blob(['EAWG Mobile herstelcode: ' + String(code || '') + '\n'], { type: 'text/plain' })), a = document.createElement('a'); a.href = u; a.download = 'EAWG-herstelcode.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); } catch (e) {} };
  const last = String(code || '').replace(/[^A-Za-z0-9]/g, '').slice(-4).toUpperCase();
  const chk = document.createElement('input'); chk.style.cssText = LGI; chk.placeholder = 'Typ de laatste 4 tekens van je code over'; chk.autocomplete = 'off'; chk.autocapitalize = 'characters'; chk.maxLength = 4;
  const b2 = document.createElement('button'); b2.type = 'button'; b2.style.cssText = LGB + ';opacity:.4'; b2.textContent = 'IK HEB HEM BEWAARD, VERDER'; b2.disabled = true;
  chk.oninput = () => { const ok = chk.value.trim().toUpperCase() === last; b2.disabled = !ok; b2.style.opacity = ok ? 1 : 0.4; };
  b2.onclick = () => { d.remove(); done && done(); };
  box.appendChild(b1); box.appendChild(b3); box.appendChild(chk); box.appendChild(b2);
}
function authLoginScreen() {
  let mode = 'login'; const d = authOverlay();
  d.innerHTML = '<form id="af" style="' + LGP + '"><div style="font:900 26px system-ui,sans-serif;text-align:center">EAWG MOBILE</div>'
    + '<div style="display:flex;gap:8px;margin:16px 0 10px"><button type="button" id="atl" style="' + LGB + ';margin:0">AANMELDEN</button><button type="button" id="atr" style="' + LGB + ';margin:0">ACCOUNT MAKEN</button></div>'
    + '<input id="au" style="' + LGI + '" placeholder="Gebruikersnaam" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="20">'
    + '<input id="ac" style="' + LGI + ';display:none" placeholder="Herstelcode" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24">'
    + '<input id="ap" type="password" style="' + LGI + '" placeholder="Wachtwoord" autocomplete="current-password" maxlength="128">'
    + '<input id="ap2" type="password" style="' + LGI + ';display:none" placeholder="Wachtwoord nog een keer" autocomplete="new-password" maxlength="128">'
    + '<div id="am" style="min-height:20px;font:600 14px system-ui,sans-serif;margin:6px 0"></div>'
    + '<button type="submit" id="ago" style="' + LGB + '">AANMELDEN</button>'
    + '<div style="text-align:center;margin-top:12px"><a href="#" id="afg" style="color:#8fb0ff;font:700 14px system-ui,sans-serif">Wachtwoord vergeten?</a></div>'
    + '<div style="margin-top:14px;font:500 12px system-ui,sans-serif;color:rgba(255,255,255,.6);line-height:1.45">Wat we bewaren: je gebruikersnaam, een versleuteld wachtwoord en je spelvoortgang. Geen e-mailadres. Gebruik geen echte naam als gebruikersnaam. <a href="#" id="apv" style="color:#8fb0ff;font-weight:700">Meer over privacy</a></div></form>';
  const $ = id => d.querySelector('#' + id), msg = (t, ok) => { $('am').style.color = ok ? '#9dffb0' : '#ff8a8a'; $('am').textContent = t || ''; };
  const render = () => {
    $('ap2').style.display = mode === 'reg' ? '' : 'none'; $('ac').style.display = mode === 'rec' ? '' : 'none';
    $('ap').placeholder = mode === 'rec' ? 'Nieuw wachtwoord (minstens 8 tekens)' : mode === 'reg' ? 'Wachtwoord (minstens 8 tekens)' : 'Wachtwoord';
    $('ap').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    $('ago').textContent = mode === 'login' ? 'AANMELDEN' : mode === 'reg' ? 'ACCOUNT MAKEN' : 'NIEUW WACHTWOORD ZETTEN';
    $('atl').style.opacity = mode === 'login' ? 1 : 0.5; $('atr').style.opacity = mode === 'reg' ? 1 : 0.5;
    $('afg').textContent = mode === 'rec' ? 'Terug naar aanmelden' : 'Wachtwoord vergeten?'; msg('');
  };
  $('apv').onclick = e => { e.preventDefault(); authPrivacy(); };
  $('atl').onclick = () => { mode = 'login'; render(); }; $('atr').onclick = () => { mode = 'reg'; render(); };
  $('afg').onclick = e => { e.preventDefault(); mode = mode === 'rec' ? 'login' : 'rec'; render(); };
  d.querySelector('form').onsubmit = async e => {
    e.preventDefault(); const u = $('au').value.trim(), p = $('ap').value;
    if (!u || !p) { msg('Vul je gebruikersnaam en wachtwoord in.'); return; }
    if (mode === 'reg' && p !== $('ap2').value) { msg('De twee wachtwoorden zijn niet gelijk.'); return; }
    $('ago').disabled = true;
    try {
      if (mode === 'rec') {
        const r = await AJ('/api/recover', { method: 'POST', body: JSON.stringify({ username: u, recoveryCode: $('ac').value.trim(), newPassword: p }) });
        if (!r.ok) { $('ago').disabled = false; msg((r.j && r.j.error) || 'Dat lukte niet.'); return; }
        authShowCode(r.j.recoveryCode, () => authLoginScreen(), 'Wachtwoord gewijzigd. Dit is je NIEUWE herstelcode, de oude werkt niet meer.'); return;
      }
      const r = await AJ(mode === 'reg' ? '/api/register' : '/api/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) });
      if (!r.ok) { $('ago').disabled = false; msg((r.j && r.j.error) || 'Dat lukte niet. Probeer het later opnieuw.'); return; }
      authUser = (r.j && r.j.username) || u;
      if (mode === 'reg') authShowCode(r.j.recoveryCode, () => { authOn = true; authSave(true); }, 'Account gemaakt! Bewaar deze herstelcode goed.');
      else authAfterLogin();
    } catch (err) { $('ago').disabled = false; msg('Geen verbinding met de server. Probeer het zo opnieuw.'); }
  };
  render(); $('au').focus();
}
function authDialog(title, info, fields, okLabel, onOk) {
  const d = authOverlay(), f = document.createElement('form'); f.style.cssText = LGP; d.appendChild(f);
  const t = document.createElement('div'); t.style.cssText = 'font:900 20px system-ui,sans-serif;text-align:center;margin-bottom:8px'; t.textContent = title; f.appendChild(t);
  if (info) { const x = document.createElement('div'); x.style.cssText = 'font:500 14px system-ui,sans-serif;line-height:1.45;color:rgba(255,255,255,.8);margin-bottom:6px'; x.textContent = info; f.appendChild(x); }
  const ins = fields.map(fl => { const i = document.createElement('input'); i.type = 'password'; i.placeholder = fl[0]; i.autocomplete = fl[1]; i.maxLength = 128; i.style.cssText = LGI; f.appendChild(i); return i; });
  const m = document.createElement('div'); m.style.cssText = 'min-height:20px;font:600 14px system-ui,sans-serif;color:#ff8a8a;margin:6px 0'; f.appendChild(m);
  const ok = document.createElement('button'); ok.type = 'submit'; ok.style.cssText = LGB; ok.textContent = okLabel; f.appendChild(ok);
  const no = document.createElement('button'); no.type = 'button'; no.style.cssText = LGB + ';background:rgba(255,255,255,.14);color:#fff'; no.textContent = 'ANNULEREN'; no.onclick = () => d.remove(); f.appendChild(no);
  f.onsubmit = async e => { e.preventDefault(); ok.disabled = true; let err = ''; try { err = await onOk(ins.map(i => i.value)); } catch (x) { err = 'Geen verbinding met de server.'; } if (err) { m.textContent = err; ok.disabled = false; } else d.remove(); };
  if (ins[0]) ins[0].focus();
}
async function authLogout() { await authSave(true); try { await AJ('/api/logout', { method: 'POST', body: '{}' }); } catch (e) {} authWipe(); location.reload(); }
function authChangePw() {
  authDialog('Wachtwoord wijzigen', '', [['Huidig wachtwoord', 'current-password'], ['Nieuw wachtwoord (minstens 8 tekens)', 'new-password'], ['Nieuw wachtwoord nog een keer', 'new-password']], 'WIJZIGEN', async v => {
    if (v[1] !== v[2]) return 'De twee nieuwe wachtwoorden zijn niet gelijk.';
    const r = await AJ('/api/password', { method: 'POST', body: JSON.stringify({ oldPassword: v[0], newPassword: v[1] }) });
    if (!r.ok) return (r.j && r.j.error) || 'Dat lukte niet.'; authMsg = 'Je wachtwoord is gewijzigd.'; return '';
  });
}
function authDelete() {
  authDialog('Account verwijderen', 'Dit wist je account en al je opgeslagen voortgang voorgoed. Dat kan niet ongedaan gemaakt worden. Vul je wachtwoord in om te bevestigen.', [['Wachtwoord', 'current-password']], 'VERWIJDER MIJN ACCOUNT', async v => {
    const r = await AJ('/api/account', { method: 'DELETE', body: JSON.stringify({ password: v[0] }) });
    if (!r.ok) return (r.j && r.j.error) || 'Dat lukte niet.'; authOn = false; authWipe(); location.reload(); return '';
  });
}
function authDownload() {
  try { const u = URL.createObjectURL(new Blob([authSnap()], { type: 'application/json' })), a = document.createElement('a'); a.href = u; a.download = 'EAWG-voortgang.json'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 2000); authMsg = 'Je voortgang is gedownload.'; } catch (e) { authMsg = 'Downloaden lukte niet.'; }
}
function drawAccount() {
  const X0 = screenBG('ACCOUNT');
  txt(authUser ? 'Aangemeld als ' + authUser : 'Je speelt lokaal, zonder account.', SW / 2, 120, 22, '#fff', 'center', '900');
  if (authUser) {
    txt('Je voortgang wordt automatisch bewaard in je account.', SW / 2, 152, 14, 'rgba(255,255,255,.7)', 'center', '600');
    pill(SW / 2 - 160, 190, 320, 54, 'UITLOGGEN', () => authLogout(), true, 18);
    pill(SW / 2 - 160, 262, 320, 46, 'WACHTWOORD WIJZIGEN', () => authChangePw(), false, 15);
    pill(SW / 2 - 160, 322, 320, 46, 'DOWNLOAD MIJN VOORTGANG', () => authDownload(), false, 15);
    pill(SW / 2 - 160, 382, 320, 46, 'ACCOUNT VERWIJDEREN', () => authDelete(), false, 15);
    pill(SW / 2 - 160, 442, 320, 40, 'PRIVACY', () => authPrivacy(), false, 14);
    if (authMsg) txt(authMsg, SW / 2, 510, 15, '#9dffb0', 'center', '700');
  } else txt('Er is geen verbinding met de accountserver. Je voortgang blijft op dit toestel.', SW / 2, 156, 14, 'rgba(255,255,255,.7)', 'center', '600');
}
function startStreet(id) {
  id = id || Object.keys(COURTS)[stSel]; if (!owned(id)) { goTo('straat'); stStep = 1; return; }
  const P = pool(), A = P.length ? P[pickA % P.length] : { kit: KITS[kitSel], ts: 64 }, B = P.length ? P[pickB % P.length] : { kit: KITS[(kitSel + 1) % KITS.length], ts: 64 };
  startMatch({ kind: 'friendly', a: A.kit, b: B.kit, ta: A.ts, tb: B.ts, street: true, court: id || Object.keys(COURTS)[stSel] });
}
function drawStraatTeams() {
  const X0 = screenBG('STRAAT'), P = pool(); if (!P.length) { stStep = 1; return; }
  pickA = (pickA + P.length) % P.length; pickB = (pickB + P.length) % P.length;
  txt('Kies eerst de teams. Daarna kies je het veldje.', SW / 2, 84, 15, '#8fb0ff', 'center', '700');
  const box = (x, label, idx, side) => {
    const t = P[idx], pick = () => { pickSide = side; pickF = -1; pickPg = Math.floor(idx / 12); pickRet = 'straat'; selV = -1; state = 'pick'; };
    cx.fillStyle = 'rgba(255,255,255,.07)'; rr(x, 104, 330, 290, 10); cx.fill();
    txt(label, x + 165, 136, 16, '#8fb0ff', 'center', '800');
    const lg = logoImg(t.logo); if (lg) cx.drawImage(lg, x + 120, 156, 90, 90); else crest(x + 165, 196, 48, t.kit, true);
    hits.push({ x: x + 60, y: 150, w: 210, h: 130, fn: pick });
    txt(t.kit.name, x + 165, 282, 21, '#fff', 'center', '900'); txt(t.comp, x + 165, 305, 13, 'rgba(255,255,255,.65)', 'center', '700');
    pill(x + 65, 336, 200, 40, 'KIES ANDER TEAM', pick, false, 14);
  };
  box(X0 + 20, 'JOUW TEAM', pickA, 0); box(X0 + 450, 'TEGENSTANDER', pickB, 1);
  pill(SW / 2 - 150, 430, 300, 54, pickA === pickB ? 'KIES 2 ANDERE TEAMS' : 'VERDER NAAR HET VELDJE', () => { if (pickA !== pickB) stStep = 1; }, pickA !== pickB, 18);
}
let stPg = 0;
function drawStraat() {
  const X0 = screenBG('STRAAT'), ids = Object.keys(COURTS), per = 8, pages = Math.ceil(ids.length / per);
  stSel = Math.max(0, Math.min(ids.length - 1, stSel)); stPg = Math.max(0, Math.min(pages - 1, stPg));
  { const P = pool(); if (P.length) txt(P[pickA % P.length].kit.name + '  tegen  ' + P[pickB % P.length].kit.name, SW / 2, 84, 15, '#8fb0ff', 'center', '800'); else txt('5 tegen 5 op het plein', SW / 2, 84, 15, '#8fb0ff', 'center', '700'); }
  pill(X0 + 16, 60, 120, 28, '< TEAMS', () => { stStep = 0; }, false, 13);
  txt('PAGINA ' + (stPg + 1) + ' / ' + pages, X0 + 784, 84, 13, '#8fb0ff', 'right', '800');
  ids.slice(stPg * per, stPg * per + per).forEach((id, j) => {
    const i = stPg * per + j, rx = X0 + 16 + (j % 4) * 195, ry = 104 + Math.floor(j / 4) * 200;
    courtTile(COURTS[id], rx, ry, 186, 190, i === stSel); hits.push({ x: rx, y: ry, w: 186, h: 190, fn: () => { stSel = i; } });
  });
  if (pages > 1) { pill(X0 + 16, 516, 110, 52, '<', () => { stPg = (stPg + pages - 1) % pages; }, false, 24); pill(X0 + 674, 516, 110, 52, '>', () => { stPg = (stPg + 1) % pages; }, false, 24); }
  const sid = ids[stSel], sc = COURTS[sid];
  if (owned(sid)) pill(SW / 2 - 150, 516, 300, 52, 'SPEEL  ' + sc.name, () => startStreet(sid), true, 17);
  else pill(SW / 2 - 150, 516, 300, 52, S.coins >= sc.price ? 'KOOP  ' + sc.name + '  ' + sc.price : 'NOG ' + (sc.price - S.coins) + ' MUNTEN NODIG', S.coins >= sc.price ? () => buyWorld(sid) : () => { goTo('club'); tab = 5; wSel = Math.max(0, WORLDS.findIndex(w => w.id === sid)); page = Math.floor(wSel / 8); }, S.coins >= sc.price, 15);
}
function buildGrass() {
  if (court) { buildFloor(); return; }
  const tw = (GX1 - GX0) * TXL, th = (GY1 - GY0) * TXL;
  if (grass) grass.width = grass.height = 0;
  grass = document.createElement('canvas'); grass.width = tw; grass.height = th;
  const g = grass.getContext('2d');
  const X = x => (x - GX0) * TXL, Y = y => (y - GY0) * TXL;
  for (let i = -4; i < 15; i++) { g.fillStyle = i % 2 ? '#2a8638' : '#37a145'; g.fillRect(X(i * 100), 0, 100 * TXL, th); }
  for (let i = 0; i < 280; i++) {
    const x = Math.random() * tw, y = Math.random() * th, r = 40 + Math.random() * 170;
    const gr = g.createRadialGradient(x, y, 0, x, y, r), c = Math.random() < 0.5 ? '255,255,255' : '0,25,0';
    gr.addColorStop(0, 'rgba(' + c + ',' + (0.035 + Math.random() * 0.045) + ')'); gr.addColorStop(1, 'rgba(' + c + ',0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  }
  for (const [wx, wy, wr, a] of [[0, H / 2, 95, 0.30], [W, H / 2, 95, 0.30], [100, H / 2, 22, 0.35], [W - 100, H / 2, 22, 0.35], [W / 2, H / 2, 24, 0.22]]) {
    const gr = g.createRadialGradient(X(wx), Y(wy), 0, X(wx), Y(wy), wr * TXL);
    gr.addColorStop(0, 'rgba(125,95,45,' + a + ')'); gr.addColorStop(1, 'rgba(125,95,45,0)');
    g.fillStyle = gr; g.fillRect(X(wx) - wr * TXL, Y(wy) - wr * TXL, 2 * wr * TXL, 2 * wr * TXL);
  }
  // ruis (vroeger een lus over ~6 miljoen beeldpunten) en grassprietjes (vroeger 150000 + 14000 fillRect) als herhaaltegel van 512 bij 512.
  // Dichtheid per beeldpunt blijft gelijk aan vroeger.
  noiseOnto(g, grass.width, grass.height, 9, 0.7, 1, 0.6, Math.random, 512);
  const T = 512, st = document.createElement('canvas'); st.width = st.height = T; const sg = st.getContext('2d');
  const dens = T * T / (grass.width * grass.height), nS = Math.round(150000 * dens), nD = Math.round(14000 * dens);
  const lite = 'rgba(175,240,125,.22)', dk = 'rgba(8,55,18,.26)';
  for (let i = 0; i < nS; i++) {
    sg.fillStyle = i & 1 ? lite : dk; const x = Math.random() * T, y = Math.random() * T, h = 3 + Math.random() * 5;
    sg.fillRect(x, y, 1, h); if (y + h > T) sg.fillRect(x, y - T, 1, h);
  }
  sg.fillStyle = 'rgba(30,110,40,.5)';
  for (let i = 0; i < nD; i++) sg.fillRect(Math.random() * T, Math.random() * T, 1, 1);
  g.fillStyle = g.createPattern(st, 'repeat'); g.fillRect(0, 0, tw, th);
  st.width = st.height = 0;
}
let lineCol = 'rgba(255,255,255,.9)';
function pl(pts, closed) {
  cx.lineCap = 'round'; cx.strokeStyle = lineCol;
  const n = pts.length - (closed ? 0 : 1);
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 45));
    for (let j = 0; j < k; j++) {
      const x0 = a[0] + (b[0] - a[0]) * j / k, y0 = a[1] + (b[1] - a[1]) * j / k, x1 = a[0] + (b[0] - a[0]) * (j + 1) / k, y1 = a[1] + (b[1] - a[1]) * (j + 1) / k;
      const p0 = P(x0, y0, 0), p1 = P(x1, y1, 0); cx.lineWidth = 2.6 * (p0[2] + p1[2]) / 2;
      cx.beginPath(); cx.moveTo(p0[0], p0[1]); cx.lineTo(p1[0], p1[1]); cx.stroke();
    }
  }
  cx.lineCap = 'butt';
}
function arcPts(x, y, r, a0, a1) { const o = [], n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * r / 14)); for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return o; }
function drawLines() {
  if (court) { drawLinesStreet(); return; }
  pl([[0, 0], [W, 0], [W, H], [0, H]], true); pl([[W / 2, 0], [W / 2, H]]);
  pl(arcPts(W / 2, H / 2, 72, 0, 6.2832));
  pl([[0, H / 2 - 130], [150, H / 2 - 130], [150, H / 2 + 130], [0, H / 2 + 130]]); pl([[W, H / 2 - 130], [W - 150, H / 2 - 130], [W - 150, H / 2 + 130], [W, H / 2 + 130]]);
  pl([[0, H / 2 - 62], [52, H / 2 - 62], [52, H / 2 + 62], [0, H / 2 + 62]]); pl([[W, H / 2 - 62], [W - 52, H / 2 - 62], [W - 52, H / 2 + 62], [W, H / 2 + 62]]);
  pl(arcPts(100, H / 2, 72, -0.805, 0.805)); pl(arcPts(W - 100, H / 2, 72, Math.PI - 0.805, Math.PI + 0.805));
  cx.fillStyle = 'rgba(255,255,255,.92)';
  for (const [sx, sy] of [[W / 2, H / 2], [100, H / 2], [W - 100, H / 2]]) { const q = P(sx, sy, 0); cx.beginPath(); cx.ellipse(q[0], q[1], 3.4 * q[2], 2.2 * q[2], 0, 0, 6.2832); cx.fill(); }
  for (const [x0, y0, a0] of [[0, 0, 0], [W, 0, 1.5708], [W, H, 3.1416], [0, H, 4.7124]]) pl(arcPts(x0, y0, 10, a0, a0 + 1.5708));
}
// vloer rij voor rij uit de textuur; elke rij is een geschaalde drawImage met 'high' filter (duur: ~200 per beeld)
function pitchRows(g, r0, r1, st) {
  // 'high' zoals vroeger. Gemeten (headless, 22 okt): groot veld bij Q0 ~130 ms per beeld, met 'low' ~50 ms maar de verte
  // wordt iets korreliger; bij Q1 is het al ~14 ms en brengt 'low' niets. Daarom ongewijzigd gelaten (keuze voor Dingo).
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  for (let y = r0; y <= r1; y += st) {
    const t = (y - SYF) / (SYN - SYF), wy = t * H;
    if (wy < GY0 || wy > GY1 - 3) continue;
    const s = (SF + (SN - SF) * t) * zoom, half = SW / 2 / s, sh = 4 + st * 2;
    g.drawImage(grass, (camX - half - GX0) * TXL, Math.max(0, (wy - GY0) * TXL - sh / 2), half * 2 * TXL, sh, 0, y, SW, st * 1.4);
  }
}
let pitchC = null, pitchK = '', pitchG = null;
function drawPitch() {
  const r0 = Math.max(0, Math.floor(SYF + (SYN - SYF) * (GY0 / H))), r1 = Math.min(VH, Math.ceil(SYF + (SYN - SYF) * (GY1 / H))), st = [2, 3, 5][Q];
  if (!court) { if (pitchC) pitchC.width = pitchC.height = 0; pitchC = pitchG = null; pitchRows(cx, r0, r1, st); cx.imageSmoothingQuality = 'high'; }
  else {
    // straat: camera staat vast, dus de vloer eenmalig projecteren en per beeld met 1 drawImage tekenen
    const k = [cv.width, scale, zoom, camX, Q, r0, r1].join();
    if (!pitchC || pitchK !== k || pitchG !== grass) {
      const hh = r1 + st * 1.4 - r0; pitchC = pitchC || document.createElement('canvas');
      pitchC.width = cv.width; pitchC.height = Math.ceil(hh * scale); pitchG = grass; pitchK = k;
      const g = pitchC.getContext('2d'); g.setTransform(scale, 0, 0, scale, 0, -r0 * scale); pitchRows(g, r0, r1, st);
    }
    cx.imageSmoothingQuality = 'low'; cx.drawImage(pitchC, 0, r0, SW, pitchC.height / scale); cx.imageSmoothingQuality = 'high'; // 1 op 1, dus 'low' volstaat
  }
  cx.fillStyle = shade; cx.fillRect(0, SYF - 10, SW, 190);
}

function drawBoards() {
  if (court) { drawWalls(); return; }
  const y = -26, a = P(-120, y, 0), b = P(W + 120, y, 0), c = P(W + 120, y, 17), d = P(-120, y, 17);
  const g = cx.createLinearGradient(0, d[1], 0, a[1]); g.addColorStop(0, '#0d3a9a'); g.addColorStop(1, '#061c55');
  poly(g, [a, b, c, d]);
  cx.fillStyle = 'rgba(255,255,255,.55)'; cx.fillRect(0, d[1], SW, 1.5);
  for (let x = -100; x < W + 100; x += 170) {
    const q = P(x, y, 5); if (q[0] < -200 || q[0] > SW + 200) continue;
    txt('EAWG MOBILE', q[0], q[1], 11 * q[2], '#fff', 'center', '900');
  }
}
function drawGoal(gx, dir) {
  const y1 = H / 2 - GW / 2, y2 = H / 2 + GW / 2, h1 = 34, dep = 34, h2 = 26;
  const a = P(gx, y1, 0), b = P(gx, y2, 0), c = P(gx, y1, h1), d = P(gx, y2, h1);
  const e = P(gx + dir * dep, y1, 0), f = P(gx + dir * dep, y2, 0), g = P(gx + dir * dep, y1, h2), h = P(gx + dir * dep, y2, h2);
  poly('rgba(255,255,255,.10)', [e, f, h, g]); poly('rgba(255,255,255,.07)', [c, d, h, g]);
  poly('rgba(255,255,255,.06)', [a, c, g, e]); poly('rgba(255,255,255,.06)', [b, d, h, f]);
  cx.strokeStyle = 'rgba(255,255,255,.28)'; cx.lineWidth = 1;
  for (let i = 0; i <= 10; i++) { const t = i / 10; seg(lerp2(e, f, t), lerp2(g, h, t)); seg(lerp2(g, h, t), lerp2(c, d, t)); }
  for (let j = 0; j <= 5; j++) { const t = j / 5; seg(lerp2(e, g, t), lerp2(f, h, t)); }
  cx.strokeStyle = '#fff'; cx.lineWidth = Math.max(2.5, 2.4 * a[2]); cx.lineCap = 'round';
  seg(a, c); seg(b, d); seg(c, d); cx.lineCap = 'butt';
}

// ---------- kleurhulpjes ----------
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
// kleurtekstjes worden per (kleur, doel, factor) maar 1 keer berekend; numerieke sleutel t + a (t is 0 of 255, a tussen 0 en 1)
const mixC = new Map();
function mixc(c, t, a) {
  let m = mixC.get(c); if (!m) { if (mixC.size > 400) mixC.clear(); mixC.set(c, m = new Map()); }
  const key = t + a; let v = m.get(key);
  if (v === undefined) { const k = hex2rgb(c); v = 'rgb(' + k.map(x => Math.round(x + (t - x) * a)).join(',') + ')'; m.set(key, v); }
  return v;
}
const lit = (c, a) => mixc(c, 255, a), dark = (c, a) => mixc(c, 0, a), lp = (a, b, t) => a + (b - a) * t;

// ---------- zachte schaduw ----------
let shSpr = null;
function makeShadow() {
  shSpr = document.createElement('canvas'); shSpr.width = 128; shSpr.height = 48;
  const g = shSpr.getContext('2d'); g.translate(64, 24); g.scale(1, 0.375);
  const gr = g.createRadialGradient(0, 0, 2, 0, 0, 62);
  gr.addColorStop(0, 'rgba(0,0,0,.66)'); gr.addColorStop(0.55, 'rgba(0,0,0,.34)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-64, -64, 128, 128);
}
function drawShadow(x, y, r) {
  const q = P(x, y, 0), w = r * 2.7 * q[2];
  cx.drawImage(shSpr, q[0] - w / 2 + 0.14 * w, q[1] - w * 0.19, w, w * 0.375);
  if (r < 6) return; cx.fillStyle = 'rgba(0,0,0,.3)'; cx.beginPath(); cx.ellipse(q[0] + 0.02 * w, q[1], w * 0.15, w * 0.052, 0, 0, 6.2832); cx.fill();
}

// ---------- lichaamsdeel (taps toelopend) ----------
function limb(ax, ay, bx, by, wa, wb, col) {
  const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  cx.fillStyle = col; cx.beginPath();
  cx.moveTo(ax + nx * wa / 2, ay + ny * wa / 2); cx.lineTo(bx + nx * wb / 2, by + ny * wb / 2);
  cx.lineTo(bx - nx * wb / 2, by - ny * wb / 2); cx.lineTo(ax - nx * wa / 2, ay - ny * wa / 2);
  cx.closePath(); cx.fill();
  cx.beginPath(); cx.moveTo(ax + wa / 2, ay); cx.arc(ax, ay, wa / 2, 0, 6.2832);
  cx.moveTo(bx + wb / 2, by); cx.arc(bx, by, wb / 2, 0, 6.2832); cx.fill();
  if (wa > 3.2) { cx.strokeStyle = 'rgba(255,255,255,.14)'; cx.lineWidth = Math.max(0.8, wb * 0.26); cx.beginPath(); cx.moveTo(ax - nx * wa * 0.2, ay - ny * wa * 0.2); cx.lineTo(bx - nx * wb * 0.2, by - ny * wb * 0.2); cx.stroke();
    cx.strokeStyle = 'rgba(0,0,0,.13)'; cx.beginPath(); cx.moveTo(ax + nx * wa * 0.3, ay + ny * wa * 0.3); cx.lineTo(bx + nx * wb * 0.3, by + ny * wb * 0.3); cx.stroke(); }
}

const LEGS = [{ a2: 0, kx: 0, ky: 0, ax: 0, ay: 0 }, { a2: 0, kx: 0, ky: 0, ax: 0, ay: 0 }]; // hergebruikt per speler, geen nieuwe objecten per beeld
function drawPlayer(p, ov) {
  if (ov) { p.kk = ov.kk; p.ph = ov.ph; }
  const hop = (state === 'goal' && goalBy === p.t) ? Math.abs(Math.sin(tNow * 7 + p.i * 1.3)) * 12 : 0;
  const q = ov ? [ov.x, ov.y, ov.u / 0.95] : P(p.x, p.y, hop), sx = q[0], sy = q[1], u = q[2] * 0.95 * (ov ? 1 : 0.95 + ((p.i * 3 + p.t * 2) % 5) * 0.022), f = ov ? ov.f : p.face;
  const sp = Math.hypot(p.vx, p.vy), run = ov ? ov.run : Math.min(1, sp / 150), T = TEAMS[p.t], gk = p.i === 0;
  const shirt = gk ? T.gk : T.shirt, shorts = gk ? T.gkShorts : T.shorts, sock = gk ? T.gkSock : T.sock, trim = gk ? '#111' : T.trim;
  const skin = p.skin, skinD = dark(skin, 0.28);
  const L1 = 10.5 * u, L2 = 10 * u, A1 = 6.4 * u, A2 = 6.2 * u, TOR = 15.5 * u;
  const legs = LEGS;
  for (let l = 0; l < 2; l++) {
    const ph = p.ph + (l ? Math.PI : 0);
    let th = Math.sin(ph) * 0.85 * run + (l ? 0.1 : -0.1) * (1 - run), kn = (0.1 + 0.95 * Math.max(0, Math.cos(ph))) * run + 0.06;
    if (p.kk > 0 && l === 1) {
      if (p.kk > 0.13) { const k = (p.kk - 0.13) / 0.12; th = -0.5 - 0.5 * k; kn = 0.6 + 0.7 * k; }
      else { const k = p.kk / 0.13; th = 1.25 * (1 - k) + 0.1 * k; kn = 0.2; }
    }
    const kx = Math.sin(th) * f * L1, ky = Math.cos(th) * L1, a2 = th - kn;
    const lg = legs[l]; lg.a2 = a2; lg.kx = kx; lg.ky = ky; lg.ax = kx + Math.sin(a2) * f * L2; lg.ay = ky + Math.cos(a2) * L2;
  }
  const hipX = sx, hipY = sy - Math.max(legs[0].ay, legs[1].ay) - 2.3 * u;
  const lean = run * 0.17 + (p.kk > 0 ? 0.05 : 0);
  const shX = hipX + Math.sin(lean) * f * TOR, shY = hipY - Math.cos(lean) * TOR;
  const hx = shX + f * (1 + 2 * run) * u, hy = shY - 7.4 * u;
  const aN = Math.sin(p.ph) * 0.9 * run, beta = 0.5 + 0.55 * run;

  const drawLeg = (lg, far) => {
    const kx = hipX + lg.kx, ky = hipY + lg.ky, ax = hipX + lg.ax, ay = hipY + lg.ay;
    const k = far ? 0.3 : 0, sk = far ? skinD : skin, sh = dark(shorts, k), so = dark(sock, k), tr = dark(trim, k);
    limb(hipX, hipY, kx, ky, 5.8 * u, 4.4 * u, sk);
    limb(kx, ky, ax, ay, 4.4 * u, 3.1 * u, sk);
    limb(lp(kx, ax, 0.12), lp(ky, ay, 0.12), ax, ay, 4.7 * u, 3.4 * u, so);
    limb(lp(kx, ax, 0.18), lp(ky, ay, 0.18), lp(kx, ax, 0.3), lp(ky, ay, 0.3), 4.8 * u, 4.5 * u, tr);
    limb(hipX, hipY, lp(hipX, kx, 0.66), lp(hipY, ky, 0.66), 7.2 * u, 6.4 * u, sh);
    const fa = Math.max(-0.3, Math.min(1.0, -lg.a2 * 0.5 + 0.1)), tx = ax + f * Math.cos(fa) * 5.4 * u, ty = ay + Math.sin(fa) * 4.9 * u + 0.8 * u;
    limb(ax - f * u, ay + 0.6 * u, tx, ty, 3.6 * u, 2.6 * u, dark(p.boot, k));
    if (!far) { cx.fillStyle = 'rgba(255,255,255,.45)'; cx.fillRect(Math.min(ax, tx) + 0.6 * u, Math.min(ay, ty) - 0.9 * u, 3 * u, 0.7 * u); }
  };
  const drawArm = (al, far) => {
    const sX = shX, sY = shY + 1.8 * u, ex = sX + Math.sin(al) * f * A1, ey = sY + Math.cos(al) * A1;
    const be = al + beta, hx2 = ex + Math.sin(be) * f * A2, hy2 = ey + Math.cos(be) * A2, k = far ? 0.3 : 0;
    limb(ex, ey, hx2, hy2, 2.9 * u, 2.3 * u, far ? skinD : skin);
    limb(sX, sY, ex, ey, 4 * u, 3.3 * u, dark(shirt, k));
    cx.fillStyle = gk ? '#ff3b8b' : (far ? skinD : skin); cx.beginPath(); cx.arc(hx2, hy2, (gk ? 2.7 : 1.8) * u, 0, 6.2832); cx.fill();
  };

  drawArm(-aN, true); drawLeg(legs[0], true);

  const adx = shX - hipX, ady = shY - hipY, ad = Math.hypot(adx, ady), nx = -ady / ad, ny = adx / ad, ww = 7.3 * u, wh = 5.7 * u;
  const gr = cx.createLinearGradient(hipX - 6 * u, 0, hipX + 6 * u, 0);
  gr.addColorStop(0, lit(shirt, 0.18)); gr.addColorStop(0.5, shirt); gr.addColorStop(1, dark(shirt, 0.32));
  cx.fillStyle = Q >= 2 ? shirt : gr; cx.beginPath();
  cx.moveTo(hipX - nx * wh, hipY - ny * wh); cx.lineTo(shX - nx * ww, shY - ny * ww);
  cx.quadraticCurveTo(shX, shY - 1.6 * u, shX + nx * ww, shY + ny * ww); cx.lineTo(hipX + nx * wh, hipY + ny * wh); cx.closePath(); cx.fill();
  cx.strokeStyle = 'rgba(0,0,0,.16)'; cx.lineWidth = 0.8 * u;
  cx.beginPath(); cx.moveTo(lp(hipX, shX, 0.45) - 3 * u, lp(hipY, shY, 0.45)); cx.quadraticCurveTo(lp(hipX, shX, 0.5), lp(hipY, shY, 0.5) + 1.3 * u, lp(hipX, shX, 0.45) + 3 * u, lp(hipY, shY, 0.45) + 0.4 * u); cx.stroke();
  limb(hipX - nx * wh, hipY - ny * wh, hipX + nx * wh, hipY + ny * wh, 2 * u, 2 * u, dark(shorts, 0.05));
  if (p.num && u > 1.1) { cx.save(); cx.fillStyle = trim; cx.globalAlpha = 0.85; cx.font = '800 ' + (3.6 * u) + 'px system-ui,sans-serif'; cx.textAlign = 'center'; cx.fillText(p.num, lp(hipX, shX, 0.52) - f * 0.6 * u, lp(hipY, shY, 0.52) + 1.3 * u); cx.restore(); }
  cx.fillStyle = 'rgba(255,255,255,.16)'; cx.beginPath(); cx.ellipse(lp(hipX, shX, 0.62) + f * 2.2 * u, lp(hipY, shY, 0.62), 1.3 * u, 3.6 * u, lean, 0, 6.2832); cx.fill();
  limb(shX + f * 0.4 * u, shY + 0.2 * u, shX + f * 0.8 * u, shY - 1.8 * u, 4.4 * u, 3.4 * u, trim);

  drawLeg(legs[1], false); drawArm(aN, false);

  limb(shX, shY, hx - f * 0.4 * u, hy + 3 * u, 3 * u, 2.8 * u, skinD);
  const hg = cx.createRadialGradient(hx + f * 1.2 * u, hy - 1.6 * u, 0.5 * u, hx, hy, 5.4 * u);
  hg.addColorStop(0, lit(skin, 0.2)); hg.addColorStop(1, dark(skin, 0.26));
  cx.fillStyle = Q >= 2 ? skin : hg; cx.beginPath(); cx.ellipse(hx, hy, 3.9 * u, 4.9 * u, 0, 0, 6.2832); cx.fill();
  const hr = p.hs === 1 ? 0.82 : 1; cx.fillStyle = p.hair; cx.beginPath(); cx.ellipse(hx - f * 0.9 * u, hy - 1.1 * u, 4.1 * u * hr, 4.2 * u * hr, 0, Math.PI * 0.9, Math.PI * 2.1); cx.fill();
  if (p.hs === 2) { cx.beginPath(); cx.ellipse(hx - f * 3.5 * u, hy + 0.2 * u, 1.9 * u, 3.1 * u, 0, 0, 6.2832); cx.fill(); }
  if (p.hs === 3) { cx.beginPath(); cx.ellipse(hx - f * 0.6 * u, hy - 3.6 * u, 3.2 * u, 1.7 * u, 0, 0, 6.2832); cx.fill(); }
  cx.fillRect(hx - f * 4 * u - (f > 0 ? 0 : -0.1 * u), hy - 1.2 * u, 1.9 * u * (f > 0 ? 1 : 1), 3 * u);
  cx.fillStyle = dark(skin, 0.18); cx.beginPath(); cx.ellipse(hx - f * 0.7 * u, hy + 0.5 * u, 0.9 * u, 1.3 * u, 0, 0, 6.2832); cx.fill();
  cx.fillStyle = 'rgba(20,12,8,.9)'; cx.beginPath(); cx.ellipse(hx + f * 2 * u, hy - 0.1 * u, 0.7 * u, 0.5 * u, 0, 0, 6.2832); cx.fill();
  cx.strokeStyle = 'rgba(20,12,8,.7)'; cx.lineWidth = 0.6 * u; cx.beginPath(); cx.moveTo(hx + f * 1.2 * u, hy - 1.2 * u); cx.lineTo(hx + f * 2.9 * u, hy - 1.3 * u); cx.stroke();
  cx.strokeStyle = 'rgba(60,25,20,.55)'; cx.lineWidth = 0.55 * u; cx.beginPath(); cx.moveTo(hx + f * 1.6 * u, hy + 2.5 * u); cx.lineTo(hx + f * 3 * u, hy + 2.4 * u); cx.stroke();
  cx.fillStyle = 'rgba(0,0,0,.14)'; cx.beginPath(); cx.ellipse(hx - f * 0.3 * u, hy + 4.4 * u, 3 * u, 0.9 * u, 0, 0, 6.2832); cx.fill();
  cx.fillStyle = 'rgba(255,170,140,.18)'; cx.beginPath(); cx.arc(hx + f * 1.6 * u, hy + 1.3 * u, 1.2 * u, 0, 6.2832); cx.fill();
  cx.fillStyle = dark(skin, 0.12); cx.beginPath(); cx.moveTo(hx + f * 3.7 * u, hy + 0.3 * u); cx.lineTo(hx + f * 4.6 * u, hy + 1.7 * u); cx.lineTo(hx + f * 3.5 * u, hy + 1.9 * u); cx.fill();

  if (p === ctrl && state !== 'menu') {
    const my = hy - 9 * u - Math.sin(tNow * 6) * 2.5;
    cx.save(); cx.strokeStyle = 'rgba(255,212,0,.9)'; cx.lineWidth = 2.4; cx.beginPath(); cx.ellipse(sx, sy, 15 * u, 5.5 * u, 0, 0, 7); cx.stroke(); cx.restore();
    cx.fillStyle = '#ffd400'; cx.strokeStyle = '#0b1b4d'; cx.lineWidth = 1.8;
    cx.beginPath(); cx.moveTo(hx, my + 7); cx.lineTo(hx - 6.5, my - 4); cx.lineTo(hx + 6.5, my - 4); cx.closePath(); cx.fill(); cx.stroke();
    if (charging) { cx.fillStyle = 'rgba(0,0,0,.55)'; cx.fillRect(sx - 20, sy + 7, 40, 6); cx.fillStyle = '#ffd400'; cx.fillRect(sx - 20, sy + 7, 40 * Math.min(1, charge / 0.7), 6); }
  }
}

function drawBall() {
  const q = P(ball.x, ball.y, ball.z + 4.5), r = 5.4 * q[2], x = q[0], y = q[1];
  const gr = cx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.1, x, y, r);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#dfe3ea'); gr.addColorStop(1, '#848b9a');
  cx.fillStyle = gr; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill();
  cx.fillStyle = '#232832';
  for (let k = 0; k < 4; k++) {
    const a = ball.rot + k * 1.57 + 0.4, c = Math.cos(a), px = x + c * r * 0.58, py = y + Math.sin(a * 1.3) * r * 0.5, rr = r * 0.26 * (0.55 + 0.45 * Math.abs(c));
    cx.beginPath(); cx.ellipse(px, py, rr * (0.6 + 0.4 * Math.abs(c)), rr, 0, 0, 6.2832); cx.fill();
  }
  cx.strokeStyle = 'rgba(15,18,28,.8)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.stroke();
  cx.fillStyle = 'rgba(255,255,255,.6)'; cx.beginPath(); cx.ellipse(x - r * 0.35, y - r * 0.4, r * 0.22, r * 0.14, -0.6, 0, 6.2832); cx.fill();
}

function drawMini() {
  const w = 132, h = 78, x = SW / 2 - w / 2, y = VH - h - 12;
  cx.fillStyle = 'rgba(5,40,15,.62)'; rr(x, y, w, h, 6); cx.fill();
  cx.strokeStyle = 'rgba(255,255,255,.7)'; cx.lineWidth = 1;
  cx.strokeRect(x + 5, y + 5, w - 10, h - 10); seg([x + w / 2, y + 5], [x + w / 2, y + h - 5]);
  cx.beginPath(); cx.arc(x + w / 2, y + h / 2, 9, 0, 7); cx.stroke();
  const mx = v => x + 5 + v / W * (w - 10), my = v => y + 5 + v / H * (h - 10);
  for (const p of players) {
    cx.fillStyle = p === ctrl ? '#ffd400' : TEAMS[p.t].shirt; cx.beginPath(); cx.arc(mx(p.x), my(p.y), p === ctrl ? 3.6 : 2.6, 0, 7); cx.fill();
    if (p.t) { cx.strokeStyle = '#16224a'; cx.lineWidth = 1; cx.stroke(); }
  }
  cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(mx(ball.x), my(ball.y), 2, 0, 7); cx.fill();
}
function nameBar(x, y, p, right) {
  const w = 236, h = 30;
  const g = cx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, right ? 'rgba(10,22,66,.45)' : 'rgba(10,22,66,.95)'); g.addColorStop(1, right ? 'rgba(10,22,66,.95)' : 'rgba(10,22,66,.45)');
  cx.fillStyle = g; cx.fillRect(x, y, w, h);
  cx.fillStyle = TEAMS[p.t].shirt; cx.fillRect(x, y + h - 3, w, 3);
  const cxn = right ? x + w - 20 : x + 20;
  cx.fillStyle = TEAMS[p.t].shirt; cx.beginPath(); cx.arc(cxn, y + h / 2 - 1, 10, 0, 7); cx.fill();
  cx.strokeStyle = '#fff'; cx.lineWidth = 1.5; cx.stroke();
  { const sh = TEAMS[p.t].shirt || '#888', m = /^#([0-9a-f]{6})$/i.exec(sh), lum = m ? (parseInt(m[1].slice(0, 2), 16) * 0.299 + parseInt(m[1].slice(2, 4), 16) * 0.587 + parseInt(m[1].slice(4, 6), 16) * 0.114) : 128; txt(String(p.num), cxn, y + h / 2 + 3.5, 10, lum < 140 ? '#fff' : '#0b1b4d', 'center', '900'); }
  if (right) { txt(p.name, x + w - 40, y + 20, 16, '#fff', 'right'); txt(String(p.rate), x + 12, y + 21, 17, '#ffd400', 'left'); }
  else { txt(String(p.rate), x + 40, y + 21, 17, '#ffd400', 'left'); txt(p.name, x + 72, y + 20, 16, '#fff', 'left'); }
}
function drawHUD() {
  const x = 14, y = 26, H1 = 30;
  cx.fillStyle = 'rgba(8,16,50,.9)'; rr(x, y - 14, 74, 13, 3); cx.fill(); txt(cur ? (cur.kind === 'cup' ? 'BEKER' : 'COMPETITIE') : 'FRIENDLY', x + 37, y - 4, 9, '#9fb8ff', 'center', '800');
  cx.fillStyle = 'rgba(8,16,50,.92)'; cx.fillRect(x, y, 300, H1);
  cx.fillStyle = TEAMS[0].shirt; cx.fillRect(x, y, 5, H1); cx.fillStyle = '#fff'; cx.fillRect(x + 295, y, 5, H1);
  txt(TEAMS[0].code, x + 14, y + 21, 17, '#fff', 'left');
  cx.fillStyle = '#fff'; cx.fillRect(x + 66, y, 66, H1);
  txt(score[0] + '  -  ' + score[1], x + 99, y + 22, 20, '#0b1b4d', 'center', '900');
  txt(TEAMS[1].code, x + 142, y + 21, 17, '#fff', 'left');
  const gs = (MATCH - timeLeft) / MATCH * 90 * 60, mm = String(Math.floor(gs / 60)).padStart(2, '0'), ss = String(Math.floor(gs % 60)).padStart(2, '0');
  cx.fillStyle = 'rgba(255,255,255,.12)'; cx.fillRect(x + 200, y, 100, H1);
  txt(mm + ':' + ss, x + 250, y + 22, 18, '#fff', 'center', '800');
  if (ctrl) nameBar(14, VH - 44, ctrl, false);
  let opp = ball.owner && ball.owner.t === 1 ? ball.owner : null;
  if (!opp) { let bd = 1e9; for (const p of players) if (p.t === 1 && p.i) { const d = Math.hypot(p.x - ball.x, p.y - ball.y); if (d < bd) { bd = d; opp = p; } } }
  if (opp) nameBar(SW - 250, 14, opp, true);
  drawMini();
  if (state === 'play') { const bx = SW - 302, by = 14; cx.fillStyle = 'rgba(8,16,50,.9)'; cx.fillRect(bx, by, 44, 30); cx.fillStyle = '#fff'; cx.fillRect(bx + 15, by + 8, 5, 14); cx.fillRect(bx + 24, by + 8, 5, 14); hits.push({ x: bx - 10, y: by - 10, w: 64, h: 52, fn: () => { state = 'pause'; } }); }
}

function draw() {
  DT.bg = DT.vloer = DT.lijn = DT.spel = DT.hud = 0;
  drawScene();
  if (DBG) drawDbg();
}
function drawScene() {
  hits = []; cx.imageSmoothingQuality = 'high'; musicTick();
  cx.setTransform(1, 0, 0, 1, 0, 0);
  cx.fillStyle = '#06130a'; cx.fillRect(0, 0, cv.width, cv.height);
  cx.setTransform(scale, 0, 0, scale, 0, oy);
  if (SCREENS[state]) { cx.save(); cx.beginPath(); cx.rect(0, 0, SW, VH); cx.clip(); SCREENS[state].draw(); cx.restore(); return; }
  if (state === 'sp') { if (SP) drawSP(); else state = 'play'; return; }
  let t0 = DBG ? performance.now() : 0, t1 = 0;
  cx.save(); cx.beginPath(); cx.rect(0, 0, SW, VH); cx.clip();
  if (shakeT > 0) cx.translate((Math.random() - 0.5) * 9 * shakeT * 2, (Math.random() - 0.5) * 7 * shakeT * 2);
  // achtergrond staat (bijna) 1 op 1 op het scherm: 'low' filter is hier even scherp en veel goedkoper dan 'high'
  cx.imageSmoothingQuality = 'low'; cx.drawImage(bg, -180 - (camX - W / 2) * 0.12, 0, bg.width / bgk, bg.height / bgk); cx.imageSmoothingQuality = 'high';
  if (Q < 2 && !(court && court.crowd !== 'fans') && (++fN & 7) === 0) { flashes = []; for (let i = 0; i < 7; i++) flashes.push([Math.random() * SW, 70 + Math.random() * (SYF - 120), 2 + Math.random() * 2]); }
  for (const f of flashes) { cx.fillStyle = 'rgba(255,255,255,.85)'; cx.beginPath(); cx.arc(f[0], f[1], f[2], 0, 6.2832); cx.fill(); }
  drawLights();
  if (DBG) { t1 = performance.now(); DT.bg = t1 - t0; t0 = t1; }
  drawPitch();
  if (DBG) { t1 = performance.now(); DT.vloer = t1 - t0; t0 = t1; }
  drawLines(); drawBoards();
  drawGoal(0, -1); drawGoal(W, 1);
  if (DBG) { t1 = performance.now(); DT.lijn = t1 - t0; t0 = t1; }
  for (const p of players) drawShadow(p.x, p.y, 8);
  drawShadow(ball.x, ball.y, 4 + ball.z * 0.02);
  const spd = Math.hypot(ball.vx, ball.vy);
  if (spd > 420) { const q = P(ball.x, ball.y, ball.z + 4.5); ball.trail.push(q); if (ball.trail.length > 7) ball.trail.shift(); } else ball.trail.length = 0;
  for (let i = 1; i < ball.trail.length; i++) {
    cx.strokeStyle = 'rgba(255,255,255,' + (i / ball.trail.length * 0.5) + ')'; cx.lineWidth = 3 * (i / ball.trail.length) * ball.trail[i][2] * 0.5;
    seg(ball.trail[i - 1], ball.trail[i]);
  }
  const list = players.slice(); list.push(ball); list.sort((a, b) => a.y - b.y);
  for (const e of list) { if (e === ball) drawBall(); else drawPlayer(e); }
  if (court && court.weather && Q < 2) drawWeather();
  cx.restore();
  if (DBG) { t1 = performance.now(); DT.spel = t1 - t0; t0 = t1; }
  if (Q < 2) { cx.fillStyle = vig; cx.fillRect(0, 0, SW, VH); }
  for (const q of parts) { cx.save(); cx.translate(q.x, q.y); cx.rotate(q.r); cx.fillStyle = q.c; cx.fillRect(-q.w / 2, -q.w / 4, q.w, q.w / 2); cx.restore(); }
  drawHUD();
  if (joy.id !== null) {
    cx.setTransform(1, 0, 0, 1, 0, 0);
    const d = DPR;
    cx.strokeStyle = 'rgba(255,255,255,.5)'; cx.lineWidth = 3 * d;
    cx.beginPath(); cx.arc(joy.ox * d, joy.oy * d, 55 * d, 0, 7); cx.stroke();
    cx.fillStyle = 'rgba(255,255,255,.5)'; cx.beginPath(); cx.arc(joy.x * d, joy.y * d, 24 * d, 0, 7); cx.fill();
    cx.setTransform(scale, 0, 0, scale, 0, oy);
  }
  if (state === 'goal') {
    if (goalT < 0.22) { cx.fillStyle = 'rgba(255,255,255,' + (0.55 * (1 - goalT / 0.22)).toFixed(3) + ')'; cx.fillRect(0, 0, SW, VH); }
    const k = Math.min(1, goalT / 0.25), sc = 0.6 + 0.4 * (1 - Math.pow(1 - k, 3));
    cx.save(); cx.translate(SW / 2, VH * 0.36); cx.scale(sc, sc);
    cx.fillStyle = 'rgba(8,16,50,.78)'; cx.fillRect(-300, -62, 600, 100);
    cx.fillStyle = goalBy ? '#f4f4f4' : TEAMS[0].shirt; cx.fillRect(-300, 30, 600, 8);
    txt(msg, 0, 12, 56, '#ffd400', 'center', '900'); cx.restore();
  }
  if (ban) { const a = Math.min(1, ban.t * 3); cx.globalAlpha = a; cx.fillStyle = 'rgba(8,16,50,.85)'; cx.fillRect(SW / 2 - 190, VH * 0.2, 380, 64); cx.fillStyle = ban.col; cx.fillRect(SW / 2 - 190, VH * 0.2 + 58, 380, 6); txt(ban.text, SW / 2, VH * 0.2 + 30, 28, '#fff', 'center', '900'); txt(ban.sub, SW / 2, VH * 0.2 + 52, 14, ban.col, 'center', '800'); cx.globalAlpha = 1; }
  if (state === 'pause') drawPause();
  if (state === 'end') drawEnd();
  if (DBG) DT.hud = performance.now() - t0;
}
// ---------- meetscherm (linksboven, klein donker vlak) ----------
// schatting van het canvasgeheugen: breedte x hoogte x 4 van alle canvassen die het spel bewaart
function dbgCanvMB() {
  let px = cv.width * cv.height; const add = c => { if (c && c.width) px += c.width * c.height; };
  add(grass); add(bg); add(pitchC); add(shSpr); for (const k in glowCache) add(glowCache[k]); for (const k in COURTS) add(COURTS[k].tex);
  return px * 4 / 1048576;
}
const dbgIOS = /iPhone|iPad|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const dbgUA = (() => { const u = navigator.userAgent || '', m = /\(([^)]*)\)/.exec(u), b = /(CriOS|FxiOS|SamsungBrowser|Edg|Chrome|Version)\/([\d.]+)/.exec(u); return ((m ? m[1] : u).replace(/; ?wv/, '').slice(0, 46) + (b ? '  ' + b[1].replace('Version', 'Safari') + ' ' + b[2].split('.')[0] : '')); })();
function drawDbg() {
  for (const k in DT) DA[k] += (DT[k] - DA[k]) * 0.1;
  let s = 0, mx = 0; for (let i = 0; i < 60; i++) { s += dbgW[i]; if (dbgW[i] > mx) mx = dbgW[i]; }
  const f = v => v.toFixed(1), L = [
    'FPS ' + f(dbgFps) + '   beeld ' + f(s / 60) + ' ms  (slechtste ' + f(mx) + ')',
    'achtergr ' + f(DA.bg) + '  vloer ' + f(DA.vloer) + '  lijn/muur ' + f(DA.lijn),
    'spelers+bal ' + f(DA.spel) + '  HUD ' + f(DA.hud) + '  update/AI ' + f(DA.upd),
    'Q ' + Q + '  dprMax ' + dprCap + '  scherm ' + innerWidth + 'x' + innerHeight + ' @' + (window.devicePixelRatio || 1) + '  canvas ' + cv.width + 'x' + cv.height,
    'canvasgeheugen ca. ' + Math.round(dbgCanvMB()) + ' MB' + (dbgIOS ? '  (iOS)' : ''),
    'modus ' + (court ? 'straat ' + court.name : (state === 'play' || state === 'goal' || state === 'pause' || state === 'end' || state === 'voor') ? 'groot veld' : state === 'sp' ? 'vrije trap 3D' : 'menu (' + state + ')'),
    dbgUA
  ];
  cx.save(); cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.globalAlpha = 1; cx.globalCompositeOperation = 'source-over';
  cx.fillStyle = 'rgba(0,0,0,.78)'; cx.fillRect(4, 4, 360, 8 + L.length * 13);
  cx.font = '600 11px ui-monospace,Menlo,Consolas,monospace'; cx.textAlign = 'left'; cx.textBaseline = 'top';
  L.forEach((t, i) => { cx.fillStyle = i === 0 ? '#9dffb0' : '#fff'; cx.fillText(t, 9, 8 + i * 13); });
  cx.restore();
}

// ---------- menu, instellingen, pauze ----------
const KITS = [
  { name: 'KVK IEPER B', code: 'IEP', shirt: '#d62828', shorts: '#ffffff', sock: '#d62828', trim: '#ffffff' },
  { name: 'SK ROESELARE B', code: 'ROE', shirt: '#17191f', shorts: '#17191f', sock: '#17191f', trim: '#ffffff' },
  { name: 'VV KOEKELARE', code: 'KOE', shirt: '#f4f4f4', shorts: '#17191f', sock: '#f4f4f4', trim: '#17191f' },
  { name: 'KM TORHOUT B', code: 'TOR', shirt: '#1f9d55', shorts: '#ffffff', sock: '#1f9d55', trim: '#ffffff' },
  { name: 'KSV DE RUITER A', code: 'DRU', shirt: '#63b6f2', shorts: '#f3f3f3', sock: '#63b6f2', trim: '#ffffff' },
  { name: 'KFC POPERINGE B', code: 'POP', shirt: '#f2c230', shorts: '#c0262d', sock: '#f2c230', trim: '#c0262d' },
  { name: 'KSV VEURNE A', code: 'VEU', shirt: '#1b3f8f', shorts: '#1b3f8f', sock: '#1b3f8f', trim: '#f2c230' },
  { name: 'EAWG FC', code: 'EAW', shirt: '#7b3fc4', shorts: '#f3f3f3', sock: '#7b3fc4', trim: '#f2c230' }
];
const GKS = [{ gk: '#d8ff2a', gkShorts: '#111', gkSock: '#111' }, { gk: '#ff7a1a', gkShorts: '#222', gkSock: '#222' }];
const MATCHES = [60, 120, 180, 240, 300], DIFFS = [0.8, 0.9, 1, 1.08, 1.15], DNAMES = ['BEGINNER', 'AMATEUR', 'SEMI-PRO', 'PROFESSIONEEL', 'WERELDKLASSE'];
const CAMS = [1.2, 1.4, 1.65], CNAMES = ['VER', 'NORMAAL', 'DICHTBIJ'], SPDS = [0.85, 1, 1.15], SNAMES = ['TRAAG', 'NORMAAL', 'SNEL'];
let camIdx = 1, spdIdx = 1;
let kitSel = 0, mIdx = 1, dIdx = 2, MATCH = 120, muted = false, menuSel = 1, hits = [], flashes = [], fN = 0;
function applyKits() {
  TEAMS[0] = Object.assign({}, GKS[0], KITS[kitSel]);
  TEAMS[1] = Object.assign({}, GKS[1], KITS[(kitSel + 1) % KITS.length]);
}
function saveSet() { try { localStorage.setItem('goalrush', JSON.stringify({ k: kitSel, m: mIdx, d: dIdx, s: muted ? 1 : 0, r: strictIdx, c: compIdx, cm: camIdx, sp: spdIdx, d5: dIdx, cr: crestMode, ko: koi, f3: fk3d })); } catch (e) {} }
function loadSet() {
  try {
    const o = JSON.parse(localStorage.getItem('goalrush') || '{}');
    if (o.k >= 0 && o.k < KITS.length) kitSel = o.k; if (o.m >= 0 && o.m < 5) mIdx = o.m; if (o.d5 >= 0 && o.d5 < 5) dIdx = o.d5; if (o.cm >= 0 && o.cm < 3) camIdx = o.cm; if (o.sp >= 0 && o.sp < 3) spdIdx = o.sp; zoom = CAMS[camIdx]; muted = !!o.s; if (o.r >= 0 && o.r < 4) strictIdx = o.r; if (o.c >= 0) compIdx = o.c; if (o.cr === 0 || o.cr === 1) crestMode = o.cr; if (o.ko === 0 || o.ko === 1) koi = o.ko; if (o.f3 === 0 || o.f3 === 1) fk3d = o.f3;
  } catch (e) {}
  MATCH = MATCHES[mIdx];
}
function startMatch(opts) {
  setCourt(opts && opts.street ? opts.court : null);
  fr = opts && opts.kind === 'friendly' ? opts : null; cur = fr ? null : (opts || null); yel = {}; ban = null;
  if (fr) { TEAMS[0] = Object.assign({}, GKS[0], fr.a); TEAMS[1] = Object.assign({}, GKS[1], fr.b); } else if (cur) { TEAMS[0] = Object.assign({}, GKS[0], KITS[cur.mine]); TEAMS[1] = Object.assign({}, GKS[1], KITS[cur.opp]); } else applyKits();
  loadVoor(); prepMatch(); state = 'voor';
}
function prepMatch() { simSeed(matchSeed); setForm(); applyKitChoice(); mk(); applyLineups(); applyRates(); applyClub(); subs = 0; sbench = null; selF = selB = vSelF = vSelB = -1; score = [0, 0]; timeLeft = MATCH; }
function beginMatch() { simSeed(matchSeed ^ 0x9E3779B9); simAcc = 0; reset(0); state = 'play'; whistle(0.6); }
let hubSel = 0;
const TILES = [
  { k: 'spelen', t: 'SPELEN', s: () => 'MATCH EN TOERNOOI', c: '#2f6bff' },
  { k: 'club', t: 'CLUB', s: () => 'STERREN EN WERELDEN', c: '#ff9a4a' },
  { k: 'str', t: 'STRAAT', s: () => '5 TEGEN 5 OP HET PLEIN', c: '#ff4fa3' },
  { k: 'meer', t: 'MEER', s: () => 'OPTIES EN BESTURING', c: '#7b5cff' }
];
const HUBS = {
  spelen: [
    { k: 'kick', t: 'KICK OFF', s: () => 'SNELLE MATCH', c: '#2f6bff' },
    { k: 'seas', t: 'SEIZOEN', s: () => S && S.season ? 'DAG ' + Math.min(7, S.season.round + 1) + ' / 7' : 'LIGA + BEKER', c: '#1fbf5a' },
    { k: 'tour', t: 'TOERNOOIEN', s: () => TT ? 'LOPEND' : 'CL, EK, WK, COPA', c: '#ffd400' },
    { k: 'pen', t: 'OEFENEN', s: () => 'PENALTY\'S', c: '#ff7a3d' }
  ],
  meer: [
    { k: 'set', t: 'OPTIES', s: () => 'INSTELLINGEN', c: '#7b5cff' },
    { k: 'acc', t: 'ACCOUNT', s: () => authUser ? authUser.toUpperCase() : 'LOKAAL SPELEN', c: '#ff4fa3' },
    { k: 'help', t: 'BESTURING', s: () => 'HOE SPEEL JE', c: '#3ab0ff' }
  ]
};
const SCREENS = {
  menu: { title: 'MENU', draw: () => drawMenu() },
  spelen: { title: 'SPELEN', parent: 'menu', draw: () => drawHub('spelen') },
  meer: { title: 'MEER', parent: 'menu', draw: () => drawHub('meer') },
  pick: { title: 'KICK OFF', parent: 'spelen', draw: () => drawPick() },
  comp: { title: 'SEIZOEN', parent: 'spelen', draw: () => drawComp() },
  tour: { title: 'TOERNOOIEN', parent: 'spelen', draw: () => drawTour() },
  pen: { title: 'OEFENEN', parent: 'spelen', draw: () => drawPen() },
  album: { title: 'ALBUM', parent: 'menu', draw: () => drawAlbum() },
  straat: { title: 'STRAAT', parent: 'menu', draw: () => stStep ? drawStraat() : drawStraatTeams() },
  voor: { title: 'MENU', parent: 'menu', draw: () => drawVoor() },
  account: { title: 'ACCOUNT', parent: 'meer', draw: () => drawAccount() },
  club: { title: 'CLUB', parent: 'menu', draw: () => drawClub() },
  reeks: { title: 'DAGREEKS', parent: 'menu', draw: () => drawReeks() },
  settings: { title: 'OPTIES', parent: 'meer', draw: () => drawSettings() },
  help: { title: 'BESTURING', parent: 'meer', draw: () => { screenBG('BESTURING'); drawHelp(); } }
};
function goTo(id) {
  state = id; tab = 0; page = 0; confirmNew = false; if (HUBS[id]) hubSel = 0;
  if (id === 'pick') { selV = -1; pickRet = null; if (pickA === pickB) pickB = (pickA + 1) % 2; }
  else if (id === 'straat') { stStep = 0; pickRet = null; if (S.home && owned(S.home)) { stSel = Object.keys(COURTS).indexOf(S.home); } else if (!owned(Object.keys(COURTS)[stSel])) stSel = 0; stPg = Math.floor(stSel / 8); }
  else if (id === 'club') upSel = -1;
  else if (id === 'tour') { tourStep = 0; tourConfirm = false; }
  else if (id === 'pen') penNew();
  else if (id === 'album') { albMsg = ''; albDet = null; if (!AL) loadAl(); }
}
const GOTO = { spelen: 'spelen', meer: 'meer', kick: 'pick', seas: 'comp', tour: 'tour', pen: 'pen', str: 'straat', acc: 'account', alb: 'album', club: 'club', set: 'settings', help: 'help' };
function act(k) {
  if (GOTO[k]) { goTo(GOTO[k]); return; }
  if (k === 'team') { kitSel = (kitSel + 1) % KITS.length; applyKits(); }
  else if (k === 'time') { mIdx = (mIdx + 1) % 5; MATCH = MATCHES[mIdx]; }
  else if (k === 'diff') dIdx = (dIdx + 1) % 5;
  else if (k === 'snd') { muted = !muted; if (AC && crowdG) crowdG.gain.value = muted ? 0 : 0.1; }
  saveSet();
}
function tileGlyph(k, x, y, col) {
  cx.save(); cx.strokeStyle = col; cx.fillStyle = col; cx.lineWidth = 3.5; cx.lineJoin = 'round';
  if (k === 'spelen' || k === 'kick') { cx.beginPath(); cx.arc(x, y, 20, 0, 6.2832); cx.stroke(); cx.beginPath(); for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.5708; cx.lineTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9); } cx.closePath(); cx.fill(); }
  else if (k === 'club') { rr(x - 15, y - 22, 30, 44, 5); cx.stroke(); cx.fillRect(x - 8, y - 14, 16, 3); cx.fillRect(x - 8, y - 6, 16, 3); }
  else if (k === 'str') { rr(x - 22, y - 16, 44, 32, 4); cx.stroke(); for (let i = -1; i <= 1; i++) { cx.beginPath(); cx.moveTo(x + i * 14, y - 16); cx.lineTo(x + i * 14, y + 16); cx.stroke(); } cx.beginPath(); cx.moveTo(x - 22, y); cx.lineTo(x + 22, y); cx.stroke(); }
  else if (k === 'acc') { cx.beginPath(); cx.arc(x, y - 9, 9, 0, 6.2832); cx.stroke(); cx.beginPath(); cx.arc(x, y + 21, 17, 3.4, 6.02); cx.stroke(); }
  else if (k === 'alb') { for (let i = 0; i < 4; i++) { rr(x - 20 + (i % 2) * 21, y - 21 + Math.floor(i / 2) * 22, 18, 20, 3); cx.stroke(); } }
  else if (k === 'meer' || k === 'set') { for (let i = -1; i <= 1; i++) { cx.beginPath(); cx.arc(x + i * 15, y, 4.5, 0, 6.2832); cx.fill(); } }
  else if (k === 'seas') { cx.beginPath(); cx.moveTo(x - 20, y + 16); cx.lineTo(x - 20, y - 8); cx.lineTo(x + 20, y - 8); cx.lineTo(x + 20, y + 16); cx.closePath(); cx.stroke(); cx.fillRect(x - 20, y - 8, 40, 7); }
  else if (k === 'tour') { cx.beginPath(); cx.moveTo(x - 13, y - 20); cx.lineTo(x + 13, y - 20); cx.lineTo(x + 10, y + 2); cx.quadraticCurveTo(x, y + 12, x - 10, y + 2); cx.closePath(); cx.stroke(); cx.fillRect(x - 3, y + 8, 6, 8); cx.fillRect(x - 11, y + 16, 22, 4); }
  else { txt('?', x, y + 14, 44, col, 'center', '900'); }
  cx.restore();
}
function tileGrid(list, x, y, w, h, gap, cols, sel) {
  list.forEach((tl, i) => {
    const bx = x + (i % cols) * (w + gap), by = y + Math.floor(i / cols) * (h + gap), on = i === sel;
    const g = cx.createLinearGradient(bx, by, bx + w, by + h); g.addColorStop(0, on ? 'rgba(255,255,255,.26)' : 'rgba(255,255,255,.13)'); g.addColorStop(1, 'rgba(10,14,50,.88)');
    cx.fillStyle = g; rr(bx, by, w, h, 12); cx.fill(); cx.strokeStyle = on ? '#ffd400' : 'rgba(255,255,255,.2)'; cx.lineWidth = on ? 3.5 : 1.5; cx.stroke();
    cx.fillStyle = tl.c || '#fff'; rr(bx, by + 14, 6, h - 28, 3); cx.fill();
    tileGlyph(tl.k, bx + 52, by + h / 2, tl.c || '#fff');
    txt(tl.t, bx + 92, by + h / 2 - 2, w < 280 ? 24 : 28, '#fff', 'left', '900'); txt(tl.s(), bx + 92, by + h / 2 + 26, 16, '#b8c6ff', 'left', '700');
    hits.push({ x: bx, y: by, w, h, fn: () => { if (list === TILES) menuSel = i; else hubSel = i; act(tl.k); } });
  });
}
function iconBtn(x, y, s, k) {
  cx.fillStyle = 'rgba(255,255,255,.14)'; rr(x, y, s, s, 12); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1.5; cx.stroke();
  const cxm = x + s / 2, cym = y + s / 2;
  if (k === 'snd') {
    cx.fillStyle = '#fff'; cx.beginPath(); cx.moveTo(cxm - 14, cym - 6); cx.lineTo(cxm - 6, cym - 6); cx.lineTo(cxm + 4, cym - 15); cx.lineTo(cxm + 4, cym + 15); cx.lineTo(cxm - 6, cym + 6); cx.lineTo(cxm - 14, cym + 6); cx.closePath(); cx.fill();
    cx.strokeStyle = '#fff'; cx.lineWidth = 3;
    if (!muted) { cx.beginPath(); cx.arc(cxm + 4, cym, 9, -0.9, 0.9); cx.stroke(); cx.beginPath(); cx.arc(cxm + 4, cym, 16, -0.9, 0.9); cx.stroke(); }
    else { cx.beginPath(); cx.moveTo(cxm + 10, cym - 9); cx.lineTo(cxm + 22, cym + 9); cx.moveTo(cxm + 22, cym - 9); cx.lineTo(cxm + 10, cym + 9); cx.stroke(); }
  } else txt('?', cxm, cym + 12, 34, '#fff', 'center', '900');
  hits.push({ x, y, w: s, h: s, fn: () => act(k) });
}
function drawHub(id) {
  const X0 = screenBG(SCREENS[id].title), list = HUBS[id], n = list.length, w = 250, gap = 25, tot = n * w + (n - 1) * gap;
  tileGrid(list, X0 + (800 - tot) / 2, 190, w, 190, gap, n, hubSel);
  txt('Kies hierboven. Met < ga je een niveau terug.', X0 + 400, 440, 16, 'rgba(255,255,255,.7)', 'center', '600');
}
function uiTap(x, y) {
  for (const h of hits) if (x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) { h.fn(); return true; }
  if (state === 'help') { state = 'meer'; return true; }
  return false;
}
function uiKey(code) {
  const sc = SCREENS[state];
  if (sc && sc.parent && (code === 'Escape' || code === 'Backspace')) { state = sc.parent; confirmNew = false; }
  else if (state === 'help') state = 'meer';
  else if (state === 'menu' || HUBS[state]) {
    const list = state === 'menu' ? TILES : HUBS[state], cols = state === 'menu' ? 2 : list.length; let i = state === 'menu' ? menuSel : hubSel;
    if (code === 'ArrowRight' || code === 'KeyD') i = (i + 1) % list.length;
    else if (code === 'ArrowLeft' || code === 'KeyA') i = (i + list.length - 1) % list.length;
    else if (code === 'ArrowDown' || code === 'KeyS') i = i + cols < list.length ? i + cols : i;
    else if (code === 'ArrowUp' || code === 'KeyW') i = i - cols >= 0 ? i - cols : i;
    else if (code === 'Enter' || code === 'Space') { act(list[i].k); return; }
    if (state === 'menu') menuSel = i; else hubSel = i;
  }
  else if (state === 'voor') { if (code === 'Enter' || code === 'Space') beginMatch(); else if (code === 'Escape') state = 'menu'; }
  else if (state === 'pause') { if (code === 'Space' || code === 'Enter' || code === 'Escape') state = 'play'; else if (code === 'KeyM') state = 'menu'; }
  else if (state === 'end') { if (code === 'Space' || code === 'Enter') { if (fr && fr.tour) { state = 'tour'; tab = 0; } else startMatch(); } else if (code === 'Escape') state = 'menu'; }
}

const bokeh = []; for (let i = 0; i < 34; i++) bokeh.push({ x: Math.random(), y: Math.random(), r: 3 + Math.random() * 10, s: 0.01 + Math.random() * 0.03, a: 0.05 + Math.random() * 0.12 });
const menuP = { t: 0, i: 3, skin: '#d9a273', hair: '#1a1209', boot: '#ff8a1f', face: -1, ph: 0, kk: 0, vx: 0, vy: 0 };
function swoosh(y0, y1, c0, c1, w, ph, a) {
  const g = cx.createLinearGradient(0, 0, SW, 0); g.addColorStop(0, c0); g.addColorStop(1, c1);
  cx.strokeStyle = g; cx.lineWidth = w; cx.globalAlpha = a; cx.beginPath();
  cx.moveTo(-40, y0); cx.bezierCurveTo(SW * 0.3, y0 + 120 * Math.sin(ph), SW * 0.6, y1 - 140 * Math.cos(ph), SW + 40, y1); cx.stroke(); cx.globalAlpha = 1;
}
function btn(x, y, w, h, label, fn, primary) {
  cx.fillStyle = primary ? '#f2f4f8' : 'rgba(255,255,255,.12)'; rr(x, y, w, h, 6); cx.fill();
  if (!primary) { cx.strokeStyle = 'rgba(255,255,255,.35)'; cx.lineWidth = 1.5; cx.stroke(); }
  txt(label, x + w / 2, y + h / 2 + 6, 18, primary ? '#0b1b4d' : '#fff', 'center', '800');
  hits.push({ x, y, w, h, fn });
}
const BGIMG = new Image(); BGIMG.src = 'achtergrond.png';
function drawMenu() {
  const g = cx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#060c24'); g.addColorStop(0.55, '#171a48'); g.addColorStop(1, '#0a0722');
  cx.fillStyle = g; cx.fillRect(0, 0, SW, VH);
  if (BGIMG.complete && BGIMG.naturalWidth) {
    const k = Math.max(SW / BGIMG.naturalWidth, VH / BGIMG.naturalHeight), iw = BGIMG.naturalWidth * k, ih = BGIMG.naturalHeight * k;
    cx.drawImage(BGIMG, (SW - iw) / 2, (VH - ih) / 2, iw, ih);
    const o = cx.createLinearGradient(0, 0, SW, 0); o.addColorStop(0, 'rgba(4,8,30,.82)'); o.addColorStop(0.6, 'rgba(4,8,30,.5)'); o.addColorStop(1, 'rgba(4,8,30,.3)');
    cx.fillStyle = o; cx.fillRect(0, 0, SW, VH);
  }
  let r = cx.createRadialGradient(SW * 0.08, VH * 0.9, 0, SW * 0.08, VH * 0.9, SW * 0.5);
  r.addColorStop(0, 'rgba(255,60,130,.28)'); r.addColorStop(1, 'rgba(255,60,130,0)'); cx.fillStyle = r; cx.fillRect(0, 0, SW, VH);
  r = cx.createRadialGradient(SW * 0.85, VH * 0.2, 0, SW * 0.85, VH * 0.2, SW * 0.45);
  r.addColorStop(0, 'rgba(60,150,255,.26)'); r.addColorStop(1, 'rgba(60,150,255,0)'); cx.fillStyle = r; cx.fillRect(0, 0, SW, VH);
  const t = tNow * 0.25;
  swoosh(VH * 0.62, VH * 0.35, '#ff5a8a', '#6a4dff', 5, t, 0.55);
  swoosh(VH * 0.7, VH * 0.5, '#ff9a4a', '#ff3b8b', 2, t + 1, 0.5);
  swoosh(VH * 0.3, VH * 0.6, '#3ab0ff', '#7b5cff', 8, t + 2, 0.35);
  swoosh(VH * 0.8, VH * 0.2, '#ff5ab0', '#3ab0ff', 2, t + 3, 0.45);
  for (const b of bokeh) { cx.fillStyle = 'rgba(255,255,255,' + b.a + ')'; cx.beginPath(); cx.arc(((b.x + tNow * b.s * 0.2) % 1) * SW, b.y * VH, b.r, 0, 6.2832); cx.fill(); }
  cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(70, 56, 24, 0, 6.2832); cx.fill();
  txt('E', 70, 64, 21, '#0b1b4d', 'center', '900'); txt('EAWG MOBILE', 108, 64, 24, '#fff', 'left', '900');

  const L = Math.max(40, (SW - 1000) / 2 + 40), Rr = Math.min(SW - 40, (SW + 1000) / 2 - 40);
  const px = Math.max(L + 700, Rr - 140), feet = VH - 62, u = 6.0;
  r = cx.createRadialGradient(px, feet - 150, 10, px, feet - 150, 230); r.addColorStop(0, 'rgba(140,110,255,.35)'); r.addColorStop(1, 'rgba(140,110,255,0)');
  cx.fillStyle = r; cx.fillRect(px - 240, feet - 390, 480, 480);
  cx.globalAlpha = 0.8; cx.drawImage(shSpr, px - 150, feet - 28, 300, 110); cx.globalAlpha = 1;
  drawPlayer(menuP, { x: px, y: feet, u, f: -1, run: 0.75, kk: 0, ph: 0.9 + Math.sin(tNow * 1.3) * 0.08 });
  iconBtn(Rr - 124, 22, 56, 'snd'); iconBtn(Rr - 56, 22, 56, 'help');
  tileGrid(TILES, L, 124, 300, 150, 16, 2, menuSel);
  drawReeksBanner(L, 456, 616);
  txt('Tik op een tegel, of gebruik pijltjes en Enter', L, VH - 30, 15, 'rgba(255,255,255,.7)', 'left', '600');
}
function drawHelp() {
  const w = Math.min(760, SW - 80), x = (SW - w) / 2, y = 110;
  cx.fillStyle = 'rgba(14,18,60,.96)'; rr(x, y, w, 380, 8); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.lineWidth = 2; cx.stroke();
  txt('BESTURING', SW / 2, y + 50, 30, '#fff', 'center', '900');
  const L = ['Links op het scherm: sleep om te sturen.', 'SCHIET: hou ingedrukt voor meer kracht, laat los om te schieten.', 'PASS: tik om naar een teamgenoot te passen.', 'Zonder bal volgt je dichtstbijzijnde speler de bal automatisch.', 'Toetsenbord: pijltjes of WASD, spatie = schieten, X = passen, Esc = pauze.', 'Menu: kies een tegel. Met de knop linksboven ga je een niveau terug.'];
  L.forEach((s, i) => txt(s, x + 36, y + 100 + i * 36, 17, 'rgba(255,255,255,.92)', 'left', '600'));
  txt('Tik om te sluiten', SW / 2, y + 350, 16, '#8fb0ff', 'center', '800');
}
// ---------- pauze met wissels (max 5 per match, spelers van de bank komen uit de selectie van je club) ----------
let subs = 0, sbench = null, selF = -1, selB = -1;
const ROLE = ['KEE', 'VER', 'VER', 'VER', 'MID', 'MID', 'AAN', 'AAN'];
function buildBench() {
  const out = [], on = new Set(players.filter(p => p.t === 0).map(p => p.name));
  const base = Math.round(players.filter(p => p.t === 0).reduce((a, p) => a + (p.rate || 60), 0) / NP);
  if (cur && S) {
    S.cards.filter(c => !S.lineup.includes(c.id) && c.pos !== 0).forEach((c, k) => out.push({ name: cshort(c), num: 12 + k, rate: eff(c) }));
  } else {
    squadOf(TEAMS[0] && TEAMS[0].name).filter(q => q.pos !== 'GK').sort((a, b) => (a.n || 99) - (b.n || 99)).forEach(q => {
      const nm = surname(q.name); if (on.has(nm) || out.length >= 7) return; const k = out.length;
      out.push({ name: nm, num: q.n || 12 + k, rate: Math.max(40, Math.min(95, base + (k % 5) - 3)), skin: SKIN[q.sk] || SKIN[(k * 3 + 2) % 5], hair: HAIR[q.hr] || HAIR[(k * 2 + 1) % 5], hs: q.hs >= 0 && q.hs < 4 ? q.hs : k % 4, boot: BOOT[q.bt] || BOOT[k % 6] });
    });
  }
  for (let k = out.length; k < 5; k++) out.push({ name: LAST[(k * 3 + 1) % LAST.length].toUpperCase(), num: 12 + k, rate: Math.max(40, base + (k % 5) - 3), skin: SKIN[(k * 3 + 2) % 5], hair: HAIR[(k * 2 + 1) % 5], hs: k % 4, boot: BOOT[k % 6] });
  return out.slice(0, 7);
}
function doSub(free) {
  const p = players.find(q => q.t === 0 && q.i === selF), b = sbench && sbench[selB]; if (!p || !b || (!free && subs >= 5)) return;
  const o = { name: p.name, num: p.num, rate: p.rate, skin: p.skin, hair: p.hair, hs: p.hs, boot: p.boot };
  Object.assign(p, { name: b.name, num: b.num, rate: b.rate, skin: b.skin || p.skin, hair: b.hair || p.hair, hs: b.hs != null ? b.hs : p.hs, boot: b.boot || p.boot });
  sbench[selB] = o; if (!free) { subs++; ban = { t: 1.8, text: 'WISSEL', sub: b.name + ' IN, ' + o.name + ' UIT', col: '#ffffff' }; } selF = selB = -1;
}
function drawPause() {
  cx.fillStyle = 'rgba(2,8,24,.86)'; cx.fillRect(0, 0, SW, VH);
  if (!sbench) sbench = buildBench();
  const m = SW / 2, xl = m - 385, xr = m + 15, w = 370, rowH = 44;
  txt('PAUZE', m, 58, 46, '#fff', 'center', '900');
  txt('Wissels: ' + subs + ' van 5', m, 86, 16, '#ffd400', 'center', '800');
  txt('OP HET VELD (tik een speler)', xl, 116, 14, '#8fb0ff', 'left', '800'); txt('BANK (tik de invaller)', xr, 116, 14, '#8fb0ff', 'left', '800');
  for (let i = 1; i < NP; i++) {
    const p = players.find(q => q.t === 0 && q.i === i); if (!p) continue;
    pill(xl, 124 + (i - 1) * rowH, w, 38, (p.num || '') + '  ' + p.name + '   ' + ROLE[i] + '  ' + Math.round(p.rate || 0), () => { selF = selF === i ? -1 : i; }, selF === i, 15);
  }
  sbench.forEach((b, k) => pill(xr, 124 + k * rowH, w, 38, (b.num || '') + '  ' + b.name + '   ' + Math.round(b.rate || 0), () => { selB = selB === k ? -1 : k; }, selB === k, 15));
  const ok = selF >= 0 && selB >= 0 && subs < 5;
  btn(m - 390, 446, 260, 54, 'WISSEL DOORVOEREN', () => { if (ok) doSub(); }, ok);
  btn(m - 130, 446, 260, 54, 'VERDER', () => { state = 'play'; }, !ok);
  btn(m + 130, 446, 260, 54, 'NAAR MENU', () => { state = 'menu'; }, false);
  txt(subs >= 5 ? 'Je hebt al 5 wissels gebruikt.' : 'Kies eerst een speler op het veld en dan een invaller van de bank.', m, 530, 14, 'rgba(255,255,255,.7)', 'center', '600');
}
function drawEnd() {
  cx.fillStyle = 'rgba(2,8,24,.72)'; cx.fillRect(0, 0, SW, VH);
  txt(score[0] > score[1] ? 'GEWONNEN!' : score[0] < score[1] ? 'VERLOREN' : 'GELIJK', SW / 2, 150, 70, '#fff', 'center', '900');
  cx.fillStyle = '#ffd400'; cx.fillRect(SW / 2 - 90, 164, 180, 5);
  txt(TEAMS[0].code + '  ' + score[0] + ' - ' + score[1] + '  ' + TEAMS[1].code, SW / 2, 214, 32, '#fff', 'center', '800');
  (lastRes || []).forEach((l, i) => txt(l, SW / 2, 252 + i * 24, 17, '#ffd400', 'center', '800'));
  const y0 = 262 + (lastRes ? lastRes.length : 0) * 24;
  if (fr && fr.tour) { btn(SW / 2 - 130, y0, 260, 54, 'VERDER', () => { state = 'tour'; tab = 0; tourStep = 0; }, true); }
  else if (cur) { btn(SW / 2 - 130, y0, 260, 54, 'VERDER', () => { state = 'comp'; tab = cur.kind === 'cup' ? 1 : 0; }, true); }
  else { btn(SW / 2 - 130, y0, 260, 54, 'REVANCHE', () => startMatch(fr || undefined), true); btn(SW / 2 - 130, y0 + 70, 260, 54, 'MENU', () => { state = 'menu'; }, false); }
}


// ---------- fase 1: seizoen, club, kaarten, markt ----------
const TS = [74, 72, 70, 66, 63, 63, 62, 60];
const FIRST = ['Jens', 'Tibo', 'Milan', 'Arne', 'Lars', 'Noah', 'Ruben', 'Seppe', 'Yanis', 'Bram', 'Kobe', 'Elias', 'Wout', 'Luca', 'Dries', 'Tim'];
const LAST = ['Verbist', 'De Smet', 'Janssens', 'Peeters', 'Willems', 'Claes', 'Hermans', 'Goossens', 'Lambert', 'Dubois', 'Maes', 'Wouters', 'Mertens', 'Jacobs', 'Coppens', 'Vos', 'Segers', 'Baert', 'Leroy', 'Pauwels'];
const PSH = ['GK', 'DEF', 'MID', 'AAN'], SLOTP = [0, 1, 1, 2, 3], SLOTN = ['KEEPER', 'VERDEDIGER', 'VERDEDIGER', 'MIDDEN', 'AANVALLER'];
const STRICT = ['UIT', 'SOEPEL', 'NORMAAL', 'STREKK'], FOULP = [0, 0.04, 0.08, 0.16];
let S = null, tab = 0, page = 0, cur = null, lastRes = null, ban = null, strictIdx = 2, yel = {}, confirmNew = false;
const weekKey = () => { const d = new Date(), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); return t.getUTCFullYear() + 'w' + Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7); };
const today = () => new Date().toISOString().slice(0, 10);
function mkRng(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } let a = h >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function genCard(r, pos, rating, id) {
  const f = FIRST[(r() * FIRST.length) | 0], l = LAST[(r() * LAST.length) | 0];
  return { id, name: f[0] + '. ' + l.toUpperCase(), pos, base: rating, lvl: 0 };
}
const eff = c => Math.min(99, c.base + c.lvl);
const tier = c => eff(c) >= 75 ? 'GOUD' : eff(c) >= 66 ? 'ZILVER' : 'BRONS';
const tcol = c => eff(c) >= 75 ? '#e7c24a' : eff(c) >= 66 ? '#c4ccd8' : '#c58a5a';
const price = c => Math.round(20 + Math.pow(c.base - 50, 2) * 0.9);
function newSave() {
  const r = mkRng('start'), cards = []; let id = 1;
  [0, 1, 1, 2, 3, 1, 3].forEach(p => cards.push(genCard(r, p, 59 + ((r() * 5) | 0), id++)));
  return { coins: 300, cards, lineup: [1, 2, 3, 4, 5], nid: id, bought: {}, season: null, obj: null, mine: 0 };
}
function loadS() {
  try { const o = JSON.parse(localStorage.getItem('goalrush2')); if (o && Array.isArray(o.cards) && Array.isArray(o.lineup)) { S = o; fixS(); return; } } catch (e) {}
  S = newSave(); fixS();
}
function saveS() { try { localStorage.setItem('goalrush2', JSON.stringify(S)); } catch (e) {} }
const cardById = id => S.cards.find(c => c.id === id);
const lineCard = i => cardById(S.lineup[i]);
function objs() {
  const d = today(); if (!S.obj || S.obj.day !== d) S.obj = { day: d, play: 0, win: 0, goals: 0, clean: 0, claimed: {} };
  return [['play', 'Speel 3 wedstrijden', 3, 60], ['win', 'Win 1 wedstrijd', 1, 80], ['goals', 'Scoor 5 doelpunten', 5, 60], ['clean', '1x de nul houden', 1, 80]];
}
function offers() {
  const d = today(), r = mkRng('markt' + d), out = [];
  for (let i = 0; i < 8; i++) { const rt = 58 + Math.round(Math.pow(r(), 1.6) * 22); out.push(genCard(r, i % 4, rt, 'o' + i)); }
  const wk = mkRng('vorm' + weekKey()); for (let n = 0; n < 2; n++) { const c = out[(wk() * 8) | 0]; if (!c.form) { c.form = true; c.base = Math.min(90, c.base + 3); } }
  return out;
}
function tradePreview(pos) {
  const el = S.cards.filter(c => c.pos === pos && !S.lineup.includes(c.id) && !c.star).sort((a, b) => eff(a) - eff(b));
  if (el.length < 3) return null;
  const give = el.slice(0, 3), avg = Math.round((eff(give[0]) + eff(give[1]) + eff(give[2])) / 3), rt = Math.min(88, avg + 4);
  const c = genCard(mkRng('ruil' + today() + pos + avg), pos, rt, 0); return { give, card: c };
}
// seizoen
function newSeason() {
  const mine = S.mine = kitSel, t = [0, 1, 2, 3, 4, 5, 6, 7], fx = [], tt = t.slice();
  for (let r = 0; r < 7; r++) { const ps = []; for (let i = 0; i < 4; i++) ps.push([tt[i], tt[7 - i]]); fx.push(ps); tt.splice(1, 0, tt.pop()); }
  const tab2 = {}; t.forEach(i => tab2[i] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
  const r = mkRng('cup' + Date.now()), order = t.slice().sort(() => r() - 0.5), pairs = [];
  for (let i = 0; i < 8; i += 2) pairs.push([order[i], order[i + 1]]);
  const n = S.season ? S.season.n + 1 : 1;
  S.season = { n, mine, fx, round: 0, tab: tab2, done: false, prize: 0, cup: { r: 0, pairs, hist: [], out: false, champ: -1, prize: 0 } };
  saveS();
}
function pois(l) { let L = Math.exp(-l), k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
function simMatch(a, b) { const la = 1.4 * Math.pow(TS[a] / TS[b], 2.4), lb = 1.4 * Math.pow(TS[b] / TS[a], 2.4); return [pois(la), pois(lb)]; }
function addRes(a, b, ga, gb) {
  const T = S.season.tab, A = T[a], B = T[b]; A.p++; B.p++; A.gf += ga; A.ga += gb; B.gf += gb; B.ga += ga;
  if (ga > gb) { A.w++; A.pts += 3; B.l++; } else if (ga < gb) { B.w++; B.pts += 3; A.l++; } else { A.d++; B.d++; A.pts++; B.pts++; }
}
const rankList = () => Object.keys(S.season.tab).map(Number).sort((x, y) => { const a = S.season.tab[x], b = S.season.tab[y]; return b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf; });
function myFix() { const se = S.season; if (se.round >= 7) return null; return se.fx[se.round].find(p => p[0] === se.mine || p[1] === se.mine); }
function myCup() { const c = S.season.cup; if (c.out || c.champ >= 0) return null; return c.pairs.find(p => p[0] === S.season.mine || p[1] === S.season.mine); }
const CUPN = ['KWARTFINALE', 'HALVE FINALE', 'FINALE'];
function startComp(kind) {
  const se = S.season, pr = kind === 'league' ? myFix() : myCup(); if (!pr) return;
  const opp = pr[0] === se.mine ? pr[1] : pr[0];
  cur = { kind, opp, mine: se.mine }; startMatch(cur);
}
function finishComp(ga, gb) {
  const se = S.season, o = cur.opp, m = cur.mine; let txtl = [], pen = null;
  if (cur.kind === 'league') {
    addRes(m, o, ga, gb);
    for (const p of se.fx[se.round]) if (p[0] !== m && p[1] !== m) { const r = simMatch(p[0], p[1]); addRes(p[0], p[1], r[0], r[1]); }
    se.round++;
    if (se.round >= 7 && !se.done) { se.done = true; const rk = rankList().indexOf(m), pz = [500, 300, 200][rk] || 100; se.prize = pz; S.coins += pz; txtl.push('Seizoen klaar: plaats ' + (rk + 1) + ' = +' + pz + ' munten'); }
  } else {
    const c = se.cup; let w = ga > gb ? m : o;
    if (ga === gb) { const pm = 0.5 + (TS[m] - TS[o]) * 0.004 + (lineAvg() - TS[m]) * 0.0; w = Math.random() < pm ? m : o; pen = w === m ? 'Gewonnen na strafschoppen' : 'Verloren na strafschoppen'; }
    const res = c.pairs.map(p => { if (p[0] === m || p[1] === m) return [p[0], p[1], p[0] === m ? ga : gb, p[0] === m ? gb : ga, w]; const r = simMatch(p[0], p[1]); let ww = r[0] > r[1] ? p[0] : r[0] < r[1] ? p[1] : (Math.random() < 0.5 ? p[0] : p[1]); return [p[0], p[1], r[0], r[1], ww]; });
    c.hist.push(res); const win = res.map(r => r[4]);
    if (w !== m) { c.out = true; let al = win; while (al.length > 1) { const n = []; for (let i = 0; i < al.length; i += 2) { const r = simMatch(al[i], al[i + 1]); const ww = r[0] > r[1] ? al[i] : r[0] < r[1] ? al[i + 1] : (Math.random() < 0.5 ? al[i] : al[i + 1]); n.push(ww); } al = n; } c.champ = al[0]; c.pairs = []; txtl.push('Uitgeschakeld in de ' + CUPN[c.r].toLowerCase()); const pz = [0, 100, 200][c.r]; if (pz) { S.coins += pz; c.prize += pz; txtl.push('Beker: +' + pz + ' munten'); }
    } else if (win.length === 1) { c.champ = m; c.pairs = []; S.coins += 400; c.prize += 400; txtl.push('BEKERWINNAAR! +400 munten'); }
    else { const n = []; for (let i = 0; i < win.length; i += 2) n.push([win[i], win[i + 1]]); c.pairs = n; }
    c.r++;
  }
  if (pen) txtl.unshift(pen); return txtl;
}
const lineAvg = () => { let s = 0; for (let i = 0; i < 5; i++) s += eff(lineCard(i)); return s / 5; };
function afterMatch() {
  const win = score[0] > score[1], dr = score[0] === score[1]; let coin = (win ? 100 : dr ? 40 : 15) + score[0] * 20; const ln = [];
  if (!cur && !(fr && fr.tour)) coin = Math.round(coin * 0.5);
  const wb = court && court.bonus ? Math.round(coin * court.bonus) : 0; coin += wb;
  objs(); const o = S.obj; o.play++; if (win) o.win++; o.goals += score[0]; if (score[1] === 0) o.clean++;
  S.coins += coin; ln.push('+' + coin + ' munten' + (wb ? ' (wereldbonus +' + wb + ')' : ''));
  econDay();
  if (cur) for (const l of finishComp(score[0], score[1])) ln.push(l);
  if (fr && fr.tour && TT) for (const l of finishTour(score[0], score[1])) ln.push(l);
  { const pk = win ? 1 : dr ? 0.5 : 0; if (pk) { albAdd(pk); ln.push('+' + pk + ' pack (album)'); } }
  lastRes = ln; saveS();
}
function applyRates(t0) {
  for (const p of players) {
    if (fr) { p.rate = Math.min(95, (p.t ? fr.tb : fr.ta) + ((p.i * 7 + p.t * 3) % 5) - 2); continue; }
    if (p.t === 0) { const c = lineCard(p.i); if (c && !c.star) { p.name = cshort(c); p.rate = eff(c); } else p.rate = Math.max(40, Math.round(lineAvg()) - 3); }
    else { const base = cur ? TS[cur.opp] : 55 + dIdx * 5; p.rate = Math.min(95, base + ((p.i * 7) % 5) - 2); }
  }
}
// snelheid: rating (zoals vroeger) maal de upgrade SNELHEID (max +12 procent)
const rf = p => Math.max(0.88, Math.min(1.14, 0.9 + ((p.rate || 60) - 60) * 0.005)) * upF(p, 0);

// ---------- economie: upgrades, sterspelers, werelden en dagreeks (alles met speelmunten, alles in goalrush2) ----------
// Upgrades: per kaart 4 eigenschappen, niveau 0 tot 5. Elk niveau = +2,4 procent, dus maximaal +12 procent (bovengrens voor de balans).
const UPN = ['SNELHEID', 'SCHOT', 'PASSEN', 'BALCONTROLE'], UPA = ['SNE', 'SCH', 'PAS', 'BAL'], UPK = 0.024, UPMAX = 5, UPCOST = [40, 70, 110, 160, 220];
const upL = (p, k) => p && p.up ? Math.max(0, Math.min(UPMAX, p.up[k] | 0)) : 0;
const upF = (p, k) => 1 + upL(p, k) * UPK;
const cshort = c => c.short || c.name.split(' ').slice(1).join(' ') || c.name;
const ROLEN = ['KEEPER', 'VERDEDIGER', 'MIDDENVELDER', 'AANVALLER'];
// Sterspelers: testversie met echte namen, alleen voor privégebruik. Uiterlijk is algemeen getekend (geen foto's, geen logo's).
// r = sterkte, up = vaste eigenschap (telt als upgrade-niveaus, dus ook onder de bovengrens van 5), sk/hr = huid en haar.
const STARS = [
  { id: 'ronaldo', name: 'C. RONALDO', short: 'RONALDO', pos: 3, r: 91, price: 1600, tr: 'KANONSCHOT', up: [0, 3, 0, 0], num: 7, sk: 1, hr: 0 },
  { id: 'messi', name: 'L. MESSI', short: 'MESSI', pos: 3, r: 92, price: 1700, tr: 'TOVENAAR', up: [0, 0, 1, 3], num: 10, sk: 0, hr: 1 },
  { id: 'mbappe', name: 'K. MBAPPE', short: 'MBAPPE', pos: 3, r: 91, price: 1600, tr: 'RAKETSNEL', up: [3, 0, 0, 0], num: 10, sk: 3, hr: 3 },
  { id: 'haaland', name: 'E. HAALAND', short: 'HAALAND', pos: 3, r: 90, price: 1500, tr: 'SPITSBEER', up: [0, 2, 0, 1], num: 9, sk: 0, hr: 2 },
  { id: 'debruyne', name: 'K. DE BRUYNE', short: 'DE BRUYNE', pos: 2, r: 89, price: 1400, tr: 'SPELMAKER', up: [0, 1, 3, 0], num: 17, sk: 0, hr: 4 },
  { id: 'neymar', name: 'NEYMAR JR', short: 'NEYMAR', pos: 3, r: 87, price: 1200, tr: 'DRIBBELAAR', up: [1, 0, 0, 2], num: 10, sk: 1, hr: 0 },
  { id: 'modric', name: 'L. MODRIC', short: 'MODRIC', pos: 2, r: 86, price: 1100, tr: 'METRONOOM', up: [0, 0, 2, 1], num: 10, sk: 0, hr: 2 },
  { id: 'salah', name: 'M. SALAH', short: 'SALAH', pos: 3, r: 89, price: 1400, tr: 'SNELLE VLEUGEL', up: [2, 1, 0, 0], num: 11, sk: 2, hr: 0 },
  { id: 'lewandowski', name: 'R. LEWANDOWSKI', short: 'LEWANDOWSKI', pos: 3, r: 88, price: 1300, tr: 'AFMAKER', up: [0, 2, 1, 0], num: 9, sk: 0, hr: 1 },
  { id: 'kane', name: 'H. KANE', short: 'KANE', pos: 3, r: 89, price: 1400, tr: 'SCHERPSCHUTTER', up: [0, 2, 1, 0], num: 9, sk: 0, hr: 1 },
  { id: 'vinicius', name: 'VINICIUS JR', short: 'VINICIUS', pos: 3, r: 89, price: 1400, tr: 'BLIKSEM', up: [2, 0, 0, 1], num: 7, sk: 3, hr: 3 },
  { id: 'pedri', name: 'PEDRI', short: 'PEDRI', pos: 2, r: 87, price: 1200, tr: 'BALVAST', up: [0, 0, 1, 2], num: 8, sk: 1, hr: 0 },
  { id: 'vandijk', name: 'V. VAN DIJK', short: 'VAN DIJK', pos: 1, r: 89, price: 1300, tr: 'MUUR', up: [1, 0, 1, 1], num: 4, sk: 2, hr: 3 },
  { id: 'courtois', name: 'T. COURTOIS', short: 'COURTOIS', pos: 0, r: 89, price: 1300, tr: 'REUZE IN DOEL', up: [1, 0, 1, 0], num: 1, sk: 0, hr: 2 }
];
// Werelden: datagedreven varianten van de straatvelden (COURTS). base = welk veld als basis dient, o = wat anders is.
const WL = (fx, col, a, extra) => fx.map((f, i) => Object.assign({ fx: f, y: 24, r: 58, col, a, cone: true, spread: 100 }, extra ? extra(i) : {}));
const WORLDS = [
  { id: 'rio', base: 'beton', name: 'RIO FAVELA', sub: 'HUISJES IN KLEUR OP DE HELLING', price: 1250, o: { floor: '#7a5a44', floor2: '#71533f', sky: ['#ff9a5a', '#ffe0a8'], crowd: 'world', bgk: 'favela', grade: 'rgba(255,170,90,.08)', lamps: WL([0.2, 0.5, 0.8], '255,214,150', 0.45) } },
  { id: 'tokio', base: 'neon', name: 'TOKIO NEON', sub: 'ROZE EN CYAAN BIJ NACHT', price: 1500, o: { floor: '#24103a', floor2: '#1e0d32', line: 'rgba(255,225,250,.95)', sky: ['#05010f', '#2a0838'], crowd: 'world', bgk: 'tokio', indoor: false, wc: ['#ff2fa0', '#3a0630', '#4a0838'], grade: 'rgba(255,40,180,.08)', lamps: [0, 1, 2, 3, 4, 5].map(i => ({ fx: (i + 0.5) / 6, y: 18, r: 50, col: i & 1 ? '60,230,255' : '255,47,160', a: 0.6, cone: true, spread: 70, flick: i === 2 ? 2.6 : 0 })) } },
  { id: 'wembley', base: 'neon', name: 'WEMBLEY AVOND', sub: 'VOLLE TRIBUNES ONDER DE LAMPEN', price: 2500, o: { floor: '#2f7d3a', floor2: '#2a7334', line: 'rgba(255,255,255,.95)', sky: ['#0a1030', '#24305a'], crowd: 'fans', pal: ['#ffffff', '#d8102e', '#1b2a6b', '#f4f4f4', '#c8102e', '#e8e8ea', '#22336b'], indoor: false, glow: false, streaks: false, wall: 'boards', wc: ['#d8102e', '#5a0612', '#7a0a1a'], tile: 100, grade: 'rgba(200,220,255,.05)', lamps: WL([0.1, 0.37, 0.63, 0.9], '235,245,255', 0.85, () => ({ y: 14, r: 64, spread: 120 })) } },
  { id: 'campnou', base: 'neon', name: 'CAMP NOU NACHT', sub: 'BLAUW EN ROOD TOT AAN HET DAK', price: 2000, o: { floor: '#2c7a38', floor2: '#286f33', line: 'rgba(255,255,255,.95)', sky: ['#020414', '#101a3c'], crowd: 'fans', pal: ['#a50044', '#004d98', '#edbb00', '#a50044', '#004d98', '#ffffff', '#7a0033'], indoor: false, glow: false, streaks: false, wall: 'boards', wc: ['#004d98', '#001a40', '#00285a'], tile: 100, grade: 'rgba(160,0,80,.05)', lamps: WL([0.1, 0.37, 0.63, 0.9], '235,245,255', 0.85, () => ({ y: 14, r: 64, spread: 120 })) } },
  { id: 'maracana', base: 'neon', name: 'MARACANA', sub: 'GEEL EN GROEN IN DE ZON', price: 2000, o: { floor: '#3a8f3c', floor2: '#358437', line: 'rgba(255,255,255,.97)', sky: ['#3f7fd0', '#a8d8f0'], crowd: 'fans', pal: ['#fdda24', '#1f9d55', '#1b5fbf', '#fdda24', '#ffffff', '#1f9d55', '#fdda24'], indoor: false, glow: false, streaks: false, wall: 'boards', wc: ['#fdda24', '#5a4a00', '#1f7a3a'], tile: 100, grade: 'rgba(255,230,120,.06)', lamps: [] } },
  { id: 'venetie', base: 'dak', name: 'VENETIE KANAAL', sub: 'GONDELS EN OUDE GEVELS', price: 1500, o: { floor: '#b9a68a', floor2: '#b09d80', line: 'rgba(255,255,255,.92)', sky: ['#3a2a5a', '#f2a07a'], crowd: 'world', bgk: 'canal', wc: ['#d8c8a8', '#c8b898'], puddle: '#6a8a9a', grade: 'rgba(255,170,120,.06)' } },
  { id: 'dubai', base: 'dak', name: 'DUBAI DAK', sub: 'TORENS BIJ ZONSONDERGANG', price: 2500, o: { floor: '#d6c7a8', floor2: '#cdbd9c', line: 'rgba(120,80,40,.85)', sky: ['#1a1040', '#ff8a3d'], crowd: 'world', bgk: 'dubai', wc: ['#e8dcc4', '#d8ccb4'], puddle: false, grade: 'rgba(255,150,60,.07)', lamps: WL([0.12, 0.37, 0.63, 0.88], '255,214,140', 0.7, () => ({ y: 26, r: 60 })) } },
  { id: 'ijs', base: 'dak', name: 'ANTARCTICA IJS', sub: 'SNEEUW, IJS EN NOORDERLICHT', price: 1500, o: { floor: '#dfeaf2', floor2: '#d3e2ec', line: 'rgba(30,80,160,.85)', sky: ['#0b1f44', '#7fb8e0'], crowd: 'world', bgk: 'ice', wc: ['#cfe6f5', '#a8c8dc'], puddle: '#a8cce4', speck: ['rgba(255,255,255,.5)', 'rgba(120,160,200,.18)'], weather: 'snow', grade: 'rgba(160,200,255,.06)', lamps: [] } },
  { id: 'mexico', base: 'beton', name: 'MEXICO KLEUR', sub: 'FELLE MUREN EN VLAGGETJES', price: 1000, o: { floor: '#c86a3a', floor2: '#bd6234', line: 'rgba(255,248,230,.92)', sky: ['#1e88d6', '#9fe0ff'], crowd: 'world', bgk: 'mexico', puddle: false, grade: 'rgba(255,190,90,.06)', lamps: [] } },
  { id: 'medina', base: 'dak', name: 'MAROKKO MEDINA', sub: 'BOGEN, LANTAARNS EN ZANDSTEEN', price: 1000, o: { floor: '#c99a62', floor2: '#bf9058', line: 'rgba(255,250,235,.92)', sky: ['#2a1a4a', '#f0a050'], crowd: 'world', bgk: 'medina', wc: ['#c87a4a', '#b86a3a'], puddle: false, grade: 'rgba(255,150,60,.07)', lamps: WL([0.15, 0.38, 0.62, 0.85], '255,170,70', 0.7, i => ({ y: 30, r: 44, flick: i === 1 ? 2.4 : 0 })) } },
  { id: 'newyork', base: 'kooi', name: 'NEW YORK COURT', sub: 'BAKSTEEN, BRANDTRAPPEN EN HEKKEN', price: 1250, o: { floor: '#2a5d9a', floor2: '#265690', line: 'rgba(255,255,255,.95)', sky: ['#0b1020', '#3a3050'], crowd: 'world', bgk: 'nyc', bare: false, puddle: '#3a5a8a', grade: 'rgba(255,190,120,.05)' } },
  { id: 'londen', base: 'kooi', name: 'LONDEN REGEN', sub: 'GRIJZE LUCHT EN NATTE TEGELS', price: 1250, o: { floor: '#3c5a46', floor2: '#365240', sky: ['#2a2f38', '#5a606a'], crowd: 'world', bgk: 'londen', weather: 'rain', puddle: '#5a6a7a', grade: 'rgba(120,140,170,.08)' } },
  { id: 'berlijn', base: 'tunnel', name: 'BERLIJN BETON', sub: 'GRIJZE BLOKKEN EN DE TV-TOREN', price: 1000, o: { floor: '#6a6a6a', floor2: '#636363', sky: ['#101014', '#3a3a44'], crowd: 'world', bgk: 'berlijn', grade: 'rgba(120,150,200,.07)', lamps: [0, 1, 2, 3, 4].map(i => ({ fx: (i + 0.5) / 5, y: 16, r: 46, col: '200,225,255', a: 0.6, flick: i === 3 ? 2.8 : 0, cone: i % 2 === 0, spread: 60 })) } },
  { id: 'savanne', base: 'strand', name: 'SAVANNE', sub: 'ACACIA EN EEN RODE ZON', price: 1000, o: { floor: '#c8a04a', floor2: '#be9642', sky: ['#ff7a2a', '#ffd27a'], crowd: 'world', bgk: 'savanne', grade: 'rgba(255,140,40,.08)' } },
  { id: 'kasteel', base: 'beton', name: 'KASTEEL', sub: 'DONKERE MUREN EN FAKKELS', price: 2000, o: { floor: '#3a3a40', floor2: '#34343a', line: 'rgba(230,210,170,.8)', sky: ['#05040a', '#1a1424'], crowd: 'world', bgk: 'kasteel', wall: 'parapet', wc: ['#3a3640', '#2e2a34'], puddle: '#2a2a3a', grade: 'rgba(255,120,40,.08)', lamps: WL([0.1, 0.3, 0.5, 0.7, 0.9], '255,140,50', 0.75, i => ({ y: 40, r: 40, cone: false, flick: 1.6 + i * 0.7 })) } },
  { id: 'ruimte', base: 'flagship', name: 'RUIMTESTATION', sub: 'STERREN, EEN PLANEET EN METAAL', price: 3000, o: { floor: '#1a1d2a', floor2: '#161926', line: 'rgba(120,230,255,.95)', sky: ['#000005', '#05051a'], crowd: 'world', bgk: 'ruimte', indoor: false, logo: null, glow: true, grade: 'rgba(60,200,255,.06)', lamps: [0, 1, 2, 3, 4].map(i => ({ fx: (i + 0.5) / 5, y: 16, r: 44, col: '90,230,255', a: 0.6, cone: true, spread: 70 })) } }
];
WORLDS.forEach(wd => { COURTS[wd.id] = Object.assign({}, COURTS[wd.base], { tex: null, tags: null, logo: null, logoImg: null, logoTry: 0 }, wd.o, { name: wd.name, sub: wd.sub, world: wd.id, price: wd.price, bonus: 0.1 }); });
const owned = id => !!COURTS[id] && (!COURTS[id].world || (S && S.worlds || []).indexOf(id) >= 0);
// oude saves aanvullen met de nieuwe velden (standaardwaarden), negatieve of foute munten rechtzetten
function fixS() {
  if (!(S.coins >= 0) || !isFinite(S.coins)) S.coins = Math.max(0, +S.coins || 0); S.coins = Math.floor(S.coins);
  S.cards.forEach(c => { if (!Array.isArray(c.up) || c.up.length !== 4) c.up = [0, 0, 0, 0]; c.up = c.up.map(v => Math.max(0, Math.min(UPMAX, v | 0))); });
  if (!Array.isArray(S.worlds)) S.worlds = []; S.worlds = S.worlds.filter(id => COURTS[id] && COURTS[id].world);
  if (typeof S.home !== 'string' || !owned(S.home)) S.home = '';
  if (!S.streak || typeof S.streak !== 'object') S.streak = { n: 0, last: '', claim: '', best: 0 };
  if (!Array.isArray(S.codes)) S.codes = [];
  if (!S.bought || typeof S.bought !== 'object') S.bought = {};
}
// kopen: nooit onder nul, en een tweede tik binnen 0,4 s doet niets (geen dubbele afschrijving)
let buyT = -1e9, econMsg = '', econMsgT = 0;
function buy(cost, fn) {
  const now = performance.now();
  if (now - buyT < 400) return false;
  if (!(cost > 0) || !(S.coins >= cost)) { econMsg = 'Te weinig munten.'; econMsgT = tNow; return false; }
  buyT = now; S.coins -= cost; fn(); saveS(); return true;
}
function upBuy(c, k) { const l = upL(c, k); if (l >= UPMAX) return false; return buy(UPCOST[l], () => { c.up[k] = l + 1; }); }
function rateBuy(c) { if (c.lvl >= 5) return false; return buy(60 * (c.lvl + 1), () => { c.lvl++; }); }
const starCard = id => S.cards.find(c => c.star === id);
function buyStar(st) { if (starCard(st.id)) return false; return buy(st.price, () => { S.cards.push({ id: S.nid++, name: st.name, short: st.short, pos: st.pos, base: st.r, lvl: 0, star: st.id, up: st.up.slice() }); econMsg = st.short + ' is van jou. Zet hem in je opstelling.'; econMsgT = tNow; }); }
function starLine(c) {
  if (S.lineup.includes(c.id)) return; let best = -1;
  SLOTP.forEach((p, s) => { if (p === c.pos && (best < 0 || !lineCard(s) || (lineCard(best) && eff(lineCard(s)) < eff(lineCard(best))))) best = s; });
  if (best >= 0) { S.lineup[best] = c.id; saveS(); }
}
function buyWorld(id) { if (owned(id)) return false; return buy(COURTS[id].price, () => { S.worlds.push(id); if (!S.home) S.home = id; }); }
// welke kaart hoort bij speler i van je team: keeper = plek 0, verdedigers = plek 1 en 2, middenveld = 3, aanval = 4 (ook bij 8 tegen 8)
function slotOf(i) { if (i === 0) return 0; if (i <= FORM[0]) return 1 + ((i - 1) % 2); if (i <= FORM[0] + FORM[1]) return 3; return 4; }
function applyClub() {
  if (!S) return; const done = {};
  for (const p of players) {
    if (p.t !== 0) { p.up = null; continue; }
    const c = lineCard(slotOf(p.i)); p.up = c && c.up ? c.up.slice() : null;
    if (c && c.star && !done[c.star]) {
      const st = STARS.find(s => s.id === c.star); done[c.star] = 1;
      p.name = cshort(c).toUpperCase().slice(0, 14); p.rate = eff(c); if (st) { p.num = st.num; p.skin = SKIN[st.sk]; p.hair = HAIR[st.hr]; }
    }
  }
}
// dagreeks: elke kalenderdag met een afgewerkte wedstrijd of oefening telt. Gemiste dag = een dag terug, nooit naar nul.
const RWD = [20, 30, 150, 40, 50, 60, 300];
const dayDiff = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const streakRw = n => RWD[(Math.max(1, n) - 1) % 7];
function econDay() {
  if (!S) return false; const R = S.streak, d = today(); if (R.last === d) return false;
  if (!R.last || !(R.n > 0)) R.n = 1;
  else { const gap = dayDiff(R.last, d); if (gap === 1) R.n++; else if (gap > 1) R.n = Math.max(1, R.n - (gap - 1)); }
  R.last = d; R.best = Math.max(R.best || 0, R.n); saveS(); return true;
}
const canClaim = () => false; // dagelijkse munten komen nu uit de leerapp (code inwisselen), niet meer uit de game zelf
function streakClaim() {
  if (!canClaim()) return false; const now = performance.now(); if (now - buyT < 400) return false; buyT = now;
  const v = streakRw(S.streak.n); S.streak.claim = today(); S.coins += v; econMsg = '+' + v + ' munten voor dag ' + S.streak.n + '!'; econMsgT = tNow; saveS(); return true;
}
// muntcode inwisselen: de server controleert de handtekening en of de code al gebruikt is in dit account
function redeemDialog(pre) {
  const d = authOverlay(), f = document.createElement('form'); f.style.cssText = LGP; d.appendChild(f);
  const t = document.createElement('div'); t.style.cssText = 'font:900 20px system-ui,sans-serif;text-align:center;margin-bottom:8px'; t.textContent = 'CODE INWISSELEN'; f.appendChild(t);
  const x = document.createElement('div'); x.style.cssText = 'font:500 14px system-ui,sans-serif;line-height:1.45;color:rgba(255,255,255,.8);margin-bottom:6px'; x.textContent = 'Heb je een muntcode gekregen, bijvoorbeeld in Leerliga? Typ of plak hem hier. Elke code werkt een keer per account en is 30 dagen geldig. Je moet aangemeld zijn.'; f.appendChild(x);
  const i = document.createElement('input'); i.style.cssText = LGI + ';font-family:ui-monospace,Consolas,monospace'; i.placeholder = 'Typ of plak hier je code'; i.maxLength = 64; i.autocomplete = 'off'; i.autocapitalize = 'characters'; i.spellcheck = false; f.appendChild(i);
  const m = document.createElement('div'); m.style.cssText = 'min-height:20px;font:600 14px system-ui,sans-serif;color:#ff8a8a;margin:6px 0'; f.appendChild(m);
  const ok = document.createElement('button'); ok.type = 'submit'; ok.style.cssText = LGB; ok.textContent = 'INWISSELEN'; f.appendChild(ok);
  const no = document.createElement('button'); no.type = 'button'; no.style.cssText = LGB + ';background:rgba(255,255,255,.14);color:#fff'; no.textContent = 'SLUITEN'; no.onclick = () => d.remove(); f.appendChild(no);
  f.onsubmit = async e => {
    e.preventDefault(); const code = i.value.toUpperCase().replace(/\s+/g, ''); if (!code) { m.textContent = 'Typ eerst een code.'; return; }
    ok.disabled = true; m.style.color = '#ff8a8a'; m.textContent = 'Even controleren...';
    let r = null; try { r = await AJ('/api/redeem', { method: 'POST', body: JSON.stringify({ code }) }); } catch (er) { r = null; }
    ok.disabled = false;
    if (!r) { m.textContent = 'Geen verbinding met de server. Probeer het zo opnieuw.'; return; }
    if (r.ok && r.j && r.j.amount > 0) {
      const key = String(r.j.key || code);
      if (S.codes.indexOf(key) < 0) { S.coins += Math.min(500, r.j.amount | 0); S.codes.push(key); if (S.codes.length > 100) S.codes.shift(); saveS(); authSave(true); }
      m.style.color = '#9dffb0'; m.textContent = '+' + r.j.amount + ' munten! Ze staan op je rekening.'; i.value = ''; econMsg = '+' + r.j.amount + ' munten uit een code'; econMsgT = tNow; return;
    }
    m.textContent = r.status === 401 ? 'Meld je eerst aan (MEER, ACCOUNT). Codes gaan naar je account.' : r.status === 503 ? 'Codes inwisselen staat nog niet aan op de server.' : (r.j && r.j.error) || 'Dat lukte niet.';
  };
  if (pre) i.value = pre;
  i.focus();
}

// ---------- economie: tekenen (wereld-achtergronden, weer, schermen) ----------
function worldBG(g, w, h, rnd, c) {
  const k = c.bgk, base = h - 26;
  const lip = (a, b) => { const l = g.createLinearGradient(0, h - 26, 0, h); l.addColorStop(0, a); l.addColorStop(1, b); g.fillStyle = l; g.fillRect(0, h - 26, w, 26); };
  const stars = (n, top) => { for (let i = 0; i < n; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.2 + rnd() * 0.7) + ')'; const s = rnd() < 0.1 ? 2.2 : 1.3; g.fillRect(rnd() * w, rnd() * h * (top || 0.55), s, s); } };
  const glow = (x, y, r, col, a) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
  const wins = (x, y, bw, bh, p, cols, sx, sy) => { for (let wy = y + 5; wy < y + bh - 4; wy += sy || 9) for (let wx = x + 4; wx < x + bw - 5; wx += sx || 8) if (rnd() < p) { g.fillStyle = cols[(rnd() * cols.length) | 0]; g.fillRect(wx, wy, 3, 4); } };
  if (k === 'favela') {
    glow(w * 0.8, 30, 90, '255,240,200', 0.7);
    g.fillStyle = '#5a7a4a'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 40) g.lineTo(x, 46 + Math.sin(x * 0.006) * 18 + Math.sin(x * 0.021) * 6); g.lineTo(w, h); g.fill();
    const cols = ['#e8553a', '#f2c230', '#3ab0ff', '#7bd04a', '#ff7ab0', '#f4efe6', '#c58a5a', '#9b59d0', '#ff9a3d'];
    for (let row = 0; row < 7; row++) { let x = -20 + rnd() * 20; const y0 = 52 + row * 17; while (x < w) { const bw = 15 + rnd() * 20, bh = 15 + rnd() * 9, yy = y0 - rnd() * 6 + Math.sin(x * 0.006) * 12; g.fillStyle = cols[(rnd() * cols.length) | 0]; g.fillRect(x, yy, bw, bh + 24); g.fillStyle = 'rgba(0,0,0,.42)'; g.fillRect(x + 3, yy + 5, 4, 5); if (bw > 22) g.fillRect(x + bw - 8, yy + 5, 4, 5); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x, yy, bw, 2); x += bw + 1; } }
    g.strokeStyle = 'rgba(30,20,20,.5)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { const y = 70 + i * 18; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 60) g.lineTo(x, y + Math.sin(x * 0.05 + i) * 4); g.stroke(); }
    lip('#4a3428', '#1a120c'); return;
  }
  if (k === 'tokio') {
    stars(30, 0.3);
    for (let layer = 0; layer < 2; layer++) { let x = -20; while (x < w) { const bw = 30 + rnd() * 50, bh = (layer ? 50 : 90) + rnd() * (layer ? 50 : 70); g.fillStyle = layer ? '#1c0b30' : '#0c0518'; g.fillRect(x, base - bh, bw, bh + 30); wins(x, base - bh, bw, bh, layer ? 0.12 : 0.22, ['#ff6ac8', '#5ae6ff', '#ffe9a0'], 7, 8); x += bw + 3; } }
    const nc = ['#ff2fa0', '#37e6ff', '#ffe14a', '#7b5cff', '#3dff9a'];
    for (let x = 30; x < w; x += 70 + rnd() * 90) { const col = nc[(rnd() * nc.length) | 0], y = 40 + rnd() * 70, vw = rnd() < 0.5, bw = vw ? 14 : 46, bh = vw ? 46 : 14; g.globalAlpha = 0.35; g.fillStyle = col; g.fillRect(x - 4, y - 4, bw + 8, bh + 8); g.globalAlpha = 1; g.strokeStyle = col; g.lineWidth = 2.5; g.strokeRect(x, y, bw, bh); g.fillStyle = col; for (let q = 0; q < 3; q++) vw ? g.fillRect(x + 4, y + 6 + q * 13, 6, 6) : g.fillRect(x + 5 + q * 13, y + 4, 8, 6); }
    lip('#2a0838', '#08010f'); return;
  }
  if (k === 'canal') {
    const wy = h - 70, cols = ['#d98a5a', '#e8c27a', '#c8574a', '#f0d9b0', '#b86a6a', '#e0a070'];
    let x = -10; while (x < w) { const bw = 50 + rnd() * 50, bh = 70 + rnd() * 50, col = cols[(rnd() * cols.length) | 0]; g.fillStyle = col; g.fillRect(x, wy - bh, bw, bh + 4); g.fillStyle = '#7a3a2a'; g.fillRect(x - 2, wy - bh - 4, bw + 4, 5);
      for (let wy2 = wy - bh + 12; wy2 < wy - 18; wy2 += 24) for (let wx = x + 7; wx < x + bw - 12; wx += 16) { g.fillStyle = '#3a2a2a'; g.fillRect(wx, wy2 + 4, 8, 12); g.beginPath(); g.arc(wx + 4, wy2 + 4, 4, Math.PI, 0); g.fill(); g.fillStyle = 'rgba(40,120,60,.8)'; g.fillRect(wx - 1, wy2 + 15, 10, 2); }
      x += bw + 2; }
    const wg = g.createLinearGradient(0, wy, 0, h - 26); wg.addColorStop(0, '#2f7a8a'); wg.addColorStop(1, '#174a5a'); g.fillStyle = wg; g.fillRect(0, wy, w, h - 26 - wy);
    for (let y = wy + 4; y < h - 28; y += 5) for (let xx = rnd() * 30; xx < w; xx += 30 + rnd() * 40) { g.fillStyle = 'rgba(255,230,190,' + (0.1 + rnd() * 0.2) + ')'; g.fillRect(xx, y, 8 + rnd() * 14, 1.3); }
    for (let px = 40; px < w; px += 140 + rnd() * 80) { g.fillStyle = '#f4f4f4'; g.fillRect(px, wy - 40, 4, 60); g.fillStyle = '#c8344a'; for (let s = 0; s < 4; s++) g.fillRect(px, wy - 36 + s * 14, 4, 6); }
    for (let i = 0; i < 3; i++) { const gx = rnd() * w, gy = wy + 14 + rnd() * 10; g.fillStyle = '#111'; g.beginPath(); g.moveTo(gx - 30, gy); g.quadraticCurveTo(gx, gy + 8, gx + 30, gy - 6); g.lineTo(gx + 26, gy); g.quadraticCurveTo(gx, gy + 4, gx - 30, gy); g.fill(); g.fillRect(gx + 8, gy - 16, 2, 14); }
    lip('#5a4a3a', '#1e1812'); return;
  }
  if (k === 'dubai') {
    glow(w * 0.3, base - 30, 120, '255,200,120', 0.8); g.fillStyle = '#ffd08a'; g.beginPath(); g.arc(w * 0.3, base - 30, 22, 0, 6.2832); g.fill();
    let x = -10; while (x < w) { const bw = 18 + rnd() * 30, bh = 50 + rnd() * 90; g.fillStyle = rnd() < 0.5 ? '#2a1838' : '#3a2040'; g.beginPath(); g.moveTo(x, base); g.lineTo(x, base - bh); g.lineTo(x + bw * 0.5, base - bh - 10 - rnd() * 16); g.lineTo(x + bw, base - bh); g.lineTo(x + bw, base); g.fill(); g.fillStyle = 'rgba(255,200,120,.5)'; for (let wy = base - bh + 6; wy < base; wy += 7) g.fillRect(x + 3, wy, bw - 6, 1); x += bw + 10 + rnd() * 20; }
    for (const bx of [w * 0.62, w * 0.12]) { g.fillStyle = '#1a0e26'; g.beginPath(); g.moveTo(bx - 18, base); g.lineTo(bx - 10, base - 90); g.lineTo(bx - 4, base - 140); g.lineTo(bx, base - 185); g.lineTo(bx + 4, base - 140); g.lineTo(bx + 10, base - 90); g.lineTo(bx + 18, base); g.fill(); g.fillStyle = '#ffd88a'; g.fillRect(bx - 1, base - 182, 2, 4); }
    lip('#6a3a3a', '#1a0e14'); return;
  }
  if (k === 'ice') {
    stars(40, 0.35);
    for (let i = 0; i < 4; i++) { const ag = g.createLinearGradient(0, 10 + i * 8, 0, 70 + i * 8); ag.addColorStop(0, 'rgba(80,255,170,0)'); ag.addColorStop(0.5, 'rgba(80,255,170,' + (0.12 + i * 0.03) + ')'); ag.addColorStop(1, 'rgba(80,255,170,0)'); g.fillStyle = ag; g.beginPath(); g.moveTo(0, 20 + i * 10); for (let x = 0; x <= w; x += 50) g.lineTo(x, 20 + i * 10 + Math.sin(x * 0.008 + i) * 18); g.lineTo(w, 80 + i * 10); g.lineTo(0, 80 + i * 10); g.fill(); }
    for (let layer = 0; layer < 2; layer++) { let x = -60; while (x < w) { const mw = 120 + rnd() * 160, mh = (layer ? 60 : 100) + rnd() * 40, y0 = base - (layer ? 0 : 10); g.fillStyle = layer ? '#e8f4fc' : '#b8d4ea'; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + mw * 0.5, y0 - mh); g.lineTo(x + mw, y0); g.fill(); g.fillStyle = layer ? '#c4dcef' : '#8fb2d0'; g.beginPath(); g.moveTo(x + mw * 0.5, y0 - mh); g.lineTo(x + mw, y0); g.lineTo(x + mw * 0.6, y0); g.fill(); x += mw * 0.7; } }
    for (let i = 0; i < 14; i++) { const px = rnd() * w, py = base - 6 + rnd() * 6; g.fillStyle = '#111820'; g.beginPath(); g.ellipse(px, py, 4, 8, 0, 0, 6.2832); g.fill(); g.fillStyle = '#f4f8fc'; g.beginPath(); g.ellipse(px + 1, py + 1, 2.4, 5.5, 0, 0, 6.2832); g.fill(); g.fillStyle = '#ffb030'; g.fillRect(px + 2, py - 6, 3, 1.5); }
    lip('#a8c4dc', '#5a7a9a'); return;
  }
  if (k === 'mexico') {
    const cols = ['#ff4f8b', '#2fc4b2', '#ffd400', '#ff7a1a', '#7b5cff', '#3ab0ff', '#7bd04a'];
    let x = -10; while (x < w) { const bw = 70 + rnd() * 80, bh = 90 + rnd() * 40, col = cols[(rnd() * cols.length) | 0]; g.fillStyle = col; g.fillRect(x, base - bh, bw, bh + 30); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x, base - bh, bw, 6);
      g.fillStyle = '#5a2a1a'; g.fillRect(x + bw * 0.35, base - 46, bw * 0.3, 46); g.fillStyle = '#ffffff'; g.fillRect(x + 10, base - bh + 18, 18, 22); g.fillStyle = '#3a6a8a'; g.fillRect(x + 12, base - bh + 20, 14, 18); x += bw; }
    for (let s = 0; s < 3; s++) { const y = 26 + s * 26; g.strokeStyle = 'rgba(40,30,30,.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); for (let xx = 0; xx <= w; xx += 80) g.quadraticCurveTo(xx + 40, y + 12, xx + 80, y); g.stroke(); for (let xx = 6; xx < w; xx += 20) { g.fillStyle = cols[((xx / 20) + s) % cols.length | 0]; const yy = y + Math.sin((xx % 80) / 80 * Math.PI) * 9; g.beginPath(); g.moveTo(xx - 7, yy); g.lineTo(xx + 7, yy); g.lineTo(xx, yy + 13); g.fill(); } }
    for (let i = 0; i < 4; i++) { const cxp = 60 + rnd() * (w - 120), cy = base; g.fillStyle = '#2f8a3e'; g.fillRect(cxp - 4, cy - 40, 8, 40); g.fillRect(cxp - 14, cy - 28, 6, 14); g.fillRect(cxp - 14, cy - 16, 12, 5); g.fillRect(cxp + 8, cy - 32, 6, 16); g.fillRect(cxp + 2, cy - 18, 12, 5); }
    lip('#8a3a1a', '#2a1208'); return;
  }
  if (k === 'medina') {
    const wall = g.createLinearGradient(0, 40, 0, base); wall.addColorStop(0, '#d8a06a'); wall.addColorStop(1, '#b07a4a'); g.fillStyle = wall; g.fillRect(0, 56, w, h - 56);
    for (let mx = 140; mx < w; mx += 520) { g.fillStyle = '#c8905a'; g.fillRect(mx, 4, 34, 60); g.fillStyle = '#a8703a'; g.fillRect(mx - 3, 0, 40, 8); g.fillStyle = '#2a8a6a'; g.fillRect(mx + 8, 20, 18, 4); g.fillStyle = '#3a1e10'; g.fillRect(mx + 12, 30, 10, 16); }
    for (let x = 20; x < w; x += 90) { g.fillStyle = '#3a1e10'; g.beginPath(); g.moveTo(x, base); g.lineTo(x, base - 60); g.arc(x + 26, base - 60, 26, Math.PI, 0); g.lineTo(x + 52, base); g.fill(); g.strokeStyle = '#2a8a6a'; g.lineWidth = 3; g.beginPath(); g.arc(x + 26, base - 60, 29, Math.PI, 0); g.stroke(); glow(x + 70, base - 74, 22, '255,170,70', 0.55); g.fillStyle = '#ffb040'; g.fillRect(x + 66, base - 80, 8, 11); }
    for (let x = 0; x < w; x += 14) { g.fillStyle = (x / 14) & 1 ? '#2a6a9a' : '#f2e6c8'; g.fillRect(x, base - 8, 14, 8); }
    lip('#6a4228', '#24160c'); return;
  }
  if (k === 'nyc') {
    stars(14, 0.25);
    let x = -20; while (x < w) { const bw = 30 + rnd() * 40, bh = 90 + rnd() * 70; g.fillStyle = '#141826'; g.fillRect(x, base - bh, bw, bh + 30); wins(x, base - bh, bw, bh, 0.25, ['#ffd27a', '#9fd8ff'], 7, 8); x += bw + 2; }
    x = -10; while (x < w) { const bw = 60 + rnd() * 50, bh = 50 + rnd() * 40, col = ['#7a3424', '#8a3e2a', '#6a2e22'][(rnd() * 3) | 0]; g.fillStyle = col; g.fillRect(x, base - bh, bw, bh + 30);
      for (let wy = base - bh + 8; wy < base - 10; wy += 16) for (let wx = x + 6; wx < x + bw - 10; wx += 14) { g.fillStyle = rnd() < 0.4 ? '#ffd27a' : '#2a1a18'; g.fillRect(wx, wy, 7, 9); }
      g.strokeStyle = '#1a1a1a'; g.lineWidth = 1.5; for (let wy = base - bh + 16; wy < base - 10; wy += 16) { g.strokeRect(x + bw * 0.3, wy, bw * 0.4, 2); g.beginPath(); g.moveTo(x + bw * 0.3, wy); g.lineTo(x + bw * 0.7, wy + 14); g.stroke(); }
      if (rnd() < 0.6) { const tx = x + 10 + rnd() * (bw - 30); g.fillStyle = '#4a2e1e'; g.fillRect(tx, base - bh - 18, 16, 14); g.beginPath(); g.moveTo(tx - 2, base - bh - 18); g.lineTo(tx + 8, base - bh - 26); g.lineTo(tx + 18, base - bh - 18); g.fill(); g.fillRect(tx + 2, base - bh - 4, 2, 4); g.fillRect(tx + 12, base - bh - 4, 2, 4); }
      x += bw + 4; }
    lip('#2a1a18', '#0a0606'); return;
  }
  if (k === 'londen') {
    g.fillStyle = 'rgba(200,205,215,.25)'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(rnd() * w, 20 + rnd() * 30, 120 + rnd() * 120, 14, 0, 0, 6.2832); g.fill(); }
    const tx = w * 0.7; g.fillStyle = '#2a2c34'; g.fillRect(tx, base - 160, 30, 160); g.beginPath(); g.moveTo(tx - 4, base - 160); g.lineTo(tx + 15, base - 196); g.lineTo(tx + 34, base - 160); g.fill(); g.fillStyle = '#e8dca0'; g.beginPath(); g.arc(tx + 15, base - 140, 10, 0, 6.2832); g.fill(); g.strokeStyle = '#2a2c34'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(tx + 15, base - 140); g.lineTo(tx + 15, base - 147); g.moveTo(tx + 15, base - 140); g.lineTo(tx + 20, base - 140); g.stroke();
    let x = -10; while (x < w) { const bw = 36 + rnd() * 20, bh = 54 + rnd() * 20, col = ['#6a3a32', '#5a5a62', '#7a4a3a', '#4a4a52'][(rnd() * 4) | 0]; g.fillStyle = col; g.fillRect(x, base - bh, bw, bh + 30); g.fillStyle = '#3a2a2a'; g.fillRect(x + bw - 12, base - bh - 10, 7, 10);
      for (let wy = base - bh + 8; wy < base - 12; wy += 18) for (let wx = x + 6; wx < x + bw - 8; wx += 13) { g.fillStyle = rnd() < 0.35 ? '#ffe2a0' : '#22242c'; g.fillRect(wx, wy, 7, 10); } g.fillStyle = ['#c8102e', '#1b3f8f', '#1f7a3a', '#111'][(rnd() * 4) | 0]; g.fillRect(x + bw / 2 - 5, base - 16, 10, 16); x += bw + 1; }
    for (let i = 0; i < 3; i++) { const bx = rnd() * w; g.fillStyle = '#c8102e'; g.fillRect(bx, base - 26, 54, 22); g.fillStyle = '#ffe9b0'; g.fillRect(bx + 4, base - 22, 46, 6); g.fillStyle = '#111'; g.beginPath(); g.arc(bx + 12, base - 3, 4, 0, 6.2832); g.arc(bx + 42, base - 3, 4, 0, 6.2832); g.fill(); }
    lip('#2a2e36', '#0c0e12'); return;
  }
  if (k === 'berlijn') {
    const tx = w * 0.35; g.fillStyle = '#20232a'; g.fillRect(tx - 3, base - 190, 6, 190); g.beginPath(); g.arc(tx, base - 150, 15, 0, 6.2832); g.fill(); g.fillStyle = '#c8102e'; g.fillRect(tx - 1, base - 196, 2, 8); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(tx - 12, base - 152, 24, 2);
    let x = -10; while (x < w) { const bw = 90 + rnd() * 70, bh = 70 + rnd() * 40; g.fillStyle = rnd() < 0.5 ? '#4a4e56' : '#575b62'; g.fillRect(x, base - bh, bw, bh + 30); for (let wy = base - bh + 6; wy < base - 6; wy += 10) for (let wx = x + 5; wx < x + bw - 6; wx += 10) { g.fillStyle = rnd() < 0.25 ? '#e0e8ff' : '#2c3038'; g.fillRect(wx, wy, 6, 5); } x += bw + 14; }
    for (let x2 = 0; x2 < w; x2 += 180) { const t = sprayTex(160, 46, (rnd() * 99999) | 0, ['#7a7e86', '#70747c'], 160); g.drawImage(t, x2 + 10, base - 50); t.width = t.height = 0; }
    lip('#3a3c42', '#0e0f12'); return;
  }
  if (k === 'savanne') {
    glow(w * 0.55, base - 50, 150, '255,200,90', 0.7); g.fillStyle = '#ff6a2a'; g.beginPath(); g.arc(w * 0.55, base - 50, 40, 0, 6.2832); g.fill();
    for (let layer = 0; layer < 2; layer++) { g.fillStyle = layer ? '#8a4a1e' : '#b06a2a'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 40) g.lineTo(x, base - (layer ? 18 : 40) - Math.sin(x * (layer ? 0.009 : 0.004) + layer) * 16); g.lineTo(w, h); g.fill(); }
    for (let x = 40 + rnd() * 60; x < w; x += 160 + rnd() * 140) { const th = 46 + rnd() * 26; g.strokeStyle = '#2a1408'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, base); g.quadraticCurveTo(x + 4, base - th * 0.6, x + 10, base - th); g.stroke(); g.fillStyle = '#2a1a0a'; g.beginPath(); g.ellipse(x + 10, base - th - 4, 46, 9, 0, 0, 6.2832); g.fill(); g.beginPath(); g.ellipse(x - 10, base - th + 8, 22, 6, 0, 0, 6.2832); g.fill(); }
    for (let i = 0; i < 3; i++) { const gx = rnd() * w, gy = base - 4; g.fillStyle = '#3a200c'; g.fillRect(gx, gy - 22, 18, 10); g.fillRect(gx + 1, gy - 12, 3, 12); g.fillRect(gx + 14, gy - 12, 3, 12); g.fillRect(gx + 14, gy - 46, 4, 26); g.fillRect(gx + 14, gy - 48, 9, 5); }
    lip('#7a4a1a', '#2a1406'); return;
  }
  if (k === 'kasteel') {
    stars(26, 0.3); g.fillStyle = '#e8e0c8'; g.beginPath(); g.arc(w * 0.82, 30, 14, 0, 6.2832); g.fill(); g.fillStyle = c.sky[0]; g.beginPath(); g.arc(w * 0.82 + 6, 26, 12, 0, 6.2832); g.fill();
    for (let tx = 60; tx < w; tx += 420) { g.fillStyle = '#1e1c24'; g.fillRect(tx, 10, 60, base); for (let q = 0; q < 4; q++) g.fillRect(tx - 4 + q * 18, 2, 12, 10); g.fillStyle = '#ffb040'; g.fillRect(tx + 26, 36, 8, 14); }
    g.fillStyle = '#2a2830'; g.fillRect(0, 60, w, h - 60); for (let x = 0; x < w; x += 24) g.fillRect(x, 50, 14, 12);
    for (let y = 64, r = 0; y < base; y += 12, r++) for (let x = -(r & 1) * 14; x < w; x += 28) { g.fillStyle = 'rgba(0,0,0,' + (0.12 + rnd() * 0.18) + ')'; g.fillRect(x + 1, y + 1, 26, 10); }
    for (let x = 90; x < w; x += 190) { g.fillStyle = '#7a1418'; g.beginPath(); g.moveTo(x - 14, 70); g.lineTo(x + 14, 70); g.lineTo(x + 14, 122); g.lineTo(x, 112); g.lineTo(x - 14, 122); g.fill(); g.fillStyle = '#d8b040'; g.fillRect(x - 3, 84, 6, 14); }
    for (let x = 0; x < w; x += 190) { glow(x, 100, 40, '255,140,50', 0.6); g.fillStyle = '#3a2410'; g.fillRect(x - 2, 100, 4, 18); g.fillStyle = '#ffb040'; g.beginPath(); g.ellipse(x, 96, 4, 7, 0, 0, 6.2832); g.fill(); }
    lip('#1a181e', '#060508'); return;
  }
  if (k === 'ruimte') {
    stars(160, 1);
    const px = w * 0.25, py = 60, pr = 46, pg = g.createRadialGradient(px - 14, py - 14, 4, px, py, pr); pg.addColorStop(0, '#ffb0e0'); pg.addColorStop(0.6, '#8a3ab0'); pg.addColorStop(1, '#2a0a4a'); g.fillStyle = pg; g.beginPath(); g.arc(px, py, pr, 0, 6.2832); g.fill();
    g.strokeStyle = 'rgba(255,220,250,.6)'; g.lineWidth = 3; g.beginPath(); g.ellipse(px, py, pr * 1.7, pr * 0.32, -0.25, 0, 6.2832); g.stroke();
    glow(w * 0.75, h + 60, 220, '60,150,255', 0.5);
    g.strokeStyle = '#5a6478'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, base - 40); g.lineTo(w, base - 40); g.moveTo(0, base - 64); g.lineTo(w, base - 64); g.stroke(); g.lineWidth = 1.5; for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, base - 64); g.lineTo(x + 24, base - 40); g.stroke(); }
    for (let x = 50; x < w; x += 260) { g.fillStyle = '#1a3a7a'; g.fillRect(x, base - 120, 90, 46); g.strokeStyle = '#7ab8ff'; g.lineWidth = 1; for (let q = 1; q < 6; q++) { g.beginPath(); g.moveTo(x + q * 15, base - 120); g.lineTo(x + q * 15, base - 74); g.stroke(); } g.beginPath(); g.moveTo(x, base - 97); g.lineTo(x + 90, base - 97); g.stroke(); g.fillStyle = '#8a92a4'; g.fillRect(x + 40, base - 74, 8, 12); }
    g.fillStyle = '#20242e'; g.fillRect(0, base - 36, w, 36); for (let x = 10; x < w; x += 60) { g.fillStyle = '#5ae6ff'; g.fillRect(x, base - 26, 24, 4); }
    lip('#14161e', '#040508'); return;
  }
  skyline(g, w, h, rnd);
}
// kleine voorbeeldprent van een wereld (voor de keuzekaarten), een keer gemaakt en bewaard
function worldThumb(c) {
  if (c.thumb) return c.thumb; if (c.crowd !== 'world') return null;
  const t = document.createElement('canvas'); t.width = 250; t.height = 80; const g = t.getContext('2d'); g.scale(0.4, 0.4);
  const sk = g.createLinearGradient(0, 0, 0, 200); sk.addColorStop(0, c.sky[0]); sk.addColorStop(1, c.sky[1]); g.fillStyle = sk; g.fillRect(0, 0, 625, 200);
  try { worldBG(g, 625, 200, rngOf(17 + c.name.length * 3), c); } catch (e) {}
  return c.thumb = t;
}
// regen of sneeuw over het veld (licht: geen nieuwe objecten per beeld, uit op de laagste kwaliteit)
function drawWeather() {
  const wt = court.weather; cx.save();
  if (wt === 'rain') { cx.strokeStyle = 'rgba(190,210,240,.38)'; cx.lineWidth = 1.3; cx.beginPath(); for (let i = 0; i < 110; i++) { const x = ((i * 137.5 + tNow * 70) % (SW + 40)) - 20, y = ((i * 71.3 + tNow * 760) % (VH + 40)) - 20; cx.moveTo(x, y); cx.lineTo(x - 4, y + 16); } cx.stroke(); }
  else { cx.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 90; i++) { const y = ((i * 53.7 + tNow * (40 + (i % 5) * 9)) % (VH + 20)) - 10, x = ((i * 113.1) % SW) + Math.sin(tNow * 1.3 + i) * 10, s = 1.5 + (i % 3); cx.fillRect(x, y, s, s); } }
  cx.restore();
}
// een keuzekaart van een veld of wereld (STRAAT en WERELDEN)
function courtTile(c, rx, ry, kw, h, sel) {
  const w = 250, x = 0, y = 0;
  courtLogo(c); cx.save(); cx.translate(rx, ry); cx.scale(kw / w, 1); rr(x, y, w, h, 10); cx.clip();
  const sg = cx.createLinearGradient(0, y, 0, y + h * 0.42); sg.addColorStop(0, c.sky[0]); sg.addColorStop(1, c.sky[1]); cx.fillStyle = sg; cx.fillRect(x, y, w, h * 0.42);
  cx.fillStyle = c.floor; cx.fillRect(x, y + h * 0.42, w, h * 0.58);
  cx.strokeStyle = c.line; cx.lineWidth = 2.2; cx.beginPath(); cx.moveTo(x + w / 2, y + h * 0.42); cx.lineTo(x + w / 2, y + h); cx.stroke(); cx.beginPath(); cx.ellipse(x + w / 2, y + h * 0.72, 38, 12, 0, 0, 6.2832); cx.stroke();
  const th = worldThumb(c);
  if (th) { cx.drawImage(th, x, y, w, h * 0.42); }
  else if (c.pal) { for (let r = 0; r < 4; r++) for (let k = 0; k < 40; k++) { cx.fillStyle = c.pal[(k * 7 + r * 3) % c.pal.length]; cx.fillRect(x + k * 6.3, y + 8 + r * h * 0.06, 5, h * 0.05); } cx.fillStyle = (c.wc && c.wc[0]) || '#2a5bff'; cx.fillRect(x, y + h * 0.34, w, h * 0.08); }
  else if (c.wall === 'graffiti') { for (let k = 0; k < 5; k++) { cx.fillStyle = TAGCOLS[k % TAGCOLS.length]; cx.fillRect(x + 8 + k * 48, y + h * 0.3, 38, h * 0.12); } }
  else if (c.wall === 'cage') { cx.strokeStyle = 'rgba(200,210,225,.55)'; cx.lineWidth = 1.5; for (let k = 0; k < 10; k++) { cx.beginPath(); cx.moveTo(x + 8 + k * 27, y + h * 0.18); cx.lineTo(x + 8 + k * 27, y + h * 0.42); cx.stroke(); } cx.beginPath(); cx.moveTo(x, y + h * 0.18); cx.lineTo(x + w, y + h * 0.18); cx.stroke(); }
  else if (c.wall === 'boards') { cx.fillStyle = '#2a5bff'; cx.fillRect(x, y + h * 0.34, w, h * 0.08); }
  else if (c.wall === 'studio') { cx.fillStyle = '#0b0b0e'; cx.fillRect(x, y + h * 0.34, w, h * 0.08); cx.fillStyle = '#fff'; cx.fillRect(x, y + h * 0.34, w, 2); for (let k = 0; k < 5; k++) { cx.fillStyle = 'rgba(255,244,225,.18)'; cx.beginPath(); cx.moveTo(x + 20 + k * 52, y); cx.lineTo(x + 4 + k * 52, y + h * 0.42); cx.lineTo(x + 36 + k * 52, y + h * 0.42); cx.fill(); } }
  else if (c.wall === 'planks') { cx.fillStyle = '#2a8fc4'; cx.fillRect(x, y + h * 0.2, w, h * 0.12); cx.fillStyle = '#e9d29c'; cx.fillRect(x, y + h * 0.32, w, h * 0.04); cx.fillStyle = '#b5865a'; cx.fillRect(x, y + h * 0.36, w, h * 0.06); for (let k = 0; k < 2; k++) { const px = x + 60 + k * 120; cx.strokeStyle = '#6b4a2a'; cx.lineWidth = 3; cx.beginPath(); cx.moveTo(px, y + h * 0.2); cx.lineTo(px + 5, y + h * 0.04); cx.stroke(); cx.fillStyle = '#2f9a3e'; cx.beginPath(); cx.ellipse(px + 5, y + h * 0.05, 18, 6, 0.2, 0, 6.2832); cx.fill(); } }
  else if (c.wall === 'tunnelwall') { for (let k = 0; k < 4; k++) { cx.fillStyle = '#6a6d72'; cx.fillRect(x + 18 + k * 64, y + h * 0.08, 18, h * 0.34); } cx.fillStyle = '#fff6d0'; for (let k = 0; k < 5; k++) cx.fillRect(x + 20 + k * 48, y + 8, 22, 3); }
  else if (c.wall === 'blocks') { for (let k = 0; k < 7; k++) { cx.fillStyle = k & 1 ? '#8a8d91' : '#93969a'; cx.fillRect(x + k * 36, y + h * 0.34, 35, h * 0.08); } cx.fillStyle = '#ffbe64'; for (let k = 0; k < 3; k++) { cx.fillRect(x + 30 + k * 90, y + 10, 4, h * 0.2); cx.beginPath(); cx.arc(x + 32 + k * 90, y + 10, 8, 0, 6.2832); cx.fill(); } }
  else { cx.fillStyle = '#9a8f86'; cx.fillRect(x, y + h * 0.36, w, h * 0.06); for (let k = 0; k < 9; k++) { cx.fillStyle = '#0d0919'; cx.fillRect(x + 6 + k * 28, y + h * (0.1 + (k * 7 % 5) * 0.05), 20, h * 0.26); } }
  if (c.weather) { cx.fillStyle = c.weather === 'snow' ? 'rgba(255,255,255,.9)' : 'rgba(200,220,255,.6)'; for (let k = 0; k < 40; k++) cx.fillRect((k * 97.31 * 7.13) % w, (k * 53.7 * 3.71) % h, c.weather === 'snow' ? 3 : 1.4, c.weather === 'snow' ? 3 : 9); }
  if (c.logoImg) { const lw = 90, lh = lw * c.logoImg.height / c.logoImg.width; cx.drawImage(c.logoImg, x + w / 2 - lw / 2, y + h * 0.72 - lh / 2, lw, lh); }
  const sh = cx.createLinearGradient(0, y + h * 0.55, 0, y + h); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.45)'); cx.fillStyle = sh; cx.fillRect(x, y, w, h);
  const tg = cx.createLinearGradient(0, y, 0, y + 56); tg.addColorStop(0, 'rgba(0,0,0,.62)'); tg.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = tg; cx.fillRect(x, y, w, 56);
  cx.restore();
  const lk = c.world && !owned(c.world);
  if (lk) { cx.fillStyle = 'rgba(4,6,20,.58)'; rr(rx, ry, kw, h, 10); cx.fill(); lockIcon(rx + kw / 2, ry + h / 2 + 8, 1); }
  cx.strokeStyle = sel ? '#ffd400' : 'rgba(255,255,255,.3)'; cx.lineWidth = sel ? 4 : 1.5; rr(rx, ry, kw, h, 10); cx.stroke();
  txt(c.name, rx + 10, ry + 26, 14, '#fff', 'left', '900'); txt(c.sub, rx + 10, ry + 41, 8.5, 'rgba(255,255,255,.85)', 'left', '700');
  if (lk) { coinTxt(String(c.price), rx + kw / 2, ry + h - 14, 16); }
  else if (c.world) { txt(S.home === c.world ? 'THUISVELD  +10% MUNTEN' : '+10% MUNTEN', rx + 10, ry + h - 10, 11, S.home === c.world ? '#ffd400' : '#9dffb0', 'left', '900'); }
}
function lockIcon(x, y, s) {
  cx.save(); cx.translate(x, y); cx.scale(s, s); cx.strokeStyle = '#fff'; cx.lineWidth = 4; cx.beginPath(); cx.arc(0, -12, 9, Math.PI, 0); cx.stroke();
  cx.fillStyle = '#ffd400'; rr(-14, -12, 28, 22, 4); cx.fill(); cx.fillStyle = '#5a4300'; cx.fillRect(-2, -5, 4, 8); cx.restore();
}
function coinTxt(s, x, y, size) {
  cx.font = '900 ' + size + 'px system-ui,-apple-system,Segoe UI,sans-serif'; const tw = cx.measureText(s).width, r = size * 0.55, x0 = x - (tw + r * 2 + 6) / 2;
  cx.fillStyle = '#ffd400'; cx.beginPath(); cx.arc(x0 + r, y - size * 0.35, r, 0, 6.2832); cx.fill(); txt('M', x0 + r, y - size * 0.35 + r * 0.42, r * 1.1, '#5a4300', 'center', '900');
  txt(s, x0 + r * 2 + 6, y, size, '#ffd400', 'left', '900');
}
function flame(x, y, s, on) {
  cx.save(); cx.translate(x, y); cx.scale(s, s);
  const g = cx.createLinearGradient(0, -22, 0, 18); g.addColorStop(0, on ? '#ffe14a' : '#9aa4c0'); g.addColorStop(1, on ? '#ff4a1a' : '#4a5470');
  cx.fillStyle = g; cx.beginPath(); cx.moveTo(0, -24); cx.bezierCurveTo(14, -8, 18, 4, 14, 12); cx.quadraticCurveTo(8, 20, 0, 20); cx.quadraticCurveTo(-8, 20, -14, 12); cx.bezierCurveTo(-18, 2, -8, -6, -4, -14); cx.quadraticCurveTo(-2, -4, 2, -2); cx.quadraticCurveTo(4, -12, 0, -24); cx.fill();
  cx.fillStyle = on ? 'rgba(255,250,200,.9)' : 'rgba(255,255,255,.35)'; cx.beginPath(); cx.ellipse(0, 10, 5, 8, 0, 0, 6.2832); cx.fill(); cx.restore();
}
// dagreeks-tegel in het hoofdmenu: de dagelijkse munten komen uit de leerapp
function drawReeksBanner(x, y, w) {
  const h = 62;
  cx.fillStyle = 'rgba(255,255,255,.1)'; rr(x, y, w, h, 12); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.22)'; cx.lineWidth = 1.5; cx.stroke();
  flame(x + 34, y + 33, 1, true);
  txt('DAGREEKS IN LEERLIGA', x + 64, y + 27, 20, '#fff', 'left', '900');
  txt('Maak elke dag 2 lessen en krijg ' + LEERMUNTEN + ' munten', x + 64, y + 50, 14, '#b8c6ff', 'left', '700');
  pill(x + w - 186, y + 11, 172, 40, 'HOE WERKT HET', () => goTo('reeks'), false, 15);
  hits.push({ x, y, w: w - 190, h, fn: () => goTo('reeks') });
  if (econMsg && tNow - econMsgT < 3) txt(econMsg, x + w / 2, y - 6, 15, '#ffd400', 'center', '900');
}
const LEERMUNTEN = 75;
function drawReeks() {
  const X0 = screenBG('DAGREEKS EN MUNTEN');
  flame(X0 + 44, 92, 0.9, true);
  txt('Elke dag munten via Leerliga', X0 + 72, 100, 20, '#fff', 'left', '900');
  cx.fillStyle = 'rgba(255,255,255,.08)'; rr(X0 + 30, 122, 740, 250, 12); cx.fill();
  const L = [['1', 'Open de leerapp (Leerliga) en maak 2 lessen.'], ['2', 'Na je tweede les krijg je een muntcode of een knop.'], ['3', 'Tik op de knop of plak de code hier bij CODE INWISSELEN.'], ['4', 'Je krijgt ' + LEERMUNTEN + ' munten voor die dag.']];
  L.forEach((r, i) => { const y = 160 + i * 52; cx.fillStyle = '#ffd400'; cx.beginPath(); cx.arc(X0 + 70, y - 6, 16, 0, 6.2832); cx.fill(); txt(r[0], X0 + 70, y, 18, '#1b1b1b', 'center', '900'); txt(r[1], X0 + 102, y, 16, '#fff', 'left', '700'); });
  txt('Meer dan 2 lessen op een dag geeft geen extra munten.', X0 + 400, 388, 15, '#ffd400', 'center', '900');
  txt('De volgende dag maak je weer 2 lessen en krijg je weer munten.', X0 + 400, 414, 15, 'rgba(255,255,255,.85)', 'center', '700');
  txt('Elke dag telt apart: een gemiste dag kun je niet inhalen.', X0 + 400, 438, 14, 'rgba(255,255,255,.7)', 'center', '600');
  pill(X0 + 230, 462, 340, 50, 'CODE INWISSELEN', () => redeemDialog(), true, 17);
  pill(X0 + 30, 540, 300, 46, 'NAAR DE WINKEL', () => { goTo('club'); tab = 4; }, false, 16);
  if (econMsg && tNow - econMsgT < 3) txt(econMsg, X0 + 400, 446, 15, '#ffd400', 'center', '900');
}
// CLUB, OPSTELLING: upgradescherm van 1 kaart
let upSel = -1;
function drawUpgrade(X0) {
  const c = lineCard(upSel); if (!c) { upSel = -1; return; }
  cardBox(X0 + 30, 106, 360, 66, c); txt(SLOTN[upSel], X0 + 410, 134, 14, '#8fb0ff', 'left', '800'); txt('Effect in elke wedstrijd', X0 + 410, 154, 12, 'rgba(255,255,255,.6)', 'left', '700');
  pill(X0 + 640, 112, 140, 48, 'KLAAR', () => { upSel = -1; }, true, 17);
  const pct = l => (l * UPK * 100).toFixed(1).replace('.', ',');
  const rows = [['RATING', c.lvl, c.lvl ? '+' + c.lvl + ' rating (snelheid en trap)' : 'algemene sterkte: nog niet geüpgraded', c.lvl >= 5 ? 0 : 60 * (c.lvl + 1), () => rateBuy(c)]].concat(UPN.map((n, k) => {
    const l = upL(c, k), fx = l ? ['loopsnelheid +' + pct(l) + '%', 'schotkracht +' + pct(l) + '%, zuiverder', 'passnelheid +' + pct(l) + '%', 'balverlies -' + pct(l) + '%'][k] : ['sneller lopen', 'harder en zuiverder schieten', 'snellere passes', 'minder balverlies'][k] + ': nog niet geüpgraded';
    return [n, l, fx, l >= UPMAX ? 0 : UPCOST[l], () => upBuy(c, k)];
  }));
  rows.forEach((r, i) => {
    const y = 184 + i * 66; cx.fillStyle = 'rgba(255,255,255,.07)'; rr(X0 + 30, y, 740, 58, 8); cx.fill();
    txt(r[0], X0 + 48, y + 26, 17, '#fff', 'left', '900'); txt(r[2], X0 + 48, y + 46, 12, '#b8c6ff', 'left', '700');
    for (let q = 0; q < 5; q++) { cx.fillStyle = q < r[1] ? '#4cd964' : 'rgba(255,255,255,.18)'; rr(X0 + 300 + q * 34, y + 18, 28, 22, 4); cx.fill(); }
    const can = r[3] > 0 && S.coins >= r[3];
    if (!r[3]) pill(X0 + 600, y + 9, 160, 40, 'MAX', null, false, 15);
    else pill(X0 + 600, y + 9, 160, 40, 'NIVEAU ' + (r[1] + 1) + '  ' + r[3], can ? r[4] : () => { econMsg = 'Te weinig munten.'; econMsgT = tNow; }, can, 14);
  });
  txt('Elk niveau van SNELHEID, SCHOT, PASSEN en BALCONTROLE = 2,4 procent, max 5 niveaus (12 procent).', X0 + 30, 524, 13, 'rgba(255,255,255,.7)', 'left', '600');
  txt('Telt in seizoen, kick off, straat (5 tegen 5) en 8 tegen 8.', X0 + 30, 544, 13, 'rgba(255,255,255,.7)', 'left', '600');
  if (econMsg && tNow - econMsgT < 3) txt(econMsg, X0 + 770, 544, 14, '#ffd400', 'right', '900');
}
// CLUB, STERREN
function drawStars(X0) {
  const per = 8, pages = Math.ceil(STARS.length / per); if (page >= pages) page = 0;
  txt('STERSPELERS: koop een ster en zet hem in je opstelling', X0 + 30, 118, 14, '#8fb0ff', 'left', '800');
  STARS.slice(page * per, page * per + per).forEach((st, j) => {
    const x = X0 + 30 + (j % 2) * 380, y = 128 + ((j / 2) | 0) * 86, own = starCard(st.id), inL = own && S.lineup.includes(own.id);
    const g = cx.createLinearGradient(x, y, x + 250, y + 78); g.addColorStop(0, 'rgba(255,212,0,.22)'); g.addColorStop(1, 'rgba(255,255,255,.05)'); cx.fillStyle = g; rr(x, y, 252, 78, 8); cx.fill(); cx.strokeStyle = '#e7c24a'; cx.lineWidth = 2; cx.stroke();
    txt(String(st.r), x + 10, y + 34, 30, '#ffd400', 'left', '900'); txt(PSH[st.pos], x + 12, y + 54, 13, '#fff', 'left', '800');
    txt(st.name, x + 62, y + 24, 16, '#fff', 'left', '900'); txt(ROLEN[st.pos] + '  |  ' + st.tr, x + 62, y + 44, 11, '#ffe9a0', 'left', '800');
    txt(st.up.map((v, k) => v ? UPA[k] + ' +' + v : '').filter(Boolean).join('   '), x + 62, y + 64, 12, '#9dffb0', 'left', '800');
    if (own) pill(x + 258, y + 16, 104, 46, inL ? 'OPGESTELD' : 'OPSTELLEN', inL ? null : () => starLine(own), !inL, 14);
    else pill(x + 258, y + 16, 104, 46, String(st.price), S.coins >= st.price ? () => buyStar(st) : () => { econMsg = 'Te weinig munten voor ' + st.short + '.'; econMsgT = tNow; }, S.coins >= st.price, 16);
  });
  txt('TESTVERSIE met echte namen, alleen voor privégebruik. Geen echte foto\'s of logo\'s.', X0 + 30, 488, 12, 'rgba(255,255,255,.6)', 'left', '700');
  txt('Een ster telt in elke wedstrijd met zijn eigen sterkte. Zijn eigenschap telt als upgrade (max 5 per eigenschap).', X0 + 30, 506, 12, 'rgba(255,255,255,.6)', 'left', '700');
  if (pages > 1) pill(X0 + 30, 520, 150, 40, 'PAGINA ' + (page + 1) + ' / ' + pages, () => { page = (page + 1) % pages; }, false, 13);
  if (econMsg && tNow - econMsgT < 3) txt(econMsg, X0 + 770, 548, 15, '#ffd400', 'right', '900');
}
// CLUB, WERELDEN
let wSel = 0;
function drawWorlds(X0) {
  const per = 8, pages = Math.ceil(WORLDS.length / per); if (page >= pages) page = 0;
  WORLDS.slice(page * per, page * per + per).forEach((wd, j) => { const i = page * per + j, rx = X0 + 16 + (j % 4) * 195, ry = 102 + Math.floor(j / 4) * 160; courtTile(COURTS[wd.id], rx, ry, 186, 150, i === wSel); hits.push({ x: rx, y: ry, w: 186, h: 150, fn: () => { wSel = i; } }); });
  const wd = WORLDS[Math.max(0, Math.min(WORLDS.length - 1, wSel))], c = COURTS[wd.id], own = owned(wd.id);
  txt(c.name + '  |  ' + c.sub, X0 + 30, 446, 15, '#fff', 'left', '900');
  txt(own ? (S.home === wd.id ? 'Dit is je thuisveld. Elke wedstrijd hier: +10 procent munten.' : 'In bezit. Kies hem als thuisveld of speel er bij STRAAT.') : 'Prijs ' + c.price + ' munten. Daarna te kiezen bij STRAAT, +10 procent munten per wedstrijd.', X0 + 30, 468, 13, '#b8c6ff', 'left', '700');
  if (!own) pill(X0 + 30, 484, 250, 48, S.coins >= c.price ? 'KOOP  ' + c.price : 'TE WEINIG (' + c.price + ')', S.coins >= c.price ? () => buyWorld(wd.id) : null, S.coins >= c.price, 16);
  else { pill(X0 + 30, 484, 250, 48, S.home === wd.id ? 'THUISVELD' : 'MAAK THUISVELD', S.home === wd.id ? null : () => { S.home = wd.id; saveS(); }, S.home !== wd.id, 16); pill(X0 + 296, 484, 200, 48, 'SPEEL HIER', () => { goTo('straat'); stSel = Object.keys(COURTS).indexOf(wd.id); stPg = Math.floor(stSel / 8); }, false, 16); }
  if (pages > 1) pill(X0 + 630, 484, 150, 48, 'PAGINA ' + (page + 1) + ' / ' + pages, () => { page = (page + 1) % pages; }, false, 13);
  txt('Munten verdien je met wedstrijden, toernooien, het seizoen, opdrachten en je dagreeks.', X0 + 30, 556, 12, 'rgba(255,255,255,.6)', 'left', '700');
  if (econMsg && tNow - econMsgT < 3) txt(econMsg, X0 + 770, 446, 15, '#ffd400', 'right', '900');
}
function econHash(k) {
  if (k === 'reeks') goTo('reeks');
  else if (k === 'werelden') { goTo('club'); tab = 5; }
  else if (k === 'upgrade') { goTo('club'); tab = 0; upSel = 4; }
  else { goTo('club'); tab = 4; }
}

// referee
function foulCheck(tackler, victim, slide) {
  const pr = FOULP[strictIdx]; if (srnd() >= pr) return false;
  let card = '';
  if (srnd() < 0.7) ban = { t: 1.8, text: 'OVERTREDING', sub: (tackler.name || '') + ' - VRIJE TRAP', col: '#ffffff' };
  else {
    const k = tackler.t + '_' + tackler.i; yel[k] = (yel[k] || 0) + 1;
    card = yel[k] >= 2 ? 'ROOD' : 'GEEL'; if (card === 'ROOD') yel[k] = 0;
    ban = { t: 1.8, text: 'OVERTREDING', sub: (tackler.name || '') + ' - ' + (card === 'ROOD' ? 'TWEEDE GEEL' : 'GELE KAART'), col: card === 'ROOD' ? '#e0302c' : '#ffd400' };
  }
  whistle(0.35);
  ball.owner = victim; victim.hold = 0; victim.cd = 0; tackler.cd = 1.4;
  tackler.x -= (tackler.t ? -1 : 1) * 30;
  // vrije trap of penalty in 3D: bij een kaart, een fout in de zestien of een zware fout dicht bij doel (OPTIES, VRIJE TRAP 3D)
  const kind = spWanted(tackler, victim, card, !!slide || Math.hypot(tackler.vx, tackler.vy) > 170);
  if (kind) spStart({ pen: kind === 2, att: victim.t, victim, tackler, card, fx: victim.x, fy: victim.y });
  return true;
}

// ---------- ui helpers ----------
function pill(x, y, w, h, label, fn, on, sz) {
  cx.fillStyle = on ? '#f2f4f8' : 'rgba(255,255,255,.1)'; rr(x, y, w, h, 6); cx.fill();
  cx.strokeStyle = on ? '#fff' : 'rgba(255,255,255,.3)'; cx.lineWidth = 1.2; cx.stroke();
  txt(label, x + w / 2, y + h / 2 + (sz || 15) * 0.36, sz || 15, on ? '#0b1b4d' : '#fff', 'center', '800');
  if (fn) hits.push({ x, y, w, h, fn });
}
function screenBG(title, sub) {
  const g = cx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#060c24'); g.addColorStop(1, '#171a48'); cx.fillStyle = g; cx.fillRect(0, 0, SW, VH);
  const X0 = (SW - 800) / 2;
  pill(X0 + 8, 6, 150, 44, '< ' + ((SCREENS[state] && SCREENS[SCREENS[state].parent] && SCREENS[SCREENS[state].parent].title) || 'MENU'), () => { if (state === 'album' && albDet) { albDet = null; return; } const sc = SCREENS[state]; state = sc && sc.parent || 'menu'; confirmNew = false; }, false, 16);
  txt(title, SW / 2, 40, 24, '#fff', 'center', '900');
  cx.fillStyle = '#ffd400'; cx.beginPath(); cx.arc(X0 + 690, 31, 11, 0, 6.2832); cx.fill(); txt('M', X0 + 690, 36, 12, '#5a4300', 'center', '900');
  txt(String(S.coins), X0 + 784, 38, 22, '#ffd400', 'right', '900');
  return X0;
}
function tabs(X0, names) {
  const st = names.length > 4 ? 128 : 158;
  names.forEach((n, i) => pill(X0 + 16 + i * st, 56, st - 8, 38, n, () => { tab = i; page = 0; confirmNew = false; upSel = -1; }, tab === i, names.length > 4 ? 13 : 15));
}
function cardBox(x, y, w, h, c, extra) {
  const col = tcol(c);
  const g = cx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(1, 'rgba(255,255,255,.05)');
  cx.fillStyle = g; rr(x, y, w, h, 8); cx.fill(); cx.strokeStyle = col; cx.lineWidth = 2; cx.stroke();
  txt(String(eff(c)), x + 10, y + 32, 28, col, 'left', '900'); txt(PSH[c.pos], x + 12, y + 50, 13, '#fff', 'left', '800');
  txt(c.name, x + w / 2 + 14, y + 26, 16, '#fff', 'center', '800');
  txt(tier(c) + (c.lvl ? '  +' + c.lvl : ''), x + w / 2 + 14, y + 46, 12, col, 'center', '800');
  if (c.form) { cx.fillStyle = '#ff3b8b'; rr(x + w - 62, y + 6, 54, 15, 3); cx.fill(); txt('IN FORM', x + w - 35, y + 17, 10, '#fff', 'center', '900'); }
  if (c.star) { cx.fillStyle = '#e7c24a'; rr(x + w - 50, y + 6, 42, 15, 3); cx.fill(); txt('STER', x + w - 29, y + 17, 10, '#3a2a00', 'center', '900'); }
  if (extra) extra(x, y, w, h);
}

let fr = null, pickA = 0, pickB = 1, pickSide = -1, pickPg = 0, pickF = -1, pickAll = null, pickRet = null, stStep = 0;
const LOGOS = {};
function logoImg(u) { if (!u || typeof u !== 'string' || !/^(logos\/[\w.-]+|data:image\/(png|jpeg|webp|svg\+xml)[^"']*)$/.test(u)) return null; let i = LOGOS[u]; if (!i) { i = LOGOS[u] = new Image(); i.src = u; } return i.complete && i.naturalWidth ? i : null; }
function pool() {
  const out = [], seen = {};
  (ALLC || COMPS || []).forEach(c => c.teams.forEach(t => { if (!seen[t.name]) { seen[t.name] = 1; out.push({ comp: c.name, ts: t.ts || 60, logo: t.logo || null, kit: { name: String(t.name).slice(0, 24), code: String(t.code || t.name).slice(0, 3).toUpperCase(), shirt: t.shirt, shorts: t.shorts || '#ffffff', sock: t.sock || t.shirt, trim: t.trim || '#ffffff' } }); } }));
  out.sort((a, b) => a.kit.name < b.kit.name ? -1 : 1);
  return out;
}
function hsh(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function lumi(c) { const n = parseInt(String(c).slice(1), 16) || 0; return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; }
function roundel(x, y, r, k, big) {
  const h = hsh(k.name || 'X'), A = k.shirt || '#c33', cd = (p, q) => { const a = parseInt(String(p).slice(1), 16) || 0, b = parseInt(String(q).slice(1), 16) || 0; return Math.abs((a >> 16) - (b >> 16)) + Math.abs(((a >> 8) & 255) - ((b >> 8) & 255)) + Math.abs((a & 255) - (b & 255)); };
  const W = c => cd(c, '#ffffff') < 60, ok = c => c && /^#[0-9a-f]{6}$/i.test(c) && cd(c, A) > 120, cand = [k.trim, k.shorts].filter(ok);
  const C = cand.find(c => !W(c)) || cand[0] || (lumi(A) > 0.5 ? '#16224a' : '#ffffff'), cy = y + r * 0.1, R = r * 1.02;
  cx.save(); cx.shadowColor = 'rgba(0,0,0,.4)'; cx.shadowBlur = r * 0.3; cx.shadowOffsetY = r * 0.08; cx.beginPath(); cx.arc(x, cy, R, 0, 6.2832); cx.fillStyle = '#fff'; cx.fill(); cx.restore();
  cx.beginPath(); cx.arc(x, cy, R * 0.9, 0, 6.2832); cx.fillStyle = lumi(A) > 0.8 ? C : A; cx.fill();
  const ir = R * 0.66; cx.save(); cx.beginPath(); cx.arc(x, cy, ir, 0, 6.2832); cx.clip(); cx.fillStyle = A; cx.fillRect(x - ir, cy - ir, ir * 2, ir * 2);
  cx.fillStyle = C; const m = h % 3;
  if (m === 0) { for (let i = 0; i < 3; i++) { cx.beginPath(); cx.arc(x, cy, ir * (0.82 - i * 0.3), 0, 6.2832); cx.fillStyle = i % 2 ? A : C; cx.fill(); } }
  else if (m === 1) { for (let i = 0; i < 8; i += 2) { cx.beginPath(); cx.moveTo(x, cy); cx.arc(x, cy, ir * 1.2, i * 0.7854, (i + 1) * 0.7854); cx.closePath(); cx.fill(); } }
  else { cx.fillRect(x - ir, cy - ir * 0.22, ir * 2, ir * 0.44); cx.beginPath(); cx.arc(x, cy - ir * 0.62, ir * 0.17, 0, 6.2832); cx.fill(); cx.beginPath(); cx.arc(x, cy + ir * 0.62, ir * 0.17, 0, 6.2832); cx.fill(); }
  cx.restore();
  cx.beginPath(); cx.arc(x, cy, ir, 0, 6.2832); cx.lineWidth = Math.max(1.5, r * 0.09); cx.strokeStyle = '#fff'; cx.stroke();
  const star = (sx, sy, sr) => { cx.beginPath(); for (let i = 0; i < 10; i++) { const a = -1.5708 + i * 0.6283, rr = i % 2 ? sr * 0.42 : sr; cx.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } cx.closePath(); cx.fillStyle = '#ffd400'; cx.fill(); };
  const ns = h % 3; for (let i = 0; i < ns; i++) star(x + (i - (ns - 1) / 2) * r * 0.42, cy - R * 1.12, r * 0.2);
  if (big) { const t = (k.code || '').slice(0, 3); cx.save(); cx.font = '900 ' + (r * 0.42) + 'px system-ui,sans-serif'; cx.textAlign = 'center'; cx.lineJoin = 'round'; cx.lineWidth = r * 0.13; cx.strokeStyle = 'rgba(0,0,0,.7)'; cx.strokeText(t, x, cy + r * 0.15); cx.fillStyle = '#fff'; cx.fillText(t, x, cy + r * 0.15); cx.restore(); }
}
let crestMode = 0;
function crest(x, y, r, k, big) {
  if (crestMode === 1) return roundel(x, y, r, k, big);
  const h = hsh(k.name || 'X'), st = h % 5, A = k.shirt || '#c33', cd = (p, q) => { const a = parseInt(String(p).slice(1), 16) || 0, b = parseInt(String(q).slice(1), 16) || 0; return Math.abs((a >> 16) - (b >> 16)) + Math.abs(((a >> 8) & 255) - ((b >> 8) & 255)) + Math.abs((a & 255) - (b & 255)); };
  const W = c => cd(c, '#ffffff') < 60, ok = c => c && /^#[0-9a-f]{6}$/i.test(c) && cd(c, A) > 120, cand = [k.trim, k.shorts].filter(ok);
  const C = cand.find(c => !W(c)) || cand[0] || (lumi(A) > 0.5 ? '#16224a' : '#ffffff'), B = W(C) ? (ok(k.trim) && !W(k.trim) ? k.trim : '#ffffff') : '#ffffff';
  const sh = () => { cx.beginPath(); cx.moveTo(x - r * 0.86, y - r); cx.lineTo(x + r * 0.86, y - r); cx.lineTo(x + r * 0.86, y + r * 0.15); cx.quadraticCurveTo(x + r * 0.86, y + r * 0.8, x, y + r * 1.12); cx.quadraticCurveTo(x - r * 0.86, y + r * 0.8, x - r * 0.86, y + r * 0.15); cx.closePath(); };
  cx.save(); cx.shadowColor = 'rgba(0,0,0,.35)'; cx.shadowBlur = r * 0.25; cx.shadowOffsetY = r * 0.08; sh(); cx.fillStyle = A; cx.fill(); cx.restore();
  cx.save(); sh(); cx.clip(); cx.fillStyle = C;
  if (st === 0) cx.fillRect(x - r * 0.28, y - r, r * 0.56, r * 2.2);
  else if (st === 1) { cx.fillRect(x - r, y - r * 0.32, r * 2, r * 0.64); }
  else if (st === 2) { cx.beginPath(); cx.moveTo(x - r, y - r * 0.2); cx.lineTo(x - r, y + r * 0.35); cx.lineTo(x + r, y - r * 0.35); cx.lineTo(x + r, y - r * 0.9); cx.closePath(); cx.fill(); }
  else if (st === 3) cx.fillRect(x, y - r, r, r * 2.2);
  else { cx.beginPath(); cx.moveTo(x - r, y - r * 0.1); cx.lineTo(x, y - r * 0.75); cx.lineTo(x + r, y - r * 0.1); cx.lineTo(x + r, y + r * 0.35); cx.lineTo(x, y - r * 0.3); cx.lineTo(x - r, y + r * 0.35); cx.closePath(); cx.fill(); }
  cx.fillStyle = B; cx.globalAlpha = 0.95; cx.fillRect(x - r, y - r, r * 2, r * 0.3); cx.globalAlpha = 1;
  cx.restore();
  sh(); cx.lineWidth = Math.max(1.5, r * 0.11); cx.strokeStyle = B; cx.stroke();
  if (big) {
    const t = (k.code || '').slice(0, 3); cx.save(); cx.font = '900 ' + (r * 0.5) + 'px system-ui,sans-serif'; cx.textAlign = 'center'; cx.lineJoin = 'round';
    cx.lineWidth = r * 0.14; cx.strokeStyle = 'rgba(0,0,0,.65)'; cx.strokeText(t, x, y + r * 0.62); cx.fillStyle = '#fff'; cx.fillText(t, x, y + r * 0.62); cx.restore();
    cx.beginPath(); cx.arc(x, y - r * 0.55, r * 0.09, 0, 6.2832); cx.fillStyle = B; cx.fill();
  }
}
function drawPick() {
  const X0 = screenBG('KICK OFF'), P = (pickAll = pool()); if (!P.length) return;
  if (pickSide >= 0) {
    const names = (ALLC || COMPS || []).map(c => c.name), fl = pickF >= 0 ? P.map((t, i) => i).filter(i => P[i].comp === names[pickF]) : P.map((t, i) => i);
    pill(X0 + 250, 52, 300, 28, pickF >= 0 ? names[pickF] + ' (' + fl.length + ')' : 'ALLE COMPETITIES (' + P.length + ')', () => { pickF = pickF + 1 >= names.length ? -1 : pickF + 1; pickPg = 0; }, true, 13);
    const PER = 12, pages = Math.max(1, Math.ceil(fl.length / PER)); pickPg = Math.max(0, Math.min(pages - 1, pickPg));
    txt(pickSide ? 'KIES TEGENSTANDER' : 'KIES JOUW TEAM', X0 + 130, 70, 14, '#8fb0ff', 'center', '800');
    for (let k = 0; k < PER; k++) {
      const i = fl[pickPg * PER + k]; if (i === undefined) break;
      const x = X0 + 10 + (k % 3) * 260, y = 96 + Math.floor(k / 3) * 64, t = P[i];
      pill(x, y, 250, 52, '', () => { if (pickSide) pickB = i; else pickA = i; pickSide = -1; if (pickRet) { state = pickRet; pickRet = null; } }, false, 14);
      { const lg = logoImg(t.logo); if (lg) cx.drawImage(lg, x + 10, y + 8, 36, 36); else crest(x + 28, y + 23, 15, t.kit, false); }
      txt(t.kit.name.slice(0, 20), x + 50, y + 22, 14, '#fff', 'left', '800'); txt(t.comp, x + 50, y + 40, 11, 'rgba(255,255,255,.6)', 'left', '700');
    }
    const ls = []; fl.forEach((ix, k) => { const L0 = P[ix].kit.name[0]; if (!ls.some(q => q[0] === L0)) ls.push([L0, k]); });
    const lw = Math.min(30, 780 / Math.max(1, ls.length));
    ls.forEach((q, k) => pill(X0 + 10 + k * lw, 408, lw - 2, 28, q[0], () => { pickPg = Math.floor(q[1] / PER); }, false, 12));
    pill(X0 + 10, 362, 110, 34, '< VORIGE', () => { pickPg = (pickPg + pages - 1) % pages; }, false, 13);
    txt((pickPg + 1) + ' / ' + pages, SW / 2, 384, 14, '#fff', 'center', '800');
    pill(X0 + 680, 362, 110, 34, 'VOLGENDE >', () => { pickPg = (pickPg + 1) % pages; }, false, 13);
    return;
  }
  pickA = (pickA + P.length) % P.length; pickB = (pickB + P.length) % P.length;
  if (selV >= 0) {
    const t = P[selV % P.length], q = squadOf(t.kit.name).slice().sort((a, b) => (a.n || 99) - (b.n || 99));
    txt('SELECTIE ' + t.kit.name, SW / 2, 78, 18, '#fff', 'center', '900');
    if (!q.length) txt('Geen spelers beschikbaar voor deze club.', SW / 2, 260, 16, 'rgba(255,255,255,.7)', 'center', '700');
    q.slice(0, 36).forEach((p, k) => { const x = X0 + 14 + Math.floor(k / 12) * 262, y = 104 + (k % 12) * 26; txt(p.n ? String(p.n) : '-', x + 26, y + 16, 14, '#ffd400', 'right', '800'); txt((p.name + (p.pos === 'GK' ? '  (K)' : '')).slice(0, 26), x + 36, y + 16, 14, '#fff', 'left', '700'); });
    if (q.length > 36) txt('+ ' + (q.length - 36) + ' meer', SW / 2, 428, 12, 'rgba(255,255,255,.6)', 'center', '700');
    pill(X0 + 300, 440, 200, 40, 'TERUG', () => { selV = -1; }, true, 16);
    return;
  }
  const box = (x, label, idx, set) => {
    const t = P[idx];
    cx.fillStyle = 'rgba(255,255,255,.07)'; rr(x, 100, 330, 270, 10); cx.fill();
    txt(label, x + 165, 132, 16, '#8fb0ff', 'center', '800');
    const lg = logoImg(t.logo);
    if (lg) cx.drawImage(lg, x + 120, 152, 90, 90); else crest(x + 165, 192, 48, t.kit, true);
    hits.push({ x: x + 60, y: 160, w: 210, h: 160, fn: () => { pickSide = x < X0 + 400 ? 0 : 1; pickF = -1; pickPg = Math.floor(idx / 12); } });
    txt(t.kit.name, x + 165, 275, 21, '#fff', 'center', '900'); txt(t.comp, x + 165, 298, 13, 'rgba(255,255,255,.65)', 'center', '700');
    txt('sterkte ' + t.ts, x + 165, 324, 16, '#ffd400', 'center', '800');
    pill(x + 92, 330, 146, 32, 'SELECTIE', () => { selV = idx; }, false, 13);
    pill(x + 12, 330, 70, 30, '<', () => { set((idx + P.length - 1) % P.length); }, false, 18); pill(x + 248, 330, 70, 30, '>', () => { set((idx + 1) % P.length); }, false, 18);
  };
  box(X0 + 50, 'JIJ', pickA, v => { pickA = v; }); box(X0 + 420, 'TEGENSTANDER', pickB, v => { pickB = v; });
  txt('VS', X0 + 400, 240, 24, '#fff', 'center', '900');
  pill(X0 + 520, 408, 130, 40, 'WISSEL', () => { const t = pickA; pickA = pickB; pickB = t; }, false, 13);
  pill(X0 + 300, 400, 200, 56, pickA === pickB ? 'KIES 2 ANDERE TEAMS' : 'START', () => { if (pickA !== pickB) startMatch({ kind: 'friendly', a: P[pickA].kit, b: P[pickB].kit, ta: P[pickA].ts, tb: P[pickB].ts }); }, pickA !== pickB, 18);
  txt('Tik op een club om te kiezen uit de lijst. Snelle match, telt niet mee voor je seizoen. Niveau stel je in bij Instellingen.', X0 + 400, 490, 13, 'rgba(255,255,255,.65)', 'center', '600');
}
// ---------- toernooien (CL, EL, Croky Cup, EK, WK) ----------
const NAT = [
  ['BELGIE', 'BEL', 82, '#c8102e', '#111111', '#c8102e', '#fdda24'], ['NEDERLAND', 'NED', 83, '#ff6a00', '#ffffff', '#ff6a00', '#1b2a6b'],
  ['DUITSLAND', 'DUI', 84, '#f4f4f4', '#111111', '#f4f4f4', '#111111'], ['FRANKRIJK', 'FRA', 86, '#1b3f8f', '#ffffff', '#c8102e', '#ffffff'],
  ['ENGELAND', 'ENG', 85, '#f4f4f4', '#1b2a6b', '#f4f4f4', '#c8102e'], ['SPANJE', 'SPA', 86, '#c8102e', '#1b2a6b', '#c8102e', '#fdda24'],
  ['PORTUGAL', 'POR', 84, '#8a1538', '#1f7a3a', '#c8102e', '#1f7a3a'], ['ITALIE', 'ITA', 82, '#1b5fbf', '#ffffff', '#1b5fbf', '#ffffff'],
  ['KROATIE', 'KRO', 80, '#f4f4f4', '#1b3f8f', '#f4f4f4', '#c8102e'], ['DENEMARKEN', 'DEN', 77, '#c8102e', '#ffffff', '#c8102e', '#ffffff'],
  ['ZWITSERLAND', 'ZWI', 77, '#c8102e', '#ffffff', '#c8102e', '#ffffff'], ['OOSTENRIJK', 'OOS', 76, '#c8102e', '#111111', '#c8102e', '#ffffff'],
  ['TURKIJE', 'TUR', 75, '#c8102e', '#c8102e', '#c8102e', '#ffffff'], ['POLEN', 'POL', 73, '#f4f4f4', '#c8102e', '#f4f4f4', '#c8102e'],
  ['SCHOTLAND', 'SCH', 70, '#1b2a6b', '#ffffff', '#1b2a6b', '#ffffff'], ['OEKRAINE', 'OEK', 72, '#fdda24', '#1b5fbf', '#fdda24', '#1b5fbf'],
  ['BRAZILIE', 'BRA', 85, '#fdda24', '#1b5fbf', '#ffffff', '#1f7a3a'], ['ARGENTINIE', 'ARG', 86, '#75aadb', '#111111', '#f4f4f4', '#ffffff'],
  ['URUGUAY', 'URU', 80, '#75aadb', '#111111', '#111111', '#ffffff'], ['COLOMBIA', 'COL', 79, '#fdda24', '#1b2a6b', '#c8102e', '#c8102e'],
  ['MEXICO', 'MEX', 76, '#1f7a3a', '#ffffff', '#c8102e', '#ffffff'], ['VERENIGDE STATEN', 'VSA', 76, '#f4f4f4', '#1b2a6b', '#c8102e', '#c8102e'],
  ['MAROKKO', 'MAR', 79, '#c8102e', '#1f7a3a', '#c8102e', '#1f7a3a'], ['SENEGAL', 'SEN', 76, '#f4f4f4', '#1f7a3a', '#f4f4f4', '#fdda24'],
  ['JAPAN', 'JAP', 77, '#1b3f8f', '#1b3f8f', '#1b3f8f', '#ffffff'], ['ZUID-KOREA', 'KOR', 74, '#c8102e', '#1b2a6b', '#c8102e', '#ffffff'],
  ['AUSTRALIE', 'AUS', 71, '#fdda24', '#1f7a3a', '#fdda24', '#1f7a3a'], ['CANADA', 'CAN', 71, '#c8102e', '#c8102e', '#c8102e', '#ffffff'],
  ['NIGERIA', 'NIG', 72, '#1f9d55', '#ffffff', '#1f9d55', '#ffffff'], ['ECUADOR', 'ECU', 74, '#fdda24', '#1b3f8f', '#c8102e', '#1b3f8f'],
  ['NOORWEGEN', 'NOR', 75, '#c8102e', '#1b2a6b', '#c8102e', '#ffffff'], ['SERVIE', 'SER', 72, '#c8102e', '#1b2a6b', '#f4f4f4', '#ffffff']
];
const TOURS = [
  { id: 'cl', name: 'CHAMPIONS LEAGUE', sub: '16 topclubs, 4 poules, knock-out', G: 4, n: 16, kind: 'club', off: 0, prize: 600, c1: '#1b3f8f' },
  { id: 'el', name: 'EUROPA LEAGUE', sub: '16 clubs, 4 poules, knock-out', G: 4, n: 16, kind: 'club', off: 16, prize: 400, c1: '#d9731a' },
  { id: 'cc', name: 'CROKY CUP', sub: '16 Belgische ploegen, knock-out', G: 0, n: 16, kind: 'be', prize: 400, c1: '#c8102e' },
  { id: 'ek', name: 'EK', sub: '16 landen, 4 poules, knock-out', G: 4, n: 16, kind: 'nat', prize: 600, c1: '#1f7a3a' },
  { id: 'wk', name: 'WK', sub: '32 landen, 8 poules, knock-out', G: 8, n: 32, kind: 'nat', prize: 900, c1: '#8a1538' },
  { id: 'ca', name: 'COPA AMERICA', sub: '8 landen van Amerika, 2 poules, knock-out', G: 2, n: 8, kind: 'nat', codes: ['BRA', 'ARG', 'URU', 'COL', 'MEX', 'VSA', 'ECU', 'CAN'], prize: 400, c1: '#d9a000' },
  { id: 'nc', name: 'NATIONS CUP', sub: '16 landen, 4 poules, knock-out', G: 4, n: 16, kind: 'nat', off: 16, prize: 500, c1: '#0e8a8a' },
  { id: 'lc', name: 'ENGELSE LEAGUE CUP', sub: '16 Engelse clubs, knock-out', G: 0, n: 16, kind: 'club', comp: 'PREMIER LEAGUE', off: 0, prize: 400, c1: '#6b2fa0' }
];
const GROUPFX = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
let TT = null, tourStep = 0, tourDef = 0, tourMine = 0, tourTeams0 = null, tourConfirm = false;
function tourTeams(d) {
  if (d.kind === 'nat') return (d.codes ? NAT.filter(n => d.codes.includes(n[1])) : NAT.slice(d.off || 0, (d.off || 0) + d.n)).map(n => ({ ts: n[2], kit: { name: n[0], code: n[1], shirt: n[3], shorts: n[4], sock: n[5], trim: n[6] } }));
  const P = pool(), PRO = ['PRO LEAGUE', 'EREDIVISIE', 'PREMIER LEAGUE', 'BUNDESLIGA'];
  const by = (a, b) => b.ts - a.ts || (a.kit.name < b.kit.name ? -1 : 1);
  if (d.kind === 'club') return P.filter(t => d.comp ? t.comp === d.comp : PRO.includes(t.comp)).sort(by).slice(d.off, d.off + d.n).map(t => ({ ts: t.ts, kit: t.kit }));
  const pro = P.filter(t => t.comp === 'PRO LEAGUE').sort(by).slice(0, 12), am = P.filter(t => !PRO.includes(t.comp)).sort(by).slice(0, 4);
  return pro.concat(am).map(t => ({ ts: t.ts, kit: t.kit }));
}
function tourSim(a, b) { const A = TT.teams[a].ts, B = TT.teams[b].ts; return [pois(1.4 * Math.pow(A / B, 2.4)), pois(1.4 * Math.pow(B / A, 2.4))]; }
function tourWin(a, b, ga, gb) { return ga > gb ? a : ga < gb ? b : (Math.random() < 0.5 + (TT.teams[a].ts - TT.teams[b].ts) * 0.004 ? a : b); }
function newTour(di, mine, teams) {
  const d = TOURS[di], n = teams.length, order = teams.map((t, i) => i).sort((a, b) => teams[b].ts - teams[a].ts), tab2 = {};
  teams.forEach((t, i) => tab2[i] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });
  let groups = [], pairs = [], phase = 'group';
  if (d.G) {
    groups = Array.from({ length: d.G }, () => []);
    for (let k = 0; k < n; k += d.G) order.slice(k, k + d.G).sort(() => Math.random() - 0.5).forEach((t, g) => groups[g].push(t));
  } else {
    const o = teams.map((t, i) => i).sort(() => Math.random() - 0.5); for (let i = 0; i < n; i += 2) pairs.push([o[i], o[i + 1]]); phase = 'ko';
  }
  TT = { di, mine, teams, groups, tab: tab2, round: 0, phase, pairs, hist: [], out: false, champ: -1, msg: '' };
  saveT();
}
function saveT() { try { localStorage.setItem('goalrush3', JSON.stringify(TT)); } catch (e) {} }
function loadT() {
  try {
    const o = JSON.parse(localStorage.getItem('goalrush3'));
    if (o && Array.isArray(o.teams) && o.teams.length >= 8 && o.teams.every(t => t && t.kit && t.kit.name) && o.mine >= 0 && o.mine < o.teams.length && TOURS[o.di] && o.tab && o.hist) TT = o;
  } catch (e) {}
}
function tAdd(a, b, ga, gb) {
  const A = TT.tab[a], B = TT.tab[b]; A.p++; B.p++; A.gf += ga; A.ga += gb; B.gf += gb; B.ga += ga;
  if (ga > gb) { A.w++; A.pts += 3; B.l++; } else if (ga < gb) { B.w++; B.pts += 3; A.l++; } else { A.d++; B.d++; A.pts++; B.pts++; }
}
const tRank = g => g.slice().sort((x, y) => { const a = TT.tab[x], b = TT.tab[y]; return b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || TT.teams[y].ts - TT.teams[x].ts; });
function myGroup() { return TT.groups.findIndex(g => g.includes(TT.mine)); }
function tourNext() {
  if (!TT || TT.out || TT.champ >= 0) return null;
  if (TT.phase === 'group') { const g = TT.groups[myGroup()]; const f = GROUPFX[TT.round].find(p => g[p[0]] === TT.mine || g[p[1]] === TT.mine); const a = g[f[0]], b = g[f[1]]; return a === TT.mine ? b : a; }
  const pr = TT.pairs.find(p => p[0] === TT.mine || p[1] === TT.mine); return pr ? (pr[0] === TT.mine ? pr[1] : pr[0]) : null;
}
const koName = n => n >= 8 ? 'ACHTSTE FINALE' : n === 4 ? 'KWARTFINALE' : n === 2 ? 'HALVE FINALE' : 'FINALE';
function tourPlay() {
  const o = tourNext(); if (o === null) return;
  const m = TT.teams[TT.mine], q = TT.teams[o];
  startMatch({ kind: 'friendly', a: m.kit, b: q.kit, ta: m.ts, tb: q.ts, tour: true });
}
function simKO() {   // rest van de knock-out simuleren (als jij eruit ligt)
  let pr = TT.pairs.slice();
  while (pr.length) {
    const res = pr.map(p => { const r = tourSim(p[0], p[1]); return [p[0], p[1], r[0], r[1], tourWin(p[0], p[1], r[0], r[1])]; });
    TT.hist.push(res); const w = res.map(r => r[4]);
    if (w.length === 1) { TT.champ = w[0]; TT.pairs = []; return; }
    pr = []; for (let i = 0; i < w.length; i += 2) pr.push([w[i], w[i + 1]]);
    TT.pairs = pr;
  }
}
function buildKO() {
  const W2 = TT.groups.map(g => tRank(g)), pr = [];
  for (let g = 0; g < TT.groups.length; g += 2) { pr.push([W2[g][0], W2[g + 1][1]]); pr.push([W2[g + 1][0], W2[g][1]]); }
  TT.pairs = pr; TT.phase = 'ko';
}
function finishTour(ga, gb) {
  const out = [], m = TT.mine, o = tourNext(), d = TOURS[TT.di]; if (o === null) return out;
  if (TT.phase === 'group') {
    tAdd(m, o, ga, gb);
    TT.groups.forEach((g, gi) => GROUPFX[TT.round].forEach(f => { const a = g[f[0]], b = g[f[1]]; if (a === m || b === m || a === o && b === m) return; const r = tourSim(a, b); tAdd(a, b, r[0], r[1]); }));
    TT.round++;
    if (TT.round >= 3) {
      buildKO(); const rk = tRank(TT.groups[myGroup()]).indexOf(m);
      if (rk > 1) { TT.out = true; out.push('Uitgeschakeld in de poule (plaats ' + (rk + 1) + ')'); simKO(); out.push('Winnaar: ' + TT.teams[TT.champ].kit.name); }
      else out.push('Poule gewonnen of overleefd: door naar de ' + koName(TT.pairs.length).toLowerCase() + '!');
    } else out.push('Volgende speelronde: ' + (TT.round + 1) + ' / 3');
  } else {
    const n = TT.pairs.length; let pen = null, w = ga > gb ? m : ga < gb ? o : null;
    if (w === null) { w = Math.random() < 0.5 + (TT.teams[m].ts - TT.teams[o].ts) * 0.004 ? m : o; pen = w === m ? 'Gewonnen na strafschoppen' : 'Verloren na strafschoppen'; }
    const res = TT.pairs.map(p => { if (p[0] === m || p[1] === m) return [p[0], p[1], p[0] === m ? ga : gb, p[0] === m ? gb : ga, w]; const r = tourSim(p[0], p[1]); return [p[0], p[1], r[0], r[1], tourWin(p[0], p[1], r[0], r[1])]; });
    TT.hist.push(res); const win = res.map(r => r[4]); if (pen) out.push(pen);
    if (w !== m) { TT.out = true; out.push('Uitgeschakeld in de ' + koName(n).toLowerCase()); const nx = []; for (let i = 0; i < win.length; i += 2) nx.push([win[i], win[i + 1]]); TT.pairs = win.length > 1 ? nx : []; if (win.length === 1) TT.champ = win[0]; else simKO(); out.push('Winnaar: ' + TT.teams[TT.champ].kit.name); }
    else if (win.length === 1) { TT.champ = m; TT.pairs = []; S.coins += d.prize; albAdd(3); out.push(d.name + ' GEWONNEN! +' + d.prize + ' munten en 3 packs'); }
    else { const nx = []; for (let i = 0; i < win.length; i += 2) nx.push([win[i], win[i + 1]]); TT.pairs = nx; out.push('Door naar de ' + koName(nx.length).toLowerCase() + '!'); }
  }
  saveT(); return out;
}
function drawTour() {
  const X0 = screenBG('TOERNOOIEN');
  if (!TT || tourStep > 0) { drawTourSetup(X0); return; }
  const d = TOURS[TT.di]; txt(d.name, X0 + 24, 82, 20, '#ffd400', 'left', '900');
  const names = d.G ? ['PROGRAMMA', 'POULES', 'KNOCK-OUT'] : ['PROGRAMMA', 'KNOCK-OUT']; if (tab >= names.length) tab = 0;
  names.forEach((n, i) => pill(X0 + 330 + i * 158, 60, 150, 32, n, () => { tab = i; tourConfirm = false; }, tab === i, 14));
  const name = names[tab], nm = i => TT.teams[i].kit.name;
  if (name === 'PROGRAMMA') {
    const o = tourNext(), m = TT.teams[TT.mine];
    crest(X0 + 120, 210, 40, m.kit, true); txt(m.kit.name, X0 + 120, 270, 17, '#fff', 'center', '900');
    if (o !== null) {
      const q = TT.teams[o], lab = TT.phase === 'group' ? 'POULE ' + String.fromCharCode(65 + myGroup()) + ' - RONDE ' + (TT.round + 1) + ' / 3' : koName(TT.pairs.length);
      txt(lab, X0 + 400, 150, 22, '#8fb0ff', 'center', '900'); txt('VS', X0 + 400, 215, 30, '#fff', 'center', '900');
      crest(X0 + 680, 210, 40, q.kit, true); txt(q.kit.name, X0 + 680, 270, 17, '#fff', 'center', '900'); txt('sterkte ' + q.ts, X0 + 680, 294, 14, '#ffd400', 'center', '800');
      pill(X0 + 300, 330, 200, 56, 'SPEEL', tourPlay, true, 20);
    } else {
      txt(TT.champ === TT.mine ? 'KAMPIOEN!' : 'UITGESCHAKELD', X0 + 400, 150, 34, TT.champ === TT.mine ? '#ffd400' : '#ff7a7a', 'center', '900');
      if (TT.champ >= 0) txt('Winnaar: ' + nm(TT.champ), X0 + 400, 190, 20, '#fff', 'center', '800');
    }
    if (TT.phase === 'group' && o !== null) {
      const g = tRank(TT.groups[myGroup()]); txt('JOUW POULE', X0 + 60, 430, 14, '#8fb0ff', 'left', '900');
      g.forEach((t, i) => { const s = TT.tab[t]; txt((i + 1) + '. ' + nm(t), X0 + 60, 452 + i * 20, 15, t === TT.mine ? '#ffd400' : '#fff', 'left', '800'); txt(s.pts + ' pt   ' + s.gf + '-' + s.ga, X0 + 460, 452 + i * 20, 15, '#fff', 'right', '800'); });
    }
    if (tourConfirm) { pill(X0 + 560, 520, 220, 34, 'ZEKER? NIEUW TOERNOOI', () => { TT = null; tourStep = 0; tourConfirm = false; try { localStorage.removeItem('goalrush3'); } catch (e) {} }, true, 13); }
    else pill(X0 + 560, 520, 220, 34, 'NIEUW TOERNOOI', () => { tourConfirm = true; }, false, 13);
  } else if (name === 'POULES') {
    TT.groups.forEach((g, gi) => {
      const cols = TT.groups.length > 4 ? 2 : 2, cx0 = X0 + 20 + (gi % cols) * 395, rows = Math.ceil(TT.groups.length / cols), cy0 = 112 + Math.floor(gi / cols) * (TT.groups.length > 4 ? 100 : 190);
      txt('POULE ' + String.fromCharCode(65 + gi), cx0, cy0, 13, '#8fb0ff', 'left', '900');
      tRank(g).forEach((t, i) => { const s = TT.tab[t], yy = cy0 + 20 + i * (TT.groups.length > 4 ? 18 : 30), f = TT.groups.length > 4 ? 14 : 17; txt(nm(t), cx0, yy, f, t === TT.mine ? '#ffd400' : i < 2 ? '#fff' : 'rgba(255,255,255,.55)', 'left', '800'); txt(s.p + ' | ' + s.pts + ' pt | ' + (s.gf - s.ga >= 0 ? '+' : '') + (s.gf - s.ga), cx0 + 370, yy, f, '#fff', 'right', '800'); });
    });
  } else {
    const last = TT.hist.length ? TT.hist[TT.hist.length - 1] : null;
    if (TT.pairs.length) { txt(koName(TT.pairs.length) + ' (te spelen)', X0 + 30, 118, 14, '#8fb0ff', 'left', '900'); TT.pairs.forEach((p, i) => txt(nm(p[0]) + '  -  ' + nm(p[1]), X0 + 30, 144 + i * 22, 15, p.includes(TT.mine) ? '#ffd400' : '#fff', 'left', '800')); }
    if (last) { txt('LAATSTE RONDE', X0 + 420, 118, 14, '#8fb0ff', 'left', '900'); last.forEach((r, i) => txt(nm(r[0]) + ' ' + r[2] + '-' + r[3] + ' ' + nm(r[1]), X0 + 420, 144 + i * 22, 15, (r[0] === TT.mine || r[1] === TT.mine) ? '#ffd400' : '#fff', 'left', '800')); }
    if (!TT.pairs.length && !last) txt('De knock-out begint na de poules.', X0 + 400, 200, 17, 'rgba(255,255,255,.7)', 'center', '700');
    if (TT.phase === 'group' && !last) txt('De knock-out begint na de poules.', X0 + 400, 300, 17, 'rgba(255,255,255,.7)', 'center', '700');
  }
}
function drawTourSetup(X0) {
  if (tourStep === 0) {
    txt('KIES EEN TOERNOOI', X0 + 400, 90, 18, '#8fb0ff', 'center', '900');
    TOURS.forEach((d, i) => {
      const y = 100 + i * 54; cx.fillStyle = 'rgba(255,255,255,.08)'; rr(X0 + 60, y, 680, 48, 8); cx.fill(); cx.fillStyle = d.c1; cx.fillRect(X0 + 60, y, 8, 48);
      txt(d.name, X0 + 90, y + 22, 20, '#fff', 'left', '900'); txt(d.sub, X0 + 90, y + 40, 13, 'rgba(255,255,255,.7)', 'left', '700');
      pill(X0 + 590, y + 6, 130, 36, 'KIES', () => { const t = tourTeams(d); if (t.length < d.n) return; tourDef = i; tourTeams0 = t; tourMine = 0; tourStep = 1; }, true, 16);
    });
    txt('Prijs bij winst: munten. Resultaten van andere wedstrijden worden gesimuleerd. Vereenvoudigd t.o.v. het echte toernooi.', X0 + 60, 548, 12, 'rgba(255,255,255,.65)', 'left', '600');
    txt('Namen van toernooien zijn eigendom van hun organisatoren: enkel voor privegebruik.', X0 + 60, 566, 12, 'rgba(255,255,255,.65)', 'left', '600');
    if (TT) pill(X0 + 560, 546, 180, 30, 'TERUG NAAR TOERNOOI', () => { tourStep = 0; tab = 0; }, false, 13);
    return;
  }
  const d = TOURS[tourDef], T = tourTeams0; txt(d.name + ': KIES JE TEAM', X0 + 400, 90, 18, '#ffd400', 'center', '900');
  const cols = 8, cw = 96, ch = 58;
  T.forEach((t, i) => {
    const x = X0 + 16 + (i % cols) * cw, y = 106 + Math.floor(i / cols) * ch, sel = i === tourMine;
    cx.fillStyle = sel ? 'rgba(255,212,0,.28)' : 'rgba(255,255,255,.07)'; rr(x, y, cw - 6, ch - 6, 6); cx.fill(); if (sel) { cx.strokeStyle = '#ffd400'; cx.lineWidth = 2; cx.stroke(); }
    crest(x + 22, y + 22, 13, t.kit, false); txt(t.kit.code, x + 62, y + 26, 15, '#fff', 'center', '900'); txt(String(t.ts), x + 62, y + 42, 12, '#ffd400', 'center', '800');
    hits.push({ x, y, w: cw - 6, h: ch - 6, fn: () => { tourMine = i; } });
  });
  txt(T[tourMine].kit.name + '  (sterkte ' + T[tourMine].ts + ')', X0 + 400, 490, 20, '#fff', 'center', '900');
  pill(X0 + 250, 510, 300, 50, 'START TOERNOOI', () => { newTour(tourDef, tourMine, tourTeams0); tourStep = 0; tab = 0; }, true, 18);
  pill(X0 + 16, 520, 120, 34, '< ANDERE', () => { tourStep = 0; }, false, 13);
}
// ---------- EAWG ALBUM: stickers verzamelen met packs die je verdient door te spelen ----------
const ALB_PER = 12, RTIER = ['GEWOON', 'ZILVER', 'GOUD', 'SPECIAAL'], RCOL = ['#c9d2e6', '#aeb8c6', '#ffcf3a', '#ff4fa3'], RBG = ['#26304f', '#2d3a55', '#4a3b10', '#4a1236'];
let AL = null, albTab = 0, albPg = 0, albSel = 0, albComp = 0, albLast = [], albMsg = '', albCache = {};
function loadAl() {
  try { const o = JSON.parse(localStorage.getItem('goalrush4')); if (o && typeof o === 'object' && o.have) { AL = o; const nh = {}; Object.keys(o.have).forEach(k => { const q = k.split('|'); const nk = q.length === 3 ? q[1] + '|' + q[2] : k; nh[nk] = Math.max(nh[nk] || 0, o.have[k]); }); AL.have = nh; return; } } catch (e) {}
  AL = { pk: 2, have: {}, day: '', pity: 0, opened: 0 };
}
function saveAl() { try { localStorage.setItem('goalrush4', JSON.stringify(AL)); } catch (e) {} }
function albAdd(n) { if (!AL) loadAl(); AL.pk = Math.round((AL.pk + n) * 10) / 10; saveAl(); }
let albCS = null, albCSk = null;
function albComps() {
  const src = ALLC || COMPS; if (albCS && albCSk === src) return albCS; albCSk = src;
  const cs = (ALLC || COMPS || []).filter(c => c.teams && c.teams.length), seen = {}, all = [];
  cs.forEach(c => c.teams.forEach(t => { if (!seen[t.name]) { seen[t.name] = 1; all.push(Object.assign({}, t, { cn: c.name })); } }));
  return albCS = cs.length ? [{ name: 'ALLE PLOEGEN', teams: all }].concat(cs) : [];
}
function albStickers(ci) {
  const cs = albComps(); if (!cs.length) return [];
  const c = cs[(ci === undefined ? albComp : ci) % cs.length]; if (albCache[c.name] && albCache[c.name].sq === !!SQUADS) return albCache[c.name].list;
  const list = [];
  c.teams.forEach((t, ti) => {
    const q = squadOf(t.name).slice().sort((a, b) => (b.star ? 1 : 0) - (a.star ? 1 : 0) || (a.n || 999) - (b.n || 999)).slice(0, ALB_PER);
    for (let i = 0; i < ALB_PER; i++) {
      const p = q[i], nm = p ? surname(p.name) : 'SPELER ' + (i + 1), id = t.name + '|' + i, h = hsh(id), v = h % 100, r = v < 70 ? 0 : v < 92 ? 1 : v < 99 ? 2 : 3;
      list.push({ id, team: t.name, cn: t.cn || c.name, ti, i, name: nm, num: p ? (p.n || 0) : 0, pos: p ? (p.pos || '') : '', r, ts: Math.max(50, Math.min(95, (t.ts || 60) + (h >>> 8) % 9 - 4 + r * 3)), kit: { name: String(t.name).slice(0, 24), code: String(t.code || t.name).slice(0, 3).toUpperCase(), shirt: t.shirt, shorts: t.shorts || '#ffffff', sock: t.sock || t.shirt, trim: t.trim || '#ffffff' } });
    }
  });
  albCache[c.name] = { sq: !!SQUADS, list }; return list;
}
const albHave = s => AL.have[s.id] || 0;
function albStats() { const L = albStickers(); let got = 0, dup = 0; L.forEach(s => { const n = albHave(s); if (n > 0) got++; if (n > 1) dup += n - 1; }); return { total: L.length, got, dup }; }
function albDraw(k) {
  const L = albStickers(), by = [0, 1, 2, 3].map(r => L.filter(s => s.r === r)), out = [];
  AL.pity++;
  for (let n = 0; n < k; n++) {
    let r = Math.random(), t = r < 0.7 ? 0 : r < 0.92 ? 1 : r < 0.99 ? 2 : 3;
    if (AL.pity >= 10 && n === k - 1 && !out.some(s => s.r >= 2)) t = Math.random() < 0.85 ? 2 : 3;
    while (t > 0 && !by[t].length) t--;
    const src = by[t].length ? by[t] : L; out.push(src[(Math.random() * src.length) | 0]);
  }
  if (out.some(s => s.r >= 2)) AL.pity = 0;
  return out;
}
const albPack = () => albStickers().length > 400 ? 10 : 5;
function albOpen() {
  if (!AL) loadAl(); if (AL.pk < 1 || !albStickers().length) return;
  AL.pk = Math.round((AL.pk - 1) * 10) / 10; AL.opened++;
  const o = albDraw(albPack()); albLast = o.map(s => ({ s, nw: albHave(s) === 0 })); o.forEach(s => { AL.have[s.id] = albHave(s) + 1; });
  albMsg = ''; saveAl();
}
function albDaily() {
  const d = today(); if (AL.day === d) return; AL.day = d; AL.pk = Math.round((AL.pk + 3) * 10) / 10; albMsg = '+3 gratis packs!'; saveAl();
}
function albSwap() {
  const L = albStickers(), miss = L.filter(s => !albHave(s)), s = miss[albSel % Math.max(1, miss.length)];
  const st = albStats(); if (!s || st.dup < 5) return;
  let need = 5; L.filter(x => albHave(x) > 1).sort((a, b) => albHave(b) - albHave(a)).forEach(x => { while (need > 0 && albHave(x) > 1) { AL.have[x.id]--; need--; } });
  AL.have[s.id] = 1; albMsg = 'Geruild: ' + s.name; saveAl();
}
function stickerCard(x, y, w, h, s, have, extra) {
  if (!have) {
    cx.fillStyle = 'rgba(255,255,255,.05)'; rr(x, y, w, h, 8); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.18)'; cx.setLineDash([5, 5]); cx.lineWidth = 1.5; cx.stroke(); cx.setLineDash([]);
    txt(String(s.i + 1), x + w / 2, y + h / 2 + 12, 34, 'rgba(255,255,255,.22)', 'center', '900'); return;
  }
  const g = cx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, RBG[s.r]); g.addColorStop(1, 'rgba(10,14,40,.95)');
  cx.fillStyle = g; rr(x, y, w, h, 8); cx.fill(); cx.strokeStyle = RCOL[s.r]; cx.lineWidth = s.r >= 2 ? 3 : 2; cx.stroke();
  if (s.r === 3) { cx.fillStyle = 'rgba(255,79,163,.18)'; rr(x, y, w, h, 8); cx.fill(); }
  if (PH[s.id]) { cx.save(); rr(x + 8, y + 26, w - 16, h * 0.52, 6); cx.clip(); cx.drawImage(PH[s.id], x + 8, y + 26, w - 16, h * 0.52); cx.restore(); } else crest(x + w / 2, y + h * 0.36, w * 0.28, s.kit, false);
  txt(String(s.ts), x + 8, y + 22, 18, RCOL[s.r], 'left', '900'); if (s.pos) txt(s.pos, x + w - 8, y + 20, 11, '#fff', 'right', '800');
  txt(s.name.length > 11 ? s.name.slice(0, 10) + '.' : s.name, x + w / 2, y + h - 30, 13, '#fff', 'center', '900');
  txt((s.num ? '#' + s.num + '  ' : '') + RTIER[s.r], x + w / 2, y + h - 12, 10, RCOL[s.r], 'center', '800');
  if (extra) extra();
}
// ---- album stap 2: eigen foto's, eigen kaarten, export, ruilcode ----
let PH = {}, albDet = null, albExp = false, albPg2 = 0, albTrade = null;
function phDB(cb) { try { const r = indexedDB.open('eawg-album', 1); r.onupgradeneeded = () => r.result.createObjectStore('ph'); r.onsuccess = () => cb(r.result); r.onerror = () => cb(null); } catch (e) { cb(null); } }
function phSet(id, url, skip) {
  if (typeof url !== 'string' || url.indexOf('data:image/jpeg;base64,') !== 0) return;
  const im = new Image(); im.onload = () => { PH[id] = im; }; im.src = url;
  if (!skip) phDB(db => { if (!db) return; try { db.transaction('ph', 'readwrite').objectStore('ph').put(url, id); } catch (e) {} });
}
function phDel(id) { delete PH[id]; phDB(db => { if (!db) return; try { db.transaction('ph', 'readwrite').objectStore('ph').delete(id); } catch (e) {} }); }
function phLoad() { phDB(db => { if (!db) return; try { const rq = db.transaction('ph').objectStore('ph').openCursor(); rq.onsuccess = () => { const c = rq.result; if (c) { phSet(c.key, c.value, true); c.continue(); } }; } catch (e) {} }); }
function phPick(id) {
  const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
  inp.onchange = () => {
    const f = inp.files && inp.files[0]; if (!f) return; if (f.size > 15e6) { albMsg = 'Bestand te groot (max 15 MB)'; return; } const rd = new FileReader();
    rd.onload = () => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); if (!im.width || !im.height) { albMsg = 'Dit bestand is geen bruikbare afbeelding'; return; } c.width = 224; c.height = 188; const g = c.getContext('2d'), s = Math.max(224 / im.width, 188 / im.height); g.drawImage(im, (224 - im.width * s) / 2, (188 - im.height * s) / 2, im.width * s, im.height * s); phSet(id, c.toDataURL('image/jpeg', 0.82)); albMsg = 'Foto toegevoegd'; }; im.onerror = () => { albMsg = 'Dit bestand is geen afbeelding'; }; im.src = rd.result; };
    rd.readAsDataURL(f);
  };
  inp.click();
}
function cardStickers() {
  return (S && S.cards || []).map((c, i) => ({ id: 'card|' + c.id, i, name: cshort(c).toUpperCase().slice(0, 14), num: 0, pos: PSH[c.pos], r: eff(c) >= 80 ? 3 : eff(c) >= 75 ? 2 : eff(c) >= 66 ? 1 : 0, ts: eff(c), team: 'MIJN KAARTEN', kit: KITS[kitSel] }));
}
function albCode() { const L = albStickers(0); return 'EA1:' + L.map(s => Math.min(9, albHave(s))).join(''); }
function albParse(code) {
  const L = albStickers(0), t = String(code || '').replace(/\s+/g, '').toUpperCase(); if (t.indexOf('EA1:') !== 0 || t.length !== 4 + L.length || !/^[0-9]+$/.test(t.slice(4))) return null;
  const th = t.slice(4).split('').map(Number), give = [], get = [];
  L.forEach((s, i) => { const m = albHave(s); if (m >= 2 && th[i] === 0) give.push(s); if (th[i] >= 2 && m === 0) get.push(s); });
  const n = Math.min(give.length, get.length); return { give: give.slice(0, n), get: get.slice(0, n), theirMiss: give.length, myMiss: get.length };
}
function albDoTrade() {
  if (!albTrade || !albTrade.give.length) return;
  albTrade.give.forEach(s => { AL.have[s.id] = Math.max(0, albHave(s) - 1); }); albTrade.get.forEach(s => { AL.have[s.id] = albHave(s) + 1; });
  albMsg = 'Geruild: ' + albTrade.give.length + ' voor ' + albTrade.get.length + '!'; albTrade = null; saveAl();
}
function domOverlay(title, text, readonly, okLabel, onOk) {
  const old = document.getElementById('albov'); if (old) old.remove();
  const d = document.createElement('div'); d.id = 'albov'; d.style.cssText = 'position:fixed;inset:0;background:rgba(2,6,20,.88);z-index:20;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font:800 18px system-ui,sans-serif;color:#fff;padding:20px;touch-action:auto;-webkit-user-select:text;user-select:text';
  const h = document.createElement('div'); h.textContent = title; const ta = document.createElement('textarea'); ta.value = text || ''; ta.readOnly = !!readonly; ta.style.cssText = 'width:min(560px,90vw);height:min(220px,40vh);font:12px monospace;border-radius:8px;padding:8px'; ta.placeholder = 'Plak hier de code';
  const row = document.createElement('div'); row.style.cssText = 'display:flex;gap:12px';
  const b = (l, f, p) => { const x = document.createElement('button'); x.textContent = l; x.style.cssText = 'font:800 18px system-ui;padding:12px 22px;border-radius:10px;border:0;background:' + (p ? '#ffd400' : '#3a4270') + ';color:' + (p ? '#0b1b4d' : '#fff'); x.onclick = f; return x; };
  row.appendChild(b(okLabel, () => { const v = ta.value; d.remove(); onOk && onOk(v); }, true)); row.appendChild(b('SLUIT', () => d.remove(), false));
  d.appendChild(h); d.appendChild(ta); d.appendChild(row); document.body.appendChild(d); if (readonly) { ta.focus(); ta.select(); }
}
function drawAlbDetail(X0) {
  const s = albDet; if (!s) return;
  cx.save(); cx.translate(X0 + 120, 120); cx.scale(1.9, 1.9); stickerCard(0, 0, 140, 200, s, true); cx.restore();
  txt(s.name, X0 + 560, 160, 30, '#fff', 'center', '900'); txt(s.team + (s.num ? '   #' + s.num : '') + '   ' + RTIER[s.r], X0 + 560, 190, 16, RCOL[s.r], 'center', '800');
  pill(X0 + 420, 230, 280, 52, PH[s.id] ? 'ANDERE FOTO KIEZEN' : 'EIGEN FOTO KIEZEN', () => phPick(s.id), true, 17);
  if (PH[s.id]) pill(X0 + 420, 296, 280, 48, 'FOTO WISSEN', () => { phDel(s.id); }, false, 17);
  pill(X0 + 420, 360, 280, 48, 'SLUIT', () => { albDet = null; albMsg = ''; }, false, 17);
  if (albMsg) txt(albMsg, X0 + 560, 440, 18, '#7dff9a', 'center', '900');
  txt('Foto blijft op dit toestel (privegebruik)', X0 + 560, 480, 14, 'rgba(255,255,255,.65)', 'center', '600');
}
function albExport() {
  if (!albExp) return; albExp = false;
  try {
    const X0 = (SW - 800) / 2, sx = (X0 + 10) * scale, sy = 112 * scale + oy, sw = 780 * scale, sh = 410 * scale, c = document.createElement('canvas'); c.width = Math.round(sw); c.height = Math.round(sh);
    c.getContext('2d').drawImage(cv, sx, sy, sw, sh, 0, 0, c.width, c.height);
    c.toBlob(b => { if (!b) return; const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = 'EAWG-album-pagina.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); albMsg = 'Afbeelding bewaard (als je toestel downloads toelaat)'; }, 'image/png');
  } catch (e) { albMsg = 'Export lukte niet'; }
}
function drawAlbum() {
  if (!AL) loadAl(); if (albExp && tab === 0) setTimeout(albExport, 0); const X0 = screenBG('ALBUM'), cs = albComps();
  if (!cs.length) { txt('Geen competitie geladen.', X0 + 400, 300, 18, '#fff', 'center', '800'); return; }
  const L = albStickers(), st = albStats(), names = ['ALBUM', 'PACKS', 'WINKEL', 'CODE', 'KAARTEN'];
  if (albDet) { drawAlbDetail(X0); return; }
  names.forEach((n, i) => pill(X0 + 8 + i * 84, 56, 80, 38, n, () => { tab = i; albMsg = ''; albTrade = null; }, tab === i, 13));
  pill(X0 + 436, 56, 348, 38, cs[albComp % cs.length].name + '   ' + st.got + ' / ' + st.total + '  (' + Math.round(st.got * 100 / Math.max(1, st.total)) + '%)', () => { albComp = (albComp + 1) % cs.length; albPg = 0; albSel = 0; albLast = []; }, false, 13);
  cx.fillStyle = 'rgba(255,255,255,.1)'; rr(X0 + 16, 100, 768, 8, 4); cx.fill(); cx.fillStyle = '#ffd400'; rr(X0 + 16, 100, Math.max(8, 768 * st.got / Math.max(1, st.total)), 8, 4); cx.fill();
  const nT = Math.ceil(L.length / ALB_PER);
  if (tab === 0) {
    if (albPg >= nT) albPg = 0; const t0 = L[albPg * ALB_PER];
    if (t0) { crest(X0 + 60, 150, 20, t0.kit, false); txt(t0.team, X0 + 100, 148, 20, '#fff', 'left', '900'); const gotT = L.slice(albPg * ALB_PER, albPg * ALB_PER + ALB_PER).filter(s => albHave(s)).length; txt(gotT + ' / ' + ALB_PER, X0 + 784, 148, 17, '#ffd400', 'right', '900'); }
    for (let i = 0; i < ALB_PER; i++) {
      const s = L[albPg * ALB_PER + i]; if (!s) continue; const x = X0 + 20 + (i % 6) * 130, y = 170 + Math.floor(i / 6) * 176, n = albHave(s);
      if (n > 0) hits.push({ x, y, w: 122, h: 168, fn: () => { albDet = s; albMsg = ''; } });
      stickerCard(x, y, 122, 168, s, n > 0, n > 1 ? () => { cx.fillStyle = '#ff3b8b'; rr(x + 78, y + 56, 38, 18, 4); cx.fill(); txt('x' + n, x + 97, y + 69, 12, '#fff', 'center', '900'); } : null);
    }
    pill(X0 + 250, 530, 60, 38, '<', () => { albPg = (albPg + nT - 1) % nT; }, false, 20); txt('PLOEG ' + (albPg + 1) + ' / ' + nT, X0 + 400, 556, 16, '#fff', 'center', '800'); pill(X0 + 490, 530, 60, 38, '>', () => { albPg = (albPg + 1) % nT; }, false, 20);
    txt('Packs: ' + Math.floor(AL.pk), X0 + 20, 556, 16, '#ffd400', 'left', '900'); txt('Tik op een sticker voor een eigen foto', X0 + 20, 580, 13, 'rgba(255,255,255,.55)', 'left', '600'); if (albMsg) txt(albMsg, X0 + 560, 584, 14, '#7dff9a', 'center', '900');
    pill(X0 + 130, 530, 100, 38, 'EXPORT', () => { albExp = true; }, false, 13);
    if (albComp === 0 && t0) pill(X0 + 590, 530, 194, 38, t0.cn.slice(0, 16) + ' >', () => { let q = albPg; do { q = (q + 1) % nT; } while (q !== albPg && L[q * ALB_PER].cn === t0.cn); albPg = q; }, false, 12);
  } else if (tab === 1) {
    txt('PACKS: ' + Math.floor(AL.pk), X0 + 400, 150, 30, '#ffd400', 'center', '900');
    txt('Pack = ' + albPack() + ' stickers. Winst 1 pack, gelijk een half, toernooi winnen 3. Elke dag 3 gratis.', X0 + 400, 178, 14, 'rgba(255,255,255,.75)', 'center', '700');
    pill(X0 + 190, 200, 200, 48, 'OPEN PACK', albOpen, AL.pk >= 1, 18); pill(X0 + 410, 200, 200, 48, AL.day === today() ? 'GRATIS: MORGEN' : '3 GRATIS PACKS', albDaily, AL.day !== today(), 16);
    if (albMsg) txt(albMsg, X0 + 400, 275, 18, '#7dff9a', 'center', '900');
    albLast.forEach((o, i) => { const m = albLast.length, big = m <= 5, sc = big ? 1 : 0.62, x = big ? X0 + 30 + i * 152 : 0, y = 295; cx.save(); if (!big) { cx.translate(X0 + 150 + (i % 5) * 100, 282 + Math.floor(i / 5) * 128); cx.scale(sc, sc); } stickerCard(big ? x : 0, big ? y : 0, 140, 200, o.s, true, () => { const bx = big ? x : 0, by = big ? y : 0; cx.fillStyle = o.nw ? '#1fbf5a' : '#ff3b8b'; rr(bx + 40, by + 108, 60, 18, 4); cx.fill(); txt(o.nw ? 'NIEUW' : 'DUBBEL', bx + 70, by + 121, 11, '#fff', 'center', '900'); }); cx.restore(); });
    txt('Pity: elke 10e pack bevat minstens 1 gouden of speciale sticker (nu ' + Math.min(AL.pity, 10) + ' / 10).', X0 + 400, 572, 13, 'rgba(255,255,255,.6)', 'center', '600');
  } else if (tab === 2) {
    const miss = L.filter(s => !albHave(s)); txt('RUILWINKEL', X0 + 400, 140, 24, '#fff', 'center', '900');
    txt('5 dubbels = 1 sticker naar keuze. Je hebt ' + st.dup + ' dubbels.', X0 + 400, 168, 15, '#ffd400', 'center', '800');
    if (!miss.length) { txt('Album compleet! Klasse.', X0 + 400, 320, 24, '#7dff9a', 'center', '900'); return; }
    const s = miss[albSel % miss.length]; albSel = albSel % miss.length;
    stickerCard(X0 + 330, 190, 140, 200, s, true, () => { cx.fillStyle = 'rgba(0,0,0,.55)'; rr(X0 + 330, 190, 140, 200, 8); cx.fill(); txt('ONTBREEKT', X0 + 400, 300, 14, '#fff', 'center', '900'); });
    pill(X0 + 240, 270, 70, 44, '<', () => { albSel = (albSel + miss.length - 1) % miss.length; }, false, 22); pill(X0 + 490, 270, 70, 44, '>', () => { albSel = (albSel + 1) % miss.length; }, false, 22);
    txt(s.team + '  (' + (albSel + 1) + ' / ' + miss.length + ')', X0 + 400, 415, 14, 'rgba(255,255,255,.75)', 'center', '700');
    pill(X0 + 270, 440, 260, 50, st.dup >= 5 ? 'RUIL 5 DUBBELS' : 'JE HEBT MINSTENS 5 DUBBELS NODIG', albSwap, st.dup >= 5, st.dup >= 5 ? 18 : 12);
    if (albMsg) txt(albMsg, X0 + 400, 520, 18, '#7dff9a', 'center', '900');
  } else if (tab === 3) {
    txt('RUILEN MET EEN VRIEND', X0 + 400, 138, 24, '#fff', 'center', '900');
    txt('Kopieer je code en stuur ze door. Plak de code van je vriend. Jullie ruilen dubbele stickers 1 voor 1.', X0 + 400, 166, 14, 'rgba(255,255,255,.75)', 'center', '700');
    pill(X0 + 120, 190, 270, 52, 'KOPIEER MIJN CODE', () => { const c = albCode(); let ok = false; try { navigator.clipboard.writeText(c).then(() => { albMsg = 'Code gekopieerd!'; }, () => domOverlay('Je code (kopieer deze tekst)', c, true, 'KLAAR')); ok = true; } catch (e) {} if (!ok) domOverlay('Je code (kopieer deze tekst)', c, true, 'KLAAR'); }, true, 17);
    pill(X0 + 410, 190, 270, 52, 'PLAK CODE VAN VRIEND', () => domOverlay('Plak de code van je vriend', '', false, 'CONTROLEER', v => { albTrade = albParse(v); albMsg = albTrade ? '' : 'Ongeldige code (zelfde album nodig)'; }), true, 17);
    if (albMsg) txt(albMsg, X0 + 400, 270, 17, albMsg.indexOf('Ongeldig') === 0 ? '#ff9a9a' : '#7dff9a', 'center', '900');
    if (albTrade) {
      const T = albTrade; txt(T.give.length ? 'Jij geeft ' + T.give.length + ', jij krijgt ' + T.get.length : 'Geen ruil mogelijk (geen passende dubbels)', X0 + 400, 304, 20, '#ffd400', 'center', '900');
      T.give.slice(0, 6).forEach((s, i) => { txt('- ' + s.name + ' (' + s.team + ')', X0 + 40, 336 + i * 24, 14, '#ff9a9a', 'left', '700'); });
      T.get.slice(0, 6).forEach((s, i) => { txt('+ ' + s.name + ' (' + s.team + ')', X0 + 430, 336 + i * 24, 14, '#7dff9a', 'left', '700'); });
      if (T.give.length) pill(X0 + 270, 500, 260, 50, 'RUIL NU', albDoTrade, true, 18);
    }
  } else {
    const cs2 = cardStickers(), per = 12, nP = Math.max(1, Math.ceil(cs2.length / per)); if (albPg2 >= nP) albPg2 = 0;
    txt('MIJN KAARTEN (uit Club): ' + cs2.length, X0 + 20, 140, 17, '#ffd400', 'left', '900');
    cs2.slice(albPg2 * per, albPg2 * per + per).forEach((s, i) => { const x = X0 + 20 + (i % 6) * 130, y = 160 + Math.floor(i / 6) * 176; hits.push({ x, y, w: 122, h: 168, fn: () => { albDet = s; albMsg = ''; } }); stickerCard(x, y, 122, 168, s, true); });
    if (nP > 1) { pill(X0 + 250, 530, 60, 38, '<', () => { albPg2 = (albPg2 + nP - 1) % nP; }, false, 20); txt('PAGINA ' + (albPg2 + 1) + ' / ' + nP, X0 + 400, 556, 16, '#fff', 'center', '800'); pill(X0 + 490, 530, 60, 38, '>', () => { albPg2 = (albPg2 + 1) % nP; }, false, 20); }
    txt('Tik op een kaart om een eigen foto te kiezen.', X0 + 20, 556, 14, 'rgba(255,255,255,.65)', 'left', '600');
  }
}

// ---------- VRIJE TRAP EN PENALTY IN 3D ----------
// Een eigen kleine 3D-wereld in meters: x opzij (rechts +), y hoogte, z richting het doel. De doellijn ligt op z = SP.dz, het doelmidden op x = 0.
// De bal ligt op (SP.bx, 0, 0). De camera staat schuin boven en achter de bal en kijkt naar het doel (draaihoek ya).
// Alles wat de uitkomst bepaalt gebruikt srnd() (vaste seed per match); netbeweging en vonkjes gebruiken Math.random.
let fk3d = 1, SP = null, spLast = null, PX = 0, PY = 0, PS = 0, PZ = 0, spTS = 1; // spTS: vertraging, alleen voor tests (__gr.spTS)
const SPRUN = 0.6, SPAIM = 7.5;
const FP = { l0: 0, l1: 0, sp: 0, arms: 0, rot: 0, hop: 0, sw: 0 }; // houding, hergebruikt per figuur (geen nieuwe objecten per beeld)
const spTrail = new Float32Array(16); let spTN = 0;
const gauss3 = () => (srnd() + srnd() + srnd() - 1.5) * 2;
function spP(x, y, z) {
  const c = SP.cam, rx = x - c.x, rz = z - c.z;
  const xr = rx * c.ca - rz * c.sa; let zr = rx * c.sa + rz * c.ca; PZ = zr; if (zr < 0.25) zr = 0.25;
  PS = c.f / zr; PX = SW / 2 + xr * PS; PY = c.hz + (c.y - y) * PS;
}
// mag deze overtreding een set piece in 3D worden? (kaart, in de zestien, of zwaar en dicht bij doel)
function spWanted(tackler, victim, card, heavy) {
  if (!fk3d || state !== 'play' || SP) return 0;
  const att = victim.t, big = !court, gxF = att === 0 ? W : 0, dU = Math.abs(gxF - victim.x), mx = big ? 0.07 : 0.05, dm = dU * mx;
  const bx = big ? 150 : 105, by = big ? 130 : 95;
  if (dU < bx && Math.abs(victim.y - H / 2) < by) return 2;          // in het strafschopgebied: penalty
  const maxD = att === 0 ? (big ? 50 : 24) : (big ? 30 : 15);         // de computer neemt alleen trappen binnen schietafstand
  if (dm > maxD) return 0;
  if (card || (heavy && dm < (big ? 30 : 15))) return 1;
  return 0;
}
function spStart(o) {
  const big = !court, att = o.att, def = 1 - att, from = o.from || 'match';
  const mx = big ? 0.07 : 0.05, my = big ? 0.113 : 0.0455;
  let dz, bx;
  if (o.pen) { dz = big ? 11 : 7; bx = 0; }
  else {
    const gxF = att === 0 ? W : 0, lat = (o.fy - H / 2) * (att === 0 ? 1 : -1);
    dz = Math.max(big ? 17 : 8, Math.min(big ? 50 : 24, Math.abs(gxF - o.fx) * mx));
    bx = Math.max(-dz * 0.9, Math.min(dz * 0.9, Math.max(big ? -22 : -9, Math.min(big ? 22 : 9, lat * my))));
  }
  const len = Math.hypot(bx, dz), fx = -bx / len, fz = dz / len;
  const pl = t => players.filter(p => p.t === t);
  let kicker = o.victim && o.victim.t === att && o.victim.i ? o.victim : pl(att).filter(p => p.i).sort((a, b) => (b.rate || 0) - (a.rate || 0))[0];
  const keeper = players.find(p => p.t === def && p.i === 0) || pl(def)[0];
  const S = SP = {
    from, pen: !!o.pen, att, def, user: att === 0, big, dz, bx, dist: len, fx, fz, rx: fz, rz: -fx,
    gw: big ? 7.32 : 4.2, gh: big ? 2.44 : 1.9, nd: big ? 2 : 1.1, wd: big ? 9.15 : 5,
    kicker, keeper, victim: o.victim || null, tackler: o.tackler || null, foul: [o.fx, o.fy], card: o.card || '',
    cam: { x: 0, y: 2.3, z: -7, ca: 1, sa: 0, f: 780, hz: 196 }, camH: big ? 2.35 : 2.0, back: big ? 6.8 : 5.6,
    t: 0, ph: 'intro', pt: 0, aim: [0, 0], pow: 0, chg: false, cv: 0, mode: 'shot', aimId: null, chgId: null, effId: null, lx: 0, ly: 0,
    dv: null, dvx: 0, dvy: 1, cw: 0, wall: [], wj: false, others: [], mate: null,
    fl: null, ft: 0, ct: -1, ev: false, free: false, b: { x: bx, y: 0.11, z: 0, vx: 0, vy: 0, vz: 0, rot: 0 },
    out: '', catch: false, nb: 0, nbx: 0, nby: 0, rt: 0, ks: [0, 0], kc: [0, 0], res: '', resC: '#ffd400'
  };
  S.f = 780 * Math.min(1.3, 1 + Math.max(0, dz - 11) * 0.012); S.cam.f = S.f;
  S.aim[0] = S.pen ? S.gw * 0.27 * (srnd() < 0.5 ? -1 : 1) : (bx >= 0 ? -1 : 1) * S.gw * 0.3; S.aim[1] = S.pen ? S.gh * 0.4 : S.gh * 0.78;
  if (!S.pen && S.user && dz > (big ? 32 : 16)) S.mode = 'pass';
  // aanloop: links achter de bal, eindigt naast de bal (rechtsvoetig)
  S.ks[0] = bx - fx * 1.9 - S.rx * 1.3; S.ks[1] = -fz * 1.9 - S.rz * 1.3;
  S.kc[0] = bx - fx * 0.5 - S.rx * 0.38; S.kc[1] = -fz * 0.5 - S.rz * 0.38;
  // muur
  if (!S.pen) {
    const n0 = big ? (dz < 20 ? 5 : dz < 26 ? 4 : 3) : (dz < 11 ? 3 : 2);
    const defs = pl(def).filter(p => p.i && p !== o.tackler).concat(o.tackler && o.tackler.i ? [o.tackler] : []);
    const n = Math.min(n0, defs.length);
    let ax, az, out;
    if (Math.abs(bx) < 1) { ax = bx + fx * S.wd; az = fz * S.wd; out = srnd() < 0.5 ? 1 : -1; }
    else { const np = (bx > 0 ? 1 : -1) * S.gw / 2, ux = np - bx, uz = dz, ul = Math.hypot(ux, uz); ax = bx + ux / ul * S.wd; az = uz / ul * S.wd; out = bx > 0 ? 1 : -1; }
    for (let k = 0; k < n; k++) {
      const off = Math.abs(bx) < 1 ? (k - (n - 1) / 2) * 0.58 + out * 0.35 : out * 0.32 - out * 0.58 * k;
      const x = ax + S.rx * off, z = az + S.rz * off;
      S.wall.push({ p: defs[k], x, z, l: (x - bx) * S.rx + z * S.rz, ph: Math.random() * 6 });
    }
    const rest = defs.slice(n).slice(0, 2), ds = big ? [[-1.8, -6.4], [2.6, -8.3]] : [[-1, -2.6], [1.4, -3.4]];
    rest.forEach((p, i) => S.others.push({ p, x: ds[i][0], z: dz + ds[i][1], back: false, ph: Math.random() * 6 }));
    const mates = pl(att).filter(p => p.i && p !== kicker), as = big ? [[-2.6, -7], [1.6, -9.2], [4.6, -6]] : [[-1.4, -2.4], [1.8, -3.8]];
    if (mates.length) { const m = mates[0]; S.mate = { p: m, x: bx + S.rx * 3.4 + fx * 1.2, z: S.rz * 3.4 + fz * 1.2, back: true, ph: Math.random() * 6 }; S.others.push(S.mate); }
    mates.slice(1, 1 + as.length).forEach((p, i) => S.others.push({ p, x: as[i][0], z: dz + as[i][1], back: true, ph: Math.random() * 6 }));
  }
  if (!S.user) S.cw = 1.3 + srnd() * 1.0;
  ban = null; charging = false; joy.id = null; joy.vx = joy.vy = 0; spTN = 0;
  state = 'sp'; whistle(0.5); swell(0.3, 2);
  spCam();
  return S;
}
function spCam() {
  const S = SP, c = S.cam, k = Math.min(1, S.t / 0.9), e = 1 - Math.pow(1 - k, 3);
  let back = S.back + (1 - e) * 4.5, up = S.camH + (1 - e) * 1.8;
  if (S.ph === 'fly' || S.ph === 'res') { const q = Math.min(1, S.ft / 0.8); back -= q * 1.2; }
  c.x = S.bx - S.fx * back + S.rx * 0.5; c.z = -S.fz * back + S.rz * 0.5; c.y = up;
  let lx = -c.x, lz = S.dz - c.z;
  if (S.fl && (S.ph === 'fly' || S.ph === 'res')) { const q = Math.min(1, S.ft / 0.6) * 0.35; lx += (S.b.x - lx - c.x) * q * 0.4; }
  const a = Math.atan2(lx, lz); c.ca = Math.cos(a); c.sa = Math.sin(a); c.f = S.f; c.hz = 196 + (1 - e) * 26;
}
// balbaan: s van 0 (bal) tot 1 (doellijn)
function spPath(s, o) {
  const F = SP.fl, h = 4 * s * (1 - s);
  o.x = SP.bx + (F.tx - SP.bx) * s + F.bend * h; o.z = SP.dz * s; o.y = 0.11 + (F.ty - 0.11) * s + F.A * h;
}
const SPQ = { x: 0, y: 0, z: 0 };
// bepaalt de uitkomst van een trap (eenmalig, met srnd) en zet de vlucht klaar
function spLaunch(tx, ty, pw, cv, pass) {
  const S = SP, rate = S.kicker ? (S.kicker.rate || 60) : 60;
  S.ct = S.t; S.ft = 0; S.ev = false; S.free = false; spTN = 0;
  if (pass && S.mate) {
    S.fl = { tx: S.mate.x - S.fx * 0.4, ty: 0.11, T: 0.75, A: 0, bend: 0, pw: 0.3, pass: true, tz: S.mate.z };
    S.out = 'PASS'; S.se = 1; S.dvx = 0; S.dvy = 1; return;
  }
  const sd = (0.12 + 0.5 * pw * pw + S.dist * 0.011) * Math.max(0.6, 1.3 - (rate - 60) * 0.012) * (!S.user && !S.pen ? 1.3 : 1);
  tx += gauss3() * sd; ty += gauss3() * sd * 0.75; if (ty < 0.11) ty = 0.11;
  const spd = 17 + 15 * pw, len = Math.hypot(tx - S.bx, S.dz), T = len / spd;
  const A = S.pen ? 0.12 + 0.25 * (1 - pw) : (0.8 + S.dist * 0.03) * (1.3 - 0.65 * pw);
  const bend = S.pen ? cv * 0.3 : cv * S.dist * 0.075;
  S.fl = { tx, ty, T, A, bend, pw, pass: false };
  let out = '', se = 1;
  S.wj = S.wall.length > 0 && srnd() < 0.75;
  if (S.wall.length) {
    let lo = 1e9, hi = -1e9; for (const m of S.wall) { lo = Math.min(lo, m.l); hi = Math.max(hi, m.l); }
    for (let i = 1; i <= 40; i++) {
      const s = i / 40; spPath(s, SPQ);
      if ((SPQ.x - S.bx) * S.fx + SPQ.z * S.fz >= S.wd) {
        const l = (SPQ.x - S.bx) * S.rx + SPQ.z * S.rz, top = 1.85 + (S.wj ? 0.4 : 0), bot = S.wj ? 0.28 : 0;
        if (l > lo - 0.34 && l < hi + 0.34 && SPQ.y < top && SPQ.y > bot) { out = 'MUUR'; se = s; }
        break;
      }
    }
  }
  const g2 = S.gw / 2, gh = S.gh, R = 0.11, pst = 0.06;
  if (!out) {
    const Rp = R * 0.75;
    if (Math.abs(ty - gh) <= Rp + pst && Math.abs(tx) <= g2 + pst) out = 'LAT';
    else if (Math.abs(Math.abs(tx) - g2) <= Rp + pst && ty <= gh + pst) out = 'PAAL';
    else if (Math.abs(tx) > g2 || ty > gh) out = ty > gh ? 'OVER' : 'NAAST';
  }
  // keeper
  const kr = S.keeper ? (S.keeper.rate || 60) : 60, ac = Math.abs(tx);
  if (S.user) {
    const fk = S.pen ? 0 : 0.18 + Math.max(0, S.dist - 17) * 0.006;
    const read = srnd() < Math.max(0.2, Math.min(0.75, 0.3 + (kr - 60) * 0.008 + fk)), stay = !read && srnd() < 0.2;
    const corner = Math.max(0, Math.min(1, (ac - 1.2) / 2.3)) * 0.6 + ((ty > gh * 0.7 || ty < 0.45) && ac > g2 * 0.5 ? 0.4 : 0);
    let pSave;
    if (read) pSave = 0.92 - corner * 0.55 - pw * 0.3 + (kr - 65) * 0.01 + fk;
    else if (stay) pSave = ac < 1 ? 0.8 : 0.03;
    else pSave = ac < 0.7 && ty < 1.2 ? 0.35 : 0.02;
    pSave = Math.max(0.03, Math.min(0.92, pSave));
    const saved = srnd() < pSave;
    if (read) { S.dvx = tx; S.dvy = ty; } else if (stay) { S.dvx = 0; S.dvy = 0.9; } else { const sg = tx >= 0 ? -1 : 1; S.dvx = sg * g2 * (0.45 + srnd() * 0.4); S.dvy = 0.3 + srnd() * gh * 0.7; }
    if (!out) { if (saved) { out = 'GERED'; S.dvx = tx; S.dvy = ty; } else { out = 'GOAL'; if (read) { S.dvx = tx * 0.72; S.dvy = ty * 0.85; } } }
  } else {
    const dvx = S.dv ? S.dv[0] : 0, dvy = S.dv ? S.dv[1] : 0.9; S.dvx = dvx; S.dvy = dvy;
    const dd = Math.hypot(dvx - tx, (dvy - ty) * 1.2), Rr = 1.05 + (kr - 60) * 0.01 + (1 - pw) * 0.35 + (S.pen ? 0 : 0.4);
    const pS = dd < Rr ? 0.88 : dd < Rr * 1.4 ? 0.3 : 0;
    if (!out) out = srnd() < pS ? 'GERED' : 'GOAL';
    if (out === 'GERED') { S.dvx = tx; S.dvy = ty; }
  }
  S.catch = out === 'GERED' && pw < 0.62 && ac < g2 * 0.6 && srnd() < 0.7;
  S.out = out; S.se = se;
}
function spUserShoot() {
  const S = SP; if (!S || S.ph !== 'aim' || !S.user) return;
  S.chg = false; S.chgId = null; S.ph = 'run'; S.pt = 0; S.pw0 = Math.max(0.25, Math.min(1, S.pow));
}
function spSkip() {
  const S = SP; if (!S) return;
  if (S.ph === 'intro' || S.ph === 'aim') {
    if (S.user) { spFinish('SKIP'); return; }
    S.dv = S.dv || null; spCpuAim(); spLaunch(S.aim[0], S.aim[1], S.pw0, S.cv, false); spFinish(S.out); return;
  }
  if (S.ph === 'run') { if (!S.fl) { if (S.user) spLaunch(S.aim[0], S.aim[1], S.pw0, S.cv, S.mode === 'pass'); else spLaunch(S.aim[0], S.aim[1], S.pw0, S.cv, false); } }
  spFinish(S.out);
}
function spCpuAim() {
  const S = SP;
  if (S.pen) { const sg = srnd() < 0.5 ? -1 : 1; S.aim[0] = sg * (S.gw / 2) * (0.3 + srnd() * 0.6); S.aim[1] = 0.25 + srnd() * S.gh * 0.7; S.pw0 = 0.5 + srnd() * 0.45; S.cv = 0; return; }
  // vrije trap: meestal over de muur naar de verre hoek, met krul
  const far = Math.abs(S.bx) < 1 ? (srnd() < 0.5 ? -1 : 1) : (S.bx > 0 ? -1 : 1), sg = srnd() < 0.75 ? far : -far;
  S.aim[0] = sg * (S.gw / 2) * (0.25 + srnd() * 0.5); S.aim[1] = S.gh * (0.45 + srnd() * 0.4);
  S.pw0 = 0.45 + srnd() * 0.35; S.cv = sg * (0.2 + srnd() * 0.6);
}
function spUpdate(dt) {
  const S = SP; if (!S) { state = 'play'; return; }
  if (document.body.classList.contains('portrait')) return;   // gsm rechtop: set piece wacht
  dt *= spTS;
  S.t += dt; S.pt += dt; S.nb *= Math.pow(0.02, dt);
  if (S.ph === 'intro' && S.pt >= 0.9) { S.ph = 'aim'; S.pt = 0; }
  else if (S.ph === 'aim') {
    if (S.user) {
      const ax = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0), ay = (keys.ArrowUp || keys.KeyW ? 1 : 0) - (keys.ArrowDown || keys.KeyS ? 1 : 0);
      if (ax || ay) { S.aim[0] = Math.max(-S.gw / 2 - 2.5, Math.min(S.gw / 2 + 2.5, S.aim[0] + ax * 3.2 * dt)); S.aim[1] = Math.max(0, Math.min(S.gh + 1.6, S.aim[1] + ay * 2.4 * dt)); }
      if (S.chg) S.pow = Math.min(1, S.pow + dt / 0.9);
      if (S.pt >= SPAIM) { if (S.pow < 0.3) S.pow = 0.6; spUserShoot(); }
    } else if (S.pt >= S.cw) { spCpuAim(); S.ph = 'run'; S.pt = 0; }
  } else if (S.ph === 'run') {
    if (S.pt >= SPRUN) {
      if (S.user) spLaunch(S.aim[0], S.aim[1], S.pw0, S.cv, S.mode === 'pass'); else spLaunch(S.aim[0], S.aim[1], S.pw0, S.cv, false);
      thud(0.5); S.ph = 'fly'; S.pt = 0;
    }
  } else if (S.ph === 'fly' || S.ph === 'res') spFly(dt);
  if (S.ph === 'res' && S.pt >= (S.out === 'GOAL' ? 2.0 : S.out === 'PASS' ? 0.7 : 1.6)) { spFinish(S.out); return; }
  spCam();
}
function spFly(dt) {
  const S = SP, F = S.fl, b = S.b;
  S.ft += dt;
  if (!S.free) {
    const s = F.T > 0 ? S.ft / F.T : 1;
    if (s < S.se) { spPath(s, b); if (F.pass) b.z = F.tz * s; b.rot += dt * (8 + F.pw * 18); }
    else {
      const s0 = Math.max(0, S.se - 0.02); spPath(s0, SPQ); spPath(S.se, b); if (F.pass) { SPQ.z = F.tz * s0; b.z = F.tz * S.se; }
      const k = 1 / (0.02 * F.T || 0.01); b.vx = (b.x - SPQ.x) * k; b.vy = (b.y - SPQ.y) * k; b.vz = (b.z - SPQ.z) * k;
      S.free = true; S.ev = true; S.et = 0;
      const o = S.out;
      if (o === 'PASS') { b.vx = b.vy = b.vz = 0; }
      else if (o === 'MUUR') { b.vx *= -0.25; b.vz *= -0.3; b.vy = 2.8; thud(0.45); }
      else if (o === 'GERED') { if (S.catch) { b.vx = b.vy = b.vz = 0; } else { b.vx = (b.x >= 0 ? 1 : -1) * 5; b.vy = 3.5; b.vz = -5; } thud(0.35); }
      else if (o === 'PAAL' || o === 'LAT') { b.vx *= -0.35; b.vz *= -0.45; b.vy = o === 'LAT' ? -2 : 2; thud(0.6); buzz(30); }
      else if (o === 'GOAL') { b.vx *= 0.6; b.vz *= 0.6; b.vy *= 0.6; }
      if (S.ph !== 'res' && (o === 'MUUR' || o === 'GERED' || o === 'PASS')) spRes();
    }
  } else {
    S.et += dt;
    if (S.out === 'GERED' && S.catch) { spKeeperHands(); b.x = SPQ.x; b.y = SPQ.y; b.z = SPQ.z; }
    else if (!(S.out === 'PASS')) {
      b.vy -= 9.8 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.rot += dt * 6;
      if (b.y < 0.11) { b.y = 0.11; b.vy = Math.abs(b.vy) * 0.45; if (b.vy < 0.4) b.vy = 0; b.vx *= 0.8; b.vz *= 0.8; }
      if (S.out === 'GOAL' && b.z > S.dz + S.nd * 0.82) { b.z = S.dz + S.nd * 0.82; if (b.vz > 0) { S.nb = Math.min(1, 0.4 + Math.abs(b.vz) / 30); S.nbx = b.x; S.nby = b.y; b.vz = -0.6; b.vx *= 0.2; } }
    }
    if (S.ph !== 'res' && S.et > (S.out === 'GOAL' ? 0.08 : 0.35)) spRes();
  }
  if (Q < 2) { spP(b.x, b.y, b.z); if (spTN < 8) spTN++; spTrail.copyWithin(2, 0, 14); spTrail[0] = PX; spTrail[1] = PY; }
}
function spRes() {
  const S = SP; S.ph = 'res'; S.pt = 0;
  const mine = S.user, o = S.out;
  const T = { GOAL: 'GOAL!', GERED: 'GERED!', MUUR: 'IN DE MUUR!', PAAL: 'OP DE PAAL!', LAT: 'OP DE LAT!', NAAST: 'NAAST!', OVER: 'OVER!', PASS: 'KORTE PASS' };
  S.res = mine ? T[o] : (o === 'GOAL' ? 'GOAL TEGEN' : o === 'GERED' ? 'GERED! TOPREDDING' : T[o]);
  const good = mine ? o === 'GOAL' || o === 'PASS' : o !== 'GOAL';
  S.resC = good ? '#ffd400' : '#ff9a9a';
  if (o === 'GOAL') { if (mine) { confetti(); buzz([30, 40, 60]); } whistle(0.6); swell(mine ? 0.7 : 0.45, 3); shakeT = 0.35; }
  else if (good && o !== 'PASS') { swell(0.5, 2); buzz(25); }
}
// keeperhanden (wereldpositie in SPQ)
const SPK = { x: 0, z: 0, rot: 0, hop: 0, k: 0 };
function spKeeperPose() {
  const S = SP, g2 = S.gw / 2; let k = 0;
  if (S.ct >= 0) k = Math.max(0, Math.min(1, (S.t - S.ct - 0.05) / 0.38));
  const e = 1 - Math.pow(1 - k, 2), tx = Math.max(-g2 - 0.4, Math.min(g2 + 0.4, S.dvx)), ty = Math.max(0.2, Math.min(S.gh + 0.2, S.dvy));
  const sway = S.ct < 0 ? Math.sin(S.t * 2.4) * 0.35 : 0;
  const h = Math.abs(tx), sg = tx >= 0 ? 1 : -1, fs = Math.min(0.8, h * 0.3), hr = Math.max(0, h - fs);
  let th = Math.min(1.45, Math.atan2(hr, Math.max(0.2, ty))); if (h < 0.6) th = 0;
  const hop = h < 0.6 ? Math.max(0, ty - 1.7) * 0.8 : Math.max(0, Math.min(0.9, ty - 2.1 * Math.cos(th)));
  SPK.x = sway * (1 - e) + sg * fs * e; SPK.z = S.dz - 0.35; SPK.rot = sg * th * e; SPK.hop = hop * e; SPK.k = k;
}
function spKeeperHands() {
  spKeeperPose(); const r = 2.0;
  SPQ.x = SPK.x + Math.sin(SPK.rot) * r; SPQ.y = SPK.hop + Math.cos(SPK.rot) * r * (SPK.k > 0 && Math.abs(SPK.rot) < 0.1 ? 0.62 : 1); SPQ.z = SPK.z + 0.25;
}
function spFinish(out) {
  const S = SP; if (!S) return;
  spLast = { out, pen: S.pen, user: S.user, dz: Math.round(S.dz * 10) / 10, bx: Math.round(S.bx * 10) / 10, wall: S.wall.length, from: S.from };
  SP = null; parts = [];
  if (S.from === 'oefen') {
    if (!PR) penNew();
    if (out === 'SKIP') { state = 'pen'; return; }
    PR.hist.push(out === 'GOAL' ? 1 : 0); PR.round++; if (out === 'GOAL') PR.goals++;
    if (PR.round >= 5) { PR.done = true; state = 'pen'; econDay(); } else spPractice();
    return;
  }
  state = 'play'; ban = null; charging = false; joy.id = null; joy.vx = joy.vy = 0;
  for (const p of players) { p.vx = p.vy = 0; p.sl = 0; }
  const att = S.att, def = S.def, v = S.victim && S.victim.t === att ? S.victim : S.kicker, gk = players.find(p => p.t === def && p.i === 0);
  const gxD = def === 0 ? 0 : W, dirIn = def === 0 ? 1 : -1;   // doellijn van de verdediger en de richting het veld in
  if (v && S.foul[0] != null) { v.x = Math.max(20, Math.min(W - 20, S.foul[0])); v.y = Math.max(20, Math.min(H - 20, S.foul[1])); }
  ball.z = ball.vz = 0; ball.trail = []; ball.vx = ball.vy = 0;
  const give = (p, hold) => { ball.owner = p; p.hold = hold || 0; p.cd = 0; ball.lt = p.t; ball.x = p.x + p.fx * 15; ball.y = p.y + p.fy * 15; };
  if (out === 'GOAL') { lastKicker = S.kicker || lastKicker; ball.owner = null; goal(att); msgT = 1.4; return; }
  if (out === 'SKIP' || !v) { if (v) { give(v, 0); v.cd = 0; } return; }
  if (out === 'PASS') {
    const m = (S.mate && S.mate.p) || v; if (m !== v) { m.x = Math.max(20, Math.min(W - 20, v.x + (att === 0 ? -30 : 30))); m.y = Math.max(20, Math.min(H - 20, v.y + (v.y < H / 2 ? 70 : -70))); }
    give(m, 0); return;
  }
  if (out === 'GERED' && S.catch && gk) { gk.x = gxD + dirIn * 40; gk.y = H / 2; gk.fx = dirIn; gk.fy = 0; give(gk, -0.3); return; }
  if (out === 'NAAST' || out === 'OVER') { ball.owner = null; ball.lt = att; ball.x = gxD - dirIn * 5; ball.y = H / 2 + (S.fl && S.fl.tx > 0 ? 1 : -1) * GW; restartOut('end'); return; }
  // los balletje: muur, paal, lat of weggestompt
  ball.owner = null; ball.lt = out === 'MUUR' || out === 'GERED' ? def : att;
  if (out === 'MUUR') { const mx = court ? 0.05 : 0.07; ball.x = v.x - (att === 0 ? -1 : 1) * Math.min(S.wd / mx, 140) * 0.9; ball.y = v.y; ball.vx = (att === 0 ? -1 : 1) * 160; ball.vy = (Math.random() - 0.5) * 40; }
  else { ball.x = gxD + dirIn * 45; ball.y = H / 2 + (S.fl && S.fl.tx >= 0 ? 1 : -1) * GW * 0.6 * (att === 0 ? 1 : -1); ball.vx = dirIn * 230; ball.vy = (ball.y - H / 2) * 1.2; }
  ball.x = Math.max(12, Math.min(W - 12, ball.x)); ball.y = Math.max(12, Math.min(H - 12, ball.y));
}
function spPractice() {
  if (court) setCourt(null);
  if (players.length !== NP * 2) { setForm(); mk(); }
  const kk = players.find(p => p.t === 0 && p.i === NP - 1);
  spStart({ pen: true, att: 0, victim: kk, from: 'oefen', fx: null, fy: null });
}
// ---------- invoer ----------
function spBtn() { return [SW - 112, 468, 64]; }
function spDown(x, y, id) {
  const S = SP; if (!S) return;
  if (S.ph !== 'intro' && S.ph !== 'aim' && !(S.ph === 'run' && !S.user)) return;
  if (!S.user) { S.aimId = id; spDive(x, y); return; }
  if (S.ph !== 'aim') return;
  const b = spBtn();
  if (Math.hypot(x - b[0], y - b[1]) < b[2] + 14) { S.chg = true; S.chgId = id; if (S.pow > 0.98) S.pow = 0; return; }
  if (S.mode === 'shot' && Math.hypot(x - 100, y - 482) < 62) { S.effId = id; S.lx = x; return; }
  S.aimId = id; S.lx = x; S.ly = y;
}
function spMove(x, y, id) {
  const S = SP; if (!S) return;
  if (!S.user) { if (id === S.aimId) spDive(x, y); return; }
  if (id === S.aimId && S.ph === 'aim') {
    spP(0, 0, S.dz); const k = 1.15 / Math.max(20, PS);
    S.aim[0] = Math.max(-S.gw / 2 - 2.5, Math.min(S.gw / 2 + 2.5, S.aim[0] + (x - S.lx) * k));
    S.aim[1] = Math.max(0, Math.min(S.gh + 1.6, S.aim[1] - (y - S.ly) * k));
    S.lx = x; S.ly = y;
  } else if (id === S.effId) { S.cv = Math.max(-1, Math.min(1, S.cv + (x - S.lx) / 46)); S.lx = x; }
}
function spUp(id) {
  const S = SP; if (!S) return;
  if (id === S.chgId) { S.chgId = null; if (S.chg && S.ph === 'aim') spUserShoot(); S.chg = false; }
  if (id === S.aimId) S.aimId = null; if (id === S.effId) S.effId = null;
}
function spDive(x, y) {
  const S = SP; if (!S || S.user || S.ct >= 0) return;
  spP(-S.gw / 2, 0, S.dz); const x0 = PX, y0 = PY, s0 = PS; spP(S.gw / 2, 0, S.dz);
  const gx = (x - (x0 + PX) / 2) / s0, gy = (y0 - y) / s0;
  S.dv = [Math.max(-S.gw / 2 - 0.3, Math.min(S.gw / 2 + 0.3, gx)), Math.max(0.15, Math.min(S.gh + 0.2, gy))];
}
function spKey(code, down) {
  const S = SP; if (!S) return;
  if (!down) { if ((code === 'Space' || code === 'Enter') && S.chgId === 'kb') spUp('kb'); return; }
  if (code === 'Escape' || code === 'Backspace') { spSkip(); return; }
  if (!S.user) {
    if (S.ct >= 0) return; const g = S.gw / 2; let dx = S.dv ? S.dv[0] : 0, dy = S.dv ? S.dv[1] : 0.9;
    if (code === 'ArrowLeft' || code === 'KeyA') dx = -g * 0.75; else if (code === 'ArrowRight' || code === 'KeyD') dx = g * 0.75;
    else if (code === 'ArrowUp' || code === 'KeyW') dy = S.gh * 0.85; else if (code === 'ArrowDown' || code === 'KeyS') dy = 0.4; else if (code === 'Space') { dx = 0; dy = 0.9; } else return;
    S.dv = [dx, dy]; return;
  }
  if (S.ph !== 'aim') return;
  if (code === 'Space' || code === 'Enter') { S.chg = true; S.chgId = 'kb'; }
  else if ((code === 'KeyP' || code === 'Tab') && !S.pen && S.mate) S.mode = S.mode === 'pass' ? 'shot' : 'pass';
  else if (code === 'KeyQ') S.cv = Math.max(-1, S.cv - 0.25); else if (code === 'KeyE') S.cv = Math.min(1, S.cv + 0.25);
}
// ---------- tekenen ----------
function spSeg(x1, z1, x2, z2) {
  const c = SP.cam, N = 0.6;
  const a = (x1 - c.x) * c.sa + (z1 - c.z) * c.ca, b = (x2 - c.x) * c.sa + (z2 - c.z) * c.ca;
  if (a < N && b < N) return;
  if (a < N) { const t = (N - a) / (b - a); x1 += (x2 - x1) * t; z1 += (z2 - z1) * t; }
  else if (b < N) { const t = (N - b) / (a - b); x2 += (x1 - x2) * t; z2 += (z1 - z2) * t; }
  spP(x1, 0, z1); cx.moveTo(PX, PY); spP(x2, 0, z2); cx.lineTo(PX, PY);
}
// vlak met 4 hoeken (a, b, c, d); grond: y = 0, wand: z vast. Hoeken achter de camera: niet tekenen.
function spQ4(ax, ay, az, bx, by, bz, qx, qy, qz, dx, dy, dz, col) {
  spP(ax, ay, az); if (PZ < 0.6) return; const x1 = PX, y1 = PY; spP(bx, by, bz); if (PZ < 0.6) return; const x2 = PX, y2 = PY;
  spP(qx, qy, qz); if (PZ < 0.6) return; const x3 = PX, y3 = PY; spP(dx, dy, dz); if (PZ < 0.6) return;
  cx.fillStyle = col; cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.lineTo(x3, y3); cx.lineTo(PX, PY); cx.closePath(); cx.fill();
}
const spGQ = (x0, x1, z0, z1, col) => spQ4(x0, 0, z0, x1, 0, z0, x1, 0, z1, x0, 0, z1, col);
const spVQ = (x0, x1, z, y0, y1, col) => spQ4(x0, y0, z, x1, y0, z, x1, y1, z, x0, y1, z, col);
function spGround() {
  const S = SP, c = S.cam, big = S.big;
  const base = court ? court.floor : '#2b8a3e', alt = court ? (court.floor2 || court.floor) : '#33994a';
  // tribune of muur achter het doel: achtergrond eindigt waar de boarding begint
  const bd = S.dz + (big ? 5 : 2.6), bh = big ? 0.95 : 1.3;
  spP(0, bh, bd); const top = Math.max(60, Math.min(c.hz + 10, PY));
  cx.fillStyle = court ? court.sky[0] : '#05070f'; cx.fillRect(0, 0, SW, top);
  const bw = bg.width / bgk, bhh = bg.height / bgk, off = Math.max(-360, Math.min(0, -180 - Math.atan2(c.sa, c.ca) * 260));
  cx.imageSmoothingQuality = 'low'; cx.drawImage(bg, off, top - bhh, bw, bhh); cx.imageSmoothingQuality = 'high';
  const g = cx.createLinearGradient(0, top, 0, VH); g.addColorStop(0, dark(base, 0.35)); g.addColorStop(0.35, base); g.addColorStop(1, lit(base, 0.06));
  cx.fillStyle = g; cx.fillRect(0, top, SW, VH - top);
  if (Q < 2 && big) { for (let k = 0; k < 12; k += 2) { const z1 = S.dz - k * 5, z0 = z1 - 5; spGQ(-38, 38, z0, z1, alt); } }
  // lijnen
  cx.strokeStyle = court ? court.line : 'rgba(255,255,255,.9)'; cx.lineWidth = 2.2; cx.beginPath();
  const dz = S.dz;
  if (big) {
    spSeg(-40, dz, 40, dz); spSeg(-20.16, dz, -20.16, dz - 16.5); spSeg(20.16, dz, 20.16, dz - 16.5); spSeg(-20.16, dz - 16.5, 20.16, dz - 16.5);
    spSeg(-9.16, dz, -9.16, dz - 5.5); spSeg(9.16, dz, 9.16, dz - 5.5); spSeg(-9.16, dz - 5.5, 9.16, dz - 5.5);
    let px = 0, pz = 0; for (let i = 0; i <= 12; i++) { const a = -0.927 + i / 12 * 1.854, x = Math.sin(a) * 9.15, z = dz - 11 - Math.cos(a) * 9.15; if (i) spSeg(px, pz, x, z); px = x; pz = z; }
  } else { spSeg(-20, dz, 20, dz); spSeg(-4.3, dz, -4.3, dz - 5.2); spSeg(4.3, dz, 4.3, dz - 5.2); spSeg(-4.3, dz - 5.2, 4.3, dz - 5.2); }
  cx.stroke();
  spP(0, 0, dz - (big ? 11 : 7)); if (PZ > 0.6) { cx.fillStyle = court ? court.line : 'rgba(255,255,255,.92)'; cx.beginPath(); cx.ellipse(PX, PY, 0.14 * PS, 0.05 * PS, 0, 0, 6.2832); cx.fill(); }
  // boarding / muur achter het doel
  spVQ(-45, 45, bd, 0, bh, big ? '#0b2f86' : dark(court.floor2 || court.floor, 0.55));
  if (big && Q < 2) { cx.fillStyle = 'rgba(255,255,255,.55)'; spP(-45, bh, bd); const y1 = PY; spP(45, bh, bd); cx.fillRect(0, Math.min(y1, PY), SW, 1.5);
    for (let x = -40; x <= 40; x += 9) { spP(x, bh * 0.32, bd); if (PX > -100 && PX < SW + 100) txt('EAWG MOBILE', PX, PY, Math.max(6, 0.42 * PS), '#fff', 'center', '900'); } }
}
// net: achterwand, zijkanten en dak, met een bult waar de bal binnenvliegt
function spNetZ(x, y) { const S = SP; if (S.nb < 0.01) return 0; const d = (x - S.nbx) * (x - S.nbx) + (y - S.nby) * (y - S.nby); return S.nb * 0.75 * Math.exp(-d / 0.9) * (1 + 0.25 * Math.sin(S.t * 22)); }
function spNet() {
  const S = SP, g2 = S.gw / 2, gh = S.gh, z0 = S.dz, z1 = S.dz + S.nd, h2 = gh * 0.82, nx = Q >= 2 ? 6 : Q ? 9 : 12, ny = Q >= 2 ? 3 : 5;
  spVQ(-g2, g2, z1, 0, h2, 'rgba(255,255,255,.08)');
  cx.strokeStyle = 'rgba(255,255,255,.42)'; cx.lineWidth = 1; cx.beginPath();
  for (let i = 0; i <= nx; i++) { const x = -g2 + i / nx * S.gw; for (let j = 0; j <= ny; j++) { const y = j / ny * h2; spP(x, y, z1 + spNetZ(x, y)); j ? cx.lineTo(PX, PY) : cx.moveTo(PX, PY); } }
  for (let j = 0; j <= ny; j++) { const y = j / ny * h2; for (let i = 0; i <= nx; i++) { const x = -g2 + i / nx * S.gw; spP(x, y, z1 + spNetZ(x, y)); i ? cx.lineTo(PX, PY) : cx.moveTo(PX, PY); } }
  // zijkanten en dak
  for (let i = 0; i <= 4; i++) { const z = z0 + i / 4 * S.nd, y = gh + (h2 - gh) * i / 4; for (const sx of [-g2, g2]) { spP(sx, 0, z); cx.moveTo(PX, PY); spP(sx, y, z); cx.lineTo(PX, PY); } spP(-g2, y, z); cx.moveTo(PX, PY); spP(g2, y, z); cx.lineTo(PX, PY); }
  for (let j = 1; j < ny; j++) { const y = j / ny * gh; for (const sx of [-g2, g2]) { spP(sx, y, z0); cx.moveTo(PX, PY); spP(sx, y * h2 / gh, z1); cx.lineTo(PX, PY); } }
  for (let i = 1; i < nx; i++) { const x = -g2 + i / nx * S.gw; spP(x, gh, z0); cx.moveTo(PX, PY); spP(x, h2, z1); cx.lineTo(PX, PY); }
  cx.stroke();
}
function spFrame() {
  const S = SP, g2 = S.gw / 2, gh = S.gh, z = S.dz;
  spP(0, gh, z); cx.strokeStyle = '#f4f6fa'; cx.lineWidth = Math.max(2.5, 0.12 * PS); cx.lineCap = 'round'; cx.beginPath();
  spP(-g2, 0, z); cx.moveTo(PX, PY); spP(-g2, gh, z); cx.lineTo(PX, PY); spP(g2, gh, z); cx.lineTo(PX, PY); spP(g2, 0, z); cx.lineTo(PX, PY); cx.stroke(); cx.lineCap = 'butt';
  cx.strokeStyle = 'rgba(0,0,0,.18)'; cx.lineWidth = Math.max(1, 0.04 * PS); cx.beginPath(); spP(-g2 + 0.04, 0, z); cx.moveTo(PX, PY); spP(-g2 + 0.04, gh - 0.04, z); cx.lineTo(PX, PY); spP(g2 + 0.04, gh - 0.04, z); cx.lineTo(PX, PY); spP(g2 + 0.04, 0, z); cx.lineTo(PX, PY); cx.stroke();
}
// figuur van voren (keeper, muur) of van achteren (trapper), getekend in eenheden: voeten op 0, hoofd op -49
function spBody(p, back) {
  const T = TEAMS[p.t] || TEAMS[0], gk = p.i === 0, F = FP;
  const shirt = gk ? T.gk : T.shirt, shorts = gk ? T.gkShorts : T.shorts, sock = gk ? T.gkSock : T.sock, trim = gk ? '#111' : T.trim, skin = p.skin || '#d9a273', skD = dark(skin, 0.22);
  for (let l = 0; l < 2; l++) {
    const sd = l ? 1 : -1, lift = l ? F.l1 : F.l0, hx = sd * 2.7, hy = -21, fx = sd * (3.1 + F.sp) - (l && F.l1 > 0.9 ? 1.4 : 0), fy = -lift * 8, kx = sd * (3.5 + F.sp * 0.6), ky = -11.5 - lift * 4.5;
    limb(hx, hy, kx, ky, 5.9, 4.6, l ? skin : skD); limb(kx, ky, fx, fy - 1.2, 4.6, 3.3, l ? skin : skD);
    limb(lp(kx, fx, 0.35), lp(ky, fy - 1.2, 0.35), fx, fy - 1.2, 4.8, 3.7, sock);
    cx.fillStyle = back && lift > 0.4 ? dark(p.boot || '#fff', 0.35) : (p.boot || '#fff'); cx.beginPath(); cx.ellipse(fx, fy - 0.4, 2.7, 1.7 + (back ? 0 : 0.2), 0, 0, 6.2832); cx.fill();
  }
  cx.fillStyle = shorts; rr(-5.7, -25.5, 11.4, 8.6, 2.2); cx.fill();
  cx.fillStyle = 'rgba(0,0,0,.16)'; cx.fillRect(-0.4, -21, 0.8, 4);
  cx.fillStyle = shirt; cx.beginPath(); cx.moveTo(-5.1, -23.6); cx.lineTo(-6.9, -36.6); cx.quadraticCurveTo(0, -38.8, 6.9, -36.6); cx.lineTo(5.1, -23.6); cx.closePath(); cx.fill();
  if (Q < 2) { cx.fillStyle = 'rgba(0,0,0,.14)'; cx.beginPath(); cx.moveTo(2.6, -23.6); cx.lineTo(3.6, -37.6); cx.lineTo(6.9, -36.6); cx.lineTo(5.1, -23.6); cx.closePath(); cx.fill(); }
  cx.fillStyle = trim; cx.fillRect(-5.2, -24.8, 10.4, 1.1);
  if (back) {
    cx.fillStyle = trim; cx.textAlign = 'center'; cx.font = '900 9px system-ui,sans-serif'; cx.fillText(String(p.num || ''), 0, -26.6);
    if (p.name) { cx.font = '800 2.4px system-ui,sans-serif'; cx.fillText(String(p.name).slice(0, 12), 0, -34.2); }
  } else if (p.num) { cx.fillStyle = trim; cx.textAlign = 'center'; cx.font = '900 4px system-ui,sans-serif'; cx.fillText(String(p.num), 2.6, -30.5); }
  const arm = (sd) => {
    let ex, ey, hx, hy; const a = F.arms;
    if (a === 1) { ex = sd * 10.5; ey = -31; hx = sd * 12.6; hy = -35.5; }
    else if (a === 2) { ex = sd * 5.6; ey = -28.6; hx = sd * 1.8; hy = -25.4; }
    else if (a === 3) { ex = sd * 7.6; ey = -43.5; hx = sd * 8.6; hy = -51; }
    else if (a === 4) { const w = Math.sin(F.sw) * sd; ex = sd * 7.9; ey = -29.5 + w * 1.5; hx = sd * 8.4 - w * 1.2; hy = -23.2 - w * 3; }
    else { ex = sd * 7.7; ey = -29.6; hx = sd * 8.1; hy = -23.2; }
    const sx = sd * 6.2, sy = -35.8;
    limb(ex, ey, hx, hy, 3.1, 2.5, gk ? shirt : skin);
    limb(sx, sy, gk ? ex : lp(sx, ex, 0.62), gk ? ey : lp(sy, ey, 0.62), 4.3, 3.6, shirt);
    if (!gk) limb(lp(sx, ex, 0.62), lp(sy, ey, 0.62), ex, ey, 3.4, 3.1, skin);
    cx.fillStyle = gk ? '#ff3b8b' : skin; cx.beginPath(); cx.arc(hx, hy, gk ? 2.7 : 1.7, 0, 6.2832); cx.fill();
  };
  arm(-1); arm(1);
  limb(0, -37, 0, -40.6, 3.3, 3.1, skD);
  cx.fillStyle = skin; cx.beginPath(); cx.ellipse(-3.9, -44, 0.9, 1.4, 0, 0, 6.2832); cx.ellipse(3.9, -44, 0.9, 1.4, 0, 0, 6.2832); cx.fill();
  cx.beginPath(); cx.ellipse(0, -44.2, 3.9, 4.8, 0, 0, 6.2832); cx.fill();
  cx.fillStyle = p.hair || '#1a1209';
  if (back) {
    cx.globalAlpha = p.hs === 1 ? 0.55 : 1; cx.beginPath(); cx.ellipse(0, -44.8, 4.1, 4.4, 0, 0, 6.2832); cx.fill(); cx.globalAlpha = 1;
    if (p.hs === 2) { cx.beginPath(); cx.ellipse(0, -39.6, 1.5, 2.3, 0, 0, 6.2832); cx.fill(); }
  } else {
    cx.beginPath(); cx.ellipse(0, -45.4, 4.15, p.hs === 1 ? 2.6 : 3.7, 0, Math.PI, 6.2832); cx.fill();
    if (p.hs === 3) { cx.beginPath(); cx.ellipse(0, -48.6, 2.8, 1.5, 0, 0, 6.2832); cx.fill(); }
    cx.fillStyle = 'rgba(20,12,8,.9)'; cx.beginPath(); cx.arc(-1.5, -44.2, 0.55, 0, 6.2832); cx.arc(1.5, -44.2, 0.55, 0, 6.2832); cx.fill();
    cx.fillStyle = 'rgba(60,25,20,.55)'; cx.fillRect(-1.1, -41.6, 2.2, 0.45);
  }
}
function spFig(p, X, Z, back) {
  if (!p) return;
  spP(X, 0, Z); if (PZ < 0.8) return;
  const gx = PX, gy = PY, w = 1.15 * PS;
  cx.globalAlpha = Math.max(0.25, 1 - FP.hop * 0.6); cx.drawImage(shSpr, gx - w / 2, gy - w * 0.19, w, w * 0.375); cx.globalAlpha = 1;
  spP(X, FP.hop, Z); const u = PS * 1.8 / 49;
  cx.save(); cx.translate(PX, PY); if (FP.rot) cx.rotate(FP.rot); cx.scale(u, u); spBody(p, back); cx.restore();
}
const fpReset = () => { FP.l0 = FP.l1 = FP.sp = FP.rot = FP.hop = FP.sw = 0; FP.arms = 0; };
function spBallDraw() {
  const S = SP, b = S.b;
  if (S.ph === 'res' && (S.out === 'NAAST' || S.out === 'OVER') && b.z > S.dz + 5) return;
  spP(b.x, 0, b.z); if (PZ < 0.6) return;
  const w = 0.5 * PS * Math.max(0.4, 1 - b.y * 0.15); cx.globalAlpha = Math.max(0.2, 1 - b.y * 0.25); cx.drawImage(shSpr, PX - w / 2, PY - w * 0.19, w, w * 0.375); cx.globalAlpha = 1;
  if (Q < 2 && spTN > 2 && S.ph !== 'aim') { for (let i = 1; i < spTN; i++) { cx.strokeStyle = 'rgba(255,255,255,' + (0.4 * (1 - i / spTN)).toFixed(2) + ')'; cx.lineWidth = 3 * (1 - i / spTN) + 0.5; cx.beginPath(); cx.moveTo(spTrail[i * 2 - 2], spTrail[i * 2 - 1]); cx.lineTo(spTrail[i * 2], spTrail[i * 2 + 1]); cx.stroke(); } }
  spP(b.x, b.y, b.z); const r = Math.max(2, 0.11 * PS), x = PX, y = PY;
  const gr = cx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.1, x, y, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#dfe3ea'); gr.addColorStop(1, '#848b9a');
  cx.fillStyle = gr; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.fill(); cx.fillStyle = '#232832';
  for (let k = 0; k < 4; k++) { const a = b.rot + k * 1.57 + 0.4, c = Math.cos(a); cx.beginPath(); cx.ellipse(x + c * r * 0.58, y + Math.sin(a * 1.3) * r * 0.5, r * 0.2, r * 0.24, 0, 0, 6.2832); cx.fill(); }
  cx.strokeStyle = 'rgba(15,18,28,.8)'; cx.lineWidth = 1; cx.beginPath(); cx.arc(x, y, r, 0, 6.2832); cx.stroke();
}
// tekenlijst (ver naar dichtbij), vaste objecten die hergebruikt worden
const SPL = []; for (let i = 0; i < 16; i++) SPL.push({ d: 0, k: 0, o: null });
function spDepth(x, z) { const c = SP.cam; return (x - c.x) * c.sa + (z - c.z) * c.ca; }
function drawSP() {
  const S = SP; if (!S) return;
  cx.save(); cx.beginPath(); cx.rect(0, 0, SW, VH); cx.clip();
  if (shakeT > 0) cx.translate((Math.random() - 0.5) * 9 * shakeT * 2, (Math.random() - 0.5) * 7 * shakeT * 2);
  spGround();
  const inNet = S.b.z > S.dz + 0.05 && S.out === 'GOAL';
  spNet();
  if (inNet) spBallDraw();
  // keeper
  spKeeperPose(); fpReset(); FP.rot = SPK.rot; FP.hop = SPK.hop;
  FP.arms = SPK.k > 0.05 ? (Math.abs(SPK.rot) > 0.15 || S.dvy > 1.5 ? 3 : 1) : 1; FP.sp = SPK.k > 0.05 && Math.abs(SPK.rot) < 0.15 ? 1.6 : 0.9;
  if (S.ph === 'res' && !S.user && S.out !== 'GOAL' && S.pt > 0.5) { FP.rot *= Math.max(0, 1 - (S.pt - 0.5) * 3); FP.hop = 0; FP.arms = 3; }
  spFrame();
  spFig(S.keeper, SPK.x, SPK.z, false);
  // overige figuren en bal, gesorteerd op diepte
  let n = 0; const add = (d, k, o) => { if (n < SPL.length) { const e = SPL[n++]; e.d = d; e.k = k; e.o = o; } };
  for (const m of S.wall) add(spDepth(m.x, m.z), 1, m);
  for (const m of S.others) add(spDepth(m.x, m.z), 2, m);
  const kp = spKick(); add(spDepth(kp[0], kp[1]), 3, null);
  if (!inNet) add(spDepth(S.b.x, S.b.z) - 0.01, 4, null);
  for (let i = 1; i < n; i++) { const e = SPL[i]; let j = i - 1; while (j >= 0 && SPL[j].d < e.d) { const t = SPL[j + 1]; SPL[j + 1] = SPL[j]; SPL[j] = t; j--; } }
  const jT = S.ct >= 0 ? S.t - S.ct : -1;
  for (let i = 0; i < n; i++) {
    const e = SPL[i]; fpReset();
    if (e.k === 1) { FP.arms = 2; FP.sp = 0.3; if (S.wj && jT > 0 && jT < 0.6) FP.hop = 0.42 * Math.sin(Math.PI * jT / 0.6); spFig(e.o.p, e.o.x, e.o.z, false); }
    else if (e.k === 2) { const cheer = S.ph === 'res' && S.out === 'GOAL' && e.o.back; FP.arms = cheer ? 3 : 0; FP.hop = cheer ? Math.abs(Math.sin(S.t * 7 + e.o.ph)) * 0.25 : 0; FP.l0 = Math.max(0, Math.sin(S.t * 1.3 + e.o.ph)) * 0.08; spFig(e.o.p, e.o.x, e.o.z, e.o.back); }
    else if (e.k === 3) spKicker(kp);
    else spBallDraw();
  }
  cx.restore();
  for (const q of parts) { cx.save(); cx.translate(q.x, q.y); cx.rotate(q.r); cx.fillStyle = q.c; cx.fillRect(-q.w / 2, -q.w / 4, q.w, q.w / 2); cx.restore(); }
  if (Q < 2) { cx.fillStyle = vig; cx.fillRect(0, 0, SW, VH); }
  spHUD();
}
const SPKP = [0, 0];
function spKick() {
  const S = SP; let k = 0;
  if (S.ph === 'run') k = Math.min(1, S.pt / SPRUN); else if (S.ph === 'fly' || S.ph === 'res') k = 1;
  const e = k * k * (3 - 2 * k); SPKP[0] = lp(S.ks[0], S.kc[0], e); SPKP[1] = lp(S.ks[1], S.kc[1], e); return SPKP;
}
function spKicker(kp) {
  const S = SP; fpReset();
  if (S.ph === 'run') { const ph = S.pt * 15; FP.l0 = Math.max(0, Math.sin(ph)) * 0.7; FP.l1 = Math.max(0, -Math.sin(ph)) * 0.7; FP.arms = 4; FP.sw = ph; }
  const kt = S.ph === 'run' ? S.pt - (SPRUN - 0.18) : (S.ph === 'fly' || S.ph === 'res') ? S.ft + 0.18 : -1;
  if (kt >= 0 && kt < 0.6) { const k = kt / 0.4; FP.l0 = 0; FP.l1 = k < 0.45 ? k / 0.45 * 1.35 : Math.max(0, 1.35 - (k - 0.45) / 0.55 * 0.7); FP.sp = k > 0.45 ? -0.4 : 0; FP.arms = 1; }
  if (S.ph === 'res' && S.user && S.out === 'GOAL') { FP.arms = 3; FP.hop = Math.abs(Math.sin(S.pt * 8)) * 0.3; FP.l1 = 0; }
  spFig(S.kicker, kp[0], kp[1], true);
}
function spHUD() {
  const S = SP, aim = S.ph === 'aim' || S.ph === 'intro';
  // titel
  cx.fillStyle = 'rgba(8,16,50,.86)'; rr(14, 12, 330, 64, 8); cx.fill(); cx.fillStyle = S.card === 'ROOD' ? '#e0302c' : S.card ? '#ffd400' : '#ffffff'; cx.fillRect(14, 70, 330, 6);
  const ttl = S.from === 'oefen' ? 'PENALTY OEFENEN' : S.pen ? 'PENALTY' : 'VRIJE TRAP';
  txt(ttl + (S.pen ? '' : '  ' + Math.round(S.dist) + ' M'), 28, 42, 24, '#fff', 'left', '900');
  const sub = S.from === 'oefen' ? 'RONDE ' + Math.min(5, PR.round + 1) + ' / 5   GOALS ' + PR.goals : (S.card ? (S.card === 'ROOD' ? 'TWEEDE GEEL' : 'GELE KAART') + (S.tackler ? ' ' + S.tackler.name : '') + '   ' : '') + TEAMS[0].code + ' ' + score[0] + ' - ' + score[1] + ' ' + TEAMS[1].code;
  txt(sub, 28, 63, 13, '#b8c6ff', 'left', '800');
  pill(SW - 196, 14, 180, 46, 'OVERSLAAN', () => spSkip(), false, 17);
  if (S.ph === 'res') {
    const k = Math.min(1, S.pt / 0.25), sc = 0.6 + 0.4 * (1 - Math.pow(1 - k, 3));
    cx.save(); cx.translate(SW / 2, 150); cx.scale(sc, sc); cx.fillStyle = 'rgba(8,16,50,.78)'; cx.fillRect(-280, -56, 560, 86); cx.fillStyle = S.resC; cx.fillRect(-280, 24, 560, 6);
    txt(S.res, 0, 8, 50, S.resC, 'center', '900'); cx.restore();
    if (S.out === 'GOAL' && S.pt < 0.2) { cx.fillStyle = 'rgba(255,255,255,' + (0.5 * (1 - S.pt / 0.2)).toFixed(3) + ')'; cx.fillRect(0, 0, SW, VH); }
    return;
  }
  if (S.ph === 'intro') { const a = Math.min(1, S.pt * 3); cx.globalAlpha = a; txt(S.user ? (S.pen ? 'JIJ NEEMT DE PENALTY' : 'JIJ NEEMT DE VRIJE TRAP') : 'JIJ STAAT IN DOEL', SW / 2, 150, 34, '#ffd400', 'center', '900'); cx.globalAlpha = 1; }
  if (S.user) {
    if (S.ph !== 'aim' && S.ph !== 'intro') return;
    // mikpunt
    if (S.mode === 'shot') {
      spP(S.aim[0], S.aim[1], S.dz); const r = 15 + Math.sin(S.t * 6) * 2;
      cx.strokeStyle = '#ffd400'; cx.lineWidth = 3; cx.beginPath(); cx.arc(PX, PY, r, 0, 6.2832); cx.moveTo(PX - r - 7, PY); cx.lineTo(PX - 5, PY); cx.moveTo(PX + 5, PY); cx.lineTo(PX + r + 7, PY); cx.moveTo(PX, PY - r - 7); cx.lineTo(PX, PY - 5); cx.moveTo(PX, PY + 5); cx.lineTo(PX, PY + r + 7); cx.stroke();
      // effect
      const ex = 100, ey = 482; cx.fillStyle = 'rgba(8,16,50,.72)'; rr(ex - 64, ey - 82, 128, 166, 14); cx.fill();
      cx.fillStyle = '#f2f4f8'; cx.beginPath(); cx.arc(ex, ey, 40, 0, 6.2832); cx.fill(); cx.strokeStyle = '#232832'; cx.lineWidth = 2; cx.stroke();
      cx.fillStyle = '#ff3b3b'; cx.beginPath(); cx.arc(ex - S.cv * 30, ey + 8, 7, 0, 6.2832); cx.fill();
      txt('EFFECT', ex, ey - 60, 14, '#fff', 'center', '900'); txt(Math.abs(S.cv) < 0.1 ? 'RECHT' : S.cv > 0 ? 'KRUL RECHTS' : 'KRUL LINKS', ex, ey + 70, 12, '#b8c6ff', 'center', '800');
    } else if (S.mate) { spP(S.mate.x, 2.4, S.mate.z); cx.fillStyle = '#ffd400'; cx.beginPath(); cx.moveTo(PX, PY + 10); cx.lineTo(PX - 9, PY - 6); cx.lineTo(PX + 9, PY - 6); cx.closePath(); cx.fill(); }
    // knop + kracht
    const b = spBtn(); cx.fillStyle = S.chg ? '#ffd400' : 'rgba(255,255,255,.9)'; cx.beginPath(); cx.arc(b[0], b[1], b[2], 0, 6.2832); cx.fill(); cx.strokeStyle = '#0b1b4d'; cx.lineWidth = 3; cx.stroke();
    txt(S.mode === 'pass' ? 'PASS' : 'SCHIET', b[0], b[1] + 7, 20, '#0b1b4d', 'center', '900');
    const px = b[0] - b[2] - 34, py = b[1] - 80; cx.fillStyle = 'rgba(8,16,50,.72)'; rr(px - 26, py - 30, 68, 196, 10); cx.fill(); cx.fillStyle = 'rgba(255,255,255,.15)'; cx.fillRect(px, py, 16, 160);
    const pw = Math.max(0, Math.min(1, S.pow)); cx.fillStyle = pw > 0.85 ? '#ff5468' : pw > 0.55 ? '#ffd400' : '#2fd071'; cx.fillRect(px + 2, py + 158 - 156 * pw, 12, 156 * pw);
    txt('KRACHT', px + 8, py - 8, 12, '#fff', 'center', '900');
    if (!S.pen && S.mate) { cx.fillStyle = 'rgba(8,16,50,.8)'; rr(SW - 252, 300, 236, 46, 6); cx.fill(); } if (!S.pen && S.mate) pill(SW - 252, 300, 236, 46, S.mode === 'pass' ? 'KIES: KORTE PASS' : 'KIES: SCHIETEN', () => { if (SP && SP.ph === 'aim') SP.mode = SP.mode === 'pass' ? 'shot' : 'pass'; }, S.mode === 'pass', 16);
    if (S.ph === 'aim') { const k = Math.max(0, 1 - S.pt / SPAIM); cx.fillStyle = 'rgba(255,255,255,.2)'; cx.fillRect(SW / 2 - 120, 16, 240, 6); cx.fillStyle = k < 0.3 ? '#ff5468' : '#ffd400'; cx.fillRect(SW / 2 - 120, 16, 240 * k, 6); }
    const l1 = S.mode === 'pass' ? 'Houd PASS kort ingedrukt en laat los: je speelt kort in.' : 'Sleep om te mikken. Houd SCHIET vast voor kracht en laat los.';
    const l2 = S.mode === 'pass' ? 'Of kies SCHIETEN om zelf op doel te trappen.' : 'Sleep over de bal links voor effect. Te hoog of te ver is naast.';
    cx.fillStyle = 'rgba(8,16,50,.62)'; rr(SW / 2 - 250, 540, 500, 54, 10); cx.fill();
    txt(l1, SW / 2, 561, 15, '#fff', 'center', '700'); txt(l2, SW / 2, 583, 13, 'rgba(255,255,255,.8)', 'center', '700');
  } else {
    if (S.ct < 0 && S.dv) { spP(S.dv[0], S.dv[1], S.dz - 0.3); cx.fillStyle = 'rgba(255,59,139,.85)'; cx.beginPath(); cx.arc(PX, PY, 16, 0, 6.2832); cx.fill(); cx.strokeStyle = '#fff'; cx.lineWidth = 3; cx.stroke(); }
    if (S.ct < 0) {
      const l1 = S.dv ? 'Keuze vast. Tik opnieuw om te wisselen.' : 'Tik in het doel waar je keeper heen duikt.';
      cx.fillStyle = 'rgba(8,16,50,.62)'; rr(SW / 2 - 260, 538, 520, 56, 10); cx.fill();
      txt(l1, SW / 2, 560, 16, '#fff', 'center', '800'); txt('Kies voor de computer trapt. Links, rechts, midden, hoog of laag.', SW / 2, 582, 13, 'rgba(255,255,255,.72)', 'center', '700');
    }
  }
}
// penalty's oefenen in 3D (vanuit het oefenscherm)
function spPracticeStart() { penNew(); PR.d3 = 1; spPractice(); }
function spHash(kind, cpu) {
  if (kind === 'penalty3d') { goTo('pen'); spPracticeStart(); return; }
  if (state !== 'play') { if (state !== 'voor') startMatch(); beginMatch(); }
  const h = location.hash || '', md = /[&#]d=(\d+)/.exec(h), mxl = /[&#]x=(-?\d+)/.exec(h);
  const att = cpu ? 1 : 0, v = players.find(p => p.t === att && p.i === NP - 1), tk = players.find(p => p.t === 1 - att && p.i === 2);
  const big = !court, mx = big ? 0.07 : 0.05, my = big ? 0.113 : 0.0455, gx = att === 0 ? W : 0, dir = att === 0 ? -1 : 1;
  const dm = md ? +md[1] : (big ? 23 : 11), lm = mxl ? +mxl[1] : (big ? 7 : 2);
  const fx = kind === 'penalty' ? gx + dir * (big ? 80 : 50) : gx + dir * dm / mx, fy = H / 2 + (kind === 'penalty' ? 0 : lm / my * (att === 0 ? 1 : -1));
  v.x = fx; v.y = fy;
  spStart({ pen: kind === 'penalty', att, victim: v, tackler: tk, card: 'GEEL', fx, fy });
}

// ---- OEFENEN: penalty's ----
let PR = null;
function penNew() { PR = { round: 0, goals: 0, shot: -1, dive: -1, res: '', t: 0, done: false, hist: [] }; }
function penShoot(z) {
  if (!PR || PR.shot >= 0 || PR.done) return;
  const dive = (Math.random() * 6) | 0; let res;
  const top = z < 3, miss = top && Math.random() < 0.12;
  if (miss) res = 'NAAST!'; else if (dive === z) res = 'GERED!'; else if (Math.abs((dive % 3) - (z % 3)) === 1 && (dive < 3) === (z < 3) && Math.random() < 0.25) res = 'GERED!'; else res = 'GOAL!';
  PR.shot = z; PR.dive = dive; PR.res = res; PR.t = 0; if (res === 'GOAL!') { PR.goals++; whistle(0.2); } buzz(res === 'GOAL!' ? 25 : 12);
}
function drawPen() {
  const X0 = screenBG('PENALTY\'S OEFENEN'); if (!PR) penNew();
  const gx = X0 + 150, gy = 130, gw = 500, gh = 250;
  cx.fillStyle = '#2f9a42'; cx.fillRect(X0, gy + gh, 800, 120); cx.fillStyle = 'rgba(255,255,255,.08)'; cx.fillRect(gx, gy, gw, gh);
  cx.strokeStyle = '#fff'; cx.lineWidth = 8; cx.strokeRect(gx, gy, gw, gh);
  cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.lineWidth = 1; for (let i = 1; i < 10; i++) { cx.beginPath(); cx.moveTo(gx + i * gw / 10, gy); cx.lineTo(gx + i * gw / 10, gy + gh); cx.stroke(); } for (let j = 1; j < 5; j++) { cx.beginPath(); cx.moveTo(gx, gy + j * gh / 5); cx.lineTo(gx + gw, gy + j * gh / 5); cx.stroke(); }
  const zw = gw / 3, zh = gh / 2, zc = z => [gx + (z % 3) * zw + zw / 2, gy + ((z / 3) | 0) * zh + zh / 2];
  if (PR.shot >= 0) PR.t += 1 / 60;
  const k = PR.shot >= 0 ? Math.min(1, PR.t / 0.45) : 0;
  // keeper
  let kx = gx + gw / 2, ky = gy + gh - 60;
  if (PR.shot >= 0) { const d = zc(PR.dive); kx += (d[0] - kx) * k; ky += (d[1] - ky) * k * 0.9; }
  cx.fillStyle = '#ff3b8b'; cx.fillRect(kx - 16, ky - 30, 32, 60); cx.fillStyle = '#d9a273'; cx.beginPath(); cx.arc(kx, ky - 40, 12, 0, 7); cx.fill();
  cx.strokeStyle = '#ff3b8b'; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(kx - 16, ky - 20); cx.lineTo(kx - 38 - 14 * k, ky - 34 - 20 * k); cx.moveTo(kx + 16, ky - 20); cx.lineTo(kx + 38 + 14 * k, ky - 34 - 20 * k); cx.stroke();
  // ball
  let bx = gx + gw / 2, by = gy + gh + 70, br = 14;
  if (PR.shot >= 0) { const t = zc(PR.shot); bx += (t[0] + (PR.res === 'NAAST!' ? (PR.shot % 3 === 0 ? -60 : PR.shot % 3 === 2 ? 60 : 0) : 0) - bx) * k; by += ((PR.res === 'NAAST!' ? gy - 20 : t[1]) - by) * k; br = 14 - 6 * k; }
  cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(bx, by, br, 0, 7); cx.fill(); cx.strokeStyle = '#111'; cx.lineWidth = 2; cx.stroke();
  // zones (taps)
  const wait = PR.shot < 0 && !PR.done;
  for (let z = 0; z < 6; z++) { const x = gx + (z % 3) * zw, y = gy + ((z / 3) | 0) * zh; if (wait) { hits.push({ x, y, w: zw, h: zh, fn: () => penShoot(z) }); cx.strokeStyle = 'rgba(255,212,0,.55)'; cx.lineWidth = 2; cx.setLineDash([8, 8]); cx.strokeRect(x + 4, y + 4, zw - 8, zh - 8); cx.setLineDash([]); } }
  txt('RONDE ' + Math.min(5, PR.round + (PR.shot >= 0 ? 1 : 1)) + ' / 5', X0 + 40, 100, 20, '#fff', 'left', '900'); txt('GOALS ' + PR.goals, X0 + 760, 100, 20, '#ffd400', 'right', '900');
  for (let i = 0; i < 5; i++) { const h = PR.hist[i]; cx.fillStyle = h === undefined ? 'rgba(255,255,255,.2)' : h ? '#2fd071' : '#ff5468'; cx.beginPath(); cx.arc(X0 + 330 + i * 34, 94, 11, 0, 7); cx.fill(); }
  if (wait && PR.round === 0) pill(X0 + 600, 396, 190, 46, 'SPEEL IN 3D', () => spPracticeStart(), true, 16);
  if (wait) txt('Tik op een hoek van het doel om te schieten (bovenhoeken kunnen naast gaan)', X0 + 400, 545, 15, 'rgba(255,255,255,.85)', 'center', '700');
  if (PR.shot >= 0 && PR.t > 0.45) {
    txt(PR.res, X0 + 400, 330, 56, PR.res === 'GOAL!' ? '#ffd400' : '#ff9a9a', 'center', '900');
    if (PR.t > 1.3) { PR.hist.push(PR.res === 'GOAL!' ? 1 : 0); PR.round++; PR.shot = -1; if (PR.round >= 5) { PR.done = true; econDay(); } }
  }
  if (PR.done) {
    const g = PR.goals, med = g >= 5 ? 'GOUD' : g >= 4 ? 'ZILVER' : g >= 2 ? 'BRONS' : 'GEEN MEDAILLE';
    cx.fillStyle = 'rgba(8,16,50,.88)'; rr(X0 + 200, 190, 400, 190, 14); cx.fill();
    txt(g + ' / 5 GESCOORD', X0 + 400, 245, 32, '#fff', 'center', '900'); txt(med, X0 + 400, 290, 26, g >= 5 ? '#ffd400' : g >= 4 ? '#c9d3e6' : '#d79a68', 'center', '900');
    pill(X0 + 260, 315, 130, 46, 'OPNIEUW', () => penNew(), true, 16); pill(X0 + 410, 315, 130, 46, 'MENU', () => { state = 'spelen'; }, false, 16);
  }
}
function drawSettings() {
  const X0 = screenBG('OPTIES'); tabs(X0, ['SPEL', 'WEERGAVE']);
  const rows = [
    ['DUUR WEDSTRIJD', () => (MATCH / 60) + ' MIN', () => { mIdx = (mIdx + 1) % 5; MATCH = MATCHES[mIdx]; }, 0],
    ['SPELVORM', () => koi ? 'KOOI (muren)' : 'VELD', () => { koi ^= 1; }, 0],
    ['NIVEAU (kick-off)', () => DNAMES[dIdx], () => { dIdx = (dIdx + 1) % 5; }, 0],
    ['SPELSNELHEID', () => SNAMES[spdIdx], () => { spdIdx = (spdIdx + 1) % 3; }, 0],
    ['SCHEIDSRECHTER', () => STRICT[strictIdx], () => { strictIdx = (strictIdx + 1) % 4; }, 0],
    ['VRIJE TRAP 3D', () => fk3d ? 'AAN' : 'UIT', () => { fk3d ^= 1; }, 0],
    ['CAMERA', () => CNAMES[camIdx], () => { camIdx = (camIdx + 1) % 3; zoom = CAMS[camIdx]; }, 1],
    ['WAPENSTIJL', () => crestMode ? 'ROND' : 'SCHILD', () => { crestMode ^= 1; }, 1],
    ['GELUID', () => muted ? 'UIT' : 'AAN', () => act('snd'), 1],
    ['COMPETITIE', () => COMPS[compIdx].name, () => { if (S.season && !S.season.done) { ban = null; return; } let n = compIdx; do { n = (n + 1) % COMPS.length; } while (COMPS[n].teams.length !== 8); applyComp(n); }, 1],
    ['TEAM (kick-off)', () => KITS[kitSel].name, () => { kitSel = (kitSel + 1) % KITS.length; applyKits(); }, 1],
    ['MEETSCHERM', () => DBG ? 'AAN' : 'UIT', () => { DBG = !DBG; try { localStorage.setItem('eawg-debug', DBG ? '1' : '0'); } catch (e) {} }, 1],
    ['UPDATE (v' + gameVer() + ')', () => updMsg || 'ZOEK NAAR UPDATE', () => checkUpdate(), 1]
  ].filter(r => r[3] === (tab || 0));
  rows.forEach((r, i) => {
    const y = 112 + i * (rows.length > 6 ? 58 : 64); cx.fillStyle = 'rgba(255,255,255,.07)'; rr(X0 + 40, y, 720, 52, 10); cx.fill();
    txt(r[0], X0 + 64, y + 33, 19, '#fff', 'left', '800'); pill(X0 + 440, y + 3, 300, 46, r[1](), () => { r[2](); saveSet(); }, true, 18);
  });
  txt(tab ? 'Competitie wisselen kan niet tijdens een lopend seizoen.' : 'Scheidsrechter: kans op overtreding bij een tackle. Gele kaart, bij de tweede een rode.', X0 + 40, 560, 15, 'rgba(255,255,255,.7)', 'left', '600');
  if (!tab) txt('Vrije trap 3D: bij een kaart, een fout in de zestien of een zware fout dicht bij doel trap je zelf (of sta je in doel).', X0 + 40, 582, 13, 'rgba(255,255,255,.6)', 'left', '600');
}

function drawComp() {
  const X0 = screenBG('SEIZOEN'); tabs(X0, ['COMPETITIE', 'BEKER']);
  if (!S.season) {
    txt('Nog geen seizoen gestart.', SW / 2, 230, 24, '#fff', 'center', '800');
    txt('8 clubs, iedereen speelt 1x tegen elkaar (7 speeldagen) + een beker.', SW / 2, 262, 15, 'rgba(255,255,255,.8)', 'center', '600');
    pill(SW / 2 - 140, 300, 280, 52, 'START SEIZOEN ' + 1 + ' met ' + KITS[kitSel].name, () => newSeason(), true, 16); return;
  }
  const se = S.season, mine = se.mine;
  if (tab === 0) {
    const rk = rankList();
    txt('#', X0 + 40, 128, 13, '#8fb0ff', 'left', '800'); txt('CLUB', X0 + 70, 128, 13, '#8fb0ff', 'left', '800');
    ['G', 'W', 'D', 'V', 'DV', 'PT'].forEach((h, i) => txt(h, X0 + 300 + i * 32, 128, 13, '#8fb0ff', 'center', '800'));
    rk.forEach((id, i) => {
      const y = 138 + i * 36, t = se.tab[id], isM = id === mine;
      cx.fillStyle = isM ? 'rgba(99,182,242,.28)' : 'rgba(255,255,255,.06)'; cx.fillRect(X0 + 30, y, 470, 32);
      cx.fillStyle = KITS[id].shirt; cx.fillRect(X0 + 30, y, 5, 32);
      txt(String(i + 1), X0 + 40, y + 22, 16, '#fff', 'left', '800'); txt(KITS[id].name, X0 + 70, y + 22, 15, '#fff', 'left', '800');
      [t.p, t.w, t.d, t.l, t.gf - t.ga, t.pts].forEach((v, j) => txt(String(v), X0 + 300 + j * 32, y + 22, 15, j === 5 ? '#ffd400' : '#fff', 'center', j === 5 ? '900' : '600'));
    });
    const px = X0 + 520;
    cx.fillStyle = 'rgba(255,255,255,.07)'; rr(px, 128, 250, 290, 8); cx.fill();
    if (!se.done) {
      const f = myFix(), opp = f[0] === mine ? f[1] : f[0];
      txt('SPEELDAG ' + (se.round + 1) + ' / 7', px + 125, 160, 16, '#8fb0ff', 'center', '800');
      txt(KITS[mine].code, px + 125, 214, 30, '#fff', 'center', '900'); txt('tegen', px + 125, 240, 14, '#fff', 'center', '600'); txt(KITS[opp].name, px + 125, 272, 22, '#fff', 'center', '900');
      txt('sterkte ' + TS[opp] + '  |  jij ' + Math.round(lineAvg()), px + 125, 298, 14, '#ffd400', 'center', '700');
      pill(px + 25, 330, 200, 50, 'SPEEL', () => startComp('league'), true, 20);
    } else {
      txt('SEIZOEN KLAAR', px + 125, 170, 20, '#ffd400', 'center', '900'); txt('Plaats ' + (rk.indexOf(mine) + 1) + ' van 8', px + 125, 214, 22, '#fff', 'center', '800');
      txt('+' + se.prize + ' munten', px + 125, 246, 18, '#ffd400', 'center', '800');
      pill(px + 20, 300, 210, 50, confirmNew ? 'ZEKER? TIK NOGMAALS' : 'NIEUW SEIZOEN', () => { if (confirmNew) { confirmNew = false; newSeason(); } else confirmNew = true; }, true, 15);
    }
    txt('Klassement: 3 punten winst, 1 gelijk.', X0 + 30, 450, 13, 'rgba(255,255,255,.6)', 'left', '600');
  } else {
    const c = se.cup;
    if (c.champ >= 0) txt('BEKERWINNAAR: ' + KITS[c.champ].name, SW / 2, 120, 20, '#ffd400', 'center', '900');
    else txt(CUPN[c.r] || '', SW / 2, 120, 18, '#8fb0ff', 'center', '800');
    const cols = c.hist.length;
    const all = []; for (let r = 0; r < 3; r++) all.push(c.hist[r] || (r === c.r ? c.pairs.map(p => [p[0], p[1], null, null, -1]) : null));
    all.forEach((rd, r) => {
      const x = X0 + 40 + r * 250; txt(CUPN[r], x + 100, 156, 13, '#8fb0ff', 'center', '800');
      if (!rd) return;
      rd.forEach((m, i) => {
        const y = 170 + i * (r === 0 ? 62 : r === 1 ? 124 : 0) + (r === 1 ? 30 : r === 2 ? 90 : 0);
        for (let k = 0; k < 2; k++) {
          const id = m[k], yy = y + k * 26, isM = id === mine;
          cx.fillStyle = isM ? 'rgba(99,182,242,.3)' : 'rgba(255,255,255,.08)'; cx.fillRect(x, yy, 200, 24); cx.fillStyle = KITS[id].shirt; cx.fillRect(x, yy, 4, 24);
          txt(KITS[id].name, x + 12, yy + 17, 13, m[4] === id ? '#ffd400' : '#fff', 'left', '800'); if (m[2] !== null) txt(String(m[2 + k]), x + 190, yy + 17, 14, '#fff', 'right', '800');
        }
      });
    });
    const f = myCup();
    if (f) { const opp = f[0] === mine ? f[1] : f[0]; pill(SW / 2 - 130, 470, 260, 46, 'SPEEL vs ' + KITS[opp].name, () => startComp('cup'), true, 16); }
    else if (c.out && c.champ !== mine) txt('Je bent uitgeschakeld. Volgend seizoen een nieuwe kans.', SW / 2, 492, 15, '#fff', 'center', '700');
  }
}

function drawClub() {
  const X0 = screenBG('CLUB'); tabs(X0, ['OPSTELLING', 'TRANSFERMARKT', 'INRUILEN', 'OPDRACHTEN', 'STERREN', 'WERELDEN']);
  if (tab === 4) { drawStars(X0); return; }
  if (tab === 5) { drawWorlds(X0); return; }
  if (tab === 0 && upSel >= 0) { drawUpgrade(X0); return; }
  if (tab === 0) {
    txt('Teamsterkte ' + lineAvg().toFixed(1), X0 + 400, 118, 16, '#ffd400', 'center', '800');
    for (let i = 0; i < 5; i++) {
      const c = lineCard(i), y = 130 + i * 74;
      cardBox(X0 + 30, y, 360, 66, c);
      txt(SLOTN[i], X0 + 410, y + 38, 13, '#8fb0ff', 'left', '800');
      pill(X0 + 530, y + 12, 110, 40, 'WISSEL', () => {
        const el = S.cards.filter(k => k.pos === SLOTP[i] && (k.id === c.id || !S.lineup.includes(k.id))); if (el.length < 2) return;
        const n = el[(el.findIndex(k => k.id === c.id) + 1) % el.length]; S.lineup[i] = n.id; saveS();
      }, false, 14);
      pill(X0 + 650, y + 12, 130, 40, 'UPGRADE', () => { upSel = i; }, true, 14);
      txt(UPA.map((a, k) => a + ' ' + upL(c, k)).join('  '), X0 + 410, y + 58, 11, '#9dffb0', 'left', '800');
    }
    txt('Kaarten in je bezit: ' + S.cards.length + '. UPGRADE: rating en 4 eigenschappen die je speler echt sneller en beter maken.', X0 + 30, 520, 13, 'rgba(255,255,255,.65)', 'left', '600');
  } else if (tab === 1) {
    const of = offers(), bt = S.bought[today()] || [];
    txt('AANBOD VAN VANDAAG (vaste prijs) - IN FORM = +3 deze week', X0 + 30, 118, 14, '#8fb0ff', 'left', '800');
    of.forEach((c, i) => {
      const x = X0 + 30 + (i % 2) * 380, y = 130 + ((i / 2) | 0) * 84, got = bt.includes(i), p = price(c);
      cardBox(x, y, 250, 74, c);
      pill(x + 258, y + 14, 104, 46, got ? 'GEKOCHT' : String(p), () => { if (got || S.coins < p) return; S.coins -= p; const n = Object.assign({}, c, { id: S.nid++, up: [0, 0, 0, 0] }); S.cards.push(n); (S.bought[today()] = S.bought[today()] || []).push(i); saveS(); }, !got && S.coins >= p, 15);
    });
    const own = S.cards.filter(c => !S.lineup.includes(c.id) && !c.star); const pg = page, per = 3;
    txt('VERKOOP RESERVES (50% van de prijs)', X0 + 30, 482, 14, '#8fb0ff', 'left', '800');
    own.slice(pg * per, pg * per + per).forEach((c, i) => {
      const x = X0 + 30 + i * 250, y = 490, v = Math.round(price(c) * 0.5);
      cx.fillStyle = 'rgba(255,255,255,.07)'; rr(x, y, 240, 64, 8); cx.fill(); txt(eff(c) + ' ' + PSH[c.pos] + ' ' + c.name, x + 8, y + 22, 14, '#fff', 'left', '800');
      pill(x + 8, y + 28, 224, 32, 'VERKOOP +' + v, () => { S.coins += v; S.cards = S.cards.filter(k => k.id !== c.id); saveS(); }, false, 14);
    });
    if (own.length > per) pill(X0 + 706, 496, 78, 44, 'MEER', () => { page = (page + 1) % Math.ceil(own.length / per); }, false, 13);
  } else if (tab === 2) {
    txt('INRUILEN: lever 3 reserves van dezelfde positie in, krijg 1 vaste betere kaart.', X0 + 30, 122, 14, '#8fb0ff', 'left', '800');
    txt('Je ziet vooraf precies wat je krijgt. Geen toeval.', X0 + 30, 144, 13, 'rgba(255,255,255,.7)', 'left', '600');
    [0, 1, 2, 3].forEach(pos => {
      const y = 160 + pos * 86, pv = tradePreview(pos);
      cx.fillStyle = 'rgba(255,255,255,.07)'; rr(X0 + 30, y, 740, 76, 8); cx.fill();
      txt(['KEEPERS', 'VERDEDIGERS', 'MIDDENVELDERS', 'AANVALLERS'][pos], X0 + 46, y + 44, 17, '#fff', 'left', '900');
      if (!pv) { txt('Je hebt minstens 3 reserves nodig (nu ' + S.cards.filter(c => c.pos === pos && !S.lineup.includes(c.id)).length + ')', X0 + 230, y + 44, 14, 'rgba(255,255,255,.6)', 'left', '700'); return; }
      txt('3 x gem. ' + Math.round(pv.give.reduce((a, c) => a + eff(c), 0) / 3), X0 + 230, y + 44, 15, '#fff', 'left', '700'); txt('>', X0 + 330, y + 44, 22, '#ffd400', 'left', '900');
      cardBox(X0 + 360, y + 5, 230, 66, pv.card);
      pill(X0 + 620, y + 18, 130, 40, 'RUIL IN', () => { const n = Object.assign({}, pv.card, { id: S.nid++, up: [0, 0, 0, 0] }); const ids = pv.give.map(c => c.id); S.cards = S.cards.filter(c => !ids.includes(c.id)); S.cards.push(n); saveS(); }, true, 15);
    });
  } else {
    const L = objs(), o = S.obj; txt('DAGELIJKSE OPDRACHTEN (nieuw elke dag)', X0 + 30, 122, 14, '#8fb0ff', 'left', '800');
    L.forEach((q, i) => {
      const y = 140 + i * 82, v = Math.min(q[2], o[q[0]]), done = v >= q[2], cl = o.claimed[q[0]];
      cx.fillStyle = 'rgba(255,255,255,.07)'; rr(X0 + 30, y, 740, 70, 8); cx.fill();
      txt(q[1], X0 + 50, y + 30, 18, '#fff', 'left', '800');
      cx.fillStyle = 'rgba(255,255,255,.15)'; cx.fillRect(X0 + 50, y + 42, 360, 10); cx.fillStyle = '#4cd964'; cx.fillRect(X0 + 50, y + 42, 360 * v / q[2], 10);
      txt(v + ' / ' + q[2], X0 + 425, y + 52, 14, '#fff', 'left', '700');
      pill(X0 + 580, y + 14, 170, 42, cl ? 'OPGEHAALD' : done ? 'HAAL +' + q[3] : '+' + q[3] + ' munten', () => { if (done && !cl) { o.claimed[q[0]] = 1; S.coins += q[3]; saveS(); } }, done && !cl, 15);
    });
  }
}

window.__gr = { econ: (w, a, b) => { if (w === 'coins') S.coins = a; if (w === 'star') buyStar(STARS[a]); if (w === 'line') { const c = starCard(STARS[a].id); if (c) starLine(c); } if (w === 'up') upBuy(lineCard(a), b); if (w === 'world') buyWorld(a); if (w === 'home') S.home = a; if (w === 'claim') streakClaim(); if (w === 'day') econDay(); if (w === 'last') { S.streak.last = a; S.streak.n = b; } if (w === 'unlock') buyT = -1e9; if (w === 'stpg') { stPg = a; stSel = b != null ? b : a * 8; } if (w === 'wsel') { wSel = a; page = b || 0; } if (w === 'page') page = a; if (w === 'save') saveS(); if (w === 'redeem') redeemDialog(); return JSON.stringify({ coins: S.coins, stars: S.cards.filter(c => c.star).map(c => c.star), worlds: S.worlds, home: S.home, streak: S.streak, lineup: S.lineup, up: S.lineup.map(id => (cardById(id) || {}).up) }); }, alb: (what, a) => { if (what === 'give') { AL.pk = a; saveAl(); } if (what === 'open') albOpen(); if (what === 'tab') { state = 'album'; tab = a; } if (what === 'pg') albPg = a; if (what === 'daily') albDaily(); if (what === 'swap') albSwap(); if (what === 'reset') { AL.have = {}; AL.day = ''; AL.pity = 0; AL.pk = 2; } if (what === 'fill') { albStickers().forEach((x, i) => { if (i % 3) AL.have[x.id] = 1 + (i % 7 === 0 ? 3 : 0); }); } if (what === 'comp') albComp = a; return JSON.stringify({ st: albStats(), pk: AL.pk, pity: AL.pity, n: albStickers().length }); }, tourPlay: () => tourPlay(), tourNew: (di, mine) => { newTour(di, mine, tourTeams(TOURS[di])); }, tourTab: n => { tab = n; }, tourSetup: (st, di) => { tourStep = st; tourDef = di || 0; tourTeams0 = tourTeams(TOURS[tourDef]); tourMine = 3; state = 'tour'; }, setState: x => { state = x; }, tourRun: (di, mine, win) => { const t = tourTeams(TOURS[di]); if (t.length < TOURS[di].n) return 'te weinig teams ' + t.length; newTour(di, mine, t); let n = 0, log = []; while (tourNext() !== null && n < 30) { const ph = TT.phase; const r = finishTour(win ? 3 : 0, win ? 0 : 3); log.push(ph[0] + ':' + r.join('|')); n++; } return JSON.stringify({ n, champ: TT.champ, out: TT.out, mine: TT.mine, last: log.slice(-2) }); }, tourState: () => TT ? TT.phase + TT.round : null, goTour: () => { state = 'tour'; tab = 0; tourStep = 0; }, shoot: (x, y, vx, vy, lt) => { ball.owner = null; ball.x = x; ball.y = y; ball.vx = vx; ball.vy = vy; ball.z = 0; ball.vz = 0; ball.lt = lt; }, ball: () => ({ x: Math.round(ball.x), y: Math.round(ball.y), o: ball.owner ? ball.owner.t + ':' + ball.owner.i : null, lt: ball.lt }), skip: () => { if (state === 'play') timeLeft = 0.05; }, st: () => state, goals: n => { score[0] += n; }, pk: (a, b) => { const P = pool(); const i = P.findIndex(t => t.kit.name === a), j = P.findIndex(t => t.kit.name === b); pickA = i; pickB = j; pickSide = -1; state = 'pick'; return [i, j, P.length]; }, sel: n => { selV = n; }, start: () => { const P = pool(); startMatch({ kind: 'friendly', a: P[pickA].kit, b: P[pickB].kit, ta: P[pickA].ts, tb: P[pickB].ts }); }, mode: m => { crestMode = m; }, give: () => { const k = players.find(p => p.t === 0 && p.i === 0); ball.owner = k; ball.x = k.x; ball.y = k.y; ball.vx = ball.vy = 0; }, pass: () => doPass(), info: () => ({ c: ctrl && ctrl.i, o: ball.owner && (ball.owner.t + ':' + ball.owner.i), v: Math.round(Math.hypot(ball.vx, ball.vy)) }), names: () => players.map(p => p.t + ':' + p.num + ' ' + p.name).join(' | '), sp: (k, c) => spHash(k, c), spSt: () => JSON.stringify(SP ? { ph: SP.ph, out: SP.out, aim: SP.aim, pow: SP.pow, dist: Math.round(SP.dist), wall: SP.wall.length, mode: SP.mode, user: SP.user, pen: SP.pen } : { last: spLast, state }), spShot: (tx, ty, pw, cv, mode) => { if (!SP) return 'geen'; SP.ph = 'aim'; SP.aim[0] = tx; SP.aim[1] = ty; SP.pow = pw; SP.cv = cv || 0; SP.mode = mode || 'shot'; spUserShoot(); return SP.ph; }, spDv: (x, y) => { if (SP) SP.dv = [x, y]; }, spSkip: () => spSkip(), score: () => score.join('-'), tijd: () => Math.round(tNow * 100) / 100, spTS: v => { spTS = v; }, spK: () => { if (!SP) return ''; spKeeperPose(); return JSON.stringify({ t: +SP.t.toFixed(2), ct: +SP.ct.toFixed(2), ph: SP.ph, dvx: +SP.dvx.toFixed(2), dvy: +SP.dvy.toFixed(2), k: +SPK.k.toFixed(2), rot: +SPK.rot.toFixed(2), x: +SPK.x.toFixed(2), tx: SP.fl ? +SP.fl.tx.toFixed(2) : null, ty: SP.fl ? +SP.fl.ty.toFixed(2) : null, c: SP.catch }); } };
const EMB = /*ROSTER*/null;
function applyRoster(r) {
  albCache = {}; albCS = null;
  if (!r || !Array.isArray(r.competitions)) return;
  const col = /^#[0-9a-f]{6}$/i;
  const ok = r.competitions.length > 0 && r.competitions.every(c => c && typeof c.name === 'string' && Array.isArray(c.teams) && c.teams.length >= 2 && c.teams.length <= 64 && c.teams.every(t => t && typeof t.name === 'string' && col.test(t.shirt || '')));
  if (!ok) return;
  ALLC = r.competitions;
  try { localStorage.setItem('krakRoster2', JSON.stringify(r)); } catch (e) {}
  if (!r.competitions.some(c => c.teams.length === 8)) return;
  if (COMPS && S && S.season && !S.season.done) return;
  COMPS = r.competitions; if (compIdx >= COMPS.length || COMPS[compIdx].teams.length !== 8) compIdx = COMPS.findIndex(c => c.teams.length === 8); applyComp(compIdx);
  try { localStorage.setItem('krakRoster2', JSON.stringify(r)); } catch (e) {}
}
setTimeout(() => fetch('players.json', { cache: 'no-store' }).then(x => x.ok ? x.json() : null).then(j => { if (j && typeof j === 'object') SQUADS = j; }).catch(() => {}), 500);
setTimeout(() => fetch('roster.json', { cache: 'no-store' }).then(x => x.ok ? x.json() : null).then(applyRoster).catch(() => {}), 300);
let COMPS = null, ALLC = null, compIdx = 0;
function applyComp(i) {
  if (!COMPS || !COMPS[i] || COMPS[i].teams.length !== 8) return; compIdx = i;
  COMPS[i].teams.forEach((t, j) => { KITS[j] = { name: String(t.name).slice(0, 24), code: String(t.code || t.name).slice(0, 3).toUpperCase(), shirt: t.shirt, shorts: t.shorts || '#ffffff', sock: t.sock || t.shirt, trim: t.trim || '#ffffff' }; if (t.ts > 40 && t.ts < 95) TS[j] = t.ts; });
  applyKits();
}
const insBtn = document.getElementById('install');
// kwaliteit: bij te trage beelden een stap lager (eerst scherpte, dan effecten); na 20 s vlot (boven 55 beelden per seconde) een stap terug omhoog.
// krakQ is alleen het startniveau voor de volgende keer; een stap omhoog wordt ook bewaard. Wie na een stap omhoog snel weer zakt, wacht de volgende keer langer (max 160 s).
let qUpT = 0, qUpWait = 20, qLastUp = -1e9;
function saveQ() { try { localStorage.setItem('krakQ', JSON.stringify({ q: Q, d: dprCap, w: qUpWait })); } catch (e) {} }
function degrade() {
  if (dprCap > 1 && (window.devicePixelRatio || 1) > 1) { dprCap = Math.max(1, dprCap - 0.5); resize(); }
  else if (Q < 2) { Q++; TXL = [2, 1.3, 1][Q]; resize(); buildGrass(); }
  else return;
  if (tNow - qLastUp < 15) qUpWait = Math.min(160, qUpWait * 2);
  qUpT = 0; saveQ();
}
function upgrade() {
  if (Q > 0) { Q--; TXL = [2, 1.3, 1][Q]; resize(); buildGrass(); }
  else if (dprCap < 2 && (window.devicePixelRatio || 1) > dprCap) { dprCap = Math.min(2, dprCap + 0.5); resize(); }
  else return;
  qLastUp = tNow; qUpT = 0; qN = 0; qT = 0; saveQ();
}
try { const o = JSON.parse(localStorage.getItem('krakQ')); if (o && o.q >= 0 && o.q <= 2) { Q = o.q; TXL = [2, 1.3, 1][Q]; dprCap = Math.max(1, Math.min(2, o.d || 2)); if (o.w >= 20 && o.w <= 160) qUpWait = o.w; } } catch (e) {}
let last = performance.now(), nextT = 0, simAcc = 0;
const STEP = 1 / 60, FRAME = 1000 / 60;
function loop(now) {
  // hoogstens 60 beelden per seconde: op 90 en 120 Hz schermen wordt een deel van de beelden overgeslagen
  if (now < nextT - 1.5) { requestAnimationFrame(loop); return; }
  nextT = Math.max(nextT + FRAME, now - FRAME);
  const w0 = DBG ? performance.now() : 0;
  if (DBG) { dbgFc++; if (now - dbgF0 >= 1000) { dbgFps = dbgFc * 1000 / (now - dbgF0); dbgFc = 0; dbgF0 = now; } }
  const raw = (now - last) / 1000;
  const dt = Math.min(0.066, raw); last = now; tNow += dt;
  if ((state === 'play' || state === 'sp') && raw < 1) {
    qT += raw; if (++qN >= 40) { const avg = qT / qN; if (avg > 1 / 30) degrade(); else if (avg < 1 / 55) { qUpT += qT; if (qUpT >= qUpWait) upgrade(); } else qUpT = 0; qN = 0; qT = 0; }
  }
  // vaste tijdstap van 1/60 s met opsparing: het spel loopt even snel op elke gsm. Hoogstens 5 stappen per beeld, de rest vervalt.
  { const t0 = DBG ? performance.now() : 0;
    let d = Math.min(0.25, raw); if (Math.abs(d - STEP) < 0.002) d = STEP; // kleine schommelingen van een 60 Hz-scherm gelijktrekken
    simAcc += d * (state === 'play' ? SPDS[spdIdx] : 1);
    let n = 0; while (simAcc >= STEP - 1e-9 && n < 5) { update(STEP); simAcc -= STEP; n++; }
    if (simAcc >= STEP) simAcc = 0;
    if (DBG) DT.upd = performance.now() - t0; }
  if (court && !(state === 'play' || state === 'goal' || state === 'pause' || state === 'end' || state === 'voor' || state === 'sp')) setCourt(null);
  if (court) { zoom = Math.min(2.6, SW / ((W + 150) * (SF + SN) / 2)); camX = W / 2; } else {
  const vis = SW / 2 / (zoom * (SF + SN) / 2);
  const target = Math.max(vis - 70, Math.min(W - vis + 70, ball.x + ball.vx * 0.22));
  camX += (target - camX) * Math.min(1, 4 * dt); }
  const sh = state === 'play' || state === 'goal'; bS.classList.toggle('hide', !sh); bP.classList.toggle('hide', !sh); if (insBtn) insBtn.classList.toggle('hide', state !== 'menu'); // alleen in het hoofdmenu, anders bedekt hij de tabbladen en munten
  if (state === 'play' && document.body.classList.contains('portrait')) state = 'pause';
  { const lb = (ctrl && ball && ball.owner !== ctrl) ? 'TAKEL' : 'PASS'; if (lb !== pLab) { pLab = lb; bP.textContent = lb; } }
  { const ch = charging ? Math.min(1, charge / 0.7) : 0, v = Math.round(ch * 10); if (v !== bsV) { bsV = v; bS.style.boxShadow = v ? '0 0 0 ' + (3 + v) + 'px rgba(255,212,0,' + (0.5 + ch * 0.5) + ')' : ''; } }
  if (updBar) updBar.classList.toggle('hide', sh || state === 'sp');
  draw();
  if (DBG) { dbgW[dbgWi] = performance.now() - w0; dbgWi = (dbgWi + 1) % 60; }
  requestAnimationFrame(loop);
}
loadSet(); loadS(); loadT(); loadAl(); phLoad(); try { applyRoster(JSON.parse(localStorage.getItem('krakRoster2'))); } catch (e) {} try { if (typeof EMB === 'object' && EMB) applyRoster(EMB); } catch (e) {} if (!COMPS) { COMPS = [{ name: 'WEST-VLAANDEREN A', teams: KITS.slice() }]; } applyComp(compIdx); applyKits(); cx.imageSmoothingQuality = 'high'; resize(); makeShadow(); mk();
setTimeout(() => { buildGrass(); const l = document.getElementById('load'); if (l) l.remove(); last = performance.now(); requestAnimationFrame(loop);
  { const m = /straat=(\w+)/.exec(location.hash || ''); if (m && COURTS[m[1]]) setTimeout(() => { stSel = Object.keys(COURTS).indexOf(m[1]); startStreet(m[1]); if (/go/.test(location.hash)) beginMatch(); }, 400); else if (/goto=/.test(location.hash || '')) setTimeout(() => { const g = /goto=(\w+)/.exec(location.hash); if (g && SCREENS[g[1]]) goTo(g[1]); }, 400); else if (/straatveld/.test(location.hash || '')) setTimeout(() => { goTo('straat'); stStep = 1; }, 400); else if (/straatmenu/.test(location.hash || '')) setTimeout(() => { goTo('straat'); const ma = /a=([^&]+)/.exec(location.hash); if (ma) { const P = pool(), i = P.findIndex(t => t.kit.name === decodeURIComponent(ma[1])); if (i >= 0) pickA = i; } }, 400); else if (/voorveld/.test(location.hash || '')) setTimeout(() => startMatch(), 400); }
  { const h = location.hash || '', m = /(vrijetrap|penalty3d|penalty)/.exec(h); if (m) setTimeout(() => spHash(m[1], /cpu/.test(h)), 1100); }
  { const m = /#(winkel|werelden|reeks|upgrade)\b/.exec(location.hash || ''); if (m) setTimeout(() => econHash(m[1]), 400); } }, 60);
authInit();
{ const mm = /munten=([A-Za-z0-9.\-]+)/.exec(location.hash || ''); if (mm) { let tries = 0; const iv = setInterval(() => { if (++tries > 120) clearInterval(iv); else if (!document.getElementById('authov') && authUser) { clearInterval(iv); redeemDialog(mm[1]); } }, 1000); } }
// service worker + melding "Nieuwe versie beschikbaar" als er een nieuwe klaarstaat
let updBar = null;
function showUpdate(sw) {
  if (updBar) return;
  updBar = document.createElement('button'); updBar.type = 'button'; updBar.textContent = 'Nieuwe versie beschikbaar, tik om te vernieuwen';
  updBar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);top:max(8px,env(safe-area-inset-top));z-index:40;padding:9px 14px;border-radius:12px;border:2px solid #ffd400;background:rgba(8,16,50,.92);color:#fff;font:700 14px system-ui,sans-serif';
  updBar.onclick = () => { updBar.textContent = 'Even geduld...'; applyUpd(sw); };
  document.body.appendChild(updBar);
}
function applyUpd(sw) {
  let done = false; const go = () => { if (!done) { done = true; location.reload(); } };
  navigator.serviceWorker.addEventListener('controllerchange', go); try { sw.postMessage('skip'); } catch (e) {} setTimeout(go, 2500);
}
let swReg = null, updMsg = '';
function gameVer() { try { const m = /v=(\d+)/.exec(document.querySelector('script[src*="game.js"]').getAttribute('src')); return m ? m[1] : '?'; } catch (e) { return '?'; } }
// update-knop: haalt alles vers van de server (cache en service worker leeg, daarna herladen). Voortgang blijft in localStorage en in je account.
function checkUpdate() {
  if (!navigator.onLine) { updMsg = 'GEEN INTERNET'; setTimeout(() => { updMsg = ''; }, 4000); return; }
  updMsg = 'VERNIEUWEN...';
  fetch('sw.js', { cache: 'no-store' }).then(r => { if (!r.ok) throw 0; return r.text(); }).then(t => {
    const nv = /VERSIE = (\d+)/.exec(t); const wipe = [];
    if (window.caches) wipe.push(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))));
    if (navigator.serviceWorker) wipe.push(navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(r => r.unregister()))));
    return Promise.all(wipe).then(() => { updMsg = nv && nv[1] !== gameVer() ? 'NIEUWE VERSIE v' + nv[1] + '...' : 'LAATSTE VERSIE LADEN...'; setTimeout(() => location.reload(), 600); });
  }).catch(() => { updMsg = 'LUKT NU NIET, PROBEER LATER'; setTimeout(() => { updMsg = ''; }, 4000); });
}
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').then(reg => {
  swReg = reg;
  const watch = w => { if (!w) return; w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdate(w); }); };
  if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
  watch(reg.installing); reg.addEventListener('updatefound', () => watch(reg.installing));
}).catch(() => {});
})();
