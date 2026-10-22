(function () {
  var KEY = 'leren-v2';
  var root = document.getElementById('app');

  var VAKKEN = [
    { id: 'engels', naam: 'Engels', icoon: '🇬🇧', uitleg: 'Woorden en zinnen' },
    { id: 'frans', naam: 'Frans', icoon: '🥐', uitleg: 'Mots et phrases' },
    { id: 'wiskunde', naam: 'Wiskunde', icoon: '➗', uitleg: 'Getallen en meetkunde' },
    { id: 'aardrijkskunde', naam: 'Aardrijkskunde', icoon: '🌍', uitleg: 'Kaarten en klimaat' },
    { id: 'geschiedenis', naam: 'Geschiedenis', icoon: '🏛️', uitleg: 'Van prehistorie tot nu' },
    { id: 'nederlands', naam: 'Nederlands', icoon: '📖', uitleg: 'Taal en spelling' }
  ];

  var data = {};   // vak-id -> geladen leerstof (of null als ze nog niet bestaat)

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var S = load();
  S.scores = S.scores || {};   // "vak/lesid" -> beste aantal juist (0..1)

  // ---------- beloningen (munten voor het voetbalspel) ----------
  // Cijfers volgen het advies van de onderzoeker; het zijn gekalibreerde gokken, na enkele weken bijsturen.
  var TRAPPEN = [[0.9, 40], [0.7, 30], [0.5, 20], [0, 10]];   // [minimumscore, munten]
  var MAX_LESSEN_DAG = 3, CAP_DAG = 100, FREEZES_PER_WEEK = 2;
  var MIJLPALEN = { 3: 30, 7: 75, 14: 150, 30: 300 }, NA_30 = 200;
  S.dagen = S.dagen || {}; S.betaald = S.betaald || {}; S.mijl = S.mijl || {}; S.freeze = S.freeze || {};

  function dag(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dagNr(key) { var p = key.split('-'); return Date.UTC(+p[0], p[1] - 1, +p[2]) / 864e5; }
  function weekKey(d) { var m = new Date(d); m.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dag(m); }
  function vandaag() { return dag(new Date()); }
  function muntenVandaag() { return (S.dagen[vandaag()] || {}).munten || 0; }

  // Brievenbus: het voetbalspel haalt dit op en telt het bij zijn munten.
  function stortMunten(n) {
    if (n <= 0) return;
    try {
      var o = JSON.parse(localStorage.getItem('leren-tegoed')) || {};
      localStorage.setItem('leren-tegoed', JSON.stringify({ coins: (o.coins || 0) + n }));
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
          msg = 'Je vrije dag werd gebruikt, je reeks blijft behouden.';
        } else {
          msg = 'Welkom terug! Je had al ' + (S.reeksLes || 0) + ' dagen gedaan, die tellen nog half mee.';
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
    var rk = bijwerkenReeks(); res.reeks = S.reeksLes; res.msg = rk.msg; res.mijl = rk.extra;
    var trap = 0; TRAPPEN.some(function (t) { if (score >= t[0]) { trap = t[1]; return true; } });
    var d = S.dagen[vandaag()] = S.dagen[vandaag()] || { lessen: 0, munten: 0 };
    var eerder = S.betaald[sleutel] || 0, verschil = Math.max(0, trap - eerder);
    if (tePlezig) res.reden = 'snel';
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
  function vak(id) { return VAKKEN.filter(function (v) { return v.id === id; })[0]; }

  function niveau() { return S.niveau === 'B' ? 'B' : 'A'; }
  function haal(bestand) {
    return fetch('data/' + bestand + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function () { return null; });
  }
  // B-stroom: eenvoudigere versie; bestaat die nog niet, dan tonen we de A-versie met een melding.
  function laad(id, niv) {
    niv = niv || niveau();
    var sl = id + niv;
    if (sl in data) return Promise.resolve(data[sl]);
    var p = niv === 'B'
      ? haal(id + '-b').then(function (d) {
          if (d) { d.niveau = 'B'; return d; }
          return haal(id).then(function (a) { if (a) { a.niveau = 'A'; a.terugval = true; } return a; });
        })
      : haal(id).then(function (a) { if (a) a.niveau = 'A'; return a; });
    return p.then(function (d) { data[sl] = d; return d; });
  }
  // Scores worden per niveau bewaard, zodat A en B elkaar niet storen.
  function sk(d, lid) { return (d.niveau === 'B' ? 'B:' : '') + d.vak + '/' + lid; }

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

  function bar(pct) { var b = el('div', 'bar'); var i = el('i'); i.style.width = pct + '%'; b.appendChild(i); return b; }
  function begroeting() { var u = new Date().getHours(); return u < 12 ? 'Goeiemorgen' : u < 18 ? 'Goeiemiddag' : 'Goeienavond'; }
  function leeg(id) {
    root.textContent = ''; window.scrollTo(0, 0);
    root.className = id ? 'v-' + id : '';
    if (id) root.setAttribute('data-vak', id); else root.removeAttribute('data-vak');
  }
  function terug(hash, tekst) { return knop('back', '← ' + (tekst || 'Terug'), function () { location.hash = hash; }); }

  // ---------- schermen ----------
  function home() {
    leeg();
    var top = el('div', 'top'), kop = el('div');
    kop.appendChild(el('h1', '', begroeting() + '! 👋'));
    kop.appendChild(el('p', 'sub', 'Wat leren we vandaag?'));
    top.appendChild(kop);
    var chips = el('div', 'chips');
    chips.appendChild(el('div', 'streak', '🔥 ' + (S.reeksLes || 0)));
    chips.appendChild(el('div', 'streak', '🪙 ' + muntenVandaag() + '/' + CAP_DAG));
    top.appendChild(chips);
    root.appendChild(top);

    if (S.laatsteLes) {
      var p = S.laatsteLes.split('/');
      var h = knop('hero v-' + p[0], '', function () { S.niveau = S.laatsteNiveau || 'A'; save(); location.hash = '#/' + S.laatsteLes; route(); });
      h.appendChild(el('small', '', 'Verder doen'));
      h.appendChild(el('strong', '', (vak(p[0]) || {}).naam + ' – ' + (S.laatsteTitel || 'verder')));
      root.appendChild(h);
    }

    var tehe = teHerhalen().length;
    if (tehe) {
      var hk = knop('herhaling', '', function () { location.hash = '#/herhaling'; });
      hk.appendChild(el('strong', '', '🔁 Herhaling van vandaag'));
      hk.appendChild(el('span', '', Math.min(tehe, HERHALING_MAX) + ' vragen om te herhalen'));
      root.appendChild(hk);
    }
    var sw = el('div', 'niveau'); sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Niveau');
    [['A', 'A-stroom'], ['B', 'B-stroom']].forEach(function (x) {
      var b = knop('seg' + (niveau() === x[0] ? ' aan' : ''), x[1], function () { S.niveau = x[0]; save(); home(); });
      b.setAttribute('aria-pressed', niveau() === x[0] ? 'true' : 'false');
      sw.appendChild(b);
    });
    root.appendChild(sw);
    root.appendChild(el('p', 'uitlegje', niveau() === 'B' ? 'B-stroom: kortere uitleg en makkelijkere vragen.' : 'A-stroom: de volledige leerstof.'));

    root.appendChild(el('h2', '', 'Vakken'));
    var grid = el('div', 'grid');
    VAKKEN.forEach(function (v) {
      var t = el(v.binnenkort ? 'div' : 'button', 'tile v-' + v.id + ' ' + (v.binnenkort ? 'off' : 'on'));
      t.appendChild(el('span', 'ico', v.icoon));
      t.appendChild(el('b', '', v.naam));
      t.appendChild(el('span', 's', v.uitleg));
      if (v.binnenkort) t.appendChild(el('span', 'badge', 'Binnenkort'));
      else {
        t.addEventListener('click', function () { location.hash = '#/' + v.id; });
        var holder = el('div'); t.appendChild(holder);
        laad(v.id).then(function (d) {
          if (!d) { holder.appendChild(el('span', 'badge', 'Nog niet klaar')); return; }
          var pr = voortgang(d);
          holder.appendChild(bar(pr.totaal ? 100 * pr.klaar / pr.totaal : 0));
          holder.appendChild(el('span', 's', pr.klaar + ' / ' + pr.totaal + ' lessen'));
        });
      }
      grid.appendChild(t);
    });
    root.appendChild(grid);
  }

  function vakScherm(id) {
    leeg(id);
    var v = vak(id);
    root.appendChild(terug('#/', 'Alle vakken'));
    var ban = el('div', 'banner'), bt = el('div');
    ban.appendChild(el('span', 'ico', v.icoon));
    bt.appendChild(el('h1', '', v.naam)); bt.appendChild(el('p', 'sub', v.uitleg + ' · ' + (niveau() === 'B' ? 'B-stroom' : 'A-stroom')));
    ban.appendChild(bt); root.appendChild(ban);
    var plek = el('div'); root.appendChild(plek);
    laad(id).then(function (d) {
      if (!d) { plek.appendChild(el('p', 'sub', 'De leerstof van dit vak is nog niet klaar.')); return; }
      if (d.terugval) plek.appendChild(el('p', 'melding', 'De makkelijkere B-versie van dit vak komt eraan. Je ziet nu de A-versie.'));
      if (d.dekking) plek.appendChild(el('p', 'sub', d.dekking));
      (d.leerjaren || []).forEach(function (j) {
        var pr = voortgang(d, j.jaar);
        plek.appendChild(el('h2', '', j.jaar + 'e middelbaar · ' + pr.klaar + '/' + pr.totaal + ' lessen'));
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
      if (d.bronnen && d.bronnen.length) {
        var b = el('details', 'bronnen'); b.appendChild(el('summary', '', 'Bronnen'));
        d.bronnen.forEach(function (x) {
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
      if (!t) { plek.appendChild(el('p', 'sub', 'Thema niet gevonden.')); return; }
      plek.appendChild(el('h1', '', t.titel));
      plek.appendChild(el('p', 'sub', t.samenvatting || ''));
      plek.appendChild(el('h2', '', 'Lessen'));
      var lijst = el('div', 'lijst');
      (t.lessen || []).forEach(function (l) {
        var s = S.scores[sk(d, l.id)];
        var rij = el('button', 'rij');
        rij.appendChild(el('b', '', l.titel));
        rij.appendChild(el('span', 'badge' + (s != null ? ' ok' : ''), s != null ? '✓ ' + Math.round(s * 100) + '%' : 'Nieuw'));
        rij.addEventListener('click', function () { location.hash = '#/' + id + '/' + tid + '/' + l.id; });
        lijst.appendChild(rij);
      });
      plek.appendChild(lijst);
    });
  }

  function lesScherm(id, tid, lid) {
    leeg(id);
    root.appendChild(terug('#/' + id + '/' + tid, 'Thema'));
    var plek = el('div'); root.appendChild(plek);
    laad(id).then(function (d) {
      var t = d && vindThema(d, tid);
      var les = t && (t.lessen || []).filter(function (l) { return l.id === lid; })[0];
      if (!les) { plek.appendChild(el('p', 'sub', 'Les niet gevonden.')); return; }
      S.laatsteLes = id + '/' + tid + '/' + lid; S.laatsteTitel = les.titel; S.laatsteNiveau = d.niveau; save();

      plek.appendChild(el('h1', '', les.titel));
      String(les.uitleg || '').split(/\n\s*\n/).forEach(function (a) { if (a.trim()) plek.appendChild(el('p', 'uitleg', a.trim())); });

      if (les.woorden && les.woorden.length) {
        plek.appendChild(el('h2', '', 'Woorden'));
        var w = el('div', 'woorden');
        les.woorden.forEach(function (x) {
          var r = el('div', 'woord');
          r.appendChild(el('b', '', x.doel)); r.appendChild(el('span', '', x.nl));
          if (x.voorbeeld) r.appendChild(el('i', '', x.voorbeeld));
          if (TAAL[id] && 'speechSynthesis' in window) {
            r.classList.add('met-spreek');
            var sp = knop('spreek', '🔊', function () { spreek(schoon(x.doel), TAAL[id]); });
            sp.setAttribute('aria-label', 'Uitspreken: ' + schoon(x.doel));
            r.appendChild(sp);
          }
          w.appendChild(r);
        });
        plek.appendChild(w);
        if (les.woorden.length >= 4) {
          plek.appendChild(el('h2', '', 'Spelletjes'));
          var sk2 = el('div', 'spelknoppen'), spel = el('div', 'spel');
          sk2.appendChild(knop('btn', '🔗 Koppelspel', function () { koppelspel(spel, les.woorden); }));
          if (TAAL[id]) sk2.appendChild(knop('btn', '⌨️ Typ het woord', function () { typSpel(spel, les.woorden); }));
          plek.appendChild(sk2); plek.appendChild(spel);
        }
      }
      if (les.oefeningen && les.oefeningen.length) {
        plek.appendChild(el('h2', '', 'Oefenen'));
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
      host.appendChild(el('p', 'teller', 'Vraag ' + (i + 1) + ' van ' + n + (item.label ? ' · ' + item.label : '')));
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
          host.appendChild(el('p', 'feedback', (goed ? 'Juist! ' : 'Niet juist. ') + (o.uitleg || '')));
          host.appendChild(knop('btn', i + 1 < n ? 'Volgende' : 'Resultaat', function () { i++; toon(); }));
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
        h.appendChild(el('p', 'uitleg', 'Klaar! ' + juist + ' van ' + n + ' juist' + (score === 1 ? ' – perfect! 🎉' : '.')));
        if (br.munten > 0) h.appendChild(el('div', 'beloning', '🪙 +' + br.munten + ' munten voor EAWG Mobile!'));
        else h.appendChild(el('p', 'sub', {
          snel: 'Neem even de tijd om de vragen te lezen, dan krijg je munten.',
          herhaling: 'Oefenen, geen extra munten meer voor deze les. Goed bezig!',
          cap: 'Vandaag zijn je lesmunten op. Leren mag altijd, morgen weer munten!'
        }[br.reden] || ''));
        if (br.mijl > 0) h.appendChild(el('div', 'beloning', '🔥 ' + br.reeks + ' dagen op rij! Bonus +' + br.mijl + ' munten'));
        else if (br.msg) h.appendChild(el('p', 'sub', br.msg));
        if (juist < n) h.appendChild(el('p', 'sub', 'De vragen die fout waren, komen morgen terug bij "Herhaling".'));
        h.appendChild(knop('btn', 'Opnieuw proberen', opnieuw));
      }
    });
  }

  // ---------- gespreide herhaling: foute vragen komen na 1, 3 en 7 dagen terug ----------
  var INTERVALLEN = [1, 3, 7], HERHALING_MAX = 8;
  S.fout = S.fout || {};
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
    root.appendChild(terug('#/', 'Start'));
    root.appendChild(el('h1', '', '🔁 Herhaling van vandaag'));
    root.appendChild(el('p', 'sub', 'Vragen die je eerder fout had. Zo blijft het langer hangen.'));
    var plek = el('div'); root.appendChild(plek);
    var keys = teHerhalen().slice(0, HERHALING_MAX);
    if (!keys.length) { plek.appendChild(el('p', 'uitleg', 'Niets te herhalen vandaag. Goed bezig! 🎉')); return; }
    Promise.all(keys.map(function (k) {
      var f = S.fout[k];
      return laad(f.v, f.n).then(function (d) {
        var les = d && alleLessen(d).filter(function (l) { return l.id === f.l; })[0];
        if (!les || !les.oefeningen[f.i]) { delete S.fout[k]; return null; }
        return { k: k, f: f, o: les.oefeningen[f.i], label: vak(f.v).naam };
      });
    })).then(function (items) {
      items = items.filter(Boolean); save();
      if (!items.length) { plek.appendChild(el('p', 'uitleg', 'Niets te herhalen vandaag.')); return; }
      ronde(plek, schud(items), {
        onAntwoord: function (it, goed) {
          var nu = dagNr(vandaag());
          if (goed) { it.f.stap++; if (it.f.stap >= INTERVALLEN.length) delete S.fout[it.k]; else it.f.due = nu + INTERVALLEN[it.f.stap]; }
          else { it.f.stap = 0; it.f.due = nu + INTERVALLEN[0]; }
          save();
        },
        onKlaar: function (h, juist, n) {
          h.appendChild(el('p', 'uitleg', 'Klaar! ' + juist + ' van ' + n + ' juist. Wat fout was, komt morgen terug.'));
          h.appendChild(knop('btn', 'Terug naar start', function () { location.hash = '#/'; }));
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
    host.appendChild(el('p', 'teller', 'Tik links een woord, dan rechts het juiste.'));
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
        if (gekozen.i === i) {
          gekozen.btn.classList.remove('gekozen'); gekozen.btn.classList.add('gevonden'); gekozen.btn.disabled = true;
          b.classList.add('gevonden'); b.disabled = true; gekozen = null; gevonden++;
          if (gevonden === paren.length) {
            host.appendChild(el('p', 'feedback', 'Alles gevonden! ' + (fouten ? fouten + ' foutje' + (fouten > 1 ? 's' : '') + '.' : 'Zonder fout! 🎉')));
            host.appendChild(knop('btn', 'Nog eens', function () { koppelspel(host, woorden); }));
          }
        } else { fouten++; b.classList.add('fout'); setTimeout(function () { b.classList.remove('fout'); }, 450); }
      });
      R.appendChild(b);
    });
    rij.appendChild(L); rij.appendChild(R); host.appendChild(rij);
  }

  // Typen is sterker dan kiezen: je moet het echt uit je geheugen halen.
  function norm(t) { return schoon(t).toLowerCase().replace(/’/g, "'").normalize('NFD').replace(/[̀-ͯ]/g, ''); }
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
        host.appendChild(el('p', 'feedback', 'Klaar! ' + juist + ' van ' + kies.length + ' juist.'));
        host.appendChild(knop('btn', 'Nog eens', function () { typSpel(host, woorden); }));
        return;
      }
      var w = kies[i], ok = aanvaard(w.doel), klaar = false;
      host.appendChild(el('p', 'teller', 'Woord ' + (i + 1) + ' van ' + kies.length));
      host.appendChild(el('p', 'vraag', 'Hoe zeg je: ' + w.nl + '?'));
      var inp = el('input', 'invul');
      inp.type = 'text'; inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocomplete', 'off');
      inp.setAttribute('autocorrect', 'off'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('aria-label', 'Jouw antwoord');
      host.appendChild(inp);
      var fb = el('p', 'feedback'), acties = el('div', 'spelknoppen');
      function controleer() {
        if (klaar || !inp.value.trim()) return; klaar = true;
        var invoer = inp.value.trim().toLowerCase(), los = norm(inp.value);
        var goed = ok.some(function (a) { return norm(a) === los; }), exact = ok.some(function (a) { return a === invoer; });
        if (goed) juist++;
        fb.textContent = goed ? (exact ? 'Juist! ' : 'Juist, let op de accenten: ' + schoon(w.doel) + '. ') : 'Niet juist. Het juiste woord is: ' + schoon(w.doel) + '.';
        fb.className = 'feedback ' + (goed ? 'goed-tekst' : 'fout-tekst');
        acties.textContent = ''; acties.appendChild(knop('btn', i + 1 < kies.length ? 'Volgende' : 'Resultaat', function () { i++; toon(); }));
      }
      acties.appendChild(knop('btn', 'Controleer', controleer));
      acties.appendChild(knop('btn zacht', 'Hint', function () { var z = schoon(w.doel); fb.textContent = 'Begint met "' + z.charAt(0) + '" en heeft ' + z.length + ' tekens.'; }));
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') controleer(); });
      host.appendChild(acties); host.appendChild(fb);
    }
    toon();
  }

  function route() {
    var p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    if (!p.length) return home();
    if (p[0] === 'herhaling') return herhalingScherm();
    if (!vak(p[0]) || vak(p[0]).binnenkort) return home();
    if (p.length === 1) return vakScherm(p[0]);
    if (p.length === 2) return themaScherm(p[0], p[1]);
    return lesScherm(p[0], p[1], p[2]);
  }
  window.addEventListener('hashchange', route);
  route();
})();
