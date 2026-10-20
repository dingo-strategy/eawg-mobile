(() => {
  "use strict";
  const F = document.getElementById("c"),
    e = F.getContext("2d");
  let at = 0,
    Kt = 2,
    Ie = 0,
    Oe = 0,
    He = 1,
    j = 1,
    ut = 1,
    ce = 0,
    E = 1e3,
    Mt = null,
    he = null,
    de = null;
  const ot = 190,
    me = 590,
    _t = 0.66,
    we = 1.22;
  let te = 1e3 / 2,
    Pe = 1.65,
    Ut = 0,
    Bt = 0,
    Ve = 0;
  function ue() {
    const t = (He = Math.min(Kt, window.devicePixelRatio || 1)),
      o = innerWidth,
      f = innerHeight;
    (F.width = Math.round(o * t)),
      (F.height = Math.round(f * t)),
      (F.style.width = o + "px"),
      (F.style.height = f + "px"),
      (ut = Math.min(F.width / 800, F.height / 600)),
      (E = F.width / ut),
      (ce = (F.height - 600 * ut) / 2),
      t0(),
      (he = e.createRadialGradient(E / 2, 600 * 0.55, 600 * 0.4, E / 2, 600 * 0.55, E * 0.62)),
      he.addColorStop(0, "rgba(0,0,0,0)"),
      he.addColorStop(1, "rgba(0,0,0,.55)"),
      (de = e.createLinearGradient(0, ot, 0, ot + 170)),
      de.addColorStop(0, "rgba(0,10,0,.35)"),
      de.addColorStop(1, "rgba(0,10,0,0)");
  }
  function t0() {
    const t = Math.ceil(E + 360),
      o = ot + 10;
    (j = at >= 1 ? 1 : Math.max(1, Math.min(2, ut))),
      (Mt = document.createElement("canvas")),
      (Mt.width = Math.ceil(t * j)),
      (Mt.height = Math.ceil(o * j));
    const f = Mt.getContext("2d");
    f.scale(j, j);
    let n = 7;
    const a = () => {
        (n |= 0), (n = (n + 1831565813) | 0);
        let u = Math.imul(n ^ (n >>> 15), 1 | n);
        return (u = (u + Math.imul(u ^ (u >>> 7), 61 | u)) ^ u), ((u ^ (u >>> 14)) >>> 0) / 4294967296;
      },
      i = f.createLinearGradient(0, 0, 0, o);
    i.addColorStop(0, "#05070f"), i.addColorStop(1, "#121c38"), (f.fillStyle = i), f.fillRect(0, 0, t, o);
    const s = [
        "#d9e8f5",
        "#8fb8e0",
        "#e8e8ea",
        "#1d2a52",
        "#c0392b",
        "#2c3e66",
        "#f4d03f",
        "#ffffff",
        "#3c4a6b",
        "#9b2d2d",
      ],
      r = ["#f1c9a5", "#d9a273", "#a8744a", "#6b4428"],
      m = document.createElement("canvas");
    (m.width = Math.ceil(t * j)), (m.height = Math.ceil(o * j));
    const l = m.getContext("2d");
    l.scale(j, j);
    for (let u = 46; u < o - 28; u += 6) {
      const b = (u - 46) / (o - 76),
        p = 0.35 + 0.65 * b;
      for (let M = -3; M < t; M += 6) {
        const R = M + a() * 3,
          Y = u + a() * 2;
        (l.globalAlpha = 1),
          (l.fillStyle = s[(a() * s.length) | 0]),
          l.fillRect(R, Y + 2.6, 5, 7),
          (l.fillStyle = r[(a() * 4) | 0]),
          l.beginPath(),
          l.arc(R + 2.5, Y + 1.6, 2.2, 0, 7),
          l.fill(),
          (l.globalAlpha = 1 - p),
          (l.fillStyle = "#04070f"),
          l.fillRect(R - 0.5, Y - 1, 6, 11);
      }
      ((u - 46) / 6) % 8 === 7 &&
        ((l.globalAlpha = 0.55), (l.fillStyle = "#05080f"), l.fillRect(0, u + 8, t, 2));
    }
    (l.globalAlpha = 1),
      "filter" in f && (f.filter = "blur(" + 0.7 * j + "px)"),
      f.save(),
      f.setTransform(1, 0, 0, 1, 0, 0),
      f.drawImage(m, 0, 0),
      f.restore(),
      (f.filter = "none"),
      (f.globalAlpha = 1);
    const h = f.createLinearGradient(0, 0, 0, 70);
    h.addColorStop(0, "#03050a"),
      h.addColorStop(0.7, "rgba(8,12,22,.92)"),
      h.addColorStop(1, "rgba(8,12,22,0)"),
      (f.fillStyle = h),
      f.fillRect(0, 0, t, 70),
      (f.strokeStyle = "rgba(70,85,120,.45)"),
      (f.lineWidth = 1);
    for (let u = -40; u < t; u += 70)
      f.beginPath(),
        f.moveTo(u, 0),
        f.lineTo(u + 45, 52),
        f.moveTo(u + 70, 0),
        f.lineTo(u + 25, 52),
        f.stroke();
    for (let u = 30; u < t; u += 70) {
      const b = 22 + (((u / 70) | 0) % 2) * 8;
      (f.fillStyle = "#fff"),
        f.beginPath(),
        f.arc(u, b, 2.4, 0, 7),
        f.fill(),
        (f.strokeStyle = "rgba(255,255,255,.6)"),
        (f.lineWidth = 1.2),
        f.beginPath(),
        f.moveTo(u - 11, b),
        f.lineTo(u + 11, b),
        f.moveTo(u, b - 11),
        f.lineTo(u, b + 11),
        f.stroke(),
        (f.fillStyle = "rgba(255,255,255,.08)"),
        f.beginPath(),
        f.arc(u, b, 14, 0, 7),
        f.fill();
    }
    const d = f.createLinearGradient(0, o - 32, 0, o);
    d.addColorStop(0, "#0c1424"),
      d.addColorStop(1, "#04060c"),
      (f.fillStyle = d),
      f.fillRect(0, o - 32, t, 32);
  }
  addEventListener("resize", ue);
  function O(t, o, f) {
    const n = o / 600,
      a = (_t + (we - _t) * n) * Pe;
    return [E / 2 + (t - te) * a, ot + (me - ot) * n - (f || 0) * a, a];
  }
  let A = null,
    Ht = null;
  function ge() {
    if (A) {
      A.state === "suspended" && A.resume();
      return;
    }
    try {
      A = new (window.AudioContext || window.webkitAudioContext)();
      const t = A.sampleRate * 2,
        o = A.createBuffer(1, t, A.sampleRate),
        f = o.getChannelData(0);
      let n = 0;
      for (let s = 0; s < t; s++) (n = (n + 0.02 * (Math.random() * 2 - 1)) / 1.02), (f[s] = n * 3.5);
      const a = A.createBufferSource();
      (a.buffer = o), (a.loop = !0);
      const i = A.createBiquadFilter();
      (i.type = "lowpass"),
        (i.frequency.value = 800),
        (Ht = A.createGain()),
        (Ht.gain.value = ct ? 0 : 0.1),
        a.connect(i),
        i.connect(Ht),
        Ht.connect(A.destination),
        a.start();
    } catch {
      A = null;
    }
  }
  function rf(t, o) {
    if (!A || ct) return;
    const f = Ht.gain,
      n = A.currentTime;
    f.cancelScheduledValues(n),
      f.setValueAtTime(f.value, n),
      f.linearRampToValueAtTime(t, n + 0.2),
      f.linearRampToValueAtTime(0.1, n + o);
  }
  function e0(t) {
    if (!A || ct) return;
    const o = A.currentTime,
      f = A.createOscillator(),
      n = A.createGain();
    (f.type = "sine"),
      f.frequency.setValueAtTime(190, o),
      f.frequency.exponentialRampToValueAtTime(55, o + 0.12),
      n.gain.setValueAtTime(t, o),
      n.gain.exponentialRampToValueAtTime(0.001, o + 0.16),
      f.connect(n),
      n.connect(A.destination),
      f.start(o),
      f.stop(o + 0.17);
  }
  function ee(t) {
    if (!A || ct) return;
    const o = A.currentTime,
      f = A.createOscillator(),
      n = A.createOscillator(),
      a = A.createGain(),
      i = A.createGain();
    (f.type = "square"),
      (f.frequency.value = 2700),
      (n.frequency.value = 34),
      (a.gain.value = 90),
      n.connect(a),
      a.connect(f.frequency),
      i.gain.setValueAtTime(1e-4, o),
      i.gain.exponentialRampToValueAtTime(0.1, o + 0.03),
      i.gain.setValueAtTime(0.1, o + t - 0.05),
      i.gain.exponentialRampToValueAtTime(1e-4, o + t),
      f.connect(i),
      i.connect(A.destination),
      f.start(o),
      n.start(o),
      f.stop(o + t + 0.02),
      n.stop(o + t + 0.02);
  }
  const gt = {},
    T = { id: null, ox: 0, oy: 0, x: 0, y: 0, vx: 0, vy: 0 };
  addEventListener("keydown", (t) => {
    (gt[t.code] = 1),
      ge(),
      t.code === "Escape" && y === "play"
        ? (y = "pause")
        : y !== "play" && y !== "goal"
          ? t.repeat || v0(t.code)
          : t.code === "Space" && y === "play" && !t.repeat && Sf(),
      t.code === "KeyX" && Ef(), t.code === "KeyC" && Tk();
  }),
    addEventListener("keyup", (t) => {
      (gt[t.code] = 0), t.code === "Space" && Ue();
    }),
    F.addEventListener("pointerdown", (t) => {
      ge();
      {
        const o = He;
        if (x0((t.clientX * o) / ut, (t.clientY * o - ce) / ut)) return;
      }
      y === "play" &&
      t.clientX < innerWidth * 0.55 &&
      T.id === null &&
      ((T.id = t.pointerId),
      (T.ox = T.x = t.clientX),
      (T.oy = T.y = t.clientY),
      (T.vx = T.vy = 0),
      F.setPointerCapture(t.pointerId));
    if (y === "train" && pn && !pn.anim && pn.r < 5 && !pn.msg)
      (pn.dr = !0), (pn.aim = [(t.clientX * He) / ut, (t.clientY * He - ce) / ut]);
  }),
    F.addEventListener("pointermove", (t) => {
      if (pn && pn.dr) {
        pn.aim = [(t.clientX * He) / ut, (t.clientY * He - ce) / ut];
        return;
      }
      if (t.pointerId !== T.id) return;
      let o = t.clientX - T.ox,
        f = t.clientY - T.oy;
      const n = Math.hypot(o, f),
        a = 55;
      n > a && ((o *= a / n), (f *= a / n)),
        (T.x = T.ox + o),
        (T.y = T.oy + f),
        (T.vx = o / a),
        (T.vy = f / a);
    });
  const lf = (t) => {
    t.pointerId === T.id && ((T.id = null), (T.vx = T.vy = 0));
    pn && pn.dr && ((pn.dr = !1), pns());
  };
  F.addEventListener("pointerup", lf), F.addEventListener("pointercancel", lf);
  const Ee = document.getElementById("bShoot"),
    cf = document.getElementById("bPass");
  Ee.addEventListener("pointerdown", (t) => {
    t.preventDefault(), ge(), Sf();
  }),
    Ee.addEventListener("pointerup", (t) => {
      t.preventDefault(), Ue();
    }),
    Ee.addEventListener("pointercancel", () => Ue()),
    cf.addEventListener("pointerdown", (t) => {
      t.preventDefault(), ge(), Ef();
    }),
    document.addEventListener("contextmenu", (t) => t.preventDefault());
  const bg = document.getElementById("bTackle");
  bg &&
    bg.addEventListener("pointerdown", (t) => {
      t.preventDefault(), ge(), Tk();
    });
  function hf() {
    let t = T.vx,
      o = T.vy;
    (gt.ArrowLeft || gt.KeyA) && (t -= 1),
      (gt.ArrowRight || gt.KeyD) && (t += 1),
      (gt.ArrowUp || gt.KeyW) && (o -= 1),
      (gt.ArrowDown || gt.KeyS) && (o += 1);
    const f = Math.hypot(t, o);
    return f > 1 && ((t /= f), (o /= f)), [t, o];
  }
  const z = [
      {
        code: "GFC",
        trim: "#ffffff",
        shirt: "#63b6f2",
        shorts: "#f3f3f3",
        sock: "#63b6f2",
        gk: "#d8ff2a",
        gkShorts: "#111",
        gkSock: "#111",
      },
      {
        code: "RSH",
        trim: "#16224a",
        shirt: "#f4f4f4",
        shorts: "#16224a",
        sock: "#f4f4f4",
        gk: "#ff7a1a",
        gkShorts: "#222",
        gkSock: "#222",
      },
    ],
    f0 = [
      ["VERBIST", "DE SMET", "JANSSENS", "PEETERS", "WILLEMS"],
      ["CLAES", "HERMANS", "GOOSSENS", "LAMBERT", "DUBOIS"],
    ],
    o0 = [
      [1, 4, 8, 10, 9],
      [1, 5, 6, 7, 11],
    ],
    n0 = ["#f1c9a5", "#d9a273", "#a8744a", "#6b4428", "#3e2a1c"],
    s0 = ["#1a1209", "#3a2a14", "#7b5a2a", "#0e0e0e", "#a0522d"],
    a0 = ["#ff8a1f", "#ffe14a", "#ff4fa3", "#37e6c8", "#c6ff2a", "#fff"],
    Se = [
      [40, 300],
      [230, 190],
      [230, 410],
      [400, 300],
      [540, 300],
    ];
  let y = "menu",
    N = [],
    c,
    P = [0, 0],
    fe = 120,
    df = "",
    We = 0,
    ye = 0,
    Ge = null,
    G = null,
    be = 0,
    Rt = !1,
    Ft = [];
  function mf() {
    N = [];
    for (let t = 0; t < 2; t++)
      for (let o = 0; o < 5; o++) {
        const f = t ? 1e3 - Se[o][0] : Se[o][0],
          n = t * 5 + o;
        N.push({
          t,
          i: o,
          x: f,
          y: Se[o][1],
          vx: 0,
          vy: 0,
          hx: f,
          hy: Se[o][1],
          fx: t ? -1 : 1,
          fy: 0,
          cd: 0,
          hold: 0,
          ph: Math.random() * 6,
          face: t ? -1 : 1,
          kk: 0,
          sl: 0,
          name: f0[t][o],
          num: o0[t][o],
          rate: 62 + ((n * 7) % 30),
          hs: (n * 5) % 4,
          skin: n0[(n * 3 + 1) % 5],
          hair: s0[(n * 2) % 5],
          boot: a0[n % 6],
        });
      }
    c = { x: 1e3 / 2, y: 600 / 2, vx: 0, vy: 0, owner: null, z: 0, vz: 0, rot: 0, trail: [] };
  }
  function uf(t) {
    for (const f of N)
      (f.x = f.hx),
        (f.y = f.hy),
        (f.vx = f.vy = 0),
        (f.cd = 0),
        (f.hold = 0),
        (f.fx = f.t ? -1 : 1),
        (f.fy = 0),
        (f.kk = 0);
    const o = N.find((f) => f.t === t && f.i === 4);
    (o.x = 1e3 / 2 + (t ? 20 : -20)),
      (o.y = 600 / 2),
      (o.hold = -0.8),
      (c.owner = o),
      (c.vx = c.vy = 0),
      (c.x = o.x),
      (c.y = o.y),
      (c.z = c.vz = 0),
      (c.trail = []),
      (Rt = !1);
  }
  const gf = (t) => c.owner && c.owner.t === t;
  function i0() {
    const t = c.owner;
    if (t && t.t === 0 && t.i !== 0) {
      G = t;
      return;
    }
    let o = null,
      f = 1e9;
    for (const n of N) {
      if (n.t || n.i === 0) continue;
      const a = Math.hypot(n.x - c.x, n.y - c.y) - (n === G ? 40 : 0);
      a < f && ((f = a), (o = n));
    }
    G = o;
  }
  function pe(t, o, f, n) {
    n *= Math.max(0.9, Math.min(1.1, 0.94 + ((t.rate || 60) - 60) * 0.004));
    const a = Math.hypot(o, f) || 1;
    (c.owner = null),
      (c.vx = (o / a) * n),
      (c.vy = (f / a) * n),
      (c.x = t.x + (o / a) * 20),
      (c.y = t.y + (f / a) * 20),
      (c.vz = n >= 600 ? 150 + Math.random() * 90 : n >= 420 ? 55 : 0),
      (c.z = 0),
      (t.cd = 0.4),
      (t.hold = 0),
      (t.kk = 0.25),
      (Ge = t),
      Math.abs(o) > 0.2 * a && (t.face = o > 0 ? 1 : -1),
      e0(Math.min(0.5, n / 1400));
  }
  function r0(t) {
    const o = t.t ? 0 : 1e3;
    let f = t.fx,
      n = t.fy;
    const a = 600 / 2 + (Math.random() - 0.5) * 180 * 0.7,
      i = o - t.x,
      s = a - t.y,
      r = Math.atan2(n, f),
      m = Math.atan2(s, i),
      l = Math.abs(((r - m + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    return Math.abs(o - t.x) < 450 && l < 0.8 && ((f = i), (n = s)), [f, n];
  }
  function De(t, o, f) {
    const n = Math.hypot(o, f) || 1;
    (o /= n), (f /= n);
    let a = null,
      i = -1e9;
    for (const s of N) {
      if (s.t !== t.t || s === t) continue;
      const r = s.x - t.x,
        m = s.y - t.y,
        l = Math.hypot(r, m);
      if (l < 60) continue;
      let h = ((r * o + m * f) / l) * 200 - l * 0.15;
      for (const d of N) d.t !== t.t && Math.hypot(d.x - s.x, d.y - s.y) < 50 && (h -= 80);
      s.i === 0 && (h -= 150), h > i && ((i = h), (a = s));
    }
    return a;
  }
  function Ke(t, o) {
    const f = Math.hypot(o.x - t.x, o.y - t.y);
    pe(t, o.x + o.vx * 0.25 - t.x, o.y + o.vy * 0.25 - t.y, Math.min(750, Math.max(250, f * 1.1 + 100)));
  }
  function Ef() {
    if (y !== "play" || !c.owner || c.owner !== G) return;
    const t = G;
    let [o, f] = hf();
    Math.hypot(o, f) < 0.2 && ((o = t.fx), (f = t.fy));
    const n = De(t, o, f);
    n ? Ke(t, n) : pe(t, o, f, 420);
  }
  function Sf() {
    y === "play" && c.owner === G && G && ((Rt = !0), (be = 0));
  }
  function Tk() {
    if (y !== "play" || !G || (G.sl || 0) > 0) return;
    if (!c.owner || c.owner.t !== 1) return;
    (G.sl = 0.38), (G.kk = 0.25), ee(0.2);
  }
  function Ue() {
    if (Rt && y === "play" && c.owner === G && G) {
      const [t, o] = r0(G);
      pe(G, t, o, 480 + (Math.min(be, 0.7) / 0.7) * 320);
    }
    Rt = !1;
  }
  function ke(t, o, f, n) {
    const a = Math.min(1, 9 * n);
    (t.vx += (o - t.vx) * a), (t.vy += (f - t.vy) * a);
  }
  function Be(t, o, f, n, a) {
    const i = o - t.x,
      s = f - t.y,
      r = Math.hypot(i, s);
    let m = 0,
      l = 0;
    if (r > 6) {
      const h = Math.min(n, r * 5);
      (m = (i / r) * h), (l = (s / r) * h);
    }
    ke(t, m, l, a);
  }
  function l0(t, o, f) {
    const n = c.owner === t,
      a = gf(t.t),
      i = t.t ? 0 : 1e3,
      s = (t.t && !K && !yt ? M0[At] : 1) * _e(t),
      r = 165 * s;
    if (t.i === 0) {
      const h = t.t ? 966 : 34;
      let d = h,
        u = Math.max(600 / 2 - 180 / 2 + 12, Math.min(600 / 2 + 180 / 2 - 12, c.y));
      if (n) {
        if (((t.hold += o), t.hold > 0.7)) {
          const b = De(t, t.t ? -1 : 1, 0);
          b && Ke(t, b);
        }
        ke(t, 0, 0, o);
        return;
      }
      !c.owner && Math.hypot(c.x - t.x, c.y - t.y) < 170 && Math.abs(c.x - h) < 200 && ((d = c.x), (u = c.y)),
        Be(t, d, u, 175 * s, o);
      return;
    }
    if (n) {
      t.hold += o;
      let h = 0,
        d = 0,
        u = 1e9;
      for (const V of N) {
        if (V.t === t.t) continue;
        const q = t.x - V.x,
          X = t.y - V.y,
          C = Math.hypot(q, X);
        (u = Math.min(u, C)), C < 90 && C > 0 && ((h += (q / C) * (90 - C)), (d += (X / C) * (90 - C)));
      }
      const b = i - t.x,
        p = 600 / 2 - t.y,
        M = Math.hypot(b, p) || 1,
        R = (b / M) * r + h * 2.2,
        Y = (p / M) * r + d * 2.2,
        pt = Math.hypot(R, Y) || 1;
      if ((ke(t, (R / pt) * r * 0.92, (Y / pt) * r * 0.92, o), t.hold > 0.3 && Math.abs(i - t.x) < 320)) {
        const V = 300 + (Math.random() - 0.5) * 180 * 0.8;
        pe(t, i - t.x, V - t.y, 560 + Math.random() * 150);
      } else if (t.hold > 1 || (u < 42 && t.hold > 0.4)) {
        const V = De(t, i - t.x, 0);
        V && Ke(t, V);
      }
      return;
    }
    let m, l;
    if (f === t) {
      const h = c.owner;
      (m = h ? h.x : c.x + c.vx * 0.2), (l = h ? h.y : c.y + c.vy * 0.2), Be(t, m, l, 175 * _e(t), o);
      return;
    }
    (m = t.hx + (c.x - 1e3 / 2) * 0.35),
      (l = t.hy + (c.y - 600 / 2) * 0.3),
      a && t.i >= 3 && (m += (t.t ? -1 : 1) * 150),
      (m = Math.max(60, Math.min(940, m))),
      (l = Math.max(30, Math.min(570, l))),
      Be(t, m, l, r, o);
  }
  function c0() {
    Ft = [];
    const t = ["#ffd400", "#63b6f2", "#fff", "#ff3b3b", "#4cd964"];
    for (let o = 0; o < 120; o++)
      Ft.push({
        x: Math.random() * E,
        y: -20 - Math.random() * 220,
        vx: (Math.random() - 0.5) * 60,
        vy: 70 + Math.random() * 150,
        r: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 10,
        c: t[o % 5],
        w: 5 + Math.random() * 6,
      });
  }
  function yf(t) {
    P[t]++,
      (y = "goal"),
      (ye = t),
      (Ve = 0),
      (df =
        "GOAL!" +
        (Ge ? "  " + Ge.name : "") +
        "  " +
        Math.max(1, Math.ceil((Pt - fe) / 60)) +
        "'"),
      (We = 2.2),
      (c.vx = c.vy = 0),
      (c.owner = null),
      (Rt = !1),
      (Bt = 0.5),
      c0(),
      ee(0.9),
      rf(t === 0 ? 0.65 : 0.4, 3.5);
  }
  function h0(t) {
    for (const n of Ft) (n.x += n.vx * t), (n.y += n.vy * t), (n.r += n.vr * t);
    if (((Ft = Ft.filter((n) => n.y < 630)), (Bt = Math.max(0, Bt - t)), y === "goal")) {
      (Ve += t), (We -= t);
      for (const n of N) (n.vx *= 0.9), (n.vy *= 0.9), (n.ph += t * 3);
      We <= 0 && (uf(1 - ye), (y = "play"), ee(0.35));
      return;
    }
    if (y !== "play") return;
    if (y === "train" && pn) {
      if (pn.anim) {
        pn.anim.t += t * 2.2;
        if (pn.anim.t >= 1) {
          pn.msg = { txt: pn.anim.res, s: pn.anim.res === "GOAL!" ? 1 : 0, t: 1.1 };
          pn.r++;
          pn.anim.res === "GOAL!" && pn.s++;
          pn.anim = null;
        }
      }
      pn.msg && ((pn.msg.t -= t), pn.msg.t <= 0 && ((pn.msg = null), (pn.aim = null)));
      return;
    }
    if (((fe -= t), fe <= 0)) {
      (fe = 0), (y = "end"), ee(1.1), rf(0.5, 3), z0();
      return;
    }
    nt && ((nt.t -= t), nt.t <= 0 && (nt = null)), i0(), Rt && (be += t);
    const o = [null, null];
    for (let n = 0; n < 2; n++) {
      if (gf(n)) continue;
      let a = 1e9;
      for (const i of N) {
        if (i.t !== n || i.i === 0 || i === G) continue;
        const s = Math.hypot(i.x - c.x, i.y - c.y);
        s < a && ((a = s), (o[n] = i));
      }
    }
    for (const n of N)
      if (((n.cd = Math.max(0, n.cd - t)), (n.kk = Math.max(0, n.kk - t)), n === G)) {
        const [a, i] = hf(),
          s = (c.owner === n ? 185 : 200) * _e(n);
        if ((n.sl || 0) > 0) {
          n.sl -= t;
          const d = c.owner;
          if (d && d.t === 1) {
            const dx = d.x - n.x,
              dy = d.y - n.y,
              dl = Math.hypot(dx, dy) || 1;
            ke(n, (dx / dl) * 330, (dy / dl) * 330, t);
            Math.hypot(n.x - d.x, n.y - d.y) < 26 &&
              ((n.sl = 0),
              Math.random() < P0[Zt] * 1.8
                ? ((n.cd = 1), Y0(n, d))
                : ((c.owner = n), (n.hold = 0), (d.cd = 0.7), ee(0.3)));
          } else n.sl = 0;
        } else ke(n, a * s, i * s, t);
      } else l0(n, t, o[n.t]);
    for (const n of N) {
      (n.x = Math.max(10, Math.min(990, n.x + n.vx * t))),
        (n.y = Math.max(10, Math.min(590, n.y + n.vy * t)));
      const a = Math.hypot(n.vx, n.vy);
      a > 30 && ((n.fx = n.vx / a), (n.fy = n.vy / a)),
        Math.abs(n.vx) > 25 && (n.face = n.vx > 0 ? 1 : -1),
        (n.ph += a * t * 0.055);
    }
    for (let n = 0; n < N.length; n++)
      for (let a = n + 1; a < N.length; a++) {
        const i = N[n],
          s = N[a],
          r = s.x - i.x,
          m = s.y - i.y,
          l = Math.hypot(r, m);
        if (l > 0 && l < 22) {
          const h = (22 - l) / 2 / l;
          (i.x -= r * h), (i.y -= m * h), (s.x += r * h), (s.y += m * h);
        }
      }
    const f = c.owner;
    if (f) {
      (c.x = f.x + f.fx * 15), (c.y = f.y + f.fy * 15), (c.vx = f.vx), (c.vy = f.vy), (c.z = 0), (c.vz = 0);
      for (const n of N)
        if (!(n.t === f.t || n.cd > 0) && Math.hypot(n.x - c.x, n.y - c.y) < 22 && Math.random() < 2.8 * t) {
          if (Y0(n, f)) break;
          (f.cd = 0.6), (f.hold = 0), (c.owner = n), (n.hold = 0), Rt && (Rt = !1);
          break;
        }
    } else {
      (c.x += c.vx * t),
        (c.y += c.vy * t),
        (c.vz -= 900 * t),
        (c.z += c.vz * t),
        c.z < 0 && ((c.z = 0), (c.vz = Math.abs(c.vz) * 0.45), c.vz < 25 && (c.vz = 0));
      const n = Math.pow(ko ? 0.55 : 0.4, t);
      (c.vx *= n),
        (c.vy *= n),
        c.y < 8 && ((c.y = 8), (c.vy = Math.abs(c.vy) * (ko ? 0.95 : 0.7))),
        c.y > 592 && ((c.y = 592), (c.vy = -Math.abs(c.vy) * (ko ? 0.95 : 0.7)));
      const a = Math.abs(c.y - 600 / 2) < 180 / 2;
      if (c.x < 0) {
        if (a) {
          yf(1);
          return;
        }
        (c.x = 0), (c.vx = Math.abs(c.vx) * (ko ? 0.95 : 0.7));
      }
      if (c.x > 1e3) {
        if (a) {
          yf(0);
          return;
        }
        (c.x = 1e3), (c.vx = -Math.abs(c.vx) * (ko ? 0.95 : 0.7));
      }
      const i = Math.hypot(c.vx, c.vy);
      for (const s of N) {
        if (s.cd > 0 || c.z > 22) continue;
        const r = Math.hypot(s.x - c.x, s.y - c.y);
        if (i < 450 && r < 17) {
          (c.owner = s), (s.hold = 0);
          break;
        }
        if (i >= 450 && r < 20) {
          if (((s.cd = 0.3), s.i === 0 && Math.random() < 0.5)) {
            (c.owner = s), (s.hold = 0);
            break;
          }
          (c.vx *= s.i === 0 ? -0.5 : 0.5), (c.vy = c.vy * 0.5 + (Math.random() - 0.5) * 200);
          break;
        }
      }
    }
    c.rot += c.vx * t * 0.06 + c.vy * t * 0.02;
  }
  function oe(t, o) {
    (e.fillStyle = t),
      e.beginPath(),
      o.forEach((f, n) => (n ? e.lineTo(f[0], f[1]) : e.moveTo(f[0], f[1]))),
      e.closePath(),
      e.fill();
  }
  function vt(t, o) {
    e.beginPath(), e.moveTo(t[0], t[1]), e.lineTo(o[0], o[1]), e.stroke();
  }
  function jt(t, o, f) {
    return [t[0] + (o[0] - t[0]) * f, t[1] + (o[1] - t[1]) * f];
  }
  function ro(t) {
    e.beginPath(),
      t.forEach(([o, f], n) => {
        const a = O(o, f);
        n ? e.lineTo(a[0], a[1]) : e.moveTo(a[0], a[1]);
      }),
      e.stroke();
  }
  function U(t, o, f, n, a) {
    e.beginPath(),
      e.moveTo(t + a, o),
      e.lineTo(t + f - a, o),
      e.quadraticCurveTo(t + f, o, t + f, o + a),
      e.lineTo(t + f, o + n - a),
      e.quadraticCurveTo(t + f, o + n, t + f - a, o + n),
      e.lineTo(t + a, o + n),
      e.quadraticCurveTo(t, o + n, t, o + n - a),
      e.lineTo(t, o + a),
      e.quadraticCurveTo(t, o, t + a, o),
      e.closePath();
  }
  function g(t, o, f, n, a, i, s) {
    (e.font = (s || "800") + " " + n + "px system-ui,-apple-system,Segoe UI,sans-serif"),
      (e.fillStyle = a),
      (e.textAlign = i || "left"),
      e.fillText(t, o, f);
  }
  let B = 2;
  const Me = -340,
    d0 = 1340,
    zt = -45,
    Fe = 655;
  let wt = null;
  function bf() {
    const t = (d0 - Me) * B,
      o = (Fe - zt) * B;
    (wt = document.createElement("canvas")), (wt.width = t), (wt.height = o);
    const f = wt.getContext("2d"),
      n = (l) => (l - Me) * B,
      a = (l) => (l - zt) * B;
    for (let l = -4; l < 15; l++)
      (f.fillStyle = l % 2 ? "#2a8638" : "#37a145"), f.fillRect(n(l * 100), 0, 100 * B, o);
    for (let l = 0; l < 280; l++) {
      const h = Math.random() * t,
        d = Math.random() * o,
        u = 40 + Math.random() * 170,
        b = f.createRadialGradient(h, d, 0, h, d, u),
        p = Math.random() < 0.5 ? "255,255,255" : "0,25,0";
      b.addColorStop(0, "rgba(" + p + "," + (0.035 + Math.random() * 0.045) + ")"),
        b.addColorStop(1, "rgba(" + p + ",0)"),
        (f.fillStyle = b),
        f.fillRect(h - u, d - u, 2 * u, 2 * u);
    }
    for (const [l, h, d, u] of [
      [0, 600 / 2, 95, 0.3],
      [1e3, 600 / 2, 95, 0.3],
      [100, 600 / 2, 22, 0.35],
      [900, 600 / 2, 22, 0.35],
      [1e3 / 2, 600 / 2, 24, 0.22],
    ]) {
      const b = f.createRadialGradient(n(l), a(h), 0, n(l), a(h), d * B);
      b.addColorStop(0, "rgba(125,95,45," + u + ")"),
        b.addColorStop(1, "rgba(125,95,45,0)"),
        (f.fillStyle = b),
        f.fillRect(n(l) - d * B, a(h) - d * B, 2 * d * B, 2 * d * B);
    }
    const i = f.getImageData(0, 0, t, o),
      s = i.data;
    for (let l = 0; l < s.length; l += 4) {
      const h = (Math.random() - 0.5) * 18;
      (s[l] += h * 0.7), (s[l + 1] += h), (s[l + 2] += h * 0.6);
    }
    f.putImageData(i, 0, 0);
    const r = "rgba(175,240,125,.22)",
      m = "rgba(8,55,18,.26)";
    for (let l = 0; l < 15e4; l++)
      (f.fillStyle = l & 1 ? r : m),
        f.fillRect(Math.random() * t, Math.random() * o, 1, 3 + Math.random() * 5);
    f.fillStyle = "rgba(30,110,40,.5)";
    for (let l = 0; l < 14e3; l++) f.fillRect(Math.random() * t, Math.random() * o, 1, 1);
  }
  function Et(t, o) {
    (e.lineCap = "round"), (e.strokeStyle = "rgba(255,255,255,.9)");
    const f = t.length - (o ? 0 : 1);
    for (let n = 0; n < f; n++) {
      const a = t[n],
        i = t[(n + 1) % t.length],
        s = Math.max(1, Math.ceil(Math.hypot(i[0] - a[0], i[1] - a[1]) / 45));
      for (let r = 0; r < s; r++) {
        const m = a[0] + ((i[0] - a[0]) * r) / s,
          l = a[1] + ((i[1] - a[1]) * r) / s,
          h = a[0] + ((i[0] - a[0]) * (r + 1)) / s,
          d = a[1] + ((i[1] - a[1]) * (r + 1)) / s,
          u = O(m, l, 0),
          b = O(h, d, 0);
        (e.lineWidth = (2.6 * (u[2] + b[2])) / 2),
          e.beginPath(),
          e.moveTo(u[0], u[1]),
          e.lineTo(b[0], b[1]),
          e.stroke();
      }
    }
    e.lineCap = "butt";
  }
  function Re(t, o, f, n, a) {
    const i = [],
      s = Math.max(8, Math.ceil((Math.abs(a - n) * f) / 14));
    for (let r = 0; r <= s; r++) {
      const m = n + ((a - n) * r) / s;
      i.push([t + Math.cos(m) * f, o + Math.sin(m) * f]);
    }
    return i;
  }
  function m0() {
    Et(
      [
        [0, 0],
        [1e3, 0],
        [1e3, 600],
        [0, 600],
      ],
      !0,
    ),
      Et([
        [1e3 / 2, 0],
        [1e3 / 2, 600],
      ]),
      Et(Re(1e3 / 2, 600 / 2, 72, 0, 6.2832)),
      Et([
        [0, 600 / 2 - 130],
        [150, 600 / 2 - 130],
        [150, 600 / 2 + 130],
        [0, 600 / 2 + 130],
      ]),
      Et([
        [1e3, 600 / 2 - 130],
        [850, 600 / 2 - 130],
        [850, 600 / 2 + 130],
        [1e3, 600 / 2 + 130],
      ]),
      Et([
        [0, 600 / 2 - 62],
        [52, 600 / 2 - 62],
        [52, 600 / 2 + 62],
        [0, 600 / 2 + 62],
      ]),
      Et([
        [1e3, 600 / 2 - 62],
        [948, 600 / 2 - 62],
        [948, 600 / 2 + 62],
        [1e3, 600 / 2 + 62],
      ]),
      Et(Re(100, 600 / 2, 72, -0.805, 0.805)),
      Et(Re(900, 600 / 2, 72, Math.PI - 0.805, Math.PI + 0.805)),
      (e.fillStyle = "rgba(255,255,255,.92)");
    for (const [t, o] of [
      [1e3 / 2, 600 / 2],
      [100, 600 / 2],
      [900, 600 / 2],
    ]) {
      const f = O(t, o, 0);
      e.beginPath(), e.ellipse(f[0], f[1], 3.4 * f[2], 2.2 * f[2], 0, 0, 6.2832), e.fill();
    }
    for (const [t, o, f] of [
      [0, 0, 0],
      [1e3, 0, 1.5708],
      [1e3, 600, 3.1416],
      [0, 600, 4.7124],
    ])
      Et(Re(t, o, 10, f, f + 1.5708));
  }
  function u0() {
    const t = Math.max(0, Math.floor(ot + (me - ot) * (zt / 600))),
      o = Math.min(600, Math.ceil(ot + (me - ot) * (Fe / 600))),
      f = [2, 3, 5][at];
    e.imageSmoothingEnabled = !0;
    for (let n = t; n <= o; n += f) {
      const a = (n - ot) / (me - ot),
        i = a * 600;
      if (i < zt || i > Fe - 3) continue;
      const s = (_t + (we - _t) * a) * Pe,
        r = E / 2 / s,
        m = 4 + f * 2;
      e.drawImage(wt, (te - r - Me) * B, Math.max(0, (i - zt) * B - m / 2), r * 2 * B, m, 0, n, E, f * 1.4);
    }
    (e.fillStyle = de), e.fillRect(0, ot - 10, E, 190);
  }
  function g0() {
    const o = O(-120, -26, 0),
      f = O(1120, -26, 0),
      n = O(1120, -26, 17),
      a = O(-120, -26, 17),
      i = e.createLinearGradient(0, a[1], 0, o[1]);
    i.addColorStop(0, "#0d3a9a"),
      i.addColorStop(1, "#061c55"),
      oe(i, [o, f, n, a]),
      (e.fillStyle = "rgba(255,255,255,.55)"),
      e.fillRect(0, a[1], E, 1.5);
    for (let s = -100; s < 1100; s += 170) {
      const r = O(s, -26, 5);
      r[0] < -200 || r[0] > E + 200 || g("EAWG MOBILE", r[0], r[1], 11 * r[2], "#fff", "center", "900");
    }
  }
  function pf(t, o) {
    const r = O(t, 210, 0),
      m = O(t, 390, 0),
      l = O(t, 210, 40),
      h = O(t, 390, 40),
      d = O(t + o * 40, 210, 0),
      u = O(t + o * 40, 390, 0),
      b = O(t + o * 40, 210, 30),
      p = O(t + o * 40, 390, 30);
    oe("rgba(255,255,255,.10)", [d, u, p, b]),
      oe("rgba(255,255,255,.07)", [l, h, p, b]),
      oe("rgba(255,255,255,.06)", [r, l, b, d]),
      oe("rgba(255,255,255,.06)", [m, h, p, u]),
      (e.strokeStyle = "rgba(255,255,255,.28)"),
      (e.lineWidth = 1);
    for (let M = 0; M <= 10; M++) {
      const R = M / 10;
      vt(jt(d, u, R), jt(b, p, R)), vt(jt(b, p, R), jt(l, h, R));
    }
    for (let M = 0; M <= 5; M++) {
      const R = M / 5;
      vt(jt(d, b, R), jt(u, p, R));
    }
    (e.strokeStyle = "#fff"),
      (e.lineWidth = Math.max(2.5, 2.4 * r[2])),
      (e.lineCap = "round"),
      vt(r, l),
      vt(m, h),
      vt(l, h),
      (e.lineCap = "butt");
  }
  function E0(t) {
    (t = t.replace("#", "")),
      t.length === 3 &&
        (t = t
          .split("")
          .map((f) => f + f)
          .join(""));
    const o = parseInt(t, 16);
    return [(o >> 16) & 255, (o >> 8) & 255, o & 255];
  }
  function kf(t, o, f) {
    return (
      "rgb(" +
      E0(t)
        .map((a) => Math.round(a + (o - a) * f))
        .join(",") +
      ")"
    );
  }
  const Mf = (t, o) => kf(t, 255, o),
    rt = (t, o) => kf(t, 0, o),
    D = (t, o, f) => t + (o - t) * f;
  let Jt = null;
  function S0() {
    (Jt = document.createElement("canvas")), (Jt.width = 128), (Jt.height = 48);
    const t = Jt.getContext("2d");
    t.translate(64, 24), t.scale(1, 0.375);
    const o = t.createRadialGradient(0, 0, 2, 0, 0, 62);
    o.addColorStop(0, "rgba(0,0,0,.66)"),
      o.addColorStop(0.55, "rgba(0,0,0,.34)"),
      o.addColorStop(1, "rgba(0,0,0,0)"),
      (t.fillStyle = o),
      t.fillRect(-64, -64, 128, 128);
  }
  function Rf(t, o, f) {
    const n = O(t, o, 0),
      a = f * 2.7 * n[2];
    e.drawImage(Jt, n[0] - a / 2 + 0.14 * a, n[1] - a * 0.19, a, a * 0.375);
  }
  function lt(t, o, f, n, a, i, s) {
    const r = f - t,
      m = n - o,
      l = Math.hypot(r, m) || 1,
      h = -m / l,
      d = r / l;
    (e.fillStyle = s),
      e.beginPath(),
      e.moveTo(t + (h * a) / 2, o + (d * a) / 2),
      e.lineTo(f + (h * i) / 2, n + (d * i) / 2),
      e.lineTo(f - (h * i) / 2, n - (d * i) / 2),
      e.lineTo(t - (h * a) / 2, o - (d * a) / 2),
      e.closePath(),
      e.fill(),
      e.beginPath(),
      e.moveTo(t + a / 2, o),
      e.arc(t, o, a / 2, 0, 6.2832),
      e.moveTo(f + i / 2, n),
      e.arc(f, n, i / 2, 0, 6.2832),
      e.fill(),
      a > 3.2 &&
        ((e.strokeStyle = "rgba(255,255,255,.14)"),
        (e.lineWidth = Math.max(0.8, i * 0.26)),
        e.beginPath(),
        e.moveTo(t - h * a * 0.2, o - d * a * 0.2),
        e.lineTo(f - h * i * 0.2, n - d * i * 0.2),
        e.stroke(),
        (e.strokeStyle = "rgba(0,0,0,.13)"),
        e.beginPath(),
        e.moveTo(t + h * a * 0.3, o + d * a * 0.3),
        e.lineTo(f + h * i * 0.3, n + d * i * 0.3),
        e.stroke());
  }
  function je(t, o) {
    o && ((t.kk = o.kk), (t.ph = o.ph));
    const f = y === "goal" && ye === t.t ? Math.abs(Math.sin(Ut * 7 + t.i * 1.3)) * 12 : 0,
      n = o ? [o.x, o.y, o.u / 0.95] : O(t.x, t.y, f),
      a = n[0],
      i = n[1],
      s = n[2] * 0.95 * (o ? 1 : 0.95 + ((t.i * 3 + t.t * 2) % 5) * 0.022),
      r = o ? o.f : t.face,
      m = Math.hypot(t.vx, t.vy),
      l = o ? o.run : Math.min(1, m / 150),
      h = z[t.t],
      d = t.i === 0,
      u = d ? h.gk : h.shirt,
      b = d ? h.gkShorts : h.shorts,
      p = d ? h.gkSock : h.sock,
      M = d ? "#111" : h.trim,
      R = t.skin,
      Y = rt(R, 0.28),
      pt = 10.5 * s,
      V = 10 * s,
      q = 6.4 * s,
      X = 6.2 * s,
      C = 15.5 * s,
      Nt = [];
    for (let W = 0; W < 2; W++) {
      const kt = t.ph + (W ? Math.PI : 0);
      let Q = Math.sin(kt) * 0.85 * l + (W ? 0.1 : -0.1) * (1 - l),
        st = (0.1 + 0.95 * Math.max(0, Math.cos(kt))) * l + 0.06;
      if (t.kk > 0 && W === 1)
        if (t.kk > 0.13) {
          const mt = (t.kk - 0.13) / 0.12;
          (Q = -0.5 - 0.5 * mt), (st = 0.6 + 0.7 * mt);
        } else {
          const mt = t.kk / 0.13;
          (Q = 1.25 * (1 - mt) + 0.1 * mt), (st = 0.2);
        }
      const $ = Math.sin(Q) * r * pt,
        _ = Math.cos(Q) * pt,
        dt = Q - st;
      Nt.push({ a2: dt, kx: $, ky: _, ax: $ + Math.sin(dt) * r * V, ay: _ + Math.cos(dt) * V });
    }
    const x = a,
      L = i - Math.max(Nt[0].ay, Nt[1].ay) - 2.3 * s,
      It = l * 0.17 + (t.kk > 0 ? 0.05 : 0),
      Z = x + Math.sin(It) * r * C,
      v = L - Math.cos(It) * C,
      k = Z + r * (1 + 2 * l) * s,
      w = v - 7.4 * s,
      jf = Math.sin(t.ph) * 0.9 * l,
      fo = 0.5 + 0.55 * l,
      zf = (W, kt) => {
        const Q = x + W.kx,
          st = L + W.ky,
          $ = x + W.ax,
          _ = L + W.ay,
          dt = kt ? 0.3 : 0,
          mt = kt ? Y : R,
          Ne = rt(b, dt),
          af = rt(p, dt),
          oo = rt(M, dt);
        lt(x, L, Q, st, 5.8 * s, 4.4 * s, mt),
          lt(Q, st, $, _, 4.4 * s, 3.1 * s, mt),
          lt(D(Q, $, 0.12), D(st, _, 0.12), $, _, 4.7 * s, 3.4 * s, af),
          lt(D(Q, $, 0.18), D(st, _, 0.18), D(Q, $, 0.3), D(st, _, 0.3), 4.8 * s, 4.5 * s, oo),
          lt(x, L, D(x, Q, 0.66), D(L, st, 0.66), 7.2 * s, 6.4 * s, Ne);
        const Qf = Math.max(-0.3, Math.min(1, -W.a2 * 0.5 + 0.1)),
          $f = $ + r * Math.cos(Qf) * 5.4 * s,
          _f = _ + Math.sin(Qf) * 4.9 * s + 0.8 * s;
        lt($ - r * s, _ + 0.6 * s, $f, _f, 3.6 * s, 2.6 * s, rt(t.boot, dt)),
          kt ||
            ((e.fillStyle = "rgba(255,255,255,.45)"),
            e.fillRect(Math.min($, $f) + 0.6 * s, Math.min(_, _f) - 0.9 * s, 3 * s, 0.7 * s));
      },
      Jf = (W, kt) => {
        const Q = Z,
          st = v + 1.8 * s,
          $ = Q + Math.sin(W) * r * q,
          _ = st + Math.cos(W) * q,
          dt = W + fo,
          mt = $ + Math.sin(dt) * r * X,
          Ne = _ + Math.cos(dt) * X,
          af = kt ? 0.3 : 0;
        lt($, _, mt, Ne, 2.9 * s, 2.3 * s, kt ? Y : R),
          lt(Q, st, $, _, 4 * s, 3.3 * s, rt(u, af)),
          (e.fillStyle = d ? "#ff3b8b" : kt ? Y : R),
          e.beginPath(),
          e.arc(mt, Ne, (d ? 2.7 : 1.8) * s, 0, 6.2832),
          e.fill();
      };
    Jf(-jf, !0), zf(Nt[0], !0);
    const Yf = Z - x,
      Xf = v - L,
      Zf = Math.hypot(Yf, Xf),
      Qt = -Xf / Zf,
      $t = Yf / Zf,
      Ce = 7.3 * s,
      Ot = 5.7 * s,
      Le = e.createLinearGradient(x - 6 * s, 0, x + 6 * s, 0);
    Le.addColorStop(0, Mf(u, 0.18)),
      Le.addColorStop(0.5, u),
      Le.addColorStop(1, rt(u, 0.32)),
      (e.fillStyle = at >= 2 ? u : Le),
      e.beginPath(),
      e.moveTo(x - Qt * Ot, L - $t * Ot),
      e.lineTo(Z - Qt * Ce, v - $t * Ce),
      e.quadraticCurveTo(Z, v - 1.6 * s, Z + Qt * Ce, v + $t * Ce),
      e.lineTo(x + Qt * Ot, L + $t * Ot),
      e.closePath(),
      e.fill(),
      (e.strokeStyle = "rgba(0,0,0,.16)"),
      (e.lineWidth = 0.8 * s),
      e.beginPath(),
      e.moveTo(D(x, Z, 0.45) - 3 * s, D(L, v, 0.45)),
      e.quadraticCurveTo(
        D(x, Z, 0.5),
        D(L, v, 0.5) + 1.3 * s,
        D(x, Z, 0.45) + 3 * s,
        D(L, v, 0.45) + 0.4 * s,
      ),
      e.stroke(),
      lt(x - Qt * Ot, L - $t * Ot, x + Qt * Ot, L + $t * Ot, 2 * s, 2 * s, rt(b, 0.05)),
      t.num &&
        s > 1.1 &&
        (e.save(),
        (e.fillStyle = M),
        (e.globalAlpha = 0.85),
        (e.font = "800 " + 3.6 * s + "px system-ui,sans-serif"),
        (e.textAlign = "center"),
        e.fillText(t.num, D(x, Z, 0.52) - r * 0.6 * s, D(L, v, 0.52) + 1.3 * s),
        e.restore()),
      (e.fillStyle = "rgba(255,255,255,.16)"),
      e.beginPath(),
      e.ellipse(D(x, Z, 0.62) + r * 2.2 * s, D(L, v, 0.62), 1.3 * s, 3.6 * s, It, 0, 6.2832),
      e.fill(),
      lt(Z + r * 0.4 * s, v + 0.2 * s, Z + r * 0.8 * s, v - 1.8 * s, 4.4 * s, 3.4 * s, M),
      zf(Nt[1], !1),
      Jf(jf, !1),
      lt(Z, v, k - r * 0.4 * s, w + 3 * s, 3 * s, 2.8 * s, Y);
    const sf = e.createRadialGradient(k + r * 1.2 * s, w - 1.6 * s, 0.5 * s, k, w, 5.4 * s);
    sf.addColorStop(0, Mf(R, 0.2)),
      sf.addColorStop(1, rt(R, 0.26)),
      (e.fillStyle = at >= 2 ? R : sf),
      e.beginPath(),
      e.ellipse(k, w, 3.9 * s, 4.9 * s, 0, 0, 6.2832),
      e.fill();
    const qf = t.hs === 1 ? 0.82 : 1;
    if (
      ((e.fillStyle = t.hair),
      e.beginPath(),
      e.ellipse(k - r * 0.9 * s, w - 1.1 * s, 4.1 * s * qf, 4.2 * s * qf, 0, Math.PI * 0.9, Math.PI * 2.1),
      e.fill(),
      t.hs === 2 &&
        (e.beginPath(), e.ellipse(k - r * 3.5 * s, w + 0.2 * s, 1.9 * s, 3.1 * s, 0, 0, 6.2832), e.fill()),
      t.hs === 3 &&
        (e.beginPath(), e.ellipse(k - r * 0.6 * s, w - 3.6 * s, 3.2 * s, 1.7 * s, 0, 0, 6.2832), e.fill()),
      e.fillRect(k - r * 4 * s - (r > 0 ? 0 : -0.1 * s), w - 1.2 * s, 1.9 * s * (r > 0, 1), 3 * s),
      (e.fillStyle = rt(R, 0.18)),
      e.beginPath(),
      e.ellipse(k - r * 0.7 * s, w + 0.5 * s, 0.9 * s, 1.3 * s, 0, 0, 6.2832),
      e.fill(),
      (e.fillStyle = "rgba(20,12,8,.9)"),
      e.beginPath(),
      e.ellipse(k + r * 2 * s, w - 0.1 * s, 0.7 * s, 0.5 * s, 0, 0, 6.2832),
      e.fill(),
      (e.strokeStyle = "rgba(20,12,8,.7)"),
      (e.lineWidth = 0.6 * s),
      e.beginPath(),
      e.moveTo(k + r * 1.2 * s, w - 1.2 * s),
      e.lineTo(k + r * 2.9 * s, w - 1.3 * s),
      e.stroke(),
      (e.strokeStyle = "rgba(60,25,20,.55)"),
      (e.lineWidth = 0.55 * s),
      e.beginPath(),
      e.moveTo(k + r * 1.6 * s, w + 2.5 * s),
      e.lineTo(k + r * 3 * s, w + 2.4 * s),
      e.stroke(),
      (e.fillStyle = "rgba(0,0,0,.14)"),
      e.beginPath(),
      e.ellipse(k - r * 0.3 * s, w + 4.4 * s, 3 * s, 0.9 * s, 0, 0, 6.2832),
      e.fill(),
      (e.fillStyle = "rgba(255,170,140,.18)"),
      e.beginPath(),
      e.arc(k + r * 1.6 * s, w + 1.3 * s, 1.2 * s, 0, 6.2832),
      e.fill(),
      (e.fillStyle = rt(R, 0.12)),
      e.beginPath(),
      e.moveTo(k + r * 3.7 * s, w + 0.3 * s),
      e.lineTo(k + r * 4.6 * s, w + 1.7 * s),
      e.lineTo(k + r * 3.5 * s, w + 1.9 * s),
      e.fill(),
      t === G && y !== "menu")
    ) {
      const W = w - 9 * s - Math.sin(Ut * 6) * 2.5;
      (e.fillStyle = "#ff2d2d"),
        (e.strokeStyle = "#fff"),
        (e.lineWidth = 1.6),
        e.beginPath(),
        e.moveTo(k, W + 7),
        e.lineTo(k - 6.5, W - 4),
        e.lineTo(k + 6.5, W - 4),
        e.closePath(),
        e.fill(),
        e.stroke(),
        Rt &&
          ((e.fillStyle = "rgba(0,0,0,.55)"),
          e.fillRect(a - 20, i + 7, 40, 6),
          (e.fillStyle = "#ffd400"),
          e.fillRect(a - 20, i + 7, 40 * Math.min(1, be / 0.7), 6));
    }
  }
  function y0() {
    const t = O(c.x, c.y, c.z + 4.5),
      o = 5.4 * t[2],
      f = t[0],
      n = t[1],
      a = e.createRadialGradient(f - o * 0.38, n - o * 0.42, o * 0.1, f, n, o);
    a.addColorStop(0, "#ffffff"),
      a.addColorStop(0.6, "#dfe3ea"),
      a.addColorStop(1, "#848b9a"),
      (e.fillStyle = a),
      e.beginPath(),
      e.arc(f, n, o, 0, 6.2832),
      e.fill(),
      (e.fillStyle = "#232832");
    for (let i = 0; i < 4; i++) {
      const s = c.rot + i * 1.57 + 0.4,
        r = Math.cos(s),
        m = f + r * o * 0.58,
        l = n + Math.sin(s * 1.3) * o * 0.5,
        h = o * 0.26 * (0.55 + 0.45 * Math.abs(r));
      e.beginPath(), e.ellipse(m, l, h * (0.6 + 0.4 * Math.abs(r)), h, 0, 0, 6.2832), e.fill();
    }
    (e.strokeStyle = "rgba(15,18,28,.8)"),
      (e.lineWidth = 1),
      e.beginPath(),
      e.arc(f, n, o, 0, 6.2832),
      e.stroke(),
      (e.fillStyle = "rgba(255,255,255,.6)"),
      e.beginPath(),
      e.ellipse(f - o * 0.35, n - o * 0.4, o * 0.22, o * 0.14, -0.6, 0, 6.2832),
      e.fill();
  }
  function b0() {
    const f = E / 2 - 66,
      n = 510;
    (e.fillStyle = "rgba(5,40,15,.62)"),
      U(f, n, 132, 78, 6),
      e.fill(),
      (e.strokeStyle = "rgba(255,255,255,.7)"),
      (e.lineWidth = 1),
      e.strokeRect(f + 5, n + 5, 122, 68),
      vt([f + 132 / 2, n + 5], [f + 132 / 2, n + 78 - 5]),
      e.beginPath(),
      e.arc(f + 132 / 2, n + 78 / 2, 9, 0, 7),
      e.stroke();
    const a = (s) => f + 5 + (s / 1e3) * 122,
      i = (s) => n + 5 + (s / 600) * 68;
    for (const s of N)
      (e.fillStyle = s === G ? "#ffd400" : z[s.t].shirt),
        e.beginPath(),
        e.arc(a(s.x), i(s.y), s === G ? 3.6 : 2.6, 0, 7),
        e.fill(),
        s.t && ((e.strokeStyle = "#16224a"), (e.lineWidth = 1), e.stroke());
    (e.fillStyle = "#fff"), e.beginPath(), e.arc(a(c.x), i(c.y), 2, 0, 7), e.fill();
  }
  function Tf(t, o, f, n) {
    const s = e.createLinearGradient(t, 0, t + 236, 0);
    s.addColorStop(0, n ? "rgba(10,22,66,.45)" : "rgba(10,22,66,.95)"),
      s.addColorStop(1, n ? "rgba(10,22,66,.95)" : "rgba(10,22,66,.45)"),
      (e.fillStyle = s),
      e.fillRect(t, o, 236, 30),
      (e.fillStyle = z[f.t].shirt),
      e.fillRect(t, o + 30 - 3, 236, 3);
    const r = n ? t + 236 - 20 : t + 20;
    (e.fillStyle = z[f.t].shirt),
      e.beginPath(),
      e.arc(r, o + 30 / 2 - 1, 10, 0, 7),
      e.fill(),
      (e.strokeStyle = "#fff"),
      (e.lineWidth = 1.5),
      e.stroke(),
      g(String(f.num), r, o + 30 / 2 + 3.5, 10, f.t ? "#16224a" : "#0b2a55", "center", "900"),
      n
        ? (g(f.name, t + 236 - 40, o + 20, 16, "#fff", "right"),
          g(String(f.rate), t + 12, o + 21, 17, "#ffd400", "left"))
        : (g(String(f.rate), t + 40, o + 21, 17, "#ffd400", "left"),
          g(f.name, t + 72, o + 20, 16, "#fff", "left"));
  }
  function p0() {
    (e.fillStyle = "rgba(8,16,50,.9)"),
      U(14, 12, 74, 13, 3),
      e.fill(),
      g(K ? (K.kind === "cup" ? "BEKER" : "COMPETITIE") : "FRIENDLY", 51, 22, 9, "#9fb8ff", "center", "800"),
      (e.fillStyle = "rgba(8,16,50,.92)"),
      e.fillRect(14, 26, 300, 30),
      (e.fillStyle = z[0].shirt),
      e.fillRect(14, 26, 5, 30),
      (e.fillStyle = "#fff"),
      e.fillRect(309, 26, 5, 30),
      g(z[0].code, 28, 47, 17, "#fff", "left"),
      (e.fillStyle = "#fff"),
      e.fillRect(80, 26, 66, 30),
      g(P[0] + "  -  " + P[1], 113, 48, 20, "#0b1b4d", "center", "900"),
      g(z[1].code, 156, 47, 17, "#fff", "left");
    const n = ((Pt - fe) / Pt) * 90 * 60,
      a = String(Math.floor(n / 60)).padStart(2, "0"),
      i = String(Math.floor(n % 60)).padStart(2, "0");
    (e.fillStyle = "rgba(255,255,255,.12)"),
      e.fillRect(214, 26, 100, 30),
      g(a + ":" + i, 264, 48, 18, "#fff", "center", "800"),
      G && Tf(14, 556, G, !1);
    let s = c.owner && c.owner.t === 1 ? c.owner : null;
    if (!s) {
      let r = 1e9;
      for (const m of N)
        if (m.t === 1 && m.i) {
          const l = Math.hypot(m.x - c.x, m.y - c.y);
          l < r && ((r = l), (s = m));
        }
    }
    if ((s && Tf(E - 250, 14, s, !0), b0(), y === "play")) {
      const r = E - 302,
        m = 14;
      (e.fillStyle = "rgba(8,16,50,.9)"),
        e.fillRect(r, m, 44, 30),
        (e.fillStyle = "#fff"),
        e.fillRect(r + 15, m + 8, 5, 14),
        e.fillRect(r + 24, m + 8, 5, 14),
        Wt.push({
          x: r,
          y: m,
          w: 44,
          h: 30,
          fn: () => {
            y = "pause";
          },
        });
    }
  }
  function k0() {
    if (
      ((Wt = []),
      (e.imageSmoothingQuality = "high"),
      e.setTransform(1, 0, 0, 1, 0, 0),
      (e.fillStyle = "#06130a"),
      e.fillRect(0, 0, F.width, F.height),
      e.setTransform(ut, 0, 0, ut, 0, ce),
      y === "menu" || y === "help" || y === "comp" || y === "club" || y === "settings" || y === "pick" || y === "train")
    ) {
      e.save(),
        e.beginPath(),
        e.rect(0, 0, E, 600),
        e.clip(),
        y === "comp"
          ? _0()
          : y === "club"
            ? to()
            : y === "settings"
              ? $0()
              : y === "pick"
                ? Q0()
                : y === "train"
                  ? pnn()
                  : (C0(), y === "help" && L0()),
        e.restore();
      return;
    }
    if (
      (e.save(),
      e.beginPath(),
      e.rect(0, 0, E, 600),
      e.clip(),
      Bt > 0 && e.translate((Math.random() - 0.5) * 9 * Bt * 2, (Math.random() - 0.5) * 7 * Bt * 2),
      e.drawImage(Mt, -180 - (te - 1e3 / 2) * 0.12, 0, Mt.width / j, Mt.height / j),
      at < 2 && (++T0 & 7) === 0)
    ) {
      Je = [];
      for (let f = 0; f < 7; f++)
        Je.push([Math.random() * E, 70 + Math.random() * (ot - 120), 2 + Math.random() * 2]);
    }
    for (const f of Je)
      (e.fillStyle = "rgba(255,255,255,.85)"), e.beginPath(), e.arc(f[0], f[1], f[2], 0, 6.2832), e.fill();
    u0(), m0(), g0(), pf(0, -1), pf(1e3, 1);
    for (const f of N) Rf(f.x, f.y, 8);
    if ((Rf(c.x, c.y, 4 + c.z * 0.02), Math.hypot(c.vx, c.vy) > 420)) {
      const f = O(c.x, c.y, c.z + 4.5);
      c.trail.push(f), c.trail.length > 7 && c.trail.shift();
    } else c.trail.length = 0;
    for (let f = 1; f < c.trail.length; f++)
      (e.strokeStyle = "rgba(255,255,255," + (f / c.trail.length) * 0.5 + ")"),
        (e.lineWidth = 3 * (f / c.trail.length) * c.trail[f][2] * 0.5),
        vt(c.trail[f - 1], c.trail[f]);
    const o = N.slice();
    o.push(c), o.sort((f, n) => f.y - n.y);
    for (const f of o) f === c ? y0() : je(f);
    e.restore(), at < 2 && ((e.fillStyle = he), e.fillRect(0, 0, E, 600));
    for (const f of Ft)
      e.save(),
        e.translate(f.x, f.y),
        e.rotate(f.r),
        (e.fillStyle = f.c),
        e.fillRect(-f.w / 2, -f.w / 4, f.w, f.w / 2),
        e.restore();
    if ((p0(), T.id !== null)) {
      e.setTransform(1, 0, 0, 1, 0, 0);
      const f = He;
      (e.strokeStyle = "rgba(255,255,255,.5)"),
        (e.lineWidth = 3 * f),
        e.beginPath(),
        e.arc(T.ox * f, T.oy * f, 55 * f, 0, 7),
        e.stroke(),
        (e.fillStyle = "rgba(255,255,255,.5)"),
        e.beginPath(),
        e.arc(T.x * f, T.y * f, 24 * f, 0, 7),
        e.fill(),
        e.setTransform(ut, 0, 0, ut, 0, ce);
    }
    if (y === "goal") {
      const f = Math.min(1, Ve / 0.25),
        n = 0.6 + 0.4 * (1 - Math.pow(1 - f, 3));
      e.save(),
        e.translate(E / 2, 600 * 0.36),
        e.scale(n, n),
        (e.fillStyle = "rgba(8,16,50,.78)"),
        e.fillRect(-300, -62, 600, 100),
        (e.fillStyle = ye ? "#f4f4f4" : z[0].shirt),
        e.fillRect(-300, 30, 600, 8),
        g(df, 0, 12, 56, "#ffd400", "center", "900"),
        e.restore();
    }
    if (nt) {
      const f = Math.min(1, nt.t * 3);
      (e.globalAlpha = f),
        (e.fillStyle = "rgba(8,16,50,.85)"),
        e.fillRect(E / 2 - 190, 600 * 0.2, 380, 64),
        (e.fillStyle = nt.col),
        e.fillRect(E / 2 - 190, 600 * 0.2 + 58, 380, 6),
        g(nt.text, E / 2, 600 * 0.2 + 30, 28, "#fff", "center", "900"),
        g(nt.sub, E / 2, 600 * 0.2 + 52, 14, nt.col, "center", "800"),
        (e.globalAlpha = 1);
    }
    y === "pause" && N0(), y === "end" && I0();
  }
  const H = [
      {
        name: "KVK IEPER B",
        code: "IEP",
        shirt: "#d62828",
        shorts: "#ffffff",
        sock: "#d62828",
        trim: "#ffffff",
      },
      {
        name: "SK ROESELARE B",
        code: "ROE",
        shirt: "#17191f",
        shorts: "#17191f",
        sock: "#17191f",
        trim: "#ffffff",
      },
      {
        name: "VV KOEKELARE",
        code: "KOE",
        shirt: "#f4f4f4",
        shorts: "#17191f",
        sock: "#f4f4f4",
        trim: "#17191f",
      },
      {
        name: "KM TORHOUT B",
        code: "TOR",
        shirt: "#1f9d55",
        shorts: "#ffffff",
        sock: "#1f9d55",
        trim: "#ffffff",
      },
      {
        name: "KSV DE RUITER A",
        code: "DRU",
        shirt: "#63b6f2",
        shorts: "#f3f3f3",
        sock: "#63b6f2",
        trim: "#ffffff",
      },
      {
        name: "KFC POPERINGE B",
        code: "POP",
        shirt: "#f2c230",
        shorts: "#c0262d",
        sock: "#f2c230",
        trim: "#c0262d",
      },
      {
        name: "KSV VEURNE A",
        code: "VEU",
        shirt: "#1b3f8f",
        shorts: "#1b3f8f",
        sock: "#1b3f8f",
        trim: "#f2c230",
      },
      { name: "EAWG FC", code: "EAW", shirt: "#7b3fc4", shorts: "#f3f3f3", sock: "#7b3fc4", trim: "#f2c230" },
    ],
    Yt = [
      { gk: "#d8ff2a", gkShorts: "#111", gkSock: "#111" },
      { gk: "#ff7a1a", gkShorts: "#222", gkSock: "#222" },
    ],
    ze = [60, 120, 180],
    M0 = [0.85, 1, 1.15],
    R0 = ["MAKKELIJK", "NORMAAL", "MOEILIJK"];
  let it = 0,
    Tt = 1,
    At = 1,
    Pt = 120,
    ct = !1,
    Vt = 1,
    Wt = [],
    Je = [],
    T0 = 0;
  function ne() {
    (z[0] = Object.assign({}, Yt[0], H[it])), (z[1] = Object.assign({}, Yt[1], H[(it + 1) % H.length]));
  }
  function Af() {
    try {
      localStorage.setItem("goalrush", JSON.stringify({ k: it, m: Tt, d: At, s: ct ? 1 : 0, r: Zt, c: bt, g: ko }));
    } catch {}
  }
  function A0() {
    try {
      const t = JSON.parse(localStorage.getItem("goalrush") || "{}");
      t.k >= 0 && t.k < H.length && (it = t.k),
        t.m >= 0 && t.m < 3 && (Tt = t.m),
        t.d >= 0 && t.d < 3 && (At = t.d),
        (ct = !!t.s),
        t.r >= 0 && t.r < 4 && (Zt = t.r),
        t.c >= 0 && (bt = t.c),
        t.g >= 0 && t.g < 2 && (ko = t.g);
    } catch {}
    Pt = ze[Tt];
  }
  function se(t) {
    (yt = t && t.kind === "friendly" ? t : null),
      (K = yt ? null : t || null),
      (ie = {}),
      (nt = null),
      yt
        ? ((z[0] = Object.assign({}, Yt[0], yt.a)), (z[1] = Object.assign({}, Yt[1], yt.b)))
        : K
          ? ((z[0] = Object.assign({}, Yt[0], H[K.mine])), (z[1] = Object.assign({}, Yt[1], H[K.opp])))
          : ne(),
      mf(),
      J0(),
      (P = [0, 0]),
      (fe = Pt),
      uf(0),
      (y = "play"),
      ee(0.6);
  }
  const Gt = [
    { k: "logo", w: 90 },
    { k: "kick", w: 190, t: "KICK OFF", s: () => "SNELLE MATCH" },
    { k: "train", w: 150, t: "OEFENEN", s: () => "PENALTY'S" },
    {
      k: "seas",
      w: 190,
      t: "SEIZOEN",
      s: () => (S && S.season ? "DAG " + Math.min(7, S.season.round + 1) + " / 7" : "COMPETITIE + BEKER"),
    },
    { k: "club", w: 190, t: "CLUB", s: () => "KAARTEN & MARKT" },
    { k: "set", w: 170, t: "INSTELLING", s: () => H[it].name },
    { k: "snd", w: 80 },
    { k: "help", w: 80 },
  ];
  function Ye(t) {
    t === "kick" || t === "logo"
      ? ((y = "pick"), et === ft && (ft = (et + 1) % 2))
      : t === "train"
        ? ((y = "train"), (pn = { r: 0, s: 0, aim: null, dr: !1, anim: null, msg: null, kd: 0 }))
        : t === "seas"
        ? ((y = "comp"), (xt = 0), (Dt = !1))
              : t === "club"
                ? ((y = "club"), (xt = 0), (ae = 0), (alb = 0), (albc = -1), (albp = null))
          : t === "set"
            ? (y = "settings")
            : t === "team"
              ? ((it = (it + 1) % H.length), ne())
              : t === "time"
                ? ((Tt = (Tt + 1) % 3), (Pt = ze[Tt]))
                : t === "diff"
                  ? (At = (At + 1) % 3)
                  : t === "snd"
                    ? ((ct = !ct), A && Ht && (Ht.gain.value = ct ? 0 : 0.1))
                    : t === "help" && (y = "help"),
      Af();
  }
  function x0(t, o) {
    for (const f of Wt) if (t >= f.x && t <= f.x + f.w && o >= f.y && o <= f.y + f.h) return f.fn(), !0;
    return y === "help" ? ((y = "menu"), !0) : !1;
  }
  function v0(t) {
    y === "menu"
      ? t === "ArrowRight" || t === "KeyD"
        ? (Vt = (Vt + 1) % Gt.length)
        : t === "ArrowLeft" || t === "KeyA"
          ? (Vt = (Vt + Gt.length - 1) % Gt.length)
          : (t === "Enter" || t === "Space") && Ye(Gt[Vt].k)
      : y === "help"
        ? (y = "menu")
        : y === "comp" || y === "club" || y === "settings" || y === "pick" || y === "train"
          ? t === "Escape" && (y = "menu")
          : y === "pause"
            ? t === "Space" || t === "Enter" || t === "Escape"
              ? (y = "play")
              : t === "KeyM" && (y = "menu")
            : y === "end" && (t === "Space" || t === "Enter" ? se() : t === "Escape" && (y = "menu"));
  }
  const xf = [];
  for (let t = 0; t < 34; t++)
    xf.push({
      x: Math.random(),
      y: Math.random(),
      r: 3 + Math.random() * 10,
      s: 0.01 + Math.random() * 0.03,
      a: 0.05 + Math.random() * 0.12,
    });
  const vf = {
    t: 0,
    i: 3,
    skin: "#d9a273",
    hair: "#1a1209",
    boot: "#ff8a1f",
    face: -1,
    ph: 0,
    kk: 0,
    vx: 0,
    vy: 0,
  };
  function Te(t, o, f, n, a, i, s) {
    const r = e.createLinearGradient(0, 0, E, 0);
    r.addColorStop(0, f),
      r.addColorStop(1, n),
      (e.strokeStyle = r),
      (e.lineWidth = a),
      (e.globalAlpha = s),
      e.beginPath(),
      e.moveTo(-40, t),
      e.bezierCurveTo(E * 0.3, t + 120 * Math.sin(i), E * 0.6, o - 140 * Math.cos(i), E + 40, o),
      e.stroke(),
      (e.globalAlpha = 1);
  }
  function Xt(t, o, f, n, a, i, s) {
    (e.fillStyle = s ? "#f2f4f8" : "rgba(255,255,255,.12)"),
      U(t, o, f, n, 6),
      e.fill(),
      s || ((e.strokeStyle = "rgba(255,255,255,.35)"), (e.lineWidth = 1.5), e.stroke()),
      g(a, t + f / 2, o + n / 2 + 6, 18, s ? "#0b1b4d" : "#fff", "center", "800"),
      Wt.push({ x: t, y: o, w: f, h: n, fn: i });
  }
  function C0() {
    const t = e.createLinearGradient(0, 0, 0, 600);
    t.addColorStop(0, "#060c24"),
      t.addColorStop(0.55, "#171a48"),
      t.addColorStop(1, "#0a0722"),
      (e.fillStyle = t),
      e.fillRect(0, 0, E, 600);
    let o = e.createRadialGradient(E * 0.08, 600 * 0.9, 0, E * 0.08, 600 * 0.9, E * 0.5);
    o.addColorStop(0, "rgba(255,60,130,.28)"),
      o.addColorStop(1, "rgba(255,60,130,0)"),
      (e.fillStyle = o),
      e.fillRect(0, 0, E, 600),
      (o = e.createRadialGradient(E * 0.85, 600 * 0.2, 0, E * 0.85, 600 * 0.2, E * 0.45)),
      o.addColorStop(0, "rgba(60,150,255,.26)"),
      o.addColorStop(1, "rgba(60,150,255,0)"),
      (e.fillStyle = o),
      e.fillRect(0, 0, E, 600);
    const f = Ut * 0.25;
    Te(600 * 0.62, 600 * 0.35, "#ff5a8a", "#6a4dff", 5, f, 0.55),
      Te(600 * 0.7, 600 * 0.5, "#ff9a4a", "#ff3b8b", 2, f + 1, 0.5),
      Te(600 * 0.3, 600 * 0.6, "#3ab0ff", "#7b5cff", 8, f + 2, 0.35),
      Te(600 * 0.8, 600 * 0.2, "#ff5ab0", "#3ab0ff", 2, f + 3, 0.45);
    for (const C of xf)
      (e.fillStyle = "rgba(255,255,255," + C.a + ")"),
        e.beginPath(),
        e.arc(((C.x + Ut * C.s * 0.2) % 1) * E, C.y * 600, C.r, 0, 6.2832),
        e.fill();
    (e.fillStyle = "#fff"),
      e.beginPath(),
      e.arc(70, 56, 24, 0, 6.2832),
      e.fill(),
      g("E", 70, 64, 21, "#0b1b4d", "center", "900"),
      g("EAWG MOBILE", 108, 64, 24, "#fff", "left", "900");
    const n = Math.min(540, E * 0.44),
      a = n * 0.56,
      i = 64,
      s = 126;
    e.save(), U(i, s, n, a, 6), e.clip();
    const r = e.createLinearGradient(0, s, 0, s + a);
    r.addColorStop(0, "#0a1230"),
      r.addColorStop(1, "#12204a"),
      (e.fillStyle = r),
      e.fillRect(i, s, n, a),
      Mt && e.drawImage(Mt, 420 * j, 30 * j, 520 * j, 150 * j, i, s, n, a * 0.6),
      wt && e.drawImage(wt, (380 - Me) * B, (250 - zt) * B, 560, 150, i, s + a * 0.6, n, a * 0.4),
      (e.fillStyle = "rgba(255,255,255,.9)"),
      e.beginPath(),
      e.arc(i + n * 0.6, s + a * 0.9, 9, 0, 6.2832),
      e.fill(),
      (e.strokeStyle = "#222"),
      (e.lineWidth = 1.5),
      e.stroke(),
      je(vf, { x: i + n * 0.72, y: s + a * 0.95, u: 2.7, f: -1, run: 0.5, kk: 0.06, ph: 1 });
    const m = e.createLinearGradient(i, 0, i + n * 0.7, 0);
    m.addColorStop(0, "rgba(6,10,36,.92)"),
      m.addColorStop(1, "rgba(6,10,36,0)"),
      (e.fillStyle = m),
      e.fillRect(i, s, n, a),
      g("EAWG MOBILE IS ER", i + 18, s + 36, 21, "#fff", "left", "900"),
      g(
        "Snelle 5-tegen-5 voetbal voor op je gsm.",
        i + 18,
        s + 62,
        14,
        "rgba(255,255,255,.9)",
        "left",
        "600",
      ),
      g("Kies je team, de duur en het niveau", i + 18, s + 82, 14, "rgba(255,255,255,.9)", "left", "600"),
      g("en trap af.", i + 18, s + 102, 14, "rgba(255,255,255,.9)", "left", "600"),
      e.restore(),
      (e.strokeStyle = "rgba(255,255,255,.2)"),
      (e.lineWidth = 1.5),
      U(i, s, n, a, 6),
      e.stroke(),
      Xt(i + 18, s + a - 46, 120, 30, "SPEEL NU", () => se(), !0);
    const l = E - 300,
      h = 150,
      d = 236,
      u = 300;
    e.save(), U(l, h, d, u, 6), e.clip();
    const b = e.createLinearGradient(0, h, 0, h + u);
    b.addColorStop(0, "rgba(255,255,255,.13)"),
      b.addColorStop(1, "rgba(255,255,255,.04)"),
      (e.fillStyle = b),
      e.fillRect(l, h, d, u),
      (e.lineCap = "round"),
      (e.strokeStyle = "#2f8bff"),
      (e.lineWidth = 9),
      e.beginPath(),
      e.moveTo(l - 20, h + u * 0.85),
      e.bezierCurveTo(l + 60, h + u * 0.5, l + 140, h + u * 1, l + d + 20, h + u * 0.45),
      e.stroke(),
      (e.strokeStyle = "#ff9a4a"),
      (e.lineWidth = 2),
      e.beginPath(),
      e.moveTo(l - 20, h + u * 0.3),
      e.bezierCurveTo(l + 80, h + u * 0.1, l + 150, h + u * 0.5, l + d + 20, h + u * 0.2),
      e.stroke(),
      (e.strokeStyle = "#ff5ab0"),
      (e.lineWidth = 2),
      e.beginPath(),
      e.moveTo(l - 20, h + u * 0.6),
      e.bezierCurveTo(l + 90, h + u * 0.3, l + 130, h + u * 0.7, l + d + 20, h + u * 0.62),
      e.stroke(),
      (e.lineCap = "butt"),
      e.restore(),
      (e.strokeStyle = "rgba(255,255,255,.15)"),
      (e.lineWidth = 1.5),
      U(l, h, d, u, 6),
      e.stroke();
    // Clubkaart in het glazen vak: jouw club, munten en stand van het seizoen
    {
      const club = H[it] || {},
        sz = S && S.season;
      const cr = Z0(club.logo);
      if (cr) {
        e.save(),
          e.beginPath(),
          e.arc(l + 34, h + 38, 16, 0, 6.2832),
          e.clip(),
          e.drawImage(cr, l + 18, h + 22, 32, 32),
          e.restore();
      } else
        (e.fillStyle = club.shirt || "#7b3fc4"),
          e.beginPath(),
          e.arc(l + 34, h + 38, 16, 0, 6.2832),
          e.fill();
      (e.strokeStyle = club.trim || "#fff"),
        (e.lineWidth = 3),
        e.beginPath(),
        e.arc(l + 34, h + 38, 16, 0, 6.2832),
        e.stroke(),
        g("JOUW CLUB", l + 60, h + 34, 11, "#8fb0ff", "left", "800"),
        g(club.code || "", l + 60, h + 50, 15, "#fff", "left", "900"),
        g(club.name || "", l + 18, h + 88, (club.name || "").length > 16 ? 13 : 16, "#fff", "left", "900"),
        g(
          "sterkte " +
            (club.ts ||
              ((J || []).flatMap((cp) => cp.teams || []).find((tm) => tm.name === club.name) || {}).ts ||
              "-"),
          l + 18,
          h + 108,
          13,
          "#ffd54a",
          "left",
          "800",
        ),
        g("MUNTEN", l + 18, h + 196, 11, "#8fb0ff", "left", "800"),
        g(String(S ? S.coins : 0), l + 18, h + 222, 24, "#fff", "left", "900"),
        g("SEIZOEN", l + 124, h + 196, 11, "#8fb0ff", "left", "800"),
        g(sz ? "DAG " + Math.min(7, sz.round + 1) + "/7" : "START", l + 124, h + 222, 20, "#fff", "left", "900"),
        Xt(l + 18, h + u - 50, d - 36, 32, "WISSEL CLUB", () => Ye("set"), !1);
    }
    const p = i + n + (l - i - n) / 2,
      M = 432,
      R = 6.4;
    (o = e.createRadialGradient(p, M - 150, 10, p, M - 150, 230)),
      o.addColorStop(0, "rgba(140,110,255,.35)"),
      o.addColorStop(1, "rgba(140,110,255,0)"),
      (e.fillStyle = o),
      e.fillRect(p - 240, M - 390, 480, 480),
      (e.globalAlpha = 0.8),
      e.drawImage(Jt, p - 150, M - 28, 300, 110),
      (e.globalAlpha = 1),
      je(vf, { x: p, y: M, u: R, f: -1, run: 0.75, kk: 0, ph: 0.9 + Math.sin(Ut * 1.3) * 0.08 });
    let Y = 0;
    for (const C of Gt) Y += C.w;
    Y += (Gt.length - 1) * 8;
    const pt = Math.min(1, (E - 80) / Y),
      V = 96 * Math.max(0.85, pt),
      q = 460;
    let X = (E - Y * pt) / 2;
    Gt.forEach((C, Nt) => {
      const x = C.w * pt,
        L = Nt === Vt;
      (e.fillStyle = L ? "#f2f4f8" : "rgba(12,14,46,.88)"),
        e.fillRect(X, q, x, V),
        (e.strokeStyle = L ? "#fff" : "rgba(255,255,255,.12)"),
        (e.lineWidth = L ? 3 : 1),
        e.strokeRect(X, q, x, V);
      const It = L ? "#0b1b4d" : "#ffffff",
        Z = L ? "#4a5d92" : "#8fb0ff";
      if (C.k === "logo")
        (e.fillStyle = L ? "#0b1b4d" : "#fff"),
          e.beginPath(),
          e.arc(X + x / 2, q + V / 2, 26, 0, 6.2832),
          e.fill(),
          g("E", X + x / 2, q + V / 2 + 8, 22, L ? "#fff" : "#0b1b4d", "center", "900");
      else if (C.k === "snd") {
        const v = X + x / 2,
          k = q + V / 2;
        (e.fillStyle = It),
          e.beginPath(),
          e.moveTo(v - 16, k - 6),
          e.lineTo(v - 7, k - 6),
          e.lineTo(v + 3, k - 15),
          e.lineTo(v + 3, k + 15),
          e.lineTo(v - 7, k + 6),
          e.lineTo(v - 16, k + 6),
          e.closePath(),
          e.fill(),
          (e.strokeStyle = It),
          (e.lineWidth = 3),
          ct
            ? (e.beginPath(),
              e.moveTo(v + 10, k - 10),
              e.lineTo(v + 24, k + 10),
              e.moveTo(v + 24, k - 10),
              e.lineTo(v + 10, k + 10),
              e.stroke())
            : (e.beginPath(),
              e.arc(v + 3, k, 9, -0.9, 0.9),
              e.stroke(),
              e.beginPath(),
              e.arc(v + 3, k, 16, -0.9, 0.9),
              e.stroke());
      } else
        C.k === "help"
          ? g("?", X + x / 2, q + V / 2 + 16, 46, It, "center", "900")
          : (g(C.t, X + 16, q + 40, 21, It, "left", "900"), g(C.s(), X + 16, q + 68, 14, Z, "left", "800"));
      Wt.push({
        x: X,
        y: q,
        w: x,
        h: V,
        fn: () => {
          (Vt = Nt), Ye(C.k);
        },
      }),
        (X += x + 8 * pt);
    }),
      g(
        matchMedia("(pointer:coarse)").matches ? "Tik op een tegel" : "Tik op een tegel  |  Toetsenbord: pijltjes en Enter",
        24,
        578,
        13,
        "rgba(255,255,255,.6)",
        "left",
        "600",
      );
  }
  function L0() {
    (e.fillStyle = "rgba(2,6,20,.82)"), e.fillRect(0, 0, E, 600);
    const t = Math.min(760, E - 80),
      o = (E - t) / 2,
      f = 110;
    (e.fillStyle = "rgba(14,18,60,.96)"),
      U(o, f, t, 380, 8),
      e.fill(),
      (e.strokeStyle = "rgba(255,255,255,.25)"),
      (e.lineWidth = 2),
      e.stroke(),
      g("BESTURING", E / 2, f + 50, 30, "#fff", "center", "900"),
      [
        "Links op het scherm: sleep om te sturen.",
        "SCHIET: hou ingedrukt voor meer kracht, laat los om te schieten.",
        "PASS: tik om naar een teamgenoot te passen.",
        "TAKEL (of C): glijdende tackle als de tegenstander de bal heeft.",
        "Zonder bal volgt je dichtstbijzijnde speler de bal automatisch.",
        "Toetsenbord: pijltjes of WASD, spatie = schieten, X = passen,",
        "Esc = pauze.",
      ].forEach((a, i) => g(a, o + 36, f + 100 + i * 36, 17, "rgba(255,255,255,.92)", "left", "600")),
      g("Tik om te sluiten", E / 2, f + 350, 16, "#8fb0ff", "center", "800");
  }
  function N0() {
    (e.fillStyle = "rgba(2,8,24,.7)"),
      e.fillRect(0, 0, E, 600),
      g("PAUZE", E / 2, 200, 70, "#fff", "center", "900"),
      Xt(
        E / 2 - 130,
        250,
        260,
        54,
        "VERDER",
        () => {
          y = "play";
        },
        !0,
      ),
      Xt(
        E / 2 - 130,
        320,
        260,
        54,
        "NAAR MENU",
        () => {
          y = "menu";
        },
        !1,
      );
  }
  function I0() {
    (e.fillStyle = "rgba(2,8,24,.72)"),
      e.fillRect(0, 0, E, 600),
      g(
        P[0] > P[1] ? "GEWONNEN!" : P[0] < P[1] ? "VERLOREN" : "GELIJK",
        E / 2,
        150,
        70,
        "#fff",
        "center",
        "900",
      ),
      (e.fillStyle = "#ffd400"),
      e.fillRect(E / 2 - 90, 164, 180, 5),
      g(z[0].code + "  " + P[0] + " - " + P[1] + "  " + z[1].code, E / 2, 214, 32, "#fff", "center", "800"),
      (Ae || []).forEach((o, f) => g(o, E / 2, 252 + f * 24, 17, "#ffd400", "center", "800"));
    const t = 262 + (Ae ? Ae.length : 0) * 24;
    K
      ? Xt(
          E / 2 - 130,
          t,
          260,
          54,
          "VERDER",
          () => {
            (y = "comp"), (xt = K.kind === "cup" ? 1 : 0);
          },
          !0,
        )
      : (Xt(E / 2 - 130, t, 260, 54, "REVANCHE", () => se(yt || void 0), !0),
        Xt(
          E / 2 - 130,
          t + 70,
          260,
          54,
          "MENU",
          () => {
            y = "menu";
          },
          !1,
        ));
  }
  const St = [74, 72, 70, 66, 63, 63, 62, 60],
    Cf = [
      "Jens",
      "Tibo",
      "Milan",
      "Arne",
      "Lars",
      "Noah",
      "Ruben",
      "Seppe",
      "Yanis",
      "Bram",
      "Kobe",
      "Elias",
      "Wout",
      "Luca",
      "Dries",
      "Tim",
    ],
    Lf = [
      "Verbist",
      "De Smet",
      "Janssens",
      "Peeters",
      "Willems",
      "Claes",
      "Hermans",
      "Goossens",
      "Lambert",
      "Dubois",
      "Maes",
      "Wouters",
      "Mertens",
      "Jacobs",
      "Coppens",
      "Vos",
      "Segers",
      "Baert",
      "Leroy",
      "Pauwels",
    ],
    Nf = ["GK", "DEF", "MID", "AAN"],
    O0 = [0, 1, 1, 2, 3],
    H0 = ["KEEPER", "VERDEDIGER", "VERDEDIGER", "MIDDEN", "AANVALLER"],
    w0 = ["UIT", "SOEPEL", "NORMAAL", "STREKK"],
    P0 = [0, 0.07, 0.16, 0.3];
  let S = null,
    xt = 0,
    ae = 0,
    K = null,
    Ae = null,
    nt = null,
    Zt = 2,
    ko = 0,
    pn = null,
    ie = {},
    Dt = !1;
  const V0 = () => {
      const t = new Date(),
        o = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())),
        f = o.getUTCDay() || 7;
      return (
        o.setUTCDate(o.getUTCDate() + 4 - f),
        o.getUTCFullYear() + "w" + Math.ceil(((o - Date.UTC(o.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7)
      );
    },
    qt = () => new Date().toISOString().slice(0, 10);
  function re(t) {
    let o = 1779033703 ^ t.length;
    for (let n = 0; n < t.length; n++)
      (o = Math.imul(o ^ t.charCodeAt(n), 3432918353)), (o = (o << 13) | (o >>> 19));
    let f = o >>> 0;
    return () => {
      (f |= 0), (f = (f + 1831565813) | 0);
      let n = Math.imul(f ^ (f >>> 15), 1 | f);
      return (n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n), ((n ^ (n >>> 14)) >>> 0) / 4294967296;
    };
  }
  function Xe(t, o, f, n) {
    const a = Cf[(t() * Cf.length) | 0],
      i = Lf[(t() * Lf.length) | 0];
    return { id: n, name: a[0] + ". " + i.toUpperCase(), pos: o, base: f, lvl: 0 };
  }
  const tt = (t) => Math.min(99, t.base + t.lvl),
    W0 = (t) => (tt(t) >= 75 ? "GOUD" : tt(t) >= 66 ? "ZILVER" : "BRONS"),
    G0 = (t) => (tt(t) >= 75 ? "#e7c24a" : tt(t) >= 66 ? "#c4ccd8" : "#c58a5a"),
    If = (t) => Math.round(20 + Math.pow(t.base - 50, 2) * 0.9);
  function D0() {
    const t = re("start"),
      o = [];
    let f = 1;
    return (
      [0, 1, 1, 2, 3, 1, 3].forEach((n) => o.push(Xe(t, n, 59 + ((t() * 5) | 0), f++))),
      { coins: 300, cards: o, lineup: [1, 2, 3, 4, 5], nid: f, bought: {}, st: {}, season: null, obj: null, mine: 0 }
    );
  }
  function K0() {
    try {
      const t = JSON.parse(localStorage.getItem("goalrush2"));
      if (t && t.cards) {
        S = t;
        return;
      }
    } catch {}
    S = D0();
  }
  function Ct() {
    try {
      localStorage.setItem("goalrush2", JSON.stringify(S));
    } catch {}
  }
  const U0 = (t) => S.cards.find((o) => o.id === t),
    Ze = (t) => U0(S.lineup[t]);
  function Of() {
    const t = qt();
    return (
      (!S.obj || S.obj.day !== t) && (S.obj = { day: t, play: 0, win: 0, goals: 0, clean: 0, claimed: {} }),
      [
        ["play", "Speel 3 wedstrijden", 3, 60],
        ["win", "Win 1 wedstrijd", 1, 80],
        ["goals", "Scoor 5 doelpunten", 5, 60],
        ["clean", "1x de nul houden", 1, 80],
      ]
    );
  }
  function B0() {
    const t = qt(),
      o = re("markt" + t),
      f = [];
    for (let a = 0; a < 8; a++) {
      const i = 58 + Math.round(Math.pow(o(), 1.6) * 22);
      f.push(Xe(o, a % 4, i, "o" + a));
    }
    const n = re("vorm" + V0());
    for (let a = 0; a < 2; a++) {
      const i = f[(n() * 8) | 0];
      i.form || ((i.form = !0), (i.base = Math.min(90, i.base + 3)));
    }
    return f;
  }
  function F0(t) {
    const o = S.cards.filter((s) => s.pos === t && !S.lineup.includes(s.id)).sort((s, r) => tt(s) - tt(r));
    if (o.length < 3) return null;
    const f = o.slice(0, 3),
      n = Math.round((tt(f[0]) + tt(f[1]) + tt(f[2])) / 3),
      a = Math.min(88, n + 4),
      i = Xe(re("ruil" + qt() + t + n), t, a, 0);
    return { give: f, card: i };
  }
  const slugOf = (t) =>
      t.logo ? t.logo.slice(6, -4) : String(t.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    allTeams = () => {
      const o = {},
        r = [];
      for (const s of of || J || [])
        for (const m of s.teams) o[m.name] || ((o[m.name] = 1), r.push(m));
      return r.sort((s, m) => (s.name < m.name ? -1 : 1));
    },
    squadOf = (t) => {
      const o = re("sq" + t.name),
        r = [];
      for (let m = 0; m < 12; m++)
        r.push({
          num: 1 + ((o() * 34) | 0),
          name: Cf[(o() * Cf.length) | 0][0] + ". " + Lf[(o() * Lf.length) | 0],
          pos: O0[(o() * 5) | 0],
        });
      return r;
    };
  let alb = 0,
    albc = -1,
    albp = null,
    albPity = 0;
  function openPack() {
    if (S.coins < 120) return;
    S.coins -= 120;
    const o = allTeams(),
      r = [];
    let m = 0;
    for (let u = 0; u < 5; u++) {
      const b = o[(Math.random() * o.length) | 0],
        d = slugOf(b);
      let p, y2, h;
      if (Math.random() < 0.25) (y2 = "wapen"), (p = "b:" + d), (h = b.code);
      else {
        const g = (Math.random() * 12) | 0;
        (y2 = "speler"), (p = "p:" + d + ":" + g), (h = squadOf(b)[g]);
      }
      const c = S.st[p];
      (S.st[p] = 1),
        c ? ((m += 20), r.push({ club: b, kind: y2, dup: 1, info: h })) : r.push({ club: b, kind: y2, dup: 0, info: h });
    }
    r.some((u) => !u.dup) ? (albPity = 0) : albPity++;
    albPity >= 3 &&
      (albPity = 0,
      (() => {
        const b = o[(Math.random() * o.length) | 0],
          d = slugOf(b),
          w = [];
        for (let g = 0; g < 13; g++) w.push(g ? "p:" + d + ":" + (g - 1) : "b:" + d);
        const k = w.find((g) => !S.st[g]);
        if (k) {
          S.st[k] = 1;
          const u = k[0] === "b" ? { club: b, kind: "wapen", dup: 0, info: b.code, pity: 1 } : { club: b, kind: "speler", dup: 0, info: squadOf(b)[+k.split(":")[2]], pity: 1 };
          r.push(u);
        }
      })()),
      (S.coins += m),
      (albp = { items: r, back: m }),
      (alb = 2),
      Ct();
  }
  function Hf() {
    const t = (S.mine = it),
      o = [0, 1, 2, 3, 4, 5, 6, 7],
      f = [],
      n = o.slice();
    for (let l = 0; l < 7; l++) {
      const h = [];
      for (let d = 0; d < 4; d++) h.push([n[d], n[7 - d]]);
      f.push(h), n.splice(1, 0, n.pop());
    }
    const a = {};
    o.forEach((l) => (a[l] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }));
    const i = re("cup" + Date.now()),
      s = o.slice().sort(() => i() - 0.5),
      r = [];
    for (let l = 0; l < 8; l += 2) r.push([s[l], s[l + 1]]);
    const m = S.season ? S.season.n + 1 : 1;
    (S.season = {
      n: m,
      mine: t,
      fx: f,
      round: 0,
      tab: a,
      done: !1,
      prize: 0,
      cup: { r: 0, pairs: r, hist: [], out: !1, champ: -1, prize: 0 },
    }),
      Ct();
  }
  function wf(t) {
    let o = Math.exp(-t),
      f = 0,
      n = 1;
    do f++, (n *= Math.random());
    while (n > o);
    return f - 1;
  }
  function qe(t, o) {
    const f = 1.4 * Math.pow(St[t] / St[o], 2.4),
      n = 1.4 * Math.pow(St[o] / St[t], 2.4);
    return [wf(f), wf(n)];
  }
  function Pf(t, o, f, n) {
    const a = S.season.tab,
      i = a[t],
      s = a[o];
    i.p++,
      s.p++,
      (i.gf += f),
      (i.ga += n),
      (s.gf += n),
      (s.ga += f),
      f > n
        ? (i.w++, (i.pts += 3), s.l++)
        : f < n
          ? (s.w++, (s.pts += 3), i.l++)
          : (i.d++, s.d++, i.pts++, s.pts++);
  }
  const Vf = () =>
    Object.keys(S.season.tab)
      .map(Number)
      .sort((t, o) => {
        const f = S.season.tab[t],
          n = S.season.tab[o];
        return n.pts - f.pts || n.gf - n.ga - (f.gf - f.ga) || n.gf - f.gf;
      });
  function Wf() {
    const t = S.season;
    return t.round >= 7 ? null : t.fx[t.round].find((o) => o[0] === t.mine || o[1] === t.mine);
  }
  function Gf() {
    const t = S.season.cup;
    return t.out || t.champ >= 0
      ? null
      : t.pairs.find((o) => o[0] === S.season.mine || o[1] === S.season.mine);
  }
  const Qe = ["KWARTFINALE", "HALVE FINALE", "FINALE"];
  function Df(t) {
    const o = S.season,
      f = t === "league" ? Wf() : Gf();
    if (!f) return;
    const n = f[0] === o.mine ? f[1] : f[0];
    (K = { kind: t, opp: n, mine: o.mine }), se(K);
  }
  function j0(t, o) {
    const f = S.season,
      n = K.opp,
      a = K.mine;
    let i = [],
      s = null;
    if (K.kind === "league") {
      Pf(a, n, t, o);
      for (const r of f.fx[f.round])
        if (r[0] !== a && r[1] !== a) {
          const m = qe(r[0], r[1]);
          Pf(r[0], r[1], m[0], m[1]);
        }
      if ((f.round++, f.round >= 7 && !f.done)) {
        f.done = !0;
        const r = Vf().indexOf(a),
          m = [500, 300, 200][r] || 100;
        (f.prize = m), (S.coins += m), i.push("Seizoen klaar: plaats " + (r + 1) + " = +" + m + " munten");
      }
    } else {
      const r = f.cup;
      let m = t > o ? a : n;
      if (t === o) {
        const d = 0.5 + (St[a] - St[n]) * 0.004 + ($e() - St[a]) * 0;
        (m = Math.random() < d ? a : n),
          (s = m === a ? "Gewonnen na strafschoppen" : "Verloren na strafschoppen");
      }
      const l = r.pairs.map((d) => {
        if (d[0] === a || d[1] === a) return [d[0], d[1], d[0] === a ? t : o, d[0] === a ? o : t, m];
        const u = qe(d[0], d[1]);
        let b = u[0] > u[1] ? d[0] : u[0] < u[1] ? d[1] : Math.random() < 0.5 ? d[0] : d[1];
        return [d[0], d[1], u[0], u[1], b];
      });
      r.hist.push(l);
      const h = l.map((d) => d[4]);
      if (m !== a) {
        r.out = !0;
        let d = h;
        for (; d.length > 1; ) {
          const b = [];
          for (let p = 0; p < d.length; p += 2) {
            const M = qe(d[p], d[p + 1]),
              R = M[0] > M[1] ? d[p] : M[0] < M[1] ? d[p + 1] : Math.random() < 0.5 ? d[p] : d[p + 1];
            b.push(R);
          }
          d = b;
        }
        (r.champ = d[0]), (r.pairs = []), i.push("Uitgeschakeld in de " + Qe[r.r].toLowerCase());
        const u = [0, 100, 200][r.r];
        u && ((S.coins += u), (r.prize += u), i.push("Beker: +" + u + " munten"));
      } else if (h.length === 1)
        (r.champ = a),
          (r.pairs = []),
          (S.coins += 400),
          (r.prize += 400),
          i.push("BEKERWINNAAR! +400 munten");
      else {
        const d = [];
        for (let u = 0; u < h.length; u += 2) d.push([h[u], h[u + 1]]);
        r.pairs = d;
      }
      r.r++;
    }
    return s && i.unshift(s), i;
  }
  const $e = () => {
    let t = 0;
    for (let o = 0; o < 5; o++) t += tt(Ze(o));
    return t / 5;
  };
  function z0() {
    const t = P[0] > P[1],
      o = P[0] === P[1];
    let f = (t ? 100 : o ? 40 : 15) + P[0] * 20;
    const n = [];
    K || (f = Math.round(f * 0.5)), Of();
    const a = S.obj;
    if (
      (a.play++,
      t && a.win++,
      (a.goals += P[0]),
      P[1] === 0 && a.clean++,
      (S.coins += f),
      n.push("+" + f + " munten"),
      K)
    )
      for (const i of j0(P[0], P[1])) n.push(i);
    (Ae = n), Ct();
  }
  function J0(t) {
    let pj = null;
    if (PJ) {
      const o = yt ? [yt.a.name, yt.b.name] : K ? [H[K.mine].name, H[K.opp].name] : [H[it].name, H[(it + 1) % H.length].name];
      pj = [PJ[o[0]], PJ[o[1]]];
    }
    for (const o of N) {
      if (pj && Array.isArray(pj[o.t]) && pj[o.t][o.i] && pj[o.t][o.i].name) {
        const f = pj[o.t][o.i];
        (o.name = String(f.name).trim().split(" ").slice(-1)[0].toUpperCase()),
          f.n && (o.num = f.n),
          void 0 !== f.sk && n0[f.sk] && (o.skin = n0[f.sk]),
          void 0 !== f.hr && s0[f.hr] && (o.hair = s0[f.hr]),
          void 0 !== f.hs && (o.hs = f.hs % 4),
          void 0 !== f.bt && a0[f.bt % a0.length] && (o.boot = a0[f.bt % a0.length]),
          (o.rate = Math.min(95, Math.max(58, (yt ? (o.t ? yt.tb : yt.ta) : o.t ? St[K ? K.opp : it] : tt(Ze(o.i))) + 2 - ((o.i * 5) % 5))));
        continue;
      }
      if (yt) {
        o.rate = Math.min(95, (o.t ? yt.tb : yt.ta) + ((o.i * 7 + o.t * 3) % 5) - 2);
        continue;
      }
      if (o.t === 0) {
        const f = Ze(o.i);
        (o.name = f.name.split(" ").slice(1).join(" ")), (o.rate = tt(f));
      } else {
        const f = K ? St[K.opp] : 60 + At * 5;
        o.rate = Math.min(95, f + ((o.i * 7) % 5) - 2);
      }
    }
  }
  const _e = (t) => Math.max(0.88, Math.min(1.14, 0.9 + ((t.rate || 60) - 60) * 0.005));
  function Y0(t, o) {
    const f = P0[Zt];
    if (Math.random() >= f) return !1;
    const n = t.t + "_" + t.i;
    ie[n] = (ie[n] || 0) + 1;
    const a = ie[n] >= 2 ? "ROOD" : "GEEL";
    return (
      a === "ROOD" && (ie[n] = 0),
      (nt = {
        t: 1.8,
        text: "OVERTREDING",
        sub: (t.name || "") + " - " + (a === "ROOD" ? "TWEEDE GEEL" : "GELE KAART"),
        col: a === "ROOD" ? "#e0302c" : "#ffd400",
      }),
      ee(0.35),
      (c.owner = o),
      (o.hold = 0),
      (o.cd = 0),
      (t.cd = 1.4),
      (t.x -= (t.t ? -1 : 1) * 30),
      !0
    );
  }
  function I(t, o, f, n, a, i, s, r) {
    (e.fillStyle = s ? "#f2f4f8" : "rgba(255,255,255,.1)"),
      U(t, o, f, n, 6),
      e.fill(),
      (e.strokeStyle = s ? "#fff" : "rgba(255,255,255,.3)"),
      (e.lineWidth = 1.2),
      e.stroke(),
      g(a, t + f / 2, o + n / 2 + (r || 15) * 0.36, r || 15, s ? "#0b1b4d" : "#fff", "center", "800"),
      i && Wt.push({ x: t, y: o, w: f, h: n, fn: i });
  }
  function xe(t, o) {
    const f = e.createLinearGradient(0, 0, 0, 600);
    f.addColorStop(0, "#060c24"), f.addColorStop(1, "#171a48"), (e.fillStyle = f), e.fillRect(0, 0, E, 600);
    const n = (E - 800) / 2;
    return (
      I(
        n + 16,
        14,
        92,
        34,
        "< TERUG",
        () => {
          (y = "menu"), (Dt = !1);
        },
        !1,
        14,
      ),
      g(t, E / 2, 40, 24, "#fff", "center", "900"),
      (e.fillStyle = "#ffd400"),
      e.beginPath(),
      e.arc(n + 690, 31, 11, 0, 6.2832),
      e.fill(),
      g("M", n + 690, 36, 12, "#5a4300", "center", "900"),
      g(String(S.coins), n + 784, 38, 22, "#ffd400", "right", "900"),
      n
    );
  }
  function Kf(t, o) {
    o.forEach((f, n) =>
      I(
        t + 16 + n * 158,
        60,
        150,
        32,
        f,
        () => {
          (xt = n), (ae = 0), (Dt = !1);
        },
        xt === n,
        14,
      ),
    );
  }
  function tf(t, o, f, n, a, i) {
    const s = G0(a),
      r = e.createLinearGradient(0, o, 0, o + n);
    r.addColorStop(0, "rgba(255,255,255,.14)"),
      r.addColorStop(1, "rgba(255,255,255,.05)"),
      (e.fillStyle = r),
      U(t, o, f, n, 8),
      e.fill(),
      (e.strokeStyle = s),
      (e.lineWidth = 2),
      e.stroke(),
      g(String(tt(a)), t + 10, o + 32, 28, s, "left", "900"),
      g(Nf[a.pos], t + 12, o + 50, 13, "#fff", "left", "800"),
      g(a.name, t + f / 2 + 14, o + 26, 16, "#fff", "center", "800"),
      g(W0(a) + (a.lvl ? "  +" + a.lvl : ""), t + f / 2 + 14, o + 46, 12, s, "center", "800"),
      a.form &&
        ((e.fillStyle = "#ff3b8b"),
        U(t + f - 62, o + 6, 54, 15, 3),
        e.fill(),
        g("IN FORM", t + f - 35, o + 17, 10, "#fff", "center", "900")),
      i && i(t, o, f, n);
  }
  let yt = null,
    et = 0,
    ft = 1,
    le = -1,
    ht = 0,
    Lt = -1,
    X0 = null;
  const Uf = {};
  function Z0(t) {
    if (
      !t ||
      typeof t != "string" ||
      !/^(logos\/[\w.-]+|data:image\/(png|jpeg|webp|svg\+xml)[^"']*)$/.test(t)
    )
      return null;
    let o = Uf[t];
    return o || ((o = Uf[t] = new Image()), (o.src = t)), o.complete && o.naturalWidth ? o : null;
  }
  function pns() {
    if (!pn.aim || pn.anim) return;
    const [x, y2] = pn.aim,
      cx = E / 2;
    if (x < cx - 195 || x > cx + 195 || y2 < 156 || y2 > 376) {
      (pn.kd = cx), (pn.msg = { txt: "MISS!", s: 0, t: 1.1 }), pn.r++, (pn.aim = null);
      return;
    }
    pn.kd = cx + (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 150);
    const reach = y2 < 205 ? 48 : 80;
    const res = Math.abs(x - pn.kd) < reach ? "GEKEERD!" : "GOAL!";
    pn.anim = { t: 0, to: [x, y2], res };
    ee(0.4);
  }
  function pnn() {
    Wt = [];
    const cx = E / 2,
      gx0 = cx - 200,
      gx1 = cx + 200;
    const bg = e.createLinearGradient(0, 0, 0, 600);
    bg.addColorStop(0, "#0a1030"), bg.addColorStop(0.45, "#123a1c"), bg.addColorStop(1, "#0d5423"),
      (e.fillStyle = bg),
      e.fillRect(0, 0, E, 600);
    e.fillStyle = "rgba(255,255,255,.10)", e.fillRect(gx0, 150, 400, 230);
    (e.strokeStyle = "rgba(255,255,255,.22)"), (e.lineWidth = 1);
    for (let t = gx0 + 25; t < gx1; t += 25)
      e.beginPath(), e.moveTo(t, 150), e.lineTo(t, 380), e.stroke();
    for (let t = 175; t < 380; t += 25)
      e.beginPath(), e.moveTo(gx0, t), e.lineTo(gx1, t), e.stroke();
    (e.strokeStyle = "#fff"), (e.lineWidth = 7), e.lineCap = "round";
    e.beginPath(), e.moveTo(gx0, 384), e.lineTo(gx0, 150), e.lineTo(gx1, 150), e.lineTo(gx1, 384), e.stroke();
    e.lineCap = "butt";
    const kx = pn.anim ? cx + (pn.kd - cx) * Math.min(1, pn.anim.t * 1.7) : cx + (pn.kd - cx) * 0;
    (e.fillStyle = "#d8ff2a"),
      U(kx - 26, 300, 52, 84, 10),
      e.fill(),
      (e.strokeStyle = "rgba(0,0,0,.35)"),
      (e.lineWidth = 2),
      e.stroke(),
      (e.fillStyle = "#f1c9a5"),
      e.beginPath(),
      e.arc(kx, 292, 16, 0, 6.2832),
      e.fill();
    let bx = cx,
      by = 470,
      br = 20;
    pn.anim &&
      ((bx = cx + (pn.anim.to[0] - cx) * pn.anim.t),
      (by = 470 + (pn.anim.to[1] - 470) * pn.anim.t),
      (br = 20 - 11 * pn.anim.t));
    e.fillStyle = "rgba(0,0,0,.3)", e.beginPath(), e.ellipse(bx, Math.min(478, by + br + 6), br * 0.9, br * 0.3, 0, 0, 6.2832), e.fill();
    const bl = e.createRadialGradient(bx - br * 0.35, by - br * 0.4, br * 0.1, bx, by, br);
    bl.addColorStop(0, "#fff"), bl.addColorStop(1, "#9aa1ad"),
      (e.fillStyle = bl),
      e.beginPath(),
      e.arc(bx, by, br, 0, 6.2832),
      e.fill(),
      (e.fillStyle = "#232832");
    for (let t = 0; t < 3; t++) {
      const a = t * 2.09 + 0.4;
      e.beginPath(),
        e.arc(bx + Math.cos(a) * br * 0.5, by + Math.sin(a) * br * 0.5, br * 0.18, 0, 6.2832),
        e.fill();
    }
    pn.dr && pn.aim && !pn.anim &&
      ((e.strokeStyle = "#ffd400"),
      (e.lineWidth = 3),
      e.beginPath(),
      e.arc(pn.aim[0], pn.aim[1], 22, 0, 6.2832),
      e.stroke(),
      e.beginPath(),
      e.moveTo(pn.aim[0] - 32, pn.aim[1]),
      e.lineTo(pn.aim[0] + 32, pn.aim[1]),
      e.moveTo(pn.aim[0], pn.aim[1] - 32),
      e.lineTo(pn.aim[0], pn.aim[1] + 32),
      e.stroke());
    g("PENALTY'S", cx, 56, 30, "#fff", "center", "900"),
      g("Ronde " + Math.min(5, pn.r + 1) + " / 5      gescoord " + pn.s, cx, 92, 19, "#ffd400", "center", "800"),
      g(
        pn.r >= 5 ? "" : pn.anim ? "" : pn.dr ? "Laat los om te schieten!" : "Sleep naar een hoek en laat los",
        cx,
        545,
        16,
        "rgba(255,255,255,.85)",
        "center",
        "700",
      );
    pn.msg &&
      g(pn.msg.txt, cx, 120, 46, pn.msg.s ? "#4cd964" : "#ff5050", "center", "900");
    if (pn.r >= 5 && !pn.anim && !pn.msg) {
      (e.fillStyle = "rgba(2,8,24,.72)"), e.fillRect(0, 0, E, 600);
      g(pn.s >= 4 ? "TOPPER!" : pn.s >= 2 ? "GOED BEZIG" : "NOG EENS!", cx, 200, 44, "#fff", "center", "900"),
        g(pn.s + " / 5 gescoord", cx, 250, 26, "#ffd400", "center", "900"),
        I(cx - 130, 300, 260, 52, "OPNIEUW", () => Ye("train"), !0, 17),
        I(
          cx - 130,
          368,
          260,
          52,
          "< MENU",
          () => {
            y = "menu";
          },
          !1,
          17,
        );
    } else
      I(
        E - 130,
        14,
        110,
        34,
        "< MENU",
        () => {
          y = "menu";
        },
        !1,
        14,
      );
  }
  function alb0(t) {
    const o = allTeams(),
      total = o.length * 13,
      heb = Object.keys(S.st).length;
    g("STICKERALBUM", t + 400, 118, 20, "#fff", "center", "900"),
      g(heb + " / " + total + " stickers", t + 400, 140, 15, "#ffd400", "center", "800");
    if (alb === 2 && albp) {
      albp.back && g("Dubbele stickers: +" + albp.back + " munten terug", t + 400, 162, 13, "#8fb0ff", "center", "700");
      albp.items.forEach((n, a) => {
        const i = t + 20 + a * 152,
          s = 160;
        (e.fillStyle = "rgba(255,255,255,.14)"),
          U(i, s, 142, 190, 8),
          e.fill(),
          (e.strokeStyle = n.kind === "wapen" ? "#e7c24a" : "rgba(255,255,255,.3)"),
          (e.lineWidth = n.kind === "wapen" ? 3 : 1.5),
          e.stroke();
        const r = Z0(n.club.logo);
        r
          ? e.drawImage(r, i + 23, s + 12, 96, 96)
          : ((e.fillStyle = n.club.shirt), U(i + 23, s + 12, 96, 96, 8), e.fill());
        n.dup &&
          ((e.fillStyle = "#8a1f2a"), U(i + 94, s + 6, 42, 18, 3), e.fill(),
          g("DUBBEL", i + 115, s + 19, 10, "#fff", "center", "900"));
        g(n.kind === "wapen" ? "WAPEN" : String(n.info.num), i + 71, s + 130, n.kind === "wapen" ? 15 : 18, "#fff", "center", "900");
        g(n.kind === "wapen" ? n.club.name.slice(0, 16) : n.info.name, i + 71, s + 152, 12, "#ffd400", "center", "800");
        g(n.kind === "speler" ? Nf[n.info.pos] : "", i + 71, s + 172, 11, "rgba(255,255,255,.6)", "center", "700");
        n.pity && g("GARANTIE", i + 71, s + 186, 10, "#4cd964", "center", "900");
      }),
        I(t + 250, 420, 300, 44, "TERUG NAAR ALBUM", () => ((alb = 0), (albp = null)), !0, 15);
      return;
    }
    if (alb === 1 && albc >= 0 && o[albc]) {
      const n = o[albc],
        a = slugOf(n),
        i = squadOf(n);
      let u = S.st["b:" + a] ? 1 : 0;
      i.forEach((r, m) => S.st["p:" + a + ":" + m] && u++);
      (e.fillStyle = "rgba(255,255,255,.07)"), U(t + 20, 112, 760, 40, 8), e.fill();
      const r = Z0(n.logo);
      r
        ? e.drawImage(r, t + 26, 114, 36, 36)
        : ((e.fillStyle = n.shirt), U(t + 26, 114, 36, 36, 6), e.fill()),
        g(n.name, t + 74, 132, 17, "#fff", "left", "900"),
        g(u + " / 13", t + 740, 138, 17, "#ffd400", "right", "900"),
        I(
          t + 620,
          60,
          120,
          30,
          "< ALBUM",
          () => {
            alb = 0;
          },
          !1,
          13,
        );
      const m = S.st["b:" + a];
      (e.fillStyle = m ? "rgba(231,194,74,.18)" : "rgba(255,255,255,.05)"),
        U(t + 20, 168, 150, 150, 10),
        e.fill(),
        (e.strokeStyle = m ? "#e7c24a" : "rgba(255,255,255,.2)"),
        (e.lineWidth = m ? 3 : 1.5),
        e.stroke(),
        m && r
          ? e.drawImage(r, t + 35, 183, 120, 120)
          : g(m ? "WAPEN" : "?", t + 95, 250, 26, m ? "#e7c24a" : "rgba(255,255,255,.3)", "center", "900"),
        g("WAPEN", t + 95, 336, 12, m ? "#e7c24a" : "rgba(255,255,255,.4)", "center", "800");
      i.forEach((r2, m2) => {
        const b = t + 190 + (m2 % 4) * 152,
          p = 168 + ((m2 / 4) | 0) * 66,
          w = S.st["p:" + a + ":" + m2];
        (e.fillStyle = w ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.05)"),
          U(b, p, 142, 56, 6),
          e.fill(),
          (e.strokeStyle = w ? "rgba(255,255,255,.4)" : "rgba(255,255,255,.12)"),
          (e.lineWidth = 1),
          e.stroke(),
        w
          ? (g(String(r2.num), b + 16, p + 35, 20, "#ffd400", "center", "900"),
            g(r2.name.slice(0, 14), b + 34, p + 25, 13, "#fff", "left", "800"),
            g(Nf[r2.pos], b + 34, p + 42, 11, "rgba(255,255,255,.6)", "left", "700"))
          : g("?", b + 71, p + 37, 24, "rgba(255,255,255,.25)", "center", "900");
      }),
        g(
          u >= 13 ? "CLUB VOLTOOID! Vermeld in je album." : "Nog " + (13 - u) + " stickers voor deze club.",
          t + 400,
          396,
          14,
          u >= 13 ? "#4cd964" : "#8fb0ff",
          "center",
          "800",
        );
      return;
    }
    I(t + 580, 104, 200, 40, "PAK: 5 STICKERS - 120", openPack, S.coins >= 120, 13);
    albPity > 0 && g("Garantie: dit pak bevat zeker " + albPity + " nieuwe na het volgende!", t + 580, 156, 11, "#4cd964", "left", "700");
    o.forEach((n, a) => {
      const i = t + 12 + (a % 12) * 64,
        s = 170 + ((a / 12) | 0) * 52;
      if (s > 570) return;
      const r = S.st["b:" + slugOf(n)],
        m = Z0(n.logo);
      (e.fillStyle = r ? "rgba(231,194,74,.15)" : "rgba(255,255,255,.05)"),
        U(i, s, 60, 48, 6),
        e.fill(),
        (e.strokeStyle = r ? "#e7c24a" : "rgba(255,255,255,.12)"),
        (e.lineWidth = r ? 2 : 1),
        e.stroke(),
      r && m
        ? e.drawImage(m, i + 6, s + 5, 38, 38)
        : g(r ? n.code : "?", i + 30, s + 30, 13, r ? "#fff" : "rgba(255,255,255,.25)", "center", "900"),
        Wt.push({
          x: i,
          y: s,
          w: 60,
          h: 48,
          fn: () => {
            (alb = 1), (albc = a);
          },
        });
    });
  }
  function q0() {
    const t = [],
      o = {};
    return (
      (of || J || []).forEach((f) =>
        f.teams.forEach((n) => {
          o[n.name] ||
            ((o[n.name] = 1),
            t.push({
              comp: f.name,
              ts: n.ts || 60,
              logo: n.logo || null,
              kit: {
                name: String(n.name).slice(0, 24),
                code: String(n.code || n.name)
                  .slice(0, 3)
                  .toUpperCase(),
                shirt: n.shirt,
                shorts: n.shorts || "#ffffff",
                sock: n.sock || n.shirt,
                trim: n.trim || "#ffffff",
              },
            }));
        }),
      ),
      t.sort((f, n) => (f.kit.name < n.kit.name ? -1 : 1)),
      t
    );
  }
  function Q0() {
    const t = xe("KICK OFF"),
      o = (X0 = q0());
    if (!o.length) return;
    if (le >= 0) {
      const n = (of || J || []).map((l) => l.name),
        a = Lt >= 0 ? o.map((l, h) => h).filter((l) => o[l].comp === n[Lt]) : o.map((l, h) => h);
      I(
        t + 250,
        52,
        300,
        28,
        Lt >= 0 ? n[Lt] + " (" + a.length + ")" : "ALLE COMPETITIES (" + o.length + ")",
        () => {
          (Lt = Lt + 1 >= n.length ? -1 : Lt + 1), (ht = 0);
        },
        !0,
        13,
      );
      const i = 12,
        s = Math.max(1, Math.ceil(a.length / i));
      (ht = Math.max(0, Math.min(s - 1, ht))),
        g(le ? "KIES TEGENSTANDER" : "KIES JOUW TEAM", t + 130, 70, 14, "#8fb0ff", "center", "800");
      for (let l = 0; l < i; l++) {
        const h = a[ht * i + l];
        if (h === void 0) break;
        const d = t + 10 + (l % 3) * 260,
          u = 96 + Math.floor(l / 3) * 64,
          b = o[h];
        (e.fillStyle = b.kit.shirt),
          e.beginPath(),
          e.arc(d + 22, u + 24, 14, 0, 6.2832),
          e.fill(),
          I(
            d,
            u,
            250,
            52,
            "",
            () => {
              le ? (ft = h) : (et = h), (le = -1);
            },
            !1,
            14,
          );
        {
          const cm = Z0(b.logo);
          if (cm)
            e.save(),
              e.beginPath(),
              e.arc(d + 26, u + 26, 14, 0, 6.2832),
              e.clip(),
              e.drawImage(cm, d + 12, u + 12, 28, 28),
              e.restore();
          else
            (e.fillStyle = b.kit.shirt),
              e.beginPath(),
              e.arc(d + 26, u + 26, 14, 0, 6.2832),
              e.fill();
          (e.strokeStyle = b.kit.trim),
            (e.lineWidth = 2),
            e.beginPath(),
            e.arc(d + 26, u + 26, 14, 0, 6.2832),
            e.stroke();
        }
          g(b.kit.name.slice(0, 20), d + 50, u + 22, 14, "#fff", "left", "800"),
          g(b.comp, d + 50, u + 40, 11, "rgba(255,255,255,.6)", "left", "700");
      }
      const r = [];
      a.forEach((l, h) => {
        const d = o[l].kit.name[0];
        r.some((u) => u[0] === d) || r.push([d, h]);
      });
      const m = Math.min(30, 780 / Math.max(1, r.length));
      r.forEach((l, h) =>
        I(
          t + 10 + h * m,
          408,
          m - 2,
          28,
          l[0],
          () => {
            ht = Math.floor(l[1] / i);
          },
          !1,
          12,
        ),
      ),
        I(
          t + 10,
          362,
          110,
          34,
          "< VORIGE",
          () => {
            ht = (ht + s - 1) % s;
          },
          !1,
          13,
        ),
        g(ht + 1 + " / " + s, E / 2, 384, 14, "#fff", "center", "800"),
        I(
          t + 680,
          362,
          110,
          34,
          "VOLGENDE >",
          () => {
            ht = (ht + 1) % s;
          },
          !1,
          13,
        );
      return;
    }
    (et = (et + o.length) % o.length), (ft = (ft + o.length) % o.length);
    const f = (n, a, i, s) => {
      const r = o[i];
      (e.fillStyle = "rgba(255,255,255,.07)"),
        U(n, 100, 330, 270, 10),
        e.fill(),
        g(a, n + 165, 132, 16, "#8fb0ff", "center", "800");
      const m = Z0(r.logo);
      m
        ? e.drawImage(m, n + 120, 152, 90, 90)
        : ((e.fillStyle = r.kit.shirt),
          e.beginPath(),
          e.arc(n + 165, 196, 40, 0, 6.2832),
          e.fill(),
          (e.strokeStyle = r.kit.trim),
          (e.lineWidth = 5),
          e.stroke(),
          g(r.kit.code, n + 165, 205, 22, r.kit.trim, "center", "900")),
        Wt.push({
          x: n + 60,
          y: 160,
          w: 210,
          h: 160,
          fn: () => {
            (le = n < t + 400 ? 0 : 1), (Lt = -1), (ht = Math.floor(i / 12));
          },
        }),
        g(r.kit.name, n + 165, 275, 21, "#fff", "center", "900"),
        g(r.comp, n + 165, 298, 13, "rgba(255,255,255,.65)", "center", "700"),
        g("sterkte " + r.ts, n + 165, 324, 16, "#ffd400", "center", "800"),
        I(
          n + 12,
          330,
          70,
          30,
          "<",
          () => {
            s((i + o.length - 1) % o.length);
          },
          !1,
          18,
        ),
        I(
          n + 248,
          330,
          70,
          30,
          ">",
          () => {
            s((i + 1) % o.length);
          },
          !1,
          18,
        );
    };
    f(t + 50, "JIJ (links)", et, (n) => {
      et = n;
    }),
      f(t + 420, "TEGENSTANDER (rechts)", ft, (n) => {
        ft = n;
      }),
      g("VS", t + 400, 240, 24, "#fff", "center", "900"),
      I(
        t + 340,
        270,
        120,
        30,
        "WISSEL",
        () => {
          const n = et;
          (et = ft), (ft = n);
        },
        !1,
        13,
      ),
      I(
        t + 300,
        400,
        200,
        56,
        et === ft ? "KIES 2 ANDERE TEAMS" : "START",
        () => {
          et !== ft && se({ kind: "friendly", a: o[et].kit, b: o[ft].kit, ta: o[et].ts, tb: o[ft].ts });
        },
        et !== ft,
        18,
      ),
      g(
        "Tik op een club om te kiezen uit de lijst. Snelle match, telt niet mee voor je seizoen. Niveau stel je in bij Instellingen.",
        t + 400,
        490,
        13,
        "rgba(255,255,255,.65)",
        "center",
        "600",
      );
  }
  function $0() {
    const t = xe("INSTELLINGEN");
    [
      [
        "COMPETITIE",
        () => J[bt].name,
        () => {
          if (S.season && !S.season.done) {
            nt = null;
            return;
          }
          let f = bt;
          do f = (f + 1) % J.length;
          while (J[f].teams.length !== 8);
          nf(f);
        },
      ],
      [
        "TEAM (kick-off)",
        () => H[it].name,
        () => {
          (it = (it + 1) % H.length), ne();
        },
      ],
      [
        "DUUR WEDSTRIJD",
        () => Pt / 60 + " MIN",
        () => {
          (Tt = (Tt + 1) % 3), (Pt = ze[Tt]);
        },
      ],
      [
        "NIVEAU (kick-off)",
        () => R0[At],
        () => {
          At = (At + 1) % 3;
        },
      ],
      [
        "SCHEIDSRECHTER",
        () => w0[Zt],
        () => {
          Zt = (Zt + 1) % 4;
        },
      ],
      [
        "SPELVORM",
        () => (ko ? "KOOI (muren)" : "VELD"),
        () => {
          ko = 1 - ko;
        },
      ],
      ["GELUID", () => (ct ? "UIT" : "AAN"), () => Ye("snd")],
    ].forEach((f, n) => {
      const a = 84 + n * 64;
      (e.fillStyle = "rgba(255,255,255,.07)"),
        U(t + 60, a, 680, 54, 8),
        e.fill(),
        g(f[0], t + 84, a + 34, 18, "#fff", "left", "800"),
        I(
          t + 470,
          a + 8,
          250,
          38,
          f[1](),
          () => {
            f[2](), Af();
          },
          !0,
          16,
        );
    }),
      g(
        "Scheidsrechter: kans op overtreding bij een tackle. KOOI: de bal kaatst van de muren, nooit bal uit.",
        t + 60,
        536,
        13,
        "rgba(255,255,255,.65)",
        "left",
        "600",
      ),
      g(
        "Tik op een waarde om te wisselen. Competitie wisselen kan niet tijdens een lopend seizoen.",
        t + 60,
        558,
        13,
        "rgba(255,255,255,.65)",
        "left",
        "600",
      );
  }
  function _0() {
    const t = xe("SEIZOEN");
    if ((Kf(t, ["COMPETITIE", "BEKER"]), !S.season)) {
      g("Nog geen seizoen gestart.", E / 2, 230, 24, "#fff", "center", "800"),
        g(
          "8 clubs, iedereen speelt 1x tegen elkaar (7 speeldagen) + een beker.",
          E / 2,
          262,
          15,
          "rgba(255,255,255,.8)",
          "center",
          "600",
        ),
        I(E / 2 - 140, 300, 280, 52, "START SEIZOEN 1 met " + H[it].name, () => Hf(), !0, 16);
      return;
    }
    const o = S.season,
      f = o.mine;
    if (xt === 0) {
      const n = Vf();
      g("#", t + 40, 128, 13, "#8fb0ff", "left", "800"),
        g("CLUB", t + 70, 128, 13, "#8fb0ff", "left", "800"),
        ["G", "W", "D", "V", "DV", "PT"].forEach((i, s) =>
          g(i, t + 300 + s * 32, 128, 13, "#8fb0ff", "center", "800"),
        ),
        n.forEach((i, s) => {
          const r = 138 + s * 36,
            m = o.tab[i],
            l = i === f;
          (e.fillStyle = l ? "rgba(99,182,242,.28)" : "rgba(255,255,255,.06)"),
            e.fillRect(t + 30, r, 470, 32),
            (e.fillStyle = H[i].shirt),
            e.fillRect(t + 30, r, 5, 32),
            g(String(s + 1), t + 40, r + 22, 16, "#fff", "left", "800"),
            g(H[i].name, t + 70, r + 22, 15, "#fff", "left", "800"),
            [m.p, m.w, m.d, m.l, m.gf - m.ga, m.pts].forEach((h, d) =>
              g(
                String(h),
                t + 300 + d * 32,
                r + 22,
                15,
                d === 5 ? "#ffd400" : "#fff",
                "center",
                d === 5 ? "900" : "600",
              ),
            );
        });
      const a = t + 520;
      if (((e.fillStyle = "rgba(255,255,255,.07)"), U(a, 128, 250, 290, 8), e.fill(), o.done))
        g("SEIZOEN KLAAR", a + 125, 170, 20, "#ffd400", "center", "900"),
          g("Plaats " + (n.indexOf(f) + 1) + " van 8", a + 125, 214, 22, "#fff", "center", "800"),
          g("+" + o.prize + " munten", a + 125, 246, 18, "#ffd400", "center", "800"),
          I(
            a + 20,
            300,
            210,
            50,
            Dt ? "ZEKER? TIK NOGMAALS" : "NIEUW SEIZOEN",
            () => {
              Dt ? ((Dt = !1), Hf()) : (Dt = !0);
            },
            !0,
            15,
          );
      else {
        const i = Wf(),
          s = i[0] === f ? i[1] : i[0];
        g("SPEELDAG " + (o.round + 1) + " / 7", a + 125, 160, 16, "#8fb0ff", "center", "800"),
          g(H[f].code, a + 125, 214, 30, "#fff", "center", "900"),
          g("tegen", a + 125, 240, 14, "#fff", "center", "600"),
          g(H[s].name, a + 125, 272, 22, "#fff", "center", "900"),
          g(
            "sterkte " + St[s] + "  |  jij " + Math.round($e()),
            a + 125,
            298,
            14,
            "#ffd400",
            "center",
            "700",
          ),
          I(a + 25, 330, 200, 50, "SPEEL", () => Df("league"), !0, 20);
      }
      g("Klassement: 3 punten winst, 1 gelijk.", t + 30, 450, 13, "rgba(255,255,255,.6)", "left", "600");
    } else {
      const n = o.cup;
      n.champ >= 0
        ? g("BEKERWINNAAR: " + H[n.champ].name, E / 2, 120, 20, "#ffd400", "center", "900")
        : g(Qe[n.r] || "", E / 2, 120, 18, "#8fb0ff", "center", "800");
      const a = n.hist.length,
        i = [];
      for (let r = 0; r < 3; r++)
        i.push(n.hist[r] || (r === n.r ? n.pairs.map((m) => [m[0], m[1], null, null, -1]) : null));
      i.forEach((r, m) => {
        const l = t + 40 + m * 250;
        g(Qe[m], l + 100, 156, 13, "#8fb0ff", "center", "800"),
          r &&
            r.forEach((h, d) => {
              const u = 170 + d * (m === 0 ? 62 : m === 1 ? 124 : 0) + (m === 1 ? 30 : m === 2 ? 90 : 0);
              for (let b = 0; b < 2; b++) {
                const p = h[b],
                  M = u + b * 26,
                  R = p === f;
                (e.fillStyle = R ? "rgba(99,182,242,.3)" : "rgba(255,255,255,.08)"),
                  e.fillRect(l, M, 200, 24),
                  (e.fillStyle = H[p].shirt),
                  e.fillRect(l, M, 4, 24),
                  g(H[p].name, l + 12, M + 17, 13, h[4] === p ? "#ffd400" : "#fff", "left", "800"),
                  h[2] !== null && g(String(h[2 + b]), l + 190, M + 17, 14, "#fff", "right", "800");
              }
            });
      });
      const s = Gf();
      if (s) {
        const r = s[0] === f ? s[1] : s[0];
        I(E / 2 - 130, 470, 260, 46, "SPEEL vs " + H[r].name, () => Df("cup"), !0, 16);
      } else
        n.out &&
          n.champ !== f &&
          g(
            "Je bent uitgeschakeld. Volgend seizoen een nieuwe kans.",
            E / 2,
            492,
            15,
            "#fff",
            "center",
            "700",
          );
    }
  }
  function to() {
    const t = xe("CLUB");
    if ((Kf(t, ["OPSTELLING", "TRANSFERMARKT", "INRUILEN", "OPDRACHTEN", "STICKERS"]), xt === 0)) {
      g("Teamsterkte " + $e().toFixed(1), t + 400, 118, 16, "#ffd400", "center", "800");
      for (let o = 0; o < 5; o++) {
        const f = Ze(o),
          n = 130 + o * 74;
        tf(t + 30, n, 360, 66, f),
          g(H0[o], t + 410, n + 38, 13, "#8fb0ff", "left", "800"),
          I(
            t + 530,
            n + 12,
            110,
            40,
            "WISSEL",
            () => {
              const i = S.cards.filter((r) => r.pos === O0[o] && (r.id === f.id || !S.lineup.includes(r.id)));
              if (i.length < 2) return;
              const s = i[(i.findIndex((r) => r.id === f.id) + 1) % i.length];
              (S.lineup[o] = s.id), Ct();
            },
            !1,
            14,
          );
        const a = 60 * (f.lvl + 1);
        I(
          t + 650,
          n + 12,
          130,
          40,
          f.lvl >= 5 ? "MAX" : "+1  (" + a + ")",
          () => {
            f.lvl < 5 && S.coins >= a && ((S.coins -= a), f.lvl++, Ct());
          },
          S.coins >= a && f.lvl < 5,
          14,
        );
      }
      g(
        "Kaarten in je bezit: " + S.cards.length + ". Upgrade: +1 rating per niveau (max +5), vaste prijs.",
        t + 30,
        520,
        13,
        "rgba(255,255,255,.65)",
        "left",
        "600",
      );
    } else if (xt === 1) {
      const o = B0(),
        f = S.bought[qt()] || [];
      g(
        "AANBOD VAN VANDAAG (vaste prijs) - IN FORM = +3 deze week",
        t + 30,
        118,
        14,
        "#8fb0ff",
        "left",
        "800",
      ),
        o.forEach((s, r) => {
          const m = t + 30 + (r % 2) * 380,
            l = 130 + ((r / 2) | 0) * 84,
            h = f.includes(r),
            d = If(s);
          tf(m, l, 250, 74, s),
            I(
              m + 258,
              l + 14,
              104,
              46,
              h ? "GEKOCHT" : String(d),
              () => {
                if (h || S.coins < d) return;
                S.coins -= d;
                const u = Object.assign({}, s, { id: S.nid++ });
                S.cards.push(u), (S.bought[qt()] = S.bought[qt()] || []).push(r), Ct();
              },
              !h && S.coins >= d,
              15,
            );
        });
      const n = S.cards.filter((s) => !S.lineup.includes(s.id)),
        a = ae,
        i = 3;
      g("VERKOOP RESERVES (50% van de prijs)", t + 30, 482, 14, "#8fb0ff", "left", "800"),
        n.slice(a * i, a * i + i).forEach((s, r) => {
          const m = t + 30 + r * 250,
            l = 490,
            h = Math.round(If(s) * 0.5);
          (e.fillStyle = "rgba(255,255,255,.07)"),
            U(m, l, 240, 56, 8),
            e.fill(),
            g(tt(s) + " " + Nf[s.pos] + " " + s.name, m + 8, l + 22, 13, "#fff", "left", "800"),
            I(
              m + 8,
              l + 28,
              224,
              24,
              "VERKOOP +" + h,
              () => {
                (S.coins += h), (S.cards = S.cards.filter((d) => d.id !== s.id)), Ct();
              },
              !1,
              12,
            );
        }),
        n.length > i &&
          I(
            t + 720,
            496,
            64,
            36,
            "MEER",
            () => {
              ae = (ae + 1) % Math.ceil(n.length / i);
            },
            !1,
            13,
          );
    } else if (xt === 2)
      g(
        "INRUILEN: lever 3 reserves van dezelfde positie in, krijg 1 vaste betere kaart.",
        t + 30,
        122,
        14,
        "#8fb0ff",
        "left",
        "800",
      ),
        g(
          "Je ziet vooraf precies wat je krijgt. Geen toeval.",
          t + 30,
          144,
          13,
          "rgba(255,255,255,.7)",
          "left",
          "600",
        ),
        [0, 1, 2, 3].forEach((o) => {
          const f = 160 + o * 86,
            n = F0(o);
          if (
            ((e.fillStyle = "rgba(255,255,255,.07)"),
            U(t + 30, f, 740, 76, 8),
            e.fill(),
            g(
              ["KEEPERS", "VERDEDIGERS", "MIDDENVELDERS", "AANVALLERS"][o],
              t + 46,
              f + 44,
              17,
              "#fff",
              "left",
              "900",
            ),
            !n)
          ) {
            g(
              "Je hebt minstens 3 reserves nodig (nu " +
                S.cards.filter((a) => a.pos === o && !S.lineup.includes(a.id)).length +
                ")",
              t + 230,
              f + 44,
              14,
              "rgba(255,255,255,.6)",
              "left",
              "700",
            );
            return;
          }
          g(
            "3 x gem. " + Math.round(n.give.reduce((a, i) => a + tt(i), 0) / 3),
            t + 230,
            f + 44,
            15,
            "#fff",
            "left",
            "700",
          ),
            g(">", t + 330, f + 44, 22, "#ffd400", "left", "900"),
            tf(t + 360, f + 5, 230, 66, n.card),
            I(
              t + 620,
              f + 18,
              130,
              40,
              "RUIL IN",
              () => {
                const a = Object.assign({}, n.card, { id: S.nid++ }),
                  i = n.give.map((s) => s.id);
                (S.cards = S.cards.filter((s) => !i.includes(s.id))), S.cards.push(a), Ct();
              },
              !0,
              15,
            );
        });
    else if (xt === 4) alb0(t);
    else {
      const o = Of(),
        f = S.obj;
      g("DAGELIJKSE OPDRACHTEN (nieuw elke dag)", t + 30, 122, 14, "#8fb0ff", "left", "800"),
        o.forEach((n, a) => {
          const i = 140 + a * 82,
            s = Math.min(n[2], f[n[0]]),
            r = s >= n[2],
            m = f.claimed[n[0]];
          (e.fillStyle = "rgba(255,255,255,.07)"),
            U(t + 30, i, 740, 70, 8),
            e.fill(),
            g(n[1], t + 50, i + 30, 18, "#fff", "left", "800"),
            (e.fillStyle = "rgba(255,255,255,.15)"),
            e.fillRect(t + 50, i + 42, 360, 10),
            (e.fillStyle = "#4cd964"),
            e.fillRect(t + 50, i + 42, (360 * s) / n[2], 10),
            g(s + " / " + n[2], t + 425, i + 52, 14, "#fff", "left", "700"),
            I(
              t + 580,
              i + 14,
              170,
              42,
              m ? "OPGEHAALD" : r ? "HAAL +" + n[3] : "+" + n[3] + " munten",
              () => {
                r && !m && ((f.claimed[n[0]] = 1), (S.coins += n[3]), Ct());
              },
              r && !m,
              15,
            );
        });
    }
  }
  const ef = {"version": 7, "competitions": [{"name": "WEST-VLAANDEREN A", "teams": [{"name": "KVK IEPER B", "code": "IEP", "shirt": "#D62828", "shorts": "#D62828", "sock": "#D62828", "trim": "#FFFFFF", "ts": 74, "logo": "logos/kvk-ieper-b.png"}, {"name": "SK ROESELARE B", "code": "ROE", "shirt": "#FFFFFF", "shorts": "#17191F", "sock": "#FFFFFF", "trim": "#17191F", "ts": 72, "logo": "logos/sk-roeselare-b.png"}, {"name": "VV KOEKELARE", "code": "KOE", "shirt": "#17191F", "shorts": "#17191F", "sock": "#17191F", "trim": "#D61111", "ts": 70, "logo": "logos/vv-koekelare.png"}, {"name": "KM TORHOUT B", "code": "TOR", "shirt": "#1F9D55", "shorts": "#17191F", "sock": "#1F9D55", "trim": "#FFFFFF", "ts": 66, "logo": "logos/km-torhout-b.png"}, {"name": "KSV DE RUITER A", "code": "DRU", "shirt": "#63B6F2", "shorts": "#FFFFFF", "sock": "#63B6F2", "trim": "#FFFFFF", "ts": 63, "logo": "logos/ksv-de-ruiter-a.png"}, {"name": "KFC POPERINGE B", "code": "POP", "shirt": "#F2C230", "shorts": "#17191F", "sock": "#F2C230", "trim": "#D62828", "ts": 63, "logo": "logos/kfc-poperinge-b.png"}, {"name": "KSV VEURNE A", "code": "VEU", "shirt": "#1F9D55", "shorts": "#17191F", "sock": "#1F9D55", "trim": "#F2E230", "ts": 62, "logo": "logos/ksv-veurne-a.png"}, {"name": "EAWG FC", "code": "EAW", "shirt": "#7b3fc4", "shorts": "#f3f3f3", "sock": "#7b3fc4", "trim": "#ffffff", "ts": 60, "logo": "logos/eawg-fc.png"}]}, {"name": "WEST-VLAANDEREN B", "teams": [{"name": "KVC WINGENE", "code": "WIN", "shirt": "#065488", "shorts": "#FFFFFF", "sock": "#065488", "trim": "#FFFFFF", "ts": 74, "logo": "logos/kvc-wingene.png"}, {"name": "KSV BREDENE", "code": "BRE", "shirt": "#5F76A8", "shorts": "#FFFFFF", "sock": "#5F76A8", "trim": "#FFFFFF", "ts": 70, "logo": "logos/ksv-bredene.png"}, {"name": "K DOSKO ST-KRUIS", "code": "DOS", "shirt": "#F2D21C", "shorts": "#1B3F8F", "sock": "#F2D21C", "trim": "#1B3F8F", "ts": 69, "logo": "logos/k-dosko-st-kruis.png"}, {"name": "KSC BLANKENBERGE", "code": "BLA", "shirt": "#D62828", "shorts": "#D62828", "sock": "#D62828", "trim": "#FFFFFF", "ts": 66, "logo": "logos/ksc-blankenberge.png"}, {"name": "VC VAMOS ZANDVOORDE", "code": "VAM", "shirt": "#63B6F2", "shorts": "#FFFFFF", "sock": "#63B6F2", "trim": "#FFFFFF", "ts": 64, "logo": "logos/vc-vamos-zandvoorde.png"}, {"name": "KFC MEULEBEKE", "code": "MEU", "shirt": "#FFFFFF", "shorts": "#D62828", "sock": "#D62828", "trim": "#D62828", "ts": 62, "logo": "logos/kfc-meulebeke.png"}, {"name": "KWS CLUB LAUWE", "code": "LAU", "shirt": "#F2C230", "shorts": "#17191F", "sock": "#F2C230", "trim": "#17191F", "ts": 62, "logo": "logos/kws-club-lauwe.png"}, {"name": "FUSION OOSTENDE", "code": "FUS", "shirt": "#17191F", "shorts": "#17191F", "sock": "#17191F", "trim": "#F2C230", "ts": 58, "logo": "logos/fusion-oostende.png"}]}, {"name": "WESTHOEK", "teams": [{"name": "KV KOKSIJDE OOSTDUINKE", "code": "KVK", "shirt": "#37A9E0", "shorts": "#37A9E0", "sock": "#37A9E0", "trim": "#FFFFFF", "ts": 72, "logo": "logos/kv-koksijde-oostduinke.png"}, {"name": "KV EENDRACHT AALTER", "code": "AAL", "shirt": "#D62828", "shorts": "#FFFFFF", "sock": "#D62828", "trim": "#FFFFFF", "ts": 69, "logo": "logos/kv-eendracht-aalter.png"}, {"name": "SCT MENEN", "code": "MEN", "shirt": "#F2C230", "shorts": "#17191F", "sock": "#F2C230", "trim": "#17191F", "ts": 66, "logo": "logos/sct-menen.png"}, {"name": "KV DIKSMUIDE OOSTENDE", "code": "DIK", "shirt": "#F2C230", "shorts": "#1B3F8F", "sock": "#1B3F8F", "trim": "#1B3F8F", "ts": 62, "logo": "logos/kv-diksmuide-oostende.png"}, {"name": "ZWEVEGEM SPORT", "code": "ZWE", "shirt": "#D62828", "shorts": "#FFFFFF", "sock": "#D62828", "trim": "#FFFFFF", "ts": 60, "logo": "logos/zwevegem-sport.png"}, {"name": "EAWG FC", "code": "EAW", "shirt": "#7b3fc4", "shorts": "#f3f3f3", "sock": "#7b3fc4", "trim": "#f2c230", "ts": 60}, {"name": "SC ZONNEBEKE", "code": "ZON", "shirt": "#1B6FB0", "shorts": "#FFFFFF", "sock": "#1B6FB0", "trim": "#FFFFFF", "ts": 58, "logo": "logos/sc-zonnebeke.png"}, {"name": "SV ZULTE-WAREGEM", "code": "ZUL", "shirt": "#d62828", "shorts": "#ffffff", "sock": "#2a9d4a", "trim": "#ffffff", "ts": 56, "logo": "logos/sv-zulte-waregem.png"}]}, {"name": "PRO LEAGUE", "teams": [{"name": "KAA GENT", "code": "GNT", "shirt": "#0023DD", "shorts": "#0023DD", "sock": "#0023DD", "trim": "#FFFFFF", "ts": 86, "logo": "logos/kaa-gent.png"}, {"name": "CLUB BRUGGE", "code": "CLU", "shirt": "#005CA9", "shorts": "#17191F", "sock": "#005CA9", "trim": "#FFFFFF", "ts": 85, "logo": "logos/club-brugge.png"}, {"name": "SPORTING CHARLEROI", "code": "CHA", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#17191F", "ts": 84, "logo": "logos/sporting-charleroi.png"}, {"name": "ROYALE UNION SG", "code": "USG", "shirt": "#FFE000", "shorts": "#000055", "sock": "#000055", "trim": "#000055", "ts": 83, "logo": "logos/royale-union-sg.png"}, {"name": "RSC ANDERLECHT", "code": "AND", "shirt": "#5C2195", "shorts": "#5C2195", "sock": "#5C2195", "trim": "#FFFFFF", "ts": 82, "logo": "logos/rsc-anderlecht.png"}, {"name": "KVC WESTERLO", "code": "WES", "shirt": "#FFFF00", "shorts": "#0000FF", "sock": "#FFFF00", "trim": "#0000FF", "ts": 81, "logo": "logos/kvc-westerlo.png"}, {"name": "KRC GENK", "code": "GNK", "shirt": "#007AFF", "shorts": "#FFFFFF", "sock": "#0000FF", "trim": "#FFFFFF", "ts": 80, "logo": "logos/krc-genk.png"}, {"name": "SV ZULTE-WAREGEM", "code": "ZUL", "shirt": "#FF0026", "shorts": "#FF0026", "sock": "#FF0026", "trim": "#1B5B39", "ts": 79}, {"name": "STANDARD LUIK", "code": "STA", "shirt": "#DD0000", "shorts": "#DD0000", "sock": "#DD0000", "trim": "#FFFFFF", "ts": 78, "logo": "logos/standard-luik.png"}, {"name": "LOMMEL SK", "code": "LOM", "shirt": "#009150", "shorts": "#FFFFFF", "sock": "#009150", "trim": "#FFFFFF", "ts": 77, "logo": "logos/lommel-sk.png"}, {"name": "WAASLAND-BEVEREN", "code": "WAA", "shirt": "#FFFF00", "shorts": "#0000FF", "sock": "#FFFF00", "trim": "#0000FF", "ts": 76, "logo": "logos/waasland-beveren.png"}, {"name": "STVV", "code": "STV", "shirt": "#FFFF00", "shorts": "#0000FF", "sock": "#FFFF00", "trim": "#0000FF", "ts": 75, "logo": "logos/stvv.png"}, {"name": "ROYAL ANTWERP FC", "code": "ANT", "shirt": "#FF0000", "shorts": "#FFFFFF", "sock": "#FF0000", "trim": "#FFFFFF", "ts": 74, "logo": "logos/royal-antwerp-fc.png"}, {"name": "KV MECHELEN", "code": "MEC", "shirt": "#FFD700", "shorts": "#17191F", "sock": "#FF0000", "trim": "#FF0000", "ts": 73, "logo": "logos/kv-mechelen.png"}, {"name": "OH LEUVEN", "code": "OHL", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#009150", "ts": 72, "logo": "logos/oh-leuven.png"}, {"name": "RAAL LA LOUVIERE", "code": "RAA", "shirt": "#009150", "shorts": "#009150", "sock": "#009150", "trim": "#FFFFFF", "ts": 71, "logo": "logos/raal-la-louviere.png"}, {"name": "KV KORTRIJK", "code": "KOR", "shirt": "#FF0000", "shorts": "#FF0000", "sock": "#FF0000", "trim": "#FFFFFF", "ts": 70, "logo": "logos/kv-kortrijk.png"}, {"name": "CERCLE BRUGGE", "code": "CER", "shirt": "#00852D", "shorts": "#17191F", "sock": "#17191F", "trim": "#17191F", "ts": 69, "logo": "logos/cercle-brugge.png"}]}, {"name": "EREDIVISIE", "teams": [{"name": "FEYENOORD", "code": "FEY", "shirt": "#D62828", "shorts": "#FFFFFF", "sock": "#D62828", "trim": "#FFFFFF", "ts": 80, "logo": "logos/feyenoord.png"}, {"name": "AZ ALKMAAR", "code": "AZ", "shirt": "#D62828", "shorts": "#FFFFFF", "sock": "#D62828", "trim": "#FFFFFF", "ts": 79, "logo": "logos/az-alkmaar.png"}, {"name": "PSV", "code": "PSV", "shirt": "#D62828", "shorts": "#FFFFFF", "sock": "#D62828", "trim": "#FFFFFF", "ts": 78, "logo": "logos/psv.png"}, {"name": "AJAX", "code": "AJA", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#D62828", "ts": 77, "logo": "logos/ajax.png"}, {"name": "FC TWENTE", "code": "TWE", "shirt": "#D62828", "shorts": "#FFFFFF", "sock": "#D62828", "trim": "#FFFFFF", "ts": 76, "logo": "logos/fc-twente.png"}, {"name": "FORTUNA SITTARD", "code": "FOR", "shirt": "#F4D21F", "shorts": "#1F9D4A", "sock": "#F4D21F", "trim": "#1F9D4A", "ts": 74, "logo": "logos/fortuna-sittard.png"}, {"name": "FC GRONINGEN", "code": "GRO", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#1F9D4A", "ts": 73, "logo": "logos/fc-groningen.png"}, {"name": "SC HEERENVEEN", "code": "HEE", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#1D5FB8", "trim": "#1D5FB8", "ts": 72, "logo": "logos/sc-heerenveen.png"}, {"name": "GO AHEAD EAGLES", "code": "GAE", "shirt": "#D62828", "shorts": "#FFFFFF", "sock": "#17191F", "trim": "#F4D21F", "ts": 71, "logo": "logos/go-ahead-eagles.png"}, {"name": "EXCELSIOR", "code": "EXC", "shirt": "#D62828", "shorts": "#D62828", "sock": "#17191F", "trim": "#17191F", "ts": 70, "logo": "logos/excelsior.png"}, {"name": "FC UTRECHT", "code": "UTR", "shirt": "#D62828", "shorts": "#D62828", "sock": "#D62828", "trim": "#FFFFFF", "ts": 68, "logo": "logos/fc-utrecht.png"}, {"name": "NEC NIJMEGEN", "code": "NEC", "shirt": "#D62828", "shorts": "#17191F", "sock": "#17191F", "trim": "#1F9D4A", "ts": 67, "logo": "logos/nec-nijmegen.png"}, {"name": "SPARTA ROTTERDAM", "code": "SPA", "shirt": "#FFFFFF", "shorts": "#17191F", "sock": "#FFFFFF", "trim": "#D62828", "ts": 66, "logo": "logos/sparta-rotterdam.png"}, {"name": "SC CAMBUUR", "code": "CAM", "shirt": "#F4D21F", "shorts": "#1D5FB8", "sock": "#F4D21F", "trim": "#1D5FB8", "ts": 65, "logo": "logos/sc-cambuur.png"}, {"name": "PEC ZWOLLE", "code": "PEC", "shirt": "#1D5FB8", "shorts": "#FFFFFF", "sock": "#1D5FB8", "trim": "#FFFFFF", "ts": 64, "logo": "logos/pec-zwolle.png"}, {"name": "TELSTAR", "code": "TEL", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#17191F", "ts": 62, "logo": "logos/telstar.png"}, {"name": "ADO DEN HAAG", "code": "ADO", "shirt": "#F4D21F", "shorts": "#1F9D4A", "sock": "#F4D21F", "trim": "#1F9D4A", "ts": 61, "logo": "logos/ado-den-haag.png"}, {"name": "WILLEM II", "code": "WIL", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#D62828", "ts": 60, "logo": "logos/willem-ii.png"}]}, {"name": "PREMIER LEAGUE", "teams": [{"name": "MANCHESTER CITY", "code": "MCI", "shirt": "#98C6EB", "shorts": "#FFFFFF", "sock": "#1C214F", "trim": "#FFFFFF", "ts": 86, "logo": "logos/manchester-city.png"}, {"name": "ARSENAL", "code": "ARS", "shirt": "#EF0107", "shorts": "#FFFFFF", "sock": "#EF0107", "trim": "#FFFFFF", "ts": 85, "logo": "logos/arsenal.png"}, {"name": "BRIGHTON", "code": "BHA", "shirt": "#1144DD", "shorts": "#1144DD", "sock": "#1144DD", "trim": "#FFFFFF", "ts": 84, "logo": "logos/brighton.png"}, {"name": "CHELSEA", "code": "CHE", "shirt": "#2054CC", "shorts": "#2054CC", "sock": "#2054CC", "trim": "#FFFFFF", "ts": 83, "logo": "logos/chelsea.png"}, {"name": "LIVERPOOL", "code": "LIV", "shirt": "#C8102E", "shorts": "#C8102E", "sock": "#C8102E", "trim": "#FFFFFF", "ts": 81, "logo": "logos/liverpool.png"}, {"name": "BRENTFORD", "code": "BRE", "shirt": "#E30613", "shorts": "#17191F", "sock": "#17191F", "trim": "#FFFFFF", "ts": 80, "logo": "logos/brentford.png"}, {"name": "LEEDS UNITED", "code": "LEE", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#FFCD00", "ts": 79, "logo": "logos/leeds-united.png"}, {"name": "EVERTON", "code": "EVE", "shirt": "#003399", "shorts": "#FFFFFF", "sock": "#003399", "trim": "#FFFFFF", "ts": 77, "logo": "logos/everton.png"}, {"name": "HULL CITY", "code": "HUL", "shirt": "#F18A1D", "shorts": "#17191F", "sock": "#F18A1D", "trim": "#17191F", "ts": 76, "logo": "logos/hull-city.png"}, {"name": "IPSWICH TOWN", "code": "IPS", "shirt": "#3A64A3", "shorts": "#FFFFFF", "sock": "#3A64A3", "trim": "#FFFFFF", "ts": 75, "logo": "logos/ipswich-town.png"}, {"name": "NEWCASTLE UNITED", "code": "NEW", "shirt": "#FFFFFF", "shorts": "#17191F", "sock": "#17191F", "trim": "#17191F", "ts": 73, "logo": "logos/newcastle-united.png"}, {"name": "ASTON VILLA", "code": "AVL", "shirt": "#670E36", "shorts": "#FFFFFF", "sock": "#95BFE5", "trim": "#95BFE5", "ts": 72, "logo": "logos/aston-villa.png"}, {"name": "MANCHESTER UNITED", "code": "MUN", "shirt": "#DA291C", "shorts": "#FFFFFF", "sock": "#17191F", "trim": "#FFFFFF", "ts": 71, "logo": "logos/manchester-united.png"}, {"name": "CRYSTAL PALACE", "code": "CRY", "shirt": "#1B458F", "shorts": "#1B458F", "sock": "#1B458F", "trim": "#C4122E", "ts": 70, "logo": "logos/crystal-palace.png"}, {"name": "BOURNEMOUTH", "code": "BOU", "shirt": "#17191F", "shorts": "#17191F", "sock": "#17191F", "trim": "#D71920", "ts": 68, "logo": "logos/bournemouth.png"}, {"name": "TOTTENHAM", "code": "TOT", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#132257", "ts": 67, "logo": "logos/tottenham.png"}, {"name": "COVENTRY CITY", "code": "COV", "shirt": "#6CC4F0", "shorts": "#FFFFFF", "sock": "#6CC4F0", "trim": "#17191F", "ts": 66, "logo": "logos/coventry-city.png"}, {"name": "FULHAM", "code": "FUL", "shirt": "#FFFFFF", "shorts": "#17191F", "sock": "#FFFFFF", "trim": "#17191F", "ts": 64, "logo": "logos/fulham.png"}, {"name": "NOTTINGHAM FOREST", "code": "NFO", "shirt": "#D70926", "shorts": "#FFFFFF", "sock": "#D70926", "trim": "#FFFFFF", "ts": 63, "logo": "logos/nottingham-forest.png"}, {"name": "SUNDERLAND", "code": "SUN", "shirt": "#EB172B", "shorts": "#17191F", "sock": "#EB172B", "trim": "#FFFFFF", "ts": 62, "logo": "logos/sunderland.png"}]}, {"name": "BUNDESLIGA", "teams": [{"name": "BAYERN MUNCHEN", "code": "FCB", "shirt": "#DC052D", "shorts": "#DC052D", "sock": "#DC052D", "trim": "#FFFFFF", "ts": 86, "logo": "logos/bayern-munchen.png"}, {"name": "BORUSSIA DORTMUND", "code": "BVB", "shirt": "#FDE100", "shorts": "#17191F", "sock": "#FDE100", "trim": "#17191F", "ts": 85, "logo": "logos/borussia-dortmund.png"}, {"name": "SC FREIBURG", "code": "SCF", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#FE0000", "ts": 84, "logo": "logos/sc-freiburg.png"}, {"name": "BAYER LEVERKUSEN", "code": "B04", "shirt": "#17191F", "shorts": "#17191F", "sock": "#17191F", "trim": "#6C0000", "ts": 83, "logo": "logos/bayer-leverkusen.png"}, {"name": "MAINZ 05", "code": "M05", "shirt": "#ED2834", "shorts": "#FFFFFF", "sock": "#ED2834", "trim": "#FFFFFF", "ts": 81, "logo": "logos/mainz-05.png"}, {"name": "ELVERSBERG", "code": "ELV", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#17191F", "ts": 80, "logo": "logos/elversberg.png"}, {"name": "RB LEIPZIG", "code": "RBL", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#D2003C", "trim": "#D2003C", "ts": 79, "logo": "logos/rb-leipzig.png"}, {"name": "WERDER BREMEN", "code": "SVW", "shirt": "#007E56", "shorts": "#FFFFFF", "sock": "#007E56", "trim": "#FFFFFF", "ts": 77, "logo": "logos/werder-bremen.png"}, {"name": "HAMBURGER SV", "code": "HSV", "shirt": "#FFFFFF", "shorts": "#DD0000", "sock": "#005CA9", "trim": "#005CA9", "ts": 76, "logo": "logos/hamburger-sv.png"}, {"name": "FC AUGSBURG", "code": "FCA", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#FF0000", "ts": 75, "logo": "logos/fc-augsburg.png"}, {"name": "EINTRACHT FRANKFURT", "code": "SGE", "shirt": "#17191F", "shorts": "#17191F", "sock": "#17191F", "trim": "#E1001A", "ts": 73, "logo": "logos/eintracht-frankfurt.png"}, {"name": "FC KOLN", "code": "KOE", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#FF0000", "ts": 72, "logo": "logos/fc-koln.png"}, {"name": "VFB STUTTGART", "code": "VFB", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#E32219", "ts": 71, "logo": "logos/vfb-stuttgart.png"}, {"name": "HOFFENHEIM", "code": "TSG", "shirt": "#00004F", "shorts": "#FFFFFF", "sock": "#00004F", "trim": "#FFFFFF", "ts": 70, "logo": "logos/hoffenheim.png"}, {"name": "SCHALKE 04", "code": "S04", "shirt": "#004B9C", "shorts": "#FFFFFF", "sock": "#004B9C", "trim": "#FFFFFF", "ts": 68, "logo": "logos/schalke-04.png"}, {"name": "SC PADERBORN", "code": "SCP", "shirt": "#004F9F", "shorts": "#FFFFFF", "sock": "#004F9F", "trim": "#17191F", "ts": 67, "logo": "logos/sc-paderborn.png"}, {"name": "UNION BERLIN", "code": "FCU", "shirt": "#E30613", "shorts": "#E30613", "sock": "#E30613", "trim": "#FFFFFF", "ts": 66, "logo": "logos/union-berlin.png"}, {"name": "BORUSSIA MONCHENGLADBACH", "code": "BMG", "shirt": "#FFFFFF", "shorts": "#FFFFFF", "sock": "#FFFFFF", "trim": "#17191F", "ts": 64, "logo": "logos/borussia-monchengladbach.png"}]}]};
  function ff(t) {
    if (!t || !Array.isArray(t.competitions) || (t.version || 0) < 7) return;
    const o = /^#[0-9a-f]{6}$/i;
    if (
      t.competitions.length > 0 &&
      t.competitions.every(
        (n) =>
          n &&
          typeof n.name == "string" &&
          Array.isArray(n.teams) &&
          n.teams.length >= 2 &&
          n.teams.length <= 64 &&
          n.teams.every((a) => a && typeof a.name == "string" && o.test(a.shirt || "")),
      )
    ) {
      of = t.competitions;
      try {
        localStorage.setItem("krakRoster2", JSON.stringify(t));
      } catch {}
      if (t.competitions.some((n) => n.teams.length === 8) && !(J && S && S.season && !S.season.done)) {
        (J = t.competitions),
          (bt >= J.length || J[bt].teams.length !== 8) && (bt = J.findIndex((n) => n.teams.length === 8)),
          nf(bt);
        try {
          localStorage.setItem("krakRoster2", JSON.stringify(t));
        } catch {}
      }
    }
  }
  setTimeout(
    () =>
      fetch("roster.json", { cache: "no-store" })
        .then((t) => (t.ok ? t.json() : null))
        .then(ff)
        .catch(() => {}),
    300,
  );
  let J = null,
    of = null,
    bt = 0,
    PJ = null;
  setTimeout(
    () =>
      fetch("players.json", { cache: "no-store" })
        .then((t) => (t.ok ? t.json() : null))
        .then((t) => {
          t && typeof t === "object" && !Array.isArray(t) && (PJ = t);
        })
        .catch(() => {}),
    400,
  );
  function nf(t) {
    !J ||
      !J[t] ||
      J[t].teams.length !== 8 ||
      ((bt = t),
      J[t].teams.forEach((o, f) => {
        (H[f] = {
          name: String(o.name).slice(0, 24),
          code: String(o.code || o.name)
            .slice(0, 3)
            .toUpperCase(),
          shirt: o.shirt,
          shorts: o.shorts || "#ffffff",
          sock: o.sock || o.shirt,
          trim: o.trim || "#ffffff",
          logo: typeof o.logo === "string" ? o.logo : null,
        }),
          o.ts > 40 && o.ts < 95 && (St[f] = o.ts);
      }),
      ne());
  }
  const Bf = document.getElementById("install");
  function eo() {
    if (Kt > 1 && (window.devicePixelRatio || 1) > 1) (Kt = Math.max(1, Kt - 0.5)), ue();
    else if (at < 2) at++, (B = [2, 1.3, 1][at]), ue(), bf();
    else return;
    try {
      localStorage.setItem("krakQ", JSON.stringify({ q: at, d: Kt }));
    } catch {}
  }
  try {
    const t = JSON.parse(localStorage.getItem("krakQ"));
    t &&
      t.q >= 0 &&
      t.q <= 2 &&
      ((at = t.q), (B = [2, 1.3, 1][at]), (Kt = Math.max(1, Math.min(2, t.d || 2))));
  } catch {}
  let ve = performance.now();
  function Ff(t) {
    const o = (t - ve) / 1e3,
      f = Math.min(0.066, (t - ve) / 1e3);
    (ve = t),
      (Ut += f),
      y === "play" && o < 1 && ((Oe += o), ++Ie >= 40 && (Oe / Ie > 1 / 30 && eo(), (Ie = 0), (Oe = 0))),
      h0(f);
    const n = E / 2 / ((Pe * (_t + we)) / 2),
      a = Math.max(n - 70, Math.min(1e3 - n + 70, c.x + c.vx * 0.22));
    te += (a - te) * Math.min(1, 4 * f);
    const i = y === "play" || y === "goal";
    Ee.classList.toggle("hide", !i),
      cf.classList.toggle("hide", !i),
      bg && bg.classList.toggle("hide", !i),
      Bf && Bf.classList.toggle("hide", i),
      k0(),
      requestAnimationFrame(Ff);
  }
  A0(), K0();
  try {
    ff(JSON.parse(localStorage.getItem("krakRoster2")));
  } catch {}
  try {
    typeof ef == "object" && ef && ff(ef);
  } catch {}
  J || (J = [{ name: "WEST-VLAANDEREN A", teams: H.slice() }]),
    nf(bt),
    ne(),
    (e.imageSmoothingQuality = "high"),
    ue(),
    S0(),
    mf(),
    setTimeout(() => {
      bf();
      const t = document.getElementById("load");
      t && t.remove(), (ve = performance.now()), requestAnimationFrame(Ff);
    }, 60),
    "serviceWorker" in navigator && navigator.serviceWorker.register("sw.js").catch(() => {});
  window.__eawg = {
    get y() {
      return y;
    },
    set y(v) {
      y = v;
    },
    get coins() {
      return S && S.coins;
    },
    get st() {
      return S && S.st && Object.keys(S.st).length;
    },
    names() {
      return N.map((o) => o.t + ":" + o.i + ":" + o.name);
    },
    get pj() {
      return PJ ? Object.keys(PJ).length : 0;
    },
    vriendelijk(a, b) {
      const L = q0(),
        A = L[a],
        B = L[b];
      se({ kind: "friendly", a: A.kit, b: B.kit, ta: A.ts, tb: B.ts });
    },
    tik(x, y2) {
      const c = F;
      c.dispatchEvent(new PointerEvent("pointerdown", { clientX: x, clientY: y2, pointerId: 9, bubbles: !0 })),
        c.dispatchEvent(new PointerEvent("pointerup", { clientX: x, clientY: y2, pointerId: 9, bubbles: !0 }));
    },
  };
})();
