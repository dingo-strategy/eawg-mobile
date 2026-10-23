(function () {
  var PKEY = 'leren-profielen', LEGACY = 'leren-v2', IKEY = 'leren-instellingen';
  var root = document.getElementById('app');

  var VAKKEN = [
    { id: 'engels', naam: 'Engels', icoon: '🇬🇧', uitleg: 'Woorden en zinnen' },
    { id: 'frans', naam: 'Frans', icoon: '🥐', uitleg: 'Mots et phrases' },
    { id: 'wiskunde', naam: 'Wiskunde', icoon: '➗', uitleg: 'Getallen en meetkunde' },
    { id: 'aardrijkskunde', naam: 'Aardrijkskunde', icoon: '🌍', uitleg: 'Kaarten en klimaat' },
    { id: 'geschiedenis', naam: 'Geschiedenis', icoon: '🏛️', uitleg: 'Van prehistorie tot nu' },
    { id: 'nederlands', naam: 'Nederlands', icoon: '📖', uitleg: 'Taal en spelling' }
  ];

  var data = {};   // vak+reeks -> geladen leerstof (of null als ze nog niet bestaat)
  var KL = { klassen: [], vakken: {} };   // uit data/klassen.json

  // Opslag: eerst in het geheugen en in de browser van dit toestel. Draait de app als claude.ai-pagina, dan wordt alles ook
  // bewaard in de eigen database van jouw claude.ai-account, zodat het terugkomt als de browser de lokale opslag wist.
  var Opslag = (function () {
    var mem = {};            // 1) geheugen: werkt altijd binnen de sessie
    var lsOk = false;        // 2) localStorage: probe-resultaat
    var db = null, uid = null, dbKlaar = false, dbSchrijfbaar = true;
    var vuil = {}, timer = null, bezig = false;
    var PREFIX = 'leren-';

    try { localStorage.setItem('leren-probe', '1'); lsOk = localStorage.getItem('leren-probe') === '1'; localStorage.removeItem('leren-probe'); } catch (e) { lsOk = false; }

    function rauw(k) { if (k in mem) return mem[k]; if (!lsOk) return null; try { return localStorage.getItem(k); } catch (e) { return null; } }
    function lees(k) { try { return JSON.parse(rauw(k)); } catch (e) { return null; } }
    function zetLokaal(k, s) { mem[k] = s; if (lsOk) { try { localStorage.setItem(k, s); } catch (e) { lsOk = false; } } }
    function schrijf(k, v) {
      var s = JSON.stringify(v); zetLokaal(k, s);
      if (dbKlaar) { vuil[k] = s; plan(); }
    }
    function wis(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) {} if (dbKlaar) { vuil[k] = null; plan(); } }

    // ---- spiegelen naar db: 1 document per sleutel, gebundeld en 1 schrijfactie tegelijk ----
    function ref(k) { return db.collection('data/users/' + uid).doc(k); }   // 4 segmenten = document
    function plan() { if (timer) return; timer = setTimeout(function () { timer = null; leegmaken(); }, 800); }
    function leegmaken() {
      if (bezig || !db || !dbSchrijfbaar) return;
      var k = Object.keys(vuil)[0]; if (!k) return;
      var s = vuil[k]; delete vuil[k]; bezig = true;
      var p = s === null ? ref(k).delete() : ref(k).set({ v: s, t: Date.now() });
      p.then(function () { bezig = false; leegmaken(); }, function (e) {
        bezig = false;
        if (e && (e.code === 'invalid_argument' || e.code === 'revoked' || e.code === 'not_granted')) { dbSchrijfbaar = false; return; }   // viewer mag niet schrijven
        if (!(k in vuil)) vuil[k] = s; plan();                                                                                            // tijdelijk: later opnieuw
      });
    }
    window.addEventListener('pagehide', function () { leegmaken(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) leegmaken(); });

    // ---- opstart: db openen en ontbrekende sleutels herstellen ----
    // Geeft Promise<{hersteld:boolean, status:'lokaal+db'|'alleen-lokaal'|'alleen-geheugen'}>. Nooit rejecten, nooit blokkeren > ms.
    function init(maxMs) {
      var klaarBericht = function (h) { return { hersteld: h, status: db ? (lsOk ? 'lokaal+db' : 'db+geheugen') : (lsOk ? 'alleen-lokaal' : 'alleen-geheugen') }; };
      var echt = new Promise(function (res) {
        if (!window.claude || !window.claude.use) return res(klaarBericht(false));
        window.claude.use('db').then(function (d) {
          if (!d) return res(klaarBericht(false));
          return window.claude.use('user').then(function (u) { return u ? u.id() : null; }).then(function (id) {
            if (!id) return res(klaarBericht(false));
            db = d; uid = id;
            return db.collection('data/users/' + uid).get().then(function (snap) {
              var hersteld = false;
              snap.docs.forEach(function (doc) {
                var k = doc.id, x = doc.data(); if (!x || typeof x.v !== 'string' || k.indexOf(PREFIX) !== 0) return;
                if (rauw(k) == null) { zetLokaal(k, x.v); hersteld = true; }       // lokaal leeg -> uit db terugzetten
              });
              dbKlaar = true;
              // lokaal aanwezig maar db leeg/achter: eenmalig opduwen
              Object.keys(mem).concat(lsKeys()).forEach(function (k) { if (k.indexOf(PREFIX) === 0 && k !== 'leren-probe' && rauw(k) != null) vuil[k] = rauw(k); });
              plan(); res(klaarBericht(hersteld));
            });
          });
        }).then(null, function () { res(klaarBericht(false)); });
      });
      var tijd = new Promise(function (res) { setTimeout(function () { res(klaarBericht(false)); }, maxMs || 2500); });
      return Promise.race([echt, tijd]);
    }
    function lsKeys() { var r = []; try { for (var i = 0; i < localStorage.length; i++) r.push(localStorage.key(i)); } catch (e) {} return r; }
    return { lees: lees, schrijf: schrijf, wis: wis, init: init, lsOk: function () { return lsOk; } };
  })();
  var lees = Opslag.lees, schrijf = Opslag.schrijf;
  var PR = lees(PKEY) || { lijst: [], actief: null };

  // ---------- instellingen en taal ----------
  // De knoppen en uitleg van de app zijn vertaald (nl, fr, en). De lessen zelf blijven Nederlands.
  var INST = lees(IKEY) || {};
  function standaardTaal() { var n = String((navigator.language || 'nl')).slice(0, 2); return n === 'fr' ? 'fr' : n === 'en' ? 'en' : 'nl'; }
  var LANG = INST.taal || standaardTaal();
  if (!INST.taalGekozen && PR.lijst.length) { INST.taal = INST.taal || 'nl'; LANG = INST.taal; INST.taalGekozen = true; }   // bestaande gebruikers blijven Nederlands
  var WOORDENBOEK = window.LEREN_I18N || {};
  function Tr(nl, v) {
    var s = nl, d = LANG !== 'nl' && WOORDENBOEK[LANG];
    if (d && d[nl] != null) s = d[nl];
    if (v) s = s.replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; });
    return s;
  }
  function bewaarInst() { schrijf(IKEY, INST); }
  function pasInstToe() {
    document.documentElement.lang = LANG;
    document.documentElement.classList.toggle('groot', !!INST.groot);
  }
  var S = {};   // staat van het actieve profiel
  function save() { if (PR.actief) schrijf('leren-p-' + PR.actief, S); }
  function savePR() { schrijf(PKEY, PR); }
  function vulS() {
    S.scores = S.scores || {};   // "vak/lesid" -> beste aantal juist (0..1)
    S.dagen = S.dagen || {}; S.betaald = S.betaald || {}; S.mijl = S.mijl || {}; S.freeze = S.freeze || {}; S.fout = S.fout || {}; S.eigen = S.eigen || [];
  }
  function activeer(id) { PR.actief = id; savePR(); S = lees('leren-p-' + id) || {}; vulS(); }
  vulS();
  function pinHash(c) { var h = 5381, t = 'leerliga:' + c; for (var i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0; return String(h); }

  // ---------- inloggen en afmelden (lokaal op dit toestel; je blijft ingelogd tot je afmeldt) ----------
  function doeLogin(x) { activeer(x.id); location.hash = '#/'; route(); }
  function pinScherm(x, terugFn) {
    leeg();
    root.appendChild(knop('back', '← ' + Tr('Terug'), terugFn));
    root.appendChild(el('h1', '', x.avatar + ' ' + x.naam));
    root.appendChild(el('p', 'sub', Tr('Typ je pincode van 4 cijfers.')));
    var inp = el('input', 'invul'); inp.type = 'password'; inp.maxLength = 4; inp.id = 'pincode';
    inp.setAttribute('inputmode', 'numeric'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('aria-label', Tr('Pincode'));
    var mel = el('p', 'sub');
    function probeer() {
      if (pinHash(inp.value) === x.pin) { doeLogin(x); return; }
      mel.textContent = Tr('Verkeerde pincode. Probeer opnieuw.'); inp.value = ''; inp.focus();
    }
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') probeer(); });
    root.appendChild(inp); root.appendChild(knop('btn', Tr('Inloggen'), probeer)); root.appendChild(mel);
    inp.focus();
  }
  function inlogScherm() {
    leeg();
    root.appendChild(el('h1', '', Tr('Inloggen')));
    root.appendChild(el('p', 'sub', Tr('Kies wie je bent.')));
    var rij = el('div', 'chiprij');
    PR.lijst.forEach(function (x) {
      rij.appendChild(knop('keuze', x.avatar + ' ' + x.naam + (x.pin ? ' 🔒' : ''), function () { if (x.pin) pinScherm(x, inlogScherm); else doeLogin(x); }));
    });
    root.appendChild(rij);
    root.appendChild(knop('btn zacht', Tr('＋ Nieuw profiel'), function () { location.hash = '#/nieuw'; }));
  }
  function afmelden() { PR.actief = null; savePR(); S = {}; vulS(); location.hash = '#/'; route(); }

  // ---------- beloningen (munten voor het voetbalspel) ----------
  // Cijfers volgen het advies van de onderzoeker; het zijn gekalibreerde gokken, na enkele weken bijsturen.
  var TRAPPEN = [[0.9, 40], [0.7, 30], [0.5, 20], [0.4, 10]];   // [minimumscore, munten]
  var MAX_LESSEN_DAG = 3, CAP_DAG = 100, FREEZES_PER_WEEK = 2;
  var CODE_MUNTEN = 75, CODE_LESSEN = 2;   // na 2 lessen op een dag krijg je een code voor 75 munten in EAWG Mobile
  var MIJLPALEN = { 3: 30, 7: 75, 14: 150, 30: 300 }, NA_30 = 200;

  // Muntcode: de server van EAWG Mobile maakt en controleert de code. Wij sturen alleen een willekeurig nummer (geen naam) en het aantal lessen van vandaag.
  var CODE_URL = 'https://eawg-mobile.jordyseyssens.workers.dev/api/leer/uitgeven', SPEL_URL = 'https://eawg-mobile.jordyseyssens.workers.dev/';
  var codeBezig = false, codeFout = false, codeWachters = [];
  function leerId() {
    if (!S.leerId) {
      var a = '';
      try { var u = new Uint8Array(12); crypto.getRandomValues(u); for (var i = 0; i < u.length; i++) a += ('0' + u[i].toString(16)).slice(-2); } catch (e) { for (var k = 0; k < 24; k++) a += Math.floor(Math.random() * 16).toString(16); }
      S.leerId = a; save();
    }
    return S.leerId;
  }
  function lessenGeteld() { var d = S.dagen[vandaag()]; return d && d.klaar ? d.klaar.length : 0; }
  function dagCode() { S.codes = S.codes || {}; return S.codes[vandaag()] || null; }
  function haalCode(klaar) {
    if (klaar) codeWachters.push(klaar);
    if (codeBezig || dagCode() || lessenGeteld() < CODE_LESSEN || !PR.actief) return;
    codeBezig = true; codeFout = false;
    var dagNu = vandaag(), actief = PR.actief, ctl = window.AbortController ? new AbortController() : null;
    var stop = setTimeout(function () { if (ctl) ctl.abort(); }, 10000);
    fetch(CODE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leerId: leerId(), lessons: lessenGeteld() }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (j) {
        if (!j || typeof j.code !== 'string' || !/^[0-9A-Za-z._-]{8,100}$/.test(j.code)) throw new Error('vorm');
        if (PR.actief !== actief) return;
        S.codes = S.codes || {}; S.codes[dagNu] = { code: j.code, amount: +j.amount || CODE_MUNTEN }; save();
      })
      .then(null, function () { codeFout = true; })
      .then(function () { clearTimeout(stop); codeBezig = false; var w = codeWachters; codeWachters = []; w.forEach(function (f) { try { f(); } catch (e) {} }); });
  }
  function codeKaart() {
    var k = el('div', 'codekaart');
    function teken() {
      k.textContent = '';
      var c = dagCode();
      if (!c) {
        if (lessenGeteld() < CODE_LESSEN) {
          var nog = CODE_LESSEN - lessenGeteld();
          k.appendChild(el('span', '', Tr(nog === 1 ? 'Nog {n} les vandaag voor je code van {m} munten in EAWG Mobile' : 'Nog {n} lessen vandaag voor je code van {m} munten in EAWG Mobile', { n: nog, m: CODE_MUNTEN })));
        } else if (codeFout && !codeBezig) {
          k.appendChild(el('span', '', Tr('De code kon niet opgehaald worden. Controleer je internet en probeer opnieuw.')));
          k.appendChild(knop('btn zacht', Tr('Probeer opnieuw'), function () { codeFout = false; haalCode(teken); teken(); }));
        } else { k.appendChild(el('span', '', Tr('Code ophalen…'))); haalCode(teken); }
        return;
      }
      k.appendChild(el('strong', '', Tr('🎁 Je code van vandaag: {m} munten', { m: c.amount })));
      k.appendChild(el('div', 'code', c.code));
      var b = knop('btn zacht', Tr('Kopieer code'), function () {
        try { navigator.clipboard.writeText(c.code).then(function () { b.textContent = Tr('Gekopieerd!'); }, function () { b.textContent = c.code; }); } catch (e) { b.textContent = c.code; }
      });
      k.appendChild(b);
      var a = el('a', 'btn', Tr('▶ Open EAWG Mobile en wissel in')); a.href = SPEL_URL + '#munten=' + c.code; a.target = '_blank'; a.rel = 'noopener'; k.appendChild(a);
      k.appendChild(el('small', '', Tr('Je code werkt 1 keer en 30 dagen. Log in bij EAWG Mobile om hem in te wisselen.')));
    }
    teken();
    return k;
  }
  function dag(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dagNr(key) { var p = key.split('-'); return Date.UTC(+p[0], p[1] - 1, +p[2]) / 864e5; }
  function weekKey(d) { var m = new Date(d); m.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dag(m); }
  function vandaag() { return dag(new Date()); }
  function muntenVandaag() { return (S.dagen[vandaag()] || {}).munten || 0; }

  function wachtOpSpel() {
    try {
      var o = JSON.parse(localStorage.getItem('leren-tegoed')) || {}, g = +localStorage.getItem('leren-gehaald') || 0;
      return Math.max(0, (o.totaal || 0) - g) + Math.max(0, o.coins || 0);
    } catch (e) { return 0; }
  }
  // Brievenbus: het voetbalspel haalt dit op en telt het bij zijn munten.
  function stortMunten(n) {
    if (n <= 0) return;
    try {   // teller die alleen stijgt; het spel onthoudt zelf hoeveel het al heeft opgehaald
      var o = JSON.parse(localStorage.getItem('leren-tegoed')) || {};
      o.totaal = (o.totaal || 0) + n;
      localStorage.setItem('leren-tegoed', JSON.stringify(o));
    } catch (e) {}
    S.totaalMunten = (S.totaalMunten || 0) + n;
  }

  // Reeks = opeenvolgende dagen met minstens 1 afgeronde les. Zachte regels: 2 gratis vrije dagen per week, en bij een gemiste dag halveert de reeks.
  function bijwerkenReeks() {
    var nu = new Date(), v = dag(nu), msg = '';
    if (S.laatsteLesDag === v) return { msg: msg, extra: 0 };
    if (!S.laatsteLesDag) S.reeksLes = 1;
    else {
      var gemist = dagNr(v) - dagNr(S.laatsteLesDag) - 1;
      if (gemist <= 0) S.reeksLes = (S.reeksLes || 0) + 1;
      else {
        var wk = weekKey(nu);
        if (S.freeze.week !== wk) S.freeze = { week: wk, gebruikt: 0 };
        if (gemist <= FREEZES_PER_WEEK - S.freeze.gebruikt) {
          S.freeze.gebruikt += gemist; S.reeksLes = (S.reeksLes || 0) + 1;
          msg = Tr('Je vrije dag werd gebruikt, je reeks blijft behouden.');
        } else {
          msg = Tr('Welkom terug! Je had al {n} dagen gedaan, die tellen nog half mee.', { n: S.reeksLes || 0 });
          S.reeksLes = Math.ceil((S.reeksLes || 0) / 2) + 1;
        }
      }
    }
    S.laatsteLesDag = v;
    var r = S.reeksLes, extra = 0;
    if (MIJLPALEN[r] && !S.mijl[r]) { S.mijl[r] = 1; extra = MIJLPALEN[r]; }
    else if (r > 30 && r % 30 === 0 && !S.mijl['r' + r]) { S.mijl['r' + r] = 1; extra = NA_30; }
    return { msg: msg, extra: extra };
  }

  // Berekent en betaalt de beloning voor een afgeronde les.
  function beloon(sleutel, score, tePlezig) {
    var res = { munten: 0, reden: '', reeks: 0, mijl: 0, msg: '' };
    var trap = 0; TRAPPEN.some(function (t) { if (score >= t[0]) { trap = t[1]; return true; } });
    var rk = (!tePlezig && trap > 0) ? bijwerkenReeks() : { msg: '', extra: 0 };   // te snel of bijna alles fout telt niet mee voor je reeks
    res.reeks = S.reeksLes || 0; res.msg = rk.msg; res.mijl = rk.extra;
    var d = S.dagen[vandaag()] = S.dagen[vandaag()] || { lessen: 0, munten: 0 };
    d.klaar = d.klaar || [];
    if (!tePlezig && trap > 0 && d.klaar.indexOf(sleutel) < 0) d.klaar.push(sleutel);   // telt mee voor de code van vandaag
    var eerder = S.betaald[sleutel] || 0, verschil = Math.max(0, trap - eerder);
    if (tePlezig) res.reden = 'snel';
    else if (trap === 0) res.reden = 'laag';
    else if (verschil === 0) res.reden = 'herhaling';
    else if (d.lessen >= MAX_LESSEN_DAG || d.munten >= CAP_DAG) res.reden = 'cap';
    else {
      res.munten = Math.min(verschil, CAP_DAG - d.munten);
      d.lessen++; d.munten += res.munten; S.betaald[sleutel] = eerder + res.munten;
    }
    stortMunten(res.munten + res.mijl);
    save();
    return res;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function knop(cls, text, fn) { var b = el('button', cls, text); b.addEventListener('click', fn); return b; }
  function vak(id) {
    var c = KL.vakken[id]; if (c) return { id: id, naam: Tr(c.naam), icoon: c.icoon, uitleg: Tr(c.uitleg) };
    var f = VAKKEN.filter(function (v) { return v.id === id; })[0];
    return f && { id: f.id, naam: Tr(f.naam), icoon: f.icoon, uitleg: Tr(f.uitleg) };
  }
  function klas() { return KL.klassen.filter(function (k) { return k.id === S.klas; })[0] || null; }
  function reeks() { var k = klas(); return k ? k.reeks : 'A'; }
  function vakkenKlas() { var k = klas(); return (k ? k.vakken : []).map(vak).filter(Boolean); }

  function haal(bestand) {
    return fetch('data/' + bestand + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return null; });
  }
  // Bestandsnaam per reeks: A = id, B = id-b (makkelijker), L = id-l (lager), G = id-g (tweede graad).
  // Bestaat de B-versie nog niet, dan tonen we de A-versie met een melding.
  var SUF = { A: '', B: '-b', L: '-l', G: '-g' };
  function laad(id, r) {
    r = r || reeks();
    var sl = id + r;
    if (sl in data) return Promise.resolve(data[sl]);
    var p = haal(id + (SUF[r] || '')).then(function (d) {
      if (d) { d.niveau = r; return d; }
      if (r === 'B') return haal(id).then(function (a) { if (a) { a.niveau = 'A'; a.terugval = true; } return a; });
      return null;
    });
    return p.then(function (d) { data[sl] = d; return d; });
  }
  // Scores worden per reeks bewaard, zodat de niveaus elkaar niet storen.
  function sk(d, lid) { return (d.niveau && d.niveau !== 'A' ? d.niveau + ':' : '') + d.vak + '/' + lid; }

  function alleLessen(d, jaar) {
    var out = [];
    (d.leerjaren || []).forEach(function (j) {
      if (jaar && j.jaar !== jaar) return;
      (j.themas || []).forEach(function (t) { (t.lessen || []).forEach(function (l) { out.push(l); }); });
    });
    return out;
  }
  function voortgang(d, jaar) {
    var l = alleLessen(d, jaar), k = 0;
    l.forEach(function (x) { if (S.scores[sk(d, x.id)] != null) k++; });
    return { klaar: k, totaal: l.length };
  }

  // ---------- logo ----------
  var LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 234" role="img" aria-label="Leerliga"><defs><linearGradient id="PFXa" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f74ff"/><stop offset="1" stop-color="#6a3fe0"/></linearGradient><linearGradient id="PFXb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe58f"/><stop offset="1" stop-color="#ffb11f"/></linearGradient></defs><path d="M100 4C128 19 159 23 192 21V116C192 171 149 210 100 229C51 210 8 171 8 116V21C41 23 72 19 100 4Z" fill="url(#PFXb)"/><path d="M100 15C126 28 153 32 181 30V116C181 164 143 199 100 216C57 199 19 164 19 116V30C47 32 74 28 100 15Z" fill="url(#PFXa)"/><path d="M100 22C124 34 148 38 173 36V116C173 158 139 190 100 206C61 190 27 158 27 116V36C52 38 76 34 100 22Z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6"/><polygon points="100.0,37.0 104.5,49.9 118.1,50.1 107.2,58.3 111.2,71.4 100.0,63.6 88.8,71.4 92.8,58.3 81.9,50.1 95.5,49.9" fill="url(#PFXb)" stroke="#fff" stroke-opacity=".7" stroke-width="1.2" stroke-linejoin="round"/><path d="M37 95V148C61 142 86 142 100 152C114 142 139 142 163 148V95Z" fill="#1f2f9e"/><path d="M100 98C86 88 63 88 43 94V140C63 134 86 134 100 144Z" fill="#e4eaff"/><path d="M100 98C114 88 137 88 157 94V140C137 134 114 134 100 144Z" fill="#fff"/><g stroke="#7f98ff" stroke-width="3" stroke-linecap="round" fill="none"><path d="M53 105C65 102 76 103 88 108"/><path d="M53 118C65 115 76 116 88 121"/><path d="M112 108C124 103 135 102 147 105"/><path d="M112 121C124 116 135 115 147 118"/></g><path d="M100 98V144" stroke="#9fb2ff" stroke-width="2"/><g><circle cx="100" cy="181" r="17" fill="#fff" stroke="#16215f" stroke-width="2.4"/><g stroke="#16215f" stroke-width="1.8" stroke-linecap="round"><line x1="100.0" y1="173.9" x2="100.0" y2="164.9"/><line x1="106.8" y1="178.8" x2="115.3" y2="176.0"/><line x1="104.2" y1="186.8" x2="109.4" y2="194.0"/><line x1="95.8" y1="186.8" x2="90.6" y2="194.0"/><line x1="93.2" y1="178.8" x2="84.7" y2="176.0"/></g><polygon points="100.0,173.9 106.8,178.8 104.2,186.8 95.8,186.8 93.2,178.8" fill="#16215f"/></g></svg>';
  var logoTeller = 0;
  function logoEl(px) {
    var sp = el('span', 'logo'); sp.style.width = px + 'px';
    sp.innerHTML = LOGO.replace(/PFX/g, 'lg' + (++logoTeller));   // vaste eigen tekening, geen gebruikersinvoer
    return sp;
  }
  function merkRegel() { var p = el('p', 'merk'); p.appendChild(logoEl(26)); p.appendChild(document.createTextNode(' Leerliga')); return p; }
  // Opstartscherm: blijft minstens even staan zodat je het logo ziet, en glijdt dan weg.
  function verbergSplash() {
    var sp = document.getElementById('splash'); if (!sp) return;
    var min = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? 500 : 1200;
    setTimeout(function () { sp.classList.add('weg'); setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 600); }, Math.max(0, min - performance.now()));
  }

  function bar(pct) { var b = el('div', 'bar'); var i = el('i'); i.style.width = pct + '%'; b.appendChild(i); return b; }
  function begroeting() { var u = new Date().getHours(); return u < 12 ? Tr('Goeiemorgen') : u < 18 ? Tr('Goeiemiddag') : Tr('Goeienavond'); }
  function leeg(id) {
    root.textContent = ''; window.scrollTo(0, 0);
    root.className = id ? 'v-' + id : '';
    if (id) root.setAttribute('data-vak', id); else root.removeAttribute('data-vak');
  }
  function terug(hash, tekst) { return knop('back', '← ' + (tekst || Tr('Terug')), function () { location.hash = hash; }); }

  // ---------- schermen ----------
  function muntenKaart() {
    var k = el('div', 'muntenkaart'), wacht = wachtOpSpel(), r = S.reeksLes || 0, vol = null;
    k.appendChild(el('strong', '', Tr('🪙 Mijn munten')));
    k.appendChild(el('span', '', Tr('{n} verdiend met leren', { n: S.totaalMunten || 0 }) + ' · ' + Tr('vandaag {n}/{m}', { n: muntenVandaag(), m: CAP_DAG })));
    if (wacht > 0) k.appendChild(el('span', '', Tr('{n} wachten op je in het spel', { n: wacht })));
    Object.keys(MIJLPALEN).map(Number).sort(function (a, b) { return a - b; }).some(function (m) { if (m > r) { vol = m; return true; } });
    if (vol) { var nog = vol - r; k.appendChild(el('span', '', Tr(nog === 1 ? 'Nog {n} dag leren en je krijgt een bonus van +{m}' : 'Nog {n} dagen leren en je krijgt een bonus van +{m}', { n: nog, m: MIJLPALEN[vol] }))); }
    k.appendChild(codeKaart());
    k.appendChild(el('small', '', Tr('Een les geeft 10 tot 40 munten (max. {a} lessen en {m} munten per dag). Elke dag leren geeft een bonus: 3 dagen +30, 7 dagen +75, 14 dagen +150, 30 dagen +300.', { a: MAX_LESSEN_DAG, m: CAP_DAG })));
    if (/\/leren\/(index\.html)?$/.test(location.pathname)) { var a = el('a', 'terugspel', Tr('⚽ Naar het spel')); a.href = '../'; k.appendChild(a); }
    return k;
  }
  function home() {
    leeg();
    root.appendChild(merkRegel());
    var top = el('div', 'top'), kop = el('div');
    kop.appendChild(el('h1', '', begroeting() + '! 👋'));
    kop.appendChild(el('p', 'sub', Tr('Wat leren we vandaag?')));
    top.appendChild(kop);
    var chips = el('div', 'chips');
    var pf = PR.lijst.filter(function (x) { return x.id === PR.actief; })[0] || {};
    chips.appendChild(knop('streak profielknop', (pf.avatar || '🙂') + ' ' + (pf.naam || ''), function () { location.hash = '#/profiel'; }));
    var gear = knop('streak profielknop', '⚙️', function () { location.hash = '#/instellingen'; }); gear.setAttribute('aria-label', Tr('Instellingen'));
    chips.appendChild(gear);
    chips.appendChild(el('div', 'streak', '🔥 ' + (S.reeksLes || 0)));
    chips.appendChild(el('div', 'streak', '🪙 ' + muntenVandaag() + '/' + CAP_DAG));
    top.appendChild(chips);
    root.appendChild(top);

    if (S.laatsteLes && S.laatsteKlas === S.klas) {
      var p = S.laatsteLes.split('/');
      var h = knop('hero v-' + p[0], '', function () { location.hash = '#/' + S.laatsteLes; });
      h.appendChild(el('small', '', Tr('Verder doen')));
      h.appendChild(el('strong', '', (vak(p[0]) || {}).naam + ' – ' + (S.laatsteTitel || Tr('verder'))));
      root.appendChild(h);
    }

    root.appendChild(muntenKaart());
    var tehe = teHerhalen().length;
    if (tehe) {
      var hk = knop('herhaling', '', function () { location.hash = '#/herhaling'; });
      hk.appendChild(el('strong', '', Tr('🔁 Herhaling van vandaag')));
      hk.appendChild(el('span', '', Tr(Math.min(tehe, HERHALING_MAX) === 1 ? '{n} vraag om te herhalen' : '{n} vragen om te herhalen', { n: Math.min(tehe, HERHALING_MAX) })));
      root.appendChild(hk);
    }
    var nl = S.eigen.length, dichtst = null;
    S.eigen.forEach(function (e) { if (e.toets) { var n = dagNr(e.toets) - dagNr(vandaag()); if (n >= 0 && (dichtst === null || n < dichtst)) dichtst = n; } });
    var mk = knop('mijnkaart', '', function () { location.hash = '#/mijn'; });
    mk.appendChild(el('strong', '', Tr('📝 Mijn lessen en toetsen')));
    mk.appendChild(el('span', '', nl ? Tr(nl === 1 ? '{n} eigen les' : '{n} eigen lessen', { n: nl }) + (dichtst !== null ? ' · ' + Tr(dichtst === 1 ? 'volgende toets over {n} dag' : 'volgende toets over {n} dagen', { n: dichtst }) : '') : Tr('Maak oefeningen van je eigen les of toets')));
    root.appendChild(mk);
    var kk = klas();
    root.appendChild(knop('klaschip', '📚 ' + (kk ? Tr(kk.naam) : Tr('Kies je klas')) + ' · ' + Tr('wijzigen'), function () { location.hash = '#/profiel'; }));
    if (kk && kk.reeks === 'B') root.appendChild(el('p', 'uitlegje', Tr('B-stroom: kortere uitleg en makkelijkere vragen.')));

    root.appendChild(el('h2', '', Tr('Vakken')));
    var grid = el('div', 'grid');
    var lijstV = vakkenKlas();
    if (!lijstV.length) root.appendChild(el('p', 'sub', Tr('Voor deze klas worden de vakken nog klaargemaakt.')));
    lijstV.forEach(function (v) {
      var t = el(v.binnenkort ? 'div' : 'button', 'tile v-' + v.id + ' ' + (v.binnenkort ? 'off' : 'on'));
      t.appendChild(el('span', 'ico', v.icoon));
      t.appendChild(el('b', '', v.naam));
      t.appendChild(el('span', 's', v.uitleg));
      if (v.binnenkort) t.appendChild(el('span', 'badge', Tr('Binnenkort')));
      else {
        t.addEventListener('click', function () { location.hash = '#/' + v.id; });
        var holder = el('div'); t.appendChild(holder);
        laad(v.id).then(function (d) {
          if (!d) { holder.appendChild(el('span', 'badge', Tr('Nog niet klaar'))); return; }
          var pr = voortgang(d, kk && kk.jaar);
          holder.appendChild(bar(pr.totaal ? 100 * pr.klaar / pr.totaal : 0));
          holder.appendChild(el('span', 's', Tr('{a} / {b} lessen', { a: pr.klaar, b: pr.totaal })));
        });
      }
      grid.appendChild(t);
    });
    root.appendChild(grid);
  }

  function vakScherm(id) {
    leeg(id);
    var v = vak(id);
    root.appendChild(terug('#/', Tr('Alle vakken')));
    var ban = el('div', 'banner'), bt = el('div');
    ban.appendChild(el('span', 'ico', v.icoon));
    bt.appendChild(el('h1', '', v.naam)); bt.appendChild(el('p', 'sub', v.uitleg + ' · ' + (klas() ? Tr(klas().naam) : '')));
    ban.appendChild(bt); root.appendChild(ban);
    var plek = el('div'); root.appendChild(plek);
    laad(id).then(function (d) {
      if (!d) { plek.appendChild(el('p', 'sub', Tr('De leerstof van dit vak is nog niet klaar.'))); return; }
      if (d.terugval) plek.appendChild(el('p', 'melding', Tr('De makkelijkere B-versie van dit vak komt eraan. Je ziet nu de A-versie.')));
      if (LANG !== 'nl') plek.appendChild(el('p', 'melding', Tr('De lessen zelf zijn in het Nederlands. De knoppen en uitleg van de app zijn vertaald.')));
      var zichtbaar = (d.leerjaren || []).filter(function (j) { return !klas() || j.jaar === klas().jaar; });
      if (!zichtbaar.length) plek.appendChild(el('p', 'sub', Tr('Voor jouw klas is er in dit vak nog geen leerstof.')));
      zichtbaar.forEach(function (j) {
        var pr = voortgang(d, j.jaar);
        plek.appendChild(el('h2', '', (klas() ? Tr(klas().naam) : j.jaar) + ' · ' + Tr('{a}/{b} lessen', { a: pr.klaar, b: pr.totaal })));
        var lijst = el('div', 'lijst');
        (j.themas || []).forEach(function (t) {
          var rij = el('button', 'rij');
          var kl = (t.lessen || []).filter(function (l) { return S.scores[sk(d, l.id)] != null; }).length;
          rij.appendChild(el('b', '', t.titel));
          rij.appendChild(el('span', 's', t.samenvatting || ''));
          rij.appendChild(el('span', 'badge', kl + '/' + (t.lessen || []).length));
          rij.addEventListener('click', function () { location.hash = '#/' + id + '/' + t.id; });
          lijst.appendChild(rij);
        });
        plek.appendChild(lijst);
      });
      var eigenHier = S.eigen.filter(function (e) { return e.vak === id; });
      if (eigenHier.length) {
        plek.appendChild(el('h2', '', Tr('Mijn lessen')));
        var el1 = el('div', 'lijst');
        eigenHier.forEach(function (e) {
          var r = el('button', 'rij'); r.appendChild(el('b', '', e.titel));
          r.appendChild(el('span', 'badge', Tr('{n} vragen', { n: e.les.oefeningen.length })));
          r.addEventListener('click', function () { location.hash = '#/mijn/' + e.id; });
          el1.appendChild(r);
        });
        plek.appendChild(el1);
      }
      if ((d.bronnen && d.bronnen.length) || d.dekking) {
        var b = el('details', 'bronnen'); b.appendChild(el('summary', '', Tr('Bronnen')));
        if (d.dekking) b.appendChild(el('p', '', d.dekking));
        (d.bronnen || []).forEach(function (x) {
          var li = el('p'); var a = el('a', '', x.titel); a.href = x.url; a.target = '_blank'; a.rel = 'noopener';
          li.appendChild(a); b.appendChild(li);
        });
        plek.appendChild(b);
      }
    });
  }

  function vindThema(d, tid) {
    for (var i = 0; i < (d.leerjaren || []).length; i++)
      for (var j = 0; j < (d.leerjaren[i].themas || []).length; j++)
        if (d.leerjaren[i].themas[j].id === tid) return d.leerjaren[i].themas[j];
  }

  function themaScherm(id, tid) {
    leeg(id);
    root.appendChild(terug('#/' + id, vak(id).naam));
    var plek = el('div'); root.appendChild(plek);
    laad(id).then(function (d) {
      var t = d && vindThema(d, tid);
      if (!t) { plek.appendChild(el('p', 'sub', Tr('Thema niet gevonden.'))); return; }
      plek.appendChild(el('h1', '', t.titel));
      plek.appendChild(el('p', 'sub', t.samenvatting || ''));
      plek.appendChild(el('h2', '', Tr('Lessen')));
      var lijst = el('div', 'lijst');
      (t.lessen || []).forEach(function (l) {
        var s = S.scores[sk(d, l.id)];
        var rij = el('button', 'rij');
        rij.appendChild(el('b', '', l.titel));
        rij.appendChild(el('span', 'badge' + (s != null ? ' ok' : ''), s != null ? '✓ ' + Math.round(s * 100) + '%' : Tr('Nieuw')));
        rij.addEventListener('click', function () { location.hash = '#/' + id + '/' + tid + '/' + l.id; });
        lijst.appendChild(rij);
      });
      plek.appendChild(lijst);
    });
  }

  function lesScherm(id, tid, lid) {
    leeg(id);
    root.appendChild(terug('#/' + id + '/' + tid, Tr('Thema')));
    var plek = el('div'); root.appendChild(plek);
    laad(id).then(function (d) {
      var t = d && vindThema(d, tid);
      var les = t && (t.lessen || []).filter(function (l) { return l.id === lid; })[0];
      if (!les) { plek.appendChild(el('p', 'sub', Tr('Les niet gevonden.'))); return; }
      S.laatsteLes = id + '/' + tid + '/' + lid; S.laatsteTitel = les.titel; S.laatsteKlas = S.klas; save();

      plek.appendChild(el('h1', '', les.titel));
      String(les.uitleg || '').split(/\n\s*\n/).forEach(function (a) { if (a.trim()) plek.appendChild(el('p', 'uitleg', a.trim())); });

      if (les.woorden && les.woorden.length) {
        plek.appendChild(el('h2', '', Tr('Woorden')));
        var w = el('div', 'woorden');
        les.woorden.forEach(function (x) {
          var r = el('div', 'woord');
          r.appendChild(el('b', '', x.doel)); r.appendChild(el('span', '', x.nl));
          if (x.voorbeeld) r.appendChild(el('i', '', x.voorbeeld));
          if (TAAL[id] && 'speechSynthesis' in window) {
            r.classList.add('met-spreek');
            var sp = knop('spreek', '🔊', function () { spreek(schoon(x.doel), TAAL[id]); });
            sp.setAttribute('aria-label', Tr('Uitspreken: {w}', { w: schoon(x.doel) }));
            r.appendChild(sp);
          }
          w.appendChild(r);
        });
        plek.appendChild(w);
        if (les.woorden.length >= 4) {
          plek.appendChild(el('h2', '', Tr('Spelletjes')));
          var sk2 = el('div', 'spelknoppen'), spel = el('div', 'spel');
          sk2.appendChild(knop('btn', Tr('🔗 Koppelspel'), function () { koppelspel(spel, les.woorden); }));
          if (TAAL[id]) sk2.appendChild(knop('btn', Tr('⌨️ Typ het woord'), function () { typSpel(spel, les.woorden); }));
          plek.appendChild(sk2); plek.appendChild(spel);
        }
      }
      if (les.oefeningen && les.oefeningen.length) {
        plek.appendChild(el('h2', '', Tr('Oefenen')));
        var q = el('div'); plek.appendChild(q);
        lesQuiz(q, d, les);
      }
    });
  }

  // ---------- vragenronde (gedeeld door les en herhaling) ----------
  function schud(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // lijst: [{ o: oefening, label }]; opt.onAntwoord(item, goed), opt.onKlaar(host, juist, n, snel, opnieuw)
  function ronde(host, lijst, opt) {
    var i = 0, juist = 0, n = lijst.length, t0 = 0, snel = true;
    function toon() {
      host.textContent = '';
      if (i >= n) { opt.onKlaar(host, juist, n, snel, function () { i = 0; juist = 0; snel = true; toon(); }); return; }
      var item = lijst[i], o = item.o;
      host.appendChild(el('p', 'teller', Tr('Vraag {i} van {n}', { i: i + 1, n: n }) + (item.label ? ' · ' + Tr(item.label) : '')));
      host.appendChild(el('p', 'vraag', o.vraag));
      var vb = el('div', 'opties'), gedaan = false, knoppen = {};
      t0 = performance.now();
      // De volgorde wordt elke keer geschud, zodat je geen vaste plek van het juiste antwoord kan leren.
      schud(o.opties.map(function (t, idx) { return idx; })).forEach(function (idx) {
        var b = knop('optie', o.opties[idx], function () {
          if (gedaan) return; gedaan = true;
          if (performance.now() - t0 >= 2000) snel = false;
          var goed = idx === o.antwoord; if (goed) juist++;
          b.classList.add(goed ? 'goed' : 'fout');
          if (!goed) knoppen[o.antwoord].classList.add('goed');
          if (opt.onAntwoord) opt.onAntwoord(item, goed);
          host.appendChild(el('p', 'feedback', (goed ? Tr('Juist!') : Tr('Niet juist.')) + ' ' + (o.uitleg || '')));
          host.appendChild(knop('btn', i + 1 < n ? Tr('Volgende') : Tr('Resultaat'), function () { i++; toon(); }));
        });
        knoppen[idx] = b; vb.appendChild(b);
      });
      host.appendChild(vb);
    }
    toon();
  }

  function lesQuiz(host, d, les) {
    var lijst = les.oefeningen.map(function (o, i) { return { o: o, i: i }; });
    ronde(host, lijst, {
      onAntwoord: function (it, goed) { if (!goed) noteerFout(d, les, it.i); },
      onKlaar: function (h, juist, n, snel, opnieuw) {
        var score = juist / n, k = sk(d, les.id);
        if (S.scores[k] == null || score > S.scores[k]) S.scores[k] = score;
        var br = beloon(k, score, snel);
        h.appendChild(el('p', 'uitleg', Tr(score === 1 ? 'Klaar! {j} van {n} juist – perfect! 🎉' : 'Klaar! {j} van {n} juist.', { j: juist, n: n })));
        if (br.munten > 0) h.appendChild(el('div', 'beloning', Tr('🪙 +{n} munten voor EAWG Mobile!', { n: br.munten })));
        else h.appendChild(el('p', 'sub', {
          laag: Tr('Haal minstens 2 van 5 juist om munten en een dag op je reeks te krijgen.'),
          snel: Tr('Neem even de tijd om de vragen te lezen, dan krijg je munten.'),
          herhaling: Tr('Oefenen, geen extra munten meer voor deze les. Goed bezig!'),
          cap: Tr('Vandaag zijn je lesmunten op. Leren mag altijd, morgen weer munten!')
        }[br.reden] || ''));
        h.appendChild(codeKaart());
        if (br.mijl > 0) h.appendChild(el('div', 'beloning', Tr('🔥 {r} dagen op rij! Bonus +{m} munten', { r: br.reeks, m: br.mijl })));
        else if (br.msg) h.appendChild(el('p', 'sub', br.msg));
        if (juist < n) h.appendChild(el('p', 'sub', Tr('De vragen die fout waren, komen morgen terug bij "Herhaling".')));
        h.appendChild(knop('btn', Tr('Opnieuw proberen'), opnieuw));
      }
    });
  }

  // ---------- gespreide herhaling: foute vragen komen na 1, 3 en 7 dagen terug ----------
  var INTERVALLEN = [1, 3, 7], HERHALING_MAX = 8;
  function noteerFout(d, les, i) {
    S.fout[d.niveau + '|' + d.vak + '|' + les.id + '|' + i] = { v: d.vak, n: d.niveau, l: les.id, i: i, stap: 0, due: dagNr(vandaag()) + INTERVALLEN[0] };
    save();
  }
  function teHerhalen() {
    var nu = dagNr(vandaag());
    return Object.keys(S.fout).filter(function (k) { return S.fout[k].due <= nu; });
  }

  function herhalingScherm() {
    leeg();
    root.appendChild(terug('#/', Tr('Start')));
    root.appendChild(el('h1', '', Tr('🔁 Herhaling van vandaag')));
    root.appendChild(el('p', 'sub', Tr('Vragen die je eerder fout had. Zo blijft het langer hangen.')));
    var plek = el('div'); root.appendChild(plek);
    var keys = teHerhalen().slice(0, HERHALING_MAX);
    if (!keys.length) { plek.appendChild(el('p', 'uitleg', Tr('Niets te herhalen vandaag. Goed bezig! 🎉'))); return; }
    Promise.all(keys.map(function (k) {
      var f = S.fout[k];
      if (f.n === 'E') {
        var e = S.eigen.filter(function (x) { return x.les.id === f.l; })[0];
        if (!e || !e.les.oefeningen[f.i]) { delete S.fout[k]; return Promise.resolve(null); }
        return Promise.resolve({ k: k, f: f, o: e.les.oefeningen[f.i], label: Tr('Mijn les') });
      }
      return laad(f.v, f.n).then(function (d) {
        var les = d && alleLessen(d).filter(function (l) { return l.id === f.l; })[0];
        if (!les || !les.oefeningen[f.i]) { delete S.fout[k]; return null; }
        return { k: k, f: f, o: les.oefeningen[f.i], label: vak(f.v).naam };
      });
    })).then(function (items) {
      items = items.filter(Boolean); save();
      if (!items.length) { plek.appendChild(el('p', 'uitleg', Tr('Niets te herhalen vandaag.'))); return; }
      ronde(plek, schud(items), {
        onAntwoord: function (it, goed) {
          var nu = dagNr(vandaag());
          if (goed) { it.f.stap++; if (it.f.stap >= INTERVALLEN.length) delete S.fout[it.k]; else it.f.due = nu + INTERVALLEN[it.f.stap]; }
          else { it.f.stap = 0; it.f.due = nu + INTERVALLEN[0]; }
          save();
        },
        onKlaar: function (h, juist, n) {
          h.appendChild(el('p', 'uitleg', Tr('Klaar! {j} van {n} juist. Wat fout was, komt morgen terug.', { j: juist, n: n })));
          h.appendChild(knop('btn', Tr('Terug naar start'), function () { location.hash = '#/'; }));
        }
      });
    });
  }

  // ---------- woordspelletjes (uit de "woorden" van een les) ----------
  var TAAL = { engels: 'en-GB', frans: 'fr-FR' };
  function schoon(t) { return String(t).replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim(); }
  function spreek(tekst, taal) {
    try { var u = new SpeechSynthesisUtterance(tekst); u.lang = taal; u.rate = 0.85; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
  }

  // Tik links een woord, dan rechts de juiste betekenis. Geen slepen: dat is op een gsm foutgevoelig.
  function koppelspel(host, woorden) {
    var paren = schud(woorden).slice(0, 6), fouten = 0, gevonden = 0, gekozen = null;
    host.textContent = '';
    host.appendChild(el('p', 'teller', Tr('Tik links een woord, dan rechts het juiste.')));
    var rij = el('div', 'koppel'), L = el('div', 'kol'), R = el('div', 'kol');
    var idx = paren.map(function (_, i) { return i; });
    schud(idx).forEach(function (i) {
      var b = knop('kop', paren[i].nl, function () {
        if (b.disabled) return;
        if (gekozen) gekozen.btn.classList.remove('gekozen');
        gekozen = { i: i, btn: b }; b.classList.add('gekozen');
      });
      L.appendChild(b);
    });
    schud(idx).forEach(function (i) {
      var b = knop('kop', schoon(paren[i].doel), function () {
        if (b.disabled || !gekozen) return;
        if (schoon(paren[gekozen.i].doel) === schoon(paren[i].doel)) {
          gekozen.btn.classList.remove('gekozen'); gekozen.btn.classList.add('gevonden'); gekozen.btn.disabled = true;
          b.classList.add('gevonden'); b.disabled = true; gekozen = null; gevonden++;
          if (gevonden === paren.length) {
            host.appendChild(el('p', 'feedback', Tr('Alles gevonden!') + ' ' + (fouten ? Tr(fouten > 1 ? '{n} foutjes.' : '{n} foutje.', { n: fouten }) : Tr('Zonder fout! 🎉'))));
            host.appendChild(knop('btn', Tr('Nog eens'), function () { koppelspel(host, woorden); }));
          }
        } else { fouten++; b.classList.add('fout'); setTimeout(function () { b.classList.remove('fout'); }, 450); }
      });
      R.appendChild(b);
    });
    rij.appendChild(L); rij.appendChild(R); host.appendChild(rij);
  }

  // Typen is sterker dan kiezen: je moet het echt uit je geheugen halen.
  function norm(t) { return schoon(t).toLowerCase().replace(/’/g, "'").normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+([?!:;,.])/g, '$1').replace(/\s+/g, ' '); }
  function aanvaard(doel) {
    var lijst = [];
    schoon(doel).split('/').forEach(function (a) {
      a = a.trim().toLowerCase(); lijst.push(a);
      lijst.push(a.replace(/^(le |la |l'|les |un |une |des |du |de la |a |an |the |to )/, ''));
    });
    return lijst;
  }
  function typSpel(host, woorden) {
    var kies = schud(woorden.filter(function (w) { return schoon(w.doel).length <= 40; })).slice(0, 5), i = 0, juist = 0;
    function toon() {
      host.textContent = '';
      if (i >= kies.length) {
        host.appendChild(el('p', 'feedback', Tr('Klaar! {j} van {n} juist.', { j: juist, n: kies.length })));
        host.appendChild(knop('btn', Tr('Nog eens'), function () { typSpel(host, woorden); }));
        return;
      }
      var w = kies[i], ok = aanvaard(w.doel), klaar = false;
      host.appendChild(el('p', 'teller', Tr('Woord {i} van {n}', { i: i + 1, n: kies.length })));
      host.appendChild(el('p', 'vraag', Tr('Hoe zeg je: {w}?', { w: String(w.nl).replace(/[?!.\s]+$/, '') })));
      var inp = el('input', 'invul');
      inp.type = 'text'; inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocomplete', 'off');
      inp.setAttribute('autocorrect', 'off'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('aria-label', Tr('Jouw antwoord'));
      host.appendChild(inp);
      var fb = el('p', 'feedback'), acties = el('div', 'spelknoppen');
      function controleer() {
        if (klaar || !inp.value.trim()) return; klaar = true;
        var invoer = inp.value.trim().toLowerCase(), los = norm(inp.value);
        var goed = ok.some(function (a) { return norm(a) === los; }), exact = ok.some(function (a) { return a === invoer; });
        if (goed) juist++;
        fb.textContent = goed ? (exact ? Tr('Juist!') + ' ' : Tr('Juist, let op de accenten: {w}.', { w: schoon(w.doel) }) + ' ') : Tr('Niet juist. Het juiste woord is: {w}.', { w: schoon(w.doel) });
        fb.className = 'feedback ' + (goed ? 'goed-tekst' : 'fout-tekst');
        acties.textContent = ''; acties.appendChild(knop('btn', i + 1 < kies.length ? Tr('Volgende') : Tr('Resultaat'), function () { i++; toon(); }));
      }
      acties.appendChild(knop('btn', Tr('Controleer'), controleer));
      acties.appendChild(knop('btn zacht', Tr('Hint'), function () { var z = schoon(w.doel); fb.textContent = Tr('Begint met "{a}" en heeft {n} tekens.', { a: z.charAt(0), n: z.length }); }));
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') controleer(); });
      host.appendChild(acties); host.appendChild(fb);
    }
    toon();
  }

  // ---------- profiel en klaskeuze ----------
  var AVATARS = ['🦊', '🐼', '🐯', '🦁', '🐸', '🐵', '🦄', '🐙', '🦉', '🐧', '🚀', '⚽'];

  function klasKiezer(host, gekozen, bijKeuze) {
    host.textContent = '';
    var groepen = [];
    KL.klassen.forEach(function (k) { if (groepen.indexOf(k.groep) < 0) groepen.push(k.groep); });
    groepen.forEach(function (g) {
      host.appendChild(el('p', 'groep', Tr(g)));
      var rij = el('div', 'chiprij');
      KL.klassen.filter(function (k) { return k.groep === g; }).forEach(function (k) {
        var b = knop('keuze' + (k.id === gekozen ? ' aan' : ''), Tr(k.naam), function () { bijKeuze(k.id); klasKiezer(host, k.id, bijKeuze); });
        b.setAttribute('aria-pressed', k.id === gekozen ? 'true' : 'false');
        rij.appendChild(b);
      });
      host.appendChild(rij);
    });
  }

  function nieuwProfiel() {
    leeg();
    var eerste = !PR.lijst.length;
    if (!eerste) root.appendChild(PR.actief ? terug('#/profiel', Tr('Profiel')) : terug('#/', Tr('Inloggen')));
    root.appendChild(el('h1', '', eerste ? Tr('Welkom bij Leerliga! 👋') : Tr('Nieuw profiel')));
    root.appendChild(el('p', 'sub', Tr('Maak je profiel. Gebruik een bijnaam en geen echte naam. Alles blijft op dit toestel. Alleen voor de muntcode van EAWG Mobile gaat een willekeurig nummer (geen naam) naar de server van het spel.')));
    var naam = el('input', 'invul'); naam.type = 'text'; naam.maxLength = 16; naam.id = 'bijnaam';
    naam.setAttribute('autocomplete', 'off'); naam.setAttribute('aria-label', Tr('Bijnaam')); naam.placeholder = Tr('Bijnaam');
    root.appendChild(naam);
    root.appendChild(el('p', 'groep', Tr('Pincode (4 cijfers, mag je overslaan)')));
    var pin = el('input', 'invul'); pin.type = 'password'; pin.maxLength = 4; pin.id = 'nieuwepin';
    pin.setAttribute('inputmode', 'numeric'); pin.setAttribute('autocomplete', 'off'); pin.setAttribute('aria-label', Tr('Pincode'));
    root.appendChild(pin);
    root.appendChild(el('p', 'groep', Tr('Kies een figuurtje')));
    var av = AVATARS[0], avRij = el('div', 'chiprij');
    function tekenAv() {
      avRij.textContent = '';
      AVATARS.forEach(function (a) {
        var b = knop('avatar' + (a === av ? ' aan' : ''), a, function () { av = a; tekenAv(); });
        b.setAttribute('aria-label', Tr('Figuurtje {a}', { a: a })); b.setAttribute('aria-pressed', a === av ? 'true' : 'false');
        avRij.appendChild(b);
      });
    }
    tekenAv(); root.appendChild(avRij);
    root.appendChild(el('h2', '', Tr('In welke klas zit je?')));
    var kz = el('div'), gekozen = null, start = knop('btn', Tr('Starten'), function () {
      var n = naam.value.trim(); if (!n || !gekozen || !pinOk()) return;
      var id = 'p' + Date.now().toString(36);
      var pf0 = { id: id, naam: n, avatar: av }; if (pin.value) pf0.pin = pinHash(pin.value); PR.lijst.push(pf0);
      if (eerste) { var oud = lees(LEGACY); if (oud) schrijf('leren-p-' + id, oud); }   // voortgang van vroeger meenemen
      activeer(id); S.klas = gekozen; save(); location.hash = '#/'; route();
    });
    start.disabled = true;
    function pinOk() { return !pin.value || /^\d{4}$/.test(pin.value); }
    var pinHint = el('p', 'sub'); pin.parentNode.insertBefore(pinHint, pin.nextSibling);
    function check() { start.disabled = !(naam.value.trim() && gekozen && pinOk()); pinHint.textContent = pinOk() ? '' : Tr('Een pincode heeft precies 4 cijfers.'); }
    naam.addEventListener('input', check); pin.addEventListener('input', check);
    klasKiezer(kz, null, function (id) { gekozen = id; check(); });
    root.appendChild(kz); root.appendChild(start);
  }

  function profielScherm() {
    leeg();
    root.appendChild(terug('#/', Tr('Start')));
    var pf = PR.lijst.filter(function (x) { return x.id === PR.actief; })[0];
    root.appendChild(el('h1', '', pf.avatar + ' ' + pf.naam));
    root.appendChild(el('h2', '', Tr('Mijn klas')));
    var kz = el('div'); root.appendChild(kz);
    klasKiezer(kz, S.klas, function (id) { S.klas = id; S.laatsteLes = null; save(); });

    if (PR.lijst.length > 1) {
      root.appendChild(el('h2', '', Tr('Wisselen van profiel')));
      var rij = el('div', 'chiprij');
      PR.lijst.forEach(function (x) {
        if (x.id === PR.actief) return;
        rij.appendChild(knop('keuze', x.avatar + ' ' + x.naam + (x.pin ? ' 🔒' : ''), function () { if (x.pin) pinScherm(x, profielScherm); else doeLogin(x); }));
      });
      root.appendChild(rij);
    }
    root.appendChild(knop('btn zacht', Tr('＋ Nieuw profiel'), function () { location.hash = '#/nieuw'; }));

    root.appendChild(el('h2', '', Tr('Bewaren en overzetten')));
    root.appendChild(el('p', 'sub', Tr('Er is geen account op een server. Wil je je voortgang naar een ander toestel meenemen? Kopieer dan de code en plak ze daar bij "Herstellen".')));
    var vak1 = el('textarea', 'code'); vak1.id = 'backup'; vak1.readOnly = true; vak1.hidden = true; vak1.setAttribute('aria-label', Tr('Back-upcode'));
    root.appendChild(knop('btn zacht', Tr('Toon mijn code'), function () {
      try { vak1.value = btoa(unescape(encodeURIComponent(JSON.stringify({ p: pf, s: S })))); } catch (e) { vak1.value = Tr('Code maken lukt niet op dit toestel.'); }
      vak1.hidden = false; vak1.focus(); vak1.select();
    }));
    root.appendChild(vak1);
    var inv = el('textarea', 'code'); inv.id = 'herstel'; inv.placeholder = Tr('Plak hier een code'); inv.setAttribute('aria-label', Tr('Code herstellen'));
    var melding = el('p', 'sub');
    root.appendChild(inv);
    root.appendChild(knop('btn zacht', Tr('Herstellen'), function () {
      try {
        var o = JSON.parse(decodeURIComponent(escape(atob(inv.value.trim()))));
        if (!o || !o.p || !o.s) throw 0;
        var id = 'p' + Date.now().toString(36);
        PR.lijst.push({ id: id, naam: String(o.p.naam || Tr('Hersteld')).slice(0, 16), avatar: o.p.avatar || '🙂' });
        schrijf('leren-p-' + id, o.s); activeer(id); location.hash = '#/'; route();
      } catch (e) { melding.textContent = Tr('Die code werkt niet. Controleer of je ze helemaal gekopieerd hebt.'); }
    }));
    root.appendChild(melding);

    root.appendChild(el('h2', '', Tr('Profiel verwijderen')));
    var wis = el('div');
    function toonWis(stap) {
      wis.textContent = '';
      if (!stap) { wis.appendChild(knop('btn zacht', Tr('Verwijder dit profiel'), function () { toonWis(1); })); return; }
      wis.appendChild(el('p', 'sub', Tr('Zeker? Alle voortgang van dit profiel verdwijnt van dit toestel.')));
      wis.appendChild(knop('btn gevaar', Tr('Ja, verwijderen'), function () {
        Opslag.wis('leren-p-' + PR.actief);
        PR.lijst = PR.lijst.filter(function (x) { return x.id !== PR.actief; });
        PR.actief = null; savePR();
        S = {}; vulS();
        location.hash = '#/'; route();
      }));
      wis.appendChild(knop('btn zacht', Tr('Annuleren'), function () { toonWis(0); }));
    }
    toonWis(0); root.appendChild(wis);
  }

  // ---------- eigen lessen en toetsvoorbereiding ----------
  // Foto van je les? Kopieer de tekst uit de foto (iPhone: Live Text, Android: Google Lens) en plak ze hier.
  // De oefeningen worden op je toestel gemaakt: er wordt niets verstuurd. Voor de beste kwaliteit kan Claude ze maken; plak dan de code.
  var STOP = ' zoals daarom omdat waarbij tussen tijdens hebben werden worden kunnen andere meestal altijd vooral sommige verschillende doordat wanneer bijvoorbeeld natuurlijk gebruikt gebruiken gebeurt gebeurde '.split(' ');
  function woordenVan(z) { return z.split(/\s+/).map(function (w) { return w.replace(/^[^A-Za-zÀ-ÿ0-9]+|[^A-Za-zÀ-ÿ0-9]+$/g, ''); }).filter(Boolean); }
  function kiesDoel(woorden) {
    var i, w;
    for (i = 0; i < woorden.length; i++) if (/^\d[\d.,]*$/.test(woorden[i])) return { w: woorden[i], k: 'getal' };
    for (i = 1; i < woorden.length; i++) { w = woorden[i]; if (/^[A-ZÀ-Þ][a-zà-ÿ]{3,}$/.test(w)) return { w: w, k: 'naam' }; }
    var best = null;
    woorden.forEach(function (x) { if (x.length >= 7 && STOP.indexOf(x.toLowerCase()) < 0 && (!best || x.length > best.length)) best = x; });
    return best ? { w: best, k: 'woord' } : null;
  }
  function maakLes(titel, tekst) {
    tekst = tekst.replace(/\r/g, '').slice(0, 20000);
    var regels = tekst.split('\n').map(function (r) { return r.trim(); }).filter(Boolean), woorden = [], rest = [], kopjes = [];
    regels.forEach(function (r) {
      var m = r.match(/^(.{2,40}?)\s*(?::|=|\s-\s|\s–\s)\s*(.{3,160})$/);
      if (m && m[1].split(/\s+/).length <= 5) woorden.push({ nl: m[1].trim(), doel: m[2].trim(), voorbeeld: '' });
      else if (r.split(/\s+/).length <= 4 && !/[.!?:]$/.test(r)) kopjes.push(r);   // een kopje, geen zin
      else rest.push(r);
    });
    var zinnen = rest.join(' ').replace(/([.!?])\s+/g, '$1|').split('|').map(function (z) { return z.trim(); })
      .filter(function (z) { var n = z.split(/\s+/).length; return n >= 6 && n <= 30; });
    var pool = { getal: [], naam: [], woord: [] }, doelen = zinnen.map(function (z) { var d = kiesDoel(woordenVan(z)); if (d) pool[d.k].push(d.w); return d; });
    var vragen = [];
    function mix(juist, fout) {
      var opties = schud([juist].concat(fout)); return { opties: opties, antwoord: opties.indexOf(juist) };
    }
    zinnen.forEach(function (z, i) {
      var d = doelen[i]; if (!d) return;
      var andere = pool[d.k].filter(function (x) { return x !== d.w; }).filter(function (x, j, a) { return a.indexOf(x) === j; }), fout;
      if (d.k === 'getal') {
        var n = parseFloat(d.w.replace(/\./g, '').replace(',', '.'));
        var kand = [n + 1, n - 1, n + 10, n - 10, n * 2].filter(function (x) { return x !== n && x > 0; }).map(function (x) { return String(x).replace('.', ','); });
        fout = andere.slice(0, 2); for (var k = 0; fout.length < 2 && k < kand.length; k++) if (fout.indexOf(kand[k]) < 0) fout.push(kand[k]);
      } else fout = schud(andere).slice(0, 2);
      if (fout.length < 2) return;
      var m = mix(d.w, fout);
      vragen.push({ vraag: Tr('Vul aan:') + ' ' + z.replace(d.w, '_____'), opties: m.opties, antwoord: m.antwoord, uitleg: Tr('Zo staat het in je les:') + ' ' + z });
    });
    if (woorden.length >= 3) woorden.forEach(function (w, i) {
      var ander = schud(woorden.filter(function (x, j) { return j !== i; })).slice(0, 2), m;
      if (i % 2 === 0) { m = mix(w.doel, ander.map(function (x) { return x.doel; })); vragen.push({ vraag: Tr('Wat betekent "{w}"?', { w: w.nl }), opties: m.opties, antwoord: m.antwoord, uitleg: w.nl + ': ' + w.doel }); }
      else { m = mix(w.nl, ander.map(function (x) { return x.nl; })); vragen.push({ vraag: Tr('Welk begrip hoort bij: "{w}"?', { w: w.doel }), opties: m.opties, antwoord: m.antwoord, uitleg: w.nl + ': ' + w.doel }); }
    });
    vragen = schud(vragen).slice(0, 15);
    return { id: 'e' + Date.now().toString(36), titel: titel, uitleg: kopjes.concat(rest).join('\n\n').slice(0, 6000), woorden: woorden.slice(0, 40), oefeningen: vragen };
  }
  function schoonLes(o) {   // controleert een geplakte code of JSON
    function t(x, n) { return String(x == null ? '' : x).slice(0, n); }
    var oef = (o.oefeningen || o.o || []).slice(0, 60).map(function (q) {
      var opt = (q.opties || []).slice(0, 5).map(function (x) { return t(x, 200); });
      if (opt.length < 2 || typeof q.antwoord !== 'number' || q.antwoord < 0 || q.antwoord >= opt.length) return null;
      return { vraag: t(q.vraag, 400), opties: opt, antwoord: q.antwoord, uitleg: t(q.uitleg, 300) };
    }).filter(Boolean);
    if (oef.length < 1) return null;
    return { titel: t(o.titel || o.t || 'Mijn les', 60), vak: t(o.vak || '', 30), toets: t(o.toets || '', 12), les: {
      id: 'e' + Date.now().toString(36), titel: t(o.titel || o.t || 'Mijn les', 60), uitleg: t(o.uitleg || o.u, 8000),
      woorden: (o.woorden || o.w || []).slice(0, 60).map(function (w) { return { nl: t(w.nl, 80), doel: t(w.doel, 200), voorbeeld: t(w.voorbeeld, 200) }; }), oefeningen: oef } };
  }
  function eigenVoegToe(titel, vakId, toets, les) {
    if (S.eigen.length >= 30) return false;
    les.titel = titel; S.eigen.push({ id: les.id, titel: titel, vak: vakId, toets: toets, les: les }); save(); return true;
  }
  function dagenTot(toets) { return toets ? dagNr(toets) - dagNr(vandaag()) : null; }
  function toetsTekst(toets) {
    var n = dagenTot(toets); if (n === null) return '';
    return n < 0 ? Tr('toets voorbij') : n === 0 ? Tr('toets vandaag') : Tr(n === 1 ? 'toets over {n} dag' : 'toets over {n} dagen', { n: n });
  }

  // ---------- foto's van je cursus ----------
  // De foto wordt op je toestel gelezen met Tesseract (gratis, open source, uit de map ocr/). Er wordt niets verstuurd.
  var OCR_TAAL = { nederlands: 'nld', engels: 'eng', frans: 'fra' };
  function taalVanVak(v) { return v === 'engels' ? 'eng' : v === 'frans' ? 'fra' : 'nld'; }
  function laadScript(src) {
    return new Promise(function (ok, nok) {
      var sc = document.createElement('script'); sc.src = src; sc.onload = ok; sc.onerror = function () { nok(new Error('script')); };
      document.head.appendChild(sc);
    });
  }
  var ocrWorkers = {}, ocrVoortgang = null;
  function ocrWorker(taal) {
    if (ocrWorkers[taal]) return ocrWorkers[taal];
    var p = (window.Tesseract ? Promise.resolve() : laadScript('ocr/tesseract.min.js')).then(function () {
      return Tesseract.createWorker(taal, 1, {
        workerPath: 'ocr/worker.min.js', corePath: 'ocr', langPath: 'ocr/lang',
        logger: function (m) { if (ocrVoortgang) ocrVoortgang(m); }
      });
    });
    ocrWorkers[taal] = p; p.catch(function () { delete ocrWorkers[taal]; });
    return p;
  }
  // Foto verkleinen en leesbaarder maken (grijs, meer contrast); een kleine versie bewaren we bij de les.
  function bereidFotoVoor(file) {
    return new Promise(function (ok, nok) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        try {
          function maak(max, filter) {
            var f = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
            c.width = Math.round(img.naturalWidth * f); c.height = Math.round(img.naturalHeight * f);
            var x = c.getContext('2d'); if (filter) { try { x.filter = filter; } catch (e) {} }
            x.drawImage(img, 0, 0, c.width, c.height); return c;
          }
          var groot = maak(2000, 'grayscale(1) contrast(1.35)'), klein = maak(1100, '');
          URL.revokeObjectURL(url);
          ok({ canvas: groot, klein: klein.toDataURL('image/jpeg', 0.7) });
        } catch (e) { nok(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); nok(new Error('foto')); };
      img.src = url;
    });
  }
  function schoonOcr(t) {
    return String(t || '').replace(/-\n(?=[a-zà-ÿ])/g, '')
      .split('\n').map(function (r) { return r.split(/\s+/).filter(function (w) { return !/^[|°‚`~^_<>\\\/«»]+$/.test(w); }).join(' ').trim(); })
      .join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  // Foto's blijven in de browser (IndexedDB), niet in de gewone opslag, want die is te klein.
  function fotoDb() {
    return new Promise(function (ok, nok) {
      try {
        var r = indexedDB.open('leren-fotos', 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('f'); };
        r.onsuccess = function () { ok(r.result); }; r.onerror = function () { nok(r.error); };
      } catch (e) { nok(e); }
    });
  }
  function fotoDoe(modus, sleutel, waarde) {
    return fotoDb().then(function (db) {
      return new Promise(function (ok, nok) {
        var tx = db.transaction('f', modus === 'lees' ? 'readonly' : 'readwrite'), st = tx.objectStore('f');
        var rq = modus === 'lees' ? st.get(sleutel) : modus === 'wis' ? st.delete(sleutel) : st.put(waarde, sleutel);
        rq.onsuccess = function () { ok(rq.result || []); }; rq.onerror = function () { nok(rq.error); };
      });
    }).catch(function () { return []; });
  }

  function mijnLijst() {
    leeg();
    root.appendChild(terug('#/', Tr('Start')));
    root.appendChild(el('h1', '', Tr('📝 Mijn lessen en toetsen')));
    root.appendChild(el('p', 'sub', Tr('Oefen met je eigen les of een toets die eraan komt. Je lessen blijven op dit toestel.')));
    root.appendChild(knop('btn', Tr('＋ Nieuwe les'), function () { location.hash = '#/mijn/nieuw'; }));
    if (!S.eigen.length) { root.appendChild(el('p', 'uitleg', Tr('Nog geen eigen lessen. Maak er een van de tekst in je cursus.'))); return; }
    root.appendChild(el('h2', '', Tr('Mijn lessen')));
    var lijst = el('div', 'lijst');
    S.eigen.slice().sort(function (a, b) { return (dagenTot(a.toets) === null ? 1e9 : dagenTot(a.toets)) - (dagenTot(b.toets) === null ? 1e9 : dagenTot(b.toets)); }).forEach(function (e) {
      var r = el('button', 'rij'), v = e.vak && vak(e.vak);
      r.appendChild(el('b', '', (v ? v.icoon + ' ' : '') + e.titel));
      r.appendChild(el('span', 'badge', Tr('{n} vragen', { n: e.les.oefeningen.length })));
      var t = toetsTekst(e.toets); if (t) r.appendChild(el('span', 's', t));
      r.addEventListener('click', function () { location.hash = '#/mijn/' + e.id; });
      lijst.appendChild(r);
    });
    root.appendChild(lijst);
  }

  function nieuweLes() {
    leeg();
    root.appendChild(terug('#/mijn', Tr('Mijn lessen')));
    root.appendChild(el('h1', '', Tr('Nieuwe les')));
    var titel = el('input', 'invul'); titel.type = 'text'; titel.id = 'les-titel'; titel.maxLength = 60; titel.placeholder = Tr('Titel, bv. Toets geschiedenis: Romeinen'); titel.setAttribute('aria-label', Tr('Titel'));
    root.appendChild(titel);
    var vs = el('select', 'invul'); vs.id = 'les-vak'; vs.setAttribute('aria-label', Tr('Vak'));
    var o0 = el('option', '', Tr('Ander vak')); o0.value = ''; vs.appendChild(o0);
    vakkenKlas().forEach(function (v) { var o = el('option', '', v.naam); o.value = v.id; vs.appendChild(o); });
    root.appendChild(vs);
    root.appendChild(el('p', 'groep', Tr('Datum van de toets (mag leeg)')));
    var dt = el('input', 'invul'); dt.type = 'date'; dt.id = 'les-datum'; dt.setAttribute('aria-label', Tr('Datum toets')); root.appendChild(dt);
    var melding = el('p', 'sub'); melding.setAttribute('role', 'status');

    function bewaar(les) {
      var tt = titel.value.trim() || les.titel || Tr('Mijn les');
      if (!eigenVoegToe(tt, vs.value, dt.value ? dt.value.replace(/-0(\d)/g, '-$1') : '', les)) { melding.textContent = Tr('Je hebt al 30 eigen lessen. Verwijder eerst een les.'); return; }
      (fotos.length ? fotoDoe('schrijf', les.id, fotos) : Promise.resolve()).then(function () { location.hash = '#/mijn/' + les.id; });
    }

    // --- foto's ---
    var fotos = [], dF = el('details'); dF.open = true;
    dF.appendChild(el('summary', '', Tr('📷 Foto van je cursus')));
    dF.appendChild(el('p', 'sub', Tr('Neem een foto van de bladzijde (goed licht, recht boven de tekst). De app leest de tekst op je toestel en maakt er zelf oefeningen van; er wordt niets verstuurd. De tekst nakijken hoeft niet, maar lezen is nooit helemaal perfect, zeker bij handschrift.')));
    var tl = el('select', 'invul'); tl.id = 'foto-taal'; tl.setAttribute('aria-label', Tr('Taal van de tekst'));
    [['nld', 'Tekst in het Nederlands'], ['eng', 'Tekst in het Engels'], ['fra', 'Tekst in het Frans']].forEach(function (x) { var o = el('option', '', Tr(x[1])); o.value = x[0]; tl.appendChild(o); });
    vs.addEventListener('change', function () { tl.value = taalVanVak(vs.value); });
    dF.appendChild(tl);
    function fotoInput(capture, multiple) {
      var i = el('input'); i.type = 'file'; i.accept = 'image/*'; i.hidden = true; if (capture) i.setAttribute('capture', 'environment'); if (multiple) i.multiple = true;
      i.addEventListener('change', function () { verwerk(Array.prototype.slice.call(i.files)); i.value = ''; }); return i;
    }
    var inNemen = fotoInput(true, false), inKies = fotoInput(false, true); inNemen.id = 'foto-nemen'; inKies.id = 'foto-kiezen';
    var fk = el('div', 'spelknoppen');
    fk.appendChild(knop('btn', Tr('📸 Foto nemen'), function () { inNemen.click(); }));
    fk.appendChild(knop('btn zacht', Tr('🖼️ Foto kiezen'), function () { inKies.click(); }));
    dF.appendChild(fk); dF.appendChild(inNemen); dF.appendChild(inKies);
    var strook = el('div', 'fotostrook'), fstatus = el('p', 'sub'); fstatus.setAttribute('role', 'status');
    dF.appendChild(strook); dF.appendChild(fstatus);
    var bezigFoto = 0, fotoMaak = knop('btn', Tr('✨ Maak oefeningen van mijn foto\'s'), function () { maakUitTekst(); });
    function updateFotoKnop() { fotoMaak.disabled = bezigFoto > 0 || !ta.value.trim(); fotoMaak.hidden = !fotos.length; }
    fotoMaak.hidden = true; dF.appendChild(fotoMaak);
    function verwerk(bestanden) {
      var rij = Promise.resolve(); bezigFoto += bestanden.length; updateFotoKnop();
      bestanden.forEach(function (f, n) {
        rij = rij.then(function () {
          fstatus.textContent = Tr('Foto {i} van {n} voorbereiden…', { i: n + 1, n: bestanden.length });
          return bereidFotoVoor(f).then(function (fp) {
            fotos.push(fp.klein);
            var im = el('img', 'thumb'); im.src = fp.klein; im.alt = Tr('Foto {i}', { i: fotos.length }); strook.appendChild(im);
            fstatus.textContent = Tr('Tekst lezen uit foto {i}… (de eerste keer wordt het taalmodel geladen)', { i: n + 1 });
            ocrVoortgang = function (m) { if (m.status === 'recognizing text') fstatus.textContent = Tr('Tekst lezen uit foto {i}… {p}%', { i: n + 1, p: Math.round(m.progress * 100) }); };
            return ocrWorker(tl.value).then(function (w) { return w.recognize(fp.canvas); }).then(function (r) {
              var t = schoonOcr(r.data && r.data.text);
              if (!t) { fstatus.textContent = Tr('Er is geen tekst herkend in foto {i}. Probeer een scherpere foto met meer licht.', { i: n + 1 }); return; }
              ta.value = (ta.value.trim() ? ta.value.trim() + '\n\n' : '') + t;
              fstatus.textContent = Tr('Klaar! Tik op "Maak oefeningen". De tekst nakijken mag, maar hoeft niet.');
            }, function () {
              fstatus.textContent = Tr('Tekst lezen lukt hier niet (de foto is wel bewaard). Typ of plak de tekst zelf, of stuur de foto aan Claude voor de beste kwaliteit.');
            });
          }, function () { fstatus.textContent = Tr('Die foto kan ik niet openen. Probeer een andere foto.'); });
        }).then(function () { bezigFoto--; updateFotoKnop(); }, function () { bezigFoto--; updateFotoKnop(); });
      });
    }
    root.appendChild(dF);

    var d1 = el('details'); d1.appendChild(el('summary', '', Tr('✍️ Tekst bekijken of zelf plakken (mag, hoeft niet)')));
    d1.appendChild(el('p', 'sub', Tr('Foto van je cursus? Houd je vinger op de tekst in de foto en kies kopiëren (iPhone: Live Text, Android: Google Lens). Plak ze hier. Regels als "begrip: uitleg" worden woordkaartjes.')));
    var ta = el('textarea', 'code tekstveld'); ta.id = 'les-tekst'; ta.placeholder = Tr('Plak of typ hier de tekst van je les'); ta.setAttribute('aria-label', Tr('Tekst van je les'));
    d1.appendChild(ta);
    function maakUitTekst() {
      if (ta.value.trim().length < 80) { melding.textContent = fotos.length ? Tr('Er is te weinig tekst herkend op de foto. Neem een scherpere foto met meer licht, of typ of plak de tekst hieronder.') : Tr('Plak wat meer tekst (minstens een paar zinnen).'); return; }
      var les = maakLes(titel.value.trim(), ta.value);
      if (les.oefeningen.length < 3) { melding.textContent = Tr('Uit deze tekst kon ik te weinig oefeningen maken. Plak meer tekst, schrijf begrippen als "begrip: uitleg", of laat Claude de oefeningen maken en plak de code hieronder.'); return; }
      les.titel = titel.value.trim() || Tr('Mijn les');
      bewaar(les);
    }
    ta.addEventListener('input', updateFotoKnop);
    d1.appendChild(knop('btn', Tr('Maak oefeningen'), maakUitTekst));
    root.appendChild(d1);

    var d2 = el('details'); d2.appendChild(el('summary', '', Tr('🤖 Code van Claude plakken (beste kwaliteit)')));
    d2.appendChild(el('p', 'sub', Tr('Stuur Claude foto\'s van je cursus of toets. Claude maakt er een les met oefeningen van en geeft je een code. Plak die code hier.')));
    var tc = el('textarea', 'code'); tc.id = 'les-code'; tc.placeholder = Tr('Plak hier de code'); tc.setAttribute('aria-label', Tr('Code van Claude'));
    d2.appendChild(tc);
    d2.appendChild(knop('btn', Tr('Importeren'), function () {
      try {
        var raw = tc.value.trim(), json = raw.charAt(0) === '{' ? raw : decodeURIComponent(escape(atob(raw.replace(/^LES1:/, ''))));
        var o = schoonLes(JSON.parse(json)); if (!o) throw 0;
        if (!titel.value.trim()) titel.value = o.titel;
        if (!vs.value && o.vak && vs.querySelector('option[value="' + o.vak.replace(/[^a-z-]/g, '') + '"]')) vs.value = o.vak;
        if (!dt.value && o.toets) dt.value = '';
        bewaar(o.les);
      } catch (e) { melding.textContent = Tr('Die code werkt niet. Controleer of je ze helemaal gekopieerd hebt.'); }
    }));
    root.appendChild(d2); root.appendChild(melding);
  }

  function noteerFoutEigen(e, i) {
    S.fout['E|' + e.les.id + '|' + i] = { v: e.vak || '', n: 'E', l: e.les.id, i: i, stap: 0, due: dagNr(vandaag()) + INTERVALLEN[0] };
    save();
  }

  function eigenLesScherm(id) {
    var e = S.eigen.filter(function (x) { return x.id === id; })[0];
    leeg(e && e.vak || undefined);
    root.appendChild(terug('#/mijn', Tr('Mijn lessen')));
    if (!e) { root.appendChild(el('p', 'sub', Tr('Les niet gevonden.'))); return; }
    var les = e.les, v = e.vak && vak(e.vak);
    root.appendChild(el('h1', '', e.titel));
    var t = toetsTekst(e.toets); if (t) root.appendChild(el('p', 'melding', '📅 ' + t.charAt(0).toUpperCase() + t.slice(1)));
    var fotoPlek = el('div'); root.appendChild(fotoPlek);
    fotoDoe('lees', e.id).then(function (lijst) {
      if (!lijst.length) return;
      var dt = el('details'); dt.appendChild(el('summary', '', Tr("📷 Mijn foto's ({n})", { n: lijst.length })));
      lijst.forEach(function (u, i) {
        var im = el('img', 'foto'); im.src = u; im.alt = Tr('Foto {i} van mijn cursus', { i: i + 1 }); dt.appendChild(im);
      });
      fotoPlek.appendChild(dt);
    });
    if (les.uitleg) String(les.uitleg).split(/\n\s*\n/).forEach(function (a) { if (a.trim()) root.appendChild(el('p', 'uitleg', a.trim())); });
    if (les.woorden && les.woorden.length) {
      root.appendChild(el('h2', '', Tr('Begrippen')));
      var w = el('div', 'woorden');
      les.woorden.forEach(function (x) {
        var r = el('div', 'woord'); r.appendChild(el('b', '', x.nl)); r.appendChild(el('span', '', x.doel));
        if (x.voorbeeld) r.appendChild(el('i', '', x.voorbeeld)); w.appendChild(r);
      });
      root.appendChild(w);
      if (les.woorden.length >= 4) {
        root.appendChild(el('h2', '', Tr('Spelletjes')));
        var spel = el('div', 'spel'), sk2 = el('div', 'spelknoppen');
        sk2.appendChild(knop('btn', Tr('🔗 Koppelspel'), function () { koppelspel(spel, les.woorden); }));
        root.appendChild(sk2); root.appendChild(spel);
      }
    }
    root.appendChild(el('h2', '', Tr('Toets jezelf')));
    var q = el('div'); root.appendChild(q);
    ronde(q, schud(les.oefeningen.map(function (o) { return { o: o, i: les.oefeningen.indexOf(o) }; })), {
      onAntwoord: function (it, goed) { if (!goed) noteerFoutEigen(e, it.i); },
      onKlaar: function (h, juist, n, snel, opnieuw) {
        h.appendChild(el('p', 'uitleg', Tr(juist === n ? 'Klaar! {j} van {n} juist – perfect! 🎉' : 'Klaar! {j} van {n} juist.', { j: juist, n: n })));
        if (juist < n) h.appendChild(el('p', 'sub', Tr('De fouten komen terug bij "Herhaling", zodat je ze tegen de toets zeker kent.')));
        h.appendChild(el('p', 'sub', Tr('Eigen lessen geven geen munten. Wel de gewone lessen.')));
        h.appendChild(knop('btn', Tr('Opnieuw'), opnieuw));
      }
    });
    root.appendChild(el('h2', '', Tr('Delen en wissen')));
    var code = el('textarea', 'code'); code.readOnly = true; code.hidden = true; code.setAttribute('aria-label', Tr('Code van deze les'));
    root.appendChild(knop('btn zacht', Tr('Toon code van deze les'), function () {
      try { code.value = 'LES1:' + btoa(unescape(encodeURIComponent(JSON.stringify({ t: e.titel, vak: e.vak, u: les.uitleg, w: les.woorden, o: les.oefeningen })))); } catch (x) { code.value = Tr('Code maken lukt niet.'); }
      code.hidden = false; code.select();
    }));
    root.appendChild(code);
    var wis = el('div');
    function toonWis(stap) {
      wis.textContent = '';
      if (!stap) { wis.appendChild(knop('btn zacht', Tr('Verwijder deze les'), function () { toonWis(1); })); return; }
      wis.appendChild(el('p', 'sub', Tr('Zeker? Deze les en haar herhalingsvragen verdwijnen.')));
      wis.appendChild(knop('btn gevaar', Tr('Ja, verwijderen'), function () {
        S.eigen = S.eigen.filter(function (x) { return x.id !== e.id; });
        fotoDoe('wis', e.id);
        Object.keys(S.fout).forEach(function (k) { if (S.fout[k].n === 'E' && S.fout[k].l === e.id) delete S.fout[k]; });
        save(); location.hash = '#/mijn'; route();
      }));
      wis.appendChild(knop('btn zacht', Tr('Annuleren'), function () { toonWis(0); }));
    }
    toonWis(0); root.appendChild(wis);
  }

  // ---------- instellingen ----------
  var TALEN = [['nl', '🇧🇪 Nederlands'], ['fr', '🇫🇷 Français'], ['en', '🇬🇧 English']];
  function kiesTaal(code) {
    LANG = code; INST.taal = code; INST.taalGekozen = true; bewaarInst(); pasInstToe();
  }
  // Eerste scherm: iedereen moet eerst zijn taal kunnen kiezen, in de talen zelf.
  function taalScherm() {
    leeg();
    var lg = el('div', 'welkomlogo'); lg.appendChild(logoEl(96)); root.appendChild(lg);
    root.appendChild(el('h1', '', 'Taal · Langue · Language'));
    root.appendChild(el('p', 'sub', 'Kies je taal · Choisis ta langue · Choose your language'));
    var lijst = el('div', 'lijst');
    TALEN.forEach(function (x) {
      lijst.appendChild(knop('rij taalrij', x[1], function () { kiesTaal(x[0]); location.hash = '#/'; route(); }));
    });
    root.appendChild(lijst);
  }
  function instellingenScherm() {
    leeg();
    root.appendChild(terug('#/', Tr('Start')));
    root.appendChild(el('h1', '', '⚙️ ' + Tr('Instellingen')));
    root.appendChild(el('h2', '', Tr('Taal')));
    var rij = el('div', 'chiprij');
    TALEN.forEach(function (x) {
      var b = knop('keuze' + (x[0] === LANG ? ' aan' : ''), x[1], function () { kiesTaal(x[0]); instellingenScherm(); });
      b.setAttribute('aria-pressed', x[0] === LANG ? 'true' : 'false'); rij.appendChild(b);
    });
    root.appendChild(rij);
    root.appendChild(el('p', 'sub', Tr('De lessen zelf zijn in het Nederlands. De knoppen en uitleg van de app zijn vertaald.')));
    root.appendChild(el('h2', '', Tr('Letters')));
    var gr = knop('keuze' + (INST.groot ? ' aan' : ''), Tr('Grote letters'), function () { INST.groot = !INST.groot; bewaarInst(); pasInstToe(); instellingenScherm(); });
    gr.setAttribute('aria-pressed', INST.groot ? 'true' : 'false');
    root.appendChild(gr);
    root.appendChild(el('h2', '', Tr('Profiel')));
    if (PR.actief) {
      var pf = PR.lijst.filter(function (x) { return x.id === PR.actief; })[0];
      root.appendChild(el('p', 'sub', Tr('Ingelogd als {naam}. Je blijft ingelogd tot je afmeldt.', { naam: pf.avatar + ' ' + pf.naam })));
      root.appendChild(knop('btn zacht', Tr('Mijn profiel en klas'), function () { location.hash = '#/profiel'; }));
      root.appendChild(el('h2', '', Tr('Pincode')));
      if (pf.pin) {
        root.appendChild(el('p', 'sub', Tr('Je profiel is beveiligd met een pincode.')));
        var vp = el('input', 'invul'); vp.type = 'password'; vp.maxLength = 4; vp.setAttribute('inputmode', 'numeric'); vp.setAttribute('autocomplete', 'off');
        vp.placeholder = Tr('Typ je pincode om hem te verwijderen'); vp.setAttribute('aria-label', Tr('Pincode'));
        var vm = el('p', 'sub');
        root.appendChild(vp);
        root.appendChild(knop('btn zacht', Tr('Pincode verwijderen'), function () {
          if (pinHash(vp.value) !== pf.pin) { vm.textContent = Tr('Verkeerde pincode. Probeer opnieuw.'); vp.value = ''; return; }
          delete pf.pin; savePR(); instellingenScherm();
        }));
        root.appendChild(vm);
      } else {
        var np = el('input', 'invul'); np.type = 'password'; np.maxLength = 4; np.setAttribute('inputmode', 'numeric'); np.setAttribute('autocomplete', 'off');
        np.placeholder = Tr('Pincode (4 cijfers)'); np.setAttribute('aria-label', Tr('Pincode'));
        var pm = el('p', 'sub');
        root.appendChild(np);
        root.appendChild(knop('btn zacht', Tr('Pincode instellen'), function () {
          if (!/^\d{4}$/.test(np.value)) { pm.textContent = Tr('Een pincode heeft precies 4 cijfers.'); return; }
          pf.pin = pinHash(np.value); savePR(); instellingenScherm();
        }));
        root.appendChild(pm);
      }
      root.appendChild(el('h2', '', Tr('Afmelden')));
      root.appendChild(knop('btn gevaar', Tr('Afmelden'), afmelden));
      root.appendChild(el('p', 'sub', Tr('Afmelden wist niets. Je voortgang blijft op dit toestel bewaard; je kiest straks opnieuw wie je bent.')));
    }
    root.appendChild(el('h2', '', Tr('Over Leerliga')));
    root.appendChild(el('p', 'sub', Tr('Leerliga is gemaakt met hulp van AI. De lessen zijn nog niet nagekeken door een leerkracht en kunnen fouten bevatten. Twijfel je? Vraag het aan je leerkracht of in je cursus.')));
    root.appendChild(el('p', 'sub', Tr('Alles wat je doet blijft op dit toestel. Er is geen account. Alleen als je 2 lessen op een dag klaar hebt, vraagt Leerliga een muntcode aan de server van EAWG Mobile. Daarbij gaan een willekeurig nummer (geen naam) en het aantal lessen van vandaag mee.')));
  }

  function route() {
    var p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(function (x) { try { return decodeURIComponent(x); } catch (e) { return x; } });
    if (!INST.taalGekozen) return taalScherm();
    if (p[0] === 'instellingen') return instellingenScherm();
    if (p[0] === 'nieuw') return nieuwProfiel();
    if (!PR.actief) return PR.lijst.length ? inlogScherm() : nieuwProfiel();
    if (p[0] === 'profiel') return profielScherm();
    if (p[0] === 'mijn') return p[1] === 'nieuw' ? nieuweLes() : p[1] ? eigenLesScherm(p[1]) : mijnLijst();
    if (!klas()) return profielScherm();
    if (!p.length) return home();
    if (p[0] === 'herhaling') return herhalingScherm();
    if (!vak(p[0]) || vak(p[0]).binnenkort || (klas().vakken || []).indexOf(p[0]) < 0) return home();
    if (p.length === 1) return vakScherm(p[0]);
    if (p.length === 2) return themaScherm(p[0], p[1]);
    return lesScherm(p[0], p[1], p[2]);
  }
  window.addEventListener('hashchange', route);
  pasInstToe();
  function toonOpslagWaarschuwing() {
    var w = el('div', 'opslagwaarschuwing', Tr('Opslag is geblokkeerd in deze browser: je voortgang verdwijnt als je de app sluit. Maak een back-upcode bij Profiel → Toon mijn code.'));
    w.setAttribute('role', 'alert'); document.body.insertBefore(w, document.body.firstChild);
  }
  Opslag.init(2500).then(function (o) {
    if (o.hersteld) {   // lokale opslag was leeg: profielen en instellingen komen uit de database van je account terug
      PR = lees(PKEY) || PR; INST = lees(IKEY) || INST; LANG = INST.taal || standaardTaal();
      if (!INST.taalGekozen && PR.lijst.length) { INST.taal = INST.taal || 'nl'; LANG = INST.taal; INST.taalGekozen = true; }
      pasInstToe();
    }
    if (o.status === 'alleen-geheugen') toonOpslagWaarschuwing();
  haal('klassen').then(function (k) {
      if (k) KL = k;
      if (PR.actief && PR.lijst.some(function (x) { return x.id === PR.actief; })) activeer(PR.actief); else PR.actief = null;
      route();
      verbergSplash();
    });
  });
})();
