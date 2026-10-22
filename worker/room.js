// EAWG Mobile: een kamer voor online spelen met twee gsm's (Durable Object, SQLite, WebSocket Hibernation).
// De host draait het echte spel en stuurt momentopnamen; de gast stuurt alleen invoer.
// Deze kamer stuurt alleen door. Er wordt nooit berichtinhoud bewaard of gelogd.
//
// Opgeslagen staat (alleen dit): created, host, guest (gebruikersnamen), idleAt, away, graceUntil.
// De kamer wordt alleen via de Worker (worker/index.js) bereikt; die controleert sessie en Origin
// en zet de gebruikersnaam in de kop X-EAWG-User.
//
// Berichten: host stuurt snap en evt, gast stuurt input; resync mogen beiden sturen (ongewijzigd doorgestuurd,
// zodat de host na terugkeren een volledige momentopname stuurt). Keepalive: de client stuurt elke 15 s
// '{"t":"ka"}' en krijgt automatisch '{"t":"ka"}' terug zonder dat de kamer wakker wordt.

const MAX_MSG_BYTES = 4096;          // maximaal 4 KB per bericht
const RATE_PER_SEC = 60;             // maximaal 60 berichten per seconde per verbinding
const RATE_CLOSE = 240;              // wie in 1 seconde boven 240 gaat, wordt gesloten (4029)
const GRACE_MS = 30 * 1000;          // respijt na het wegvallen van een speler (iOS sluit sockets vaak bij achtergrond of slot)
const IDLE_MS = 15 * 60 * 1000;      // kamer verdwijnt na 15 minuten zonder verkeer
const IDLE_WRITE_EVERY = 60 * 1000;  // de idle-deadline wordt hoogstens 1 keer per minuut weggeschreven

// Types die alleen de server zelf mag sturen.
const SERVER_TYPES = new Set(["hello", "pong", "peer-join", "peer-left", "peer-back", "peer-gone", "error", "closed"]);

const enc = new TextEncoder();

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.rate = new WeakMap(); // per verbinding: { start, n, warned } (alleen in het geheugen)
    this.lastSeen = 0;         // laatste verkeer, in het geheugen
    this.st = null;            // kopie van de opgeslagen staat
    // Keepalive zonder de kamer wakker te maken: '{"t":"ka"}' krijgt meteen '{"t":"ka"}' terug.
    try {
      if (typeof WebSocketRequestResponsePair === "function") {
        ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ka"}', '{"t":"ka"}'));
      }
    } catch {}
  }

  // ---------- staat ----------

  async load() {
    if (this.st) return this.st;
    const m = await this.ctx.storage.get(["created", "host", "guest", "idleAt", "away", "graceUntil"]);
    this.st = {
      created: m.get("created") || 0,
      host: m.get("host") || null,
      guest: m.get("guest") || null,
      idleAt: m.get("idleAt") || 0,
      away: m.get("away") || { host: 0, guest: 0 },
      graceUntil: m.get("graceUntil") || 0,
    };
    return this.st;
  }
  async save(fields) {
    Object.assign(this.st, fields);
    await this.ctx.storage.put(fields);
  }
  async schedule() {
    const s = this.st;
    const times = [s.idleAt, s.graceUntil].filter((t) => t > 0);
    if (times.length) await this.ctx.storage.setAlarm(Math.min(...times));
  }
  // Verkeer gezien: idle-deadline verschuiven, maar hoogstens 1 schrijfactie per minuut.
  async bump() {
    const now = Date.now();
    this.lastSeen = now;
    if (this.st.idleAt - now < IDLE_MS - IDLE_WRITE_EVERY) {
      await this.save({ idleAt: now + IDLE_MS });
      await this.schedule();
    }
  }
  async destroy(reason) {
    for (const ws of this.ctx.getWebSockets()) {
      try { ws.send(JSON.stringify({ t: "closed", reason })); } catch {}
      try { ws.close(4000, "kamer gesloten"); } catch {}
    }
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    this.st = null;
  }

  // ---------- hulpjes ----------

  sockets(role) {
    return this.ctx.getWebSockets(role).filter((ws) => {
      const a = ws.deserializeAttachment();
      return a && !a.replaced && ws.readyState === 1;
    });
  }
  sendTo(role, obj) {
    const data = typeof obj === "string" ? obj : JSON.stringify(obj);
    for (const ws of this.sockets(role)) {
      try { ws.send(data); } catch {}
    }
  }
  other(role) {
    return role === "host" ? "guest" : "host";
  }

  // ---------- verzoeken van de Worker ----------

  async fetch(request) {
    const url = new URL(request.url);
    await this.load();

    // Kamer aanmaken (alleen door POST /api/room/create in de Worker).
    if (url.pathname === "/init" && request.method === "POST") {
      if (this.st.created) return Response.json({ error: "bezet" }, { status: 409 });
      const user = request.headers.get("X-EAWG-User");
      if (!user) return Response.json({ error: "geen gebruiker" }, { status: 400 });
      const now = Date.now();
      await this.save({ created: now, host: user, guest: null, idleAt: now + IDLE_MS, away: { host: 0, guest: 0 }, graceUntil: 0 });
      await this.schedule();
      return Response.json({ ok: true }, { status: 201 });
    }

    if (url.pathname !== "/connect") return Response.json({ error: "Onbekend adres." }, { status: 404 });
    if (!this.st.created) {
      // Onbekende kamer: niets opslaan, zodat er geen kamer ontstaat.
      this.st = null;
      return Response.json({ error: "Kamer bestaat niet." }, { status: 404 });
    }
    if ((request.headers.get("Upgrade") || "").toLowerCase() !== "websocket") {
      return Response.json({ error: "Verwacht een WebSocket-verbinding." }, { status: 426 });
    }
    const user = request.headers.get("X-EAWG-User");
    if (!user) return Response.json({ error: "Niet ingelogd." }, { status: 401 });

    const s = this.st;
    let role = null;
    let firstJoin = false;
    if (user === s.host) role = "host";
    else if (user === s.guest) role = "guest";
    else if (!s.guest) { role = "guest"; firstJoin = true; }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    if (!role) {
      // Derde speler: nette afwijzing via de WebSocket zelf (een browser kan de HTTP-status niet lezen).
      // Gewone (niet-slapende) verbinding die meteen weer dicht gaat. Lokaal getest: zo komt sluitcode 4003
      // betrouwbaar aan. Via acceptWebSocket kwam de sluitcode lokaal niet aan. Bijwerking lokaal: wrangler dev
      // logt dan 1 keer "Uncaught Error: Network connection lost" (geen gevolg voor de spelers).
      server.accept();
      server.addEventListener("error", () => {});
      server.send(JSON.stringify({ t: "error", code: "room-full", msg: "Deze kamer is vol." }));
      server.close(4003, "kamer vol");
      return new Response(null, { status: 101, webSocket: client });
    }

    // Zelfde speler al verbonden (bv. tweede tabblad of herverbinden): de oude verbinding vervangen.
    let replaced = false;
    for (const old of this.ctx.getWebSockets(role)) {
      const a = old.deserializeAttachment() || {};
      if (!a.replaced) replaced = true;
      old.serializeAttachment({ ...a, replaced: true });
      try { old.close(4001, "vervangen door nieuwe verbinding"); } catch {}
    }

    this.ctx.acceptWebSocket(server, [role]);
    server.serializeAttachment({ role, name: user, at: Date.now() });

    const fields = {};
    if (firstJoin) fields.guest = user;
    const wasAway = s.away[role] > 0;
    if (wasAway) {
      fields.away = { ...s.away, [role]: 0 };
      const otherAway = fields.away[this.other(role)] > 0;
      fields.graceUntil = otherAway ? s.graceUntil : 0;
    }
    if (Object.keys(fields).length) await this.save(fields);
    await this.bump();
    await this.schedule();

    const peerRole = this.other(role);
    const peerName = role === "host" ? this.st.guest : this.st.host;
    server.send(JSON.stringify({
      t: "hello", role, you: user, peer: peerName || null,
      peerOnline: this.sockets(peerRole).length > 0, maxBytes: MAX_MSG_BYTES, maxRate: RATE_PER_SEC,
    }));
    if (firstJoin) this.sendTo("host", { t: "peer-join", role: "guest", name: user });
    else if (wasAway) this.sendTo(peerRole, { t: "peer-back", role, name: user });
    else if (!replaced && role === "guest") this.sendTo("host", { t: "peer-join", role: "guest", name: user });
    else if (!replaced && role === "host" && this.sockets("guest").length) {
      this.sendTo("guest", { t: "peer-join", role: "host", name: user });
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  // ---------- WebSocket-gebeurtenissen (ook na het slapen) ----------

  async webSocketMessage(ws, message) {
    const a = ws.deserializeAttachment();
    if (!a || a.replaced) return;

    // Alleen tekst.
    if (typeof message !== "string") {
      try { ws.close(1003, "alleen JSON-tekst"); } catch {}
      return;
    }
    // Maximaal 4 KB.
    if (message.length > MAX_MSG_BYTES || (message.length > MAX_MSG_BYTES / 3 && enc.encode(message).byteLength > MAX_MSG_BYTES)) {
      try { ws.close(1009, "bericht groter dan 4 KB"); } catch {}
      return;
    }
    // Maximaal 60 per seconde: daarboven weggooien, bij zware overlast sluiten.
    const now = Date.now();
    let r = this.rate.get(ws);
    if (!r || now - r.start >= 1000) { r = { start: now, n: 0, warned: false }; this.rate.set(ws, r); }
    r.n++;
    if (r.n > RATE_CLOSE) {
      try { ws.close(4029, "te veel berichten"); } catch {}
      return;
    }
    if (r.n > RATE_PER_SEC) {
      if (!r.warned) {
        r.warned = true;
        try { ws.send(JSON.stringify({ t: "error", code: "rate-limited", msg: "Meer dan 60 berichten per seconde, de rest wordt weggegooid." })); } catch {}
      }
      return;
    }

    let msg;
    try { msg = JSON.parse(message); } catch { msg = null; }
    if (!msg || typeof msg !== "object" || Array.isArray(msg) || typeof msg.t !== "string") {
      try { ws.send(JSON.stringify({ t: "error", code: "bad-message", msg: "Verwacht JSON met een veld t." })); } catch {}
      return;
    }

    await this.load();
    if (!this.st.created) return;
    await this.bump();

    if (msg.t === "ping") {
      try { ws.send(JSON.stringify({ t: "pong", ts: typeof msg.ts === "number" ? msg.ts : null, st: Date.now() })); } catch {}
      return;
    }
    if (SERVER_TYPES.has(msg.t) || (a.role === "guest" && msg.t === "snap")) {
      try { ws.send(JSON.stringify({ t: "error", code: "forbidden-type", msg: "Dit berichttype mag je niet sturen." })); } catch {}
      return;
    }
    // Doorsturen naar de ander, ongewijzigd (de inhoud wordt nergens bewaard).
    this.sendTo(this.other(a.role), message);
  }

  async webSocketClose(ws, code, reason, wasClean) {
    await this.left(ws);
  }
  async webSocketError(ws, error) {
    await this.left(ws);
  }

  async left(ws) {
    const a = ws.deserializeAttachment();
    try { ws.close(1000, "tot ziens"); } catch {}
    if (!a || a.replaced) return; // vervangen verbinding: niets melden
    ws.serializeAttachment({ ...a, replaced: true });
    await this.load();
    if (!this.st.created) return;
    if (this.sockets(a.role).length) return; // er is al een nieuwe verbinding voor deze rol
    const now = Date.now();
    const away = { ...this.st.away, [a.role]: now };
    await this.save({ away, graceUntil: now + GRACE_MS });
    await this.schedule();
    this.sendTo(this.other(a.role), { t: "peer-left", role: a.role, graceMs: GRACE_MS });
  }

  // ---------- wekker: respijt en opruimen ----------

  async alarm() {
    await this.load();
    const s = this.st;
    if (!s.created) { await this.ctx.storage.deleteAll(); this.st = null; return; }
    const now = Date.now();

    // Respijt voorbij?
    if (s.graceUntil && now >= s.graceUntil) {
      if (s.away.host && !this.sockets("host").length) {
        // Host komt niet terug: zonder host geen spel, kamer sluiten.
        this.sendTo("guest", { t: "peer-gone", role: "host" });
        await this.destroy("host-gone");
        return;
      }
      const fields = { graceUntil: 0, away: { host: 0, guest: 0 } };
      if (s.away.guest && !this.sockets("guest").length) {
        // Gast komt niet terug: plaats vrijmaken voor een nieuwe gast.
        fields.guest = null;
        this.sendTo("host", { t: "peer-gone", role: "guest" });
      }
      await this.save(fields);
    }

    // 15 minuten zonder verkeer?
    let idleAt = s.idleAt;
    if (this.lastSeen && this.lastSeen + IDLE_MS > idleAt) idleAt = this.lastSeen + IDLE_MS;
    if (now >= idleAt) {
      await this.destroy("idle");
      return;
    }
    if (idleAt !== s.idleAt) await this.save({ idleAt });
    await this.schedule();
  }
}
