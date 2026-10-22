(function () {
  var KEY = 'leren-v2';
  var root = document.getElementById('app');

  var VAKKEN = [
    { id: 'engels', naam: 'Engels', icoon: '🇬🇧', uitleg: 'Woorden en zinnen' },
    { id: 'frans', naam: 'Frans', icoon: '🥐', uitleg: 'Mots et phrases' },
    { id: 'wiskunde', naam: 'Wiskunde', icoon: '➗', uitleg: 'Getallen en meetkunde' },
    { id: 'aardrijkskunde', naam: 'Aardrijkskunde', icoon: '🌍', uitleg: 'Kaarten en klimaat' },
    { id: 'geschiedenis', naam: 'Geschiedenis', icoon: '🏛️', uitleg: 'Van prehistorie tot nu' },
    { id: 'nederlands', naam: 'Nederlands', icoon: '📖', uitleg: 'Taal en spelling', binnenkort: true }
  ];

  var data = {};   // vak-id -> geladen leerstof (of null als ze nog niet bestaat)

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  var S = load();
  S.scores = S.scores || {};   // "vak/lesid" -> beste aantal juist (0..1)

  function dag(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  (function reeks() {
    var nu = new Date(), v = dag(nu);
    if (S.laatste === v) return;
    var g = new Date(nu); g.setDate(nu.getDate() - 1);
    S.reeks = S.laatste === dag(g) ? (S.reeks || 0) + 1 : 1;
    S.laatste = v; save();
  })();

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function knop(cls, text, fn) { var b = el('button', cls, text); b.addEventListener('click', fn); return b; }
  function vak(id) { return VAKKEN.filter(function (v) { return v.id === id; })[0]; }

  function laad(id) {
    if (id in data) return Promise.resolve(data[id]);
    return fetch('data/' + id + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () { return null; })
      .then(function (d) { data[id] = d; return d; });
  }

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
    l.forEach(function (x) { if (S.scores[d.vak + '/' + x.id] != null) k++; });
    return { klaar: k, totaal: l.length };
  }

  function bar(pct) { var b = el('div', 'bar'); var i = el('i'); i.style.width = pct + '%'; b.appendChild(i); return b; }
  function begroeting() { var u = new Date().getHours(); return u < 12 ? 'Goeiemorgen' : u < 18 ? 'Goeiemiddag' : 'Goeienavond'; }
  function leeg() { root.textContent = ''; window.scrollTo(0, 0); }
  function terug(hash, tekst) { return knop('back', '← ' + (tekst || 'Terug'), function () { location.hash = hash; }); }

  // ---------- schermen ----------
  function home() {
    leeg();
    var top = el('div', 'top'), kop = el('div');
    kop.appendChild(el('h1', '', begroeting() + '! 👋'));
    kop.appendChild(el('p', 'sub', 'Wat leren we vandaag?'));
    top.appendChild(kop); top.appendChild(el('div', 'streak', '🔥 ' + (S.reeks || 1)));
    root.appendChild(top);

    if (S.laatsteLes) {
      var p = S.laatsteLes.split('/');
      var h = knop('hero', '', function () { location.hash = '#/' + S.laatsteLes; });
      h.appendChild(el('small', '', 'Verder doen'));
      h.appendChild(el('strong', '', (vak(p[0]) || {}).naam + ' – ' + (S.laatsteTitel || 'verder')));
      root.appendChild(h);
    }

    root.appendChild(el('h2', '', 'Vakken'));
    var grid = el('div', 'grid');
    VAKKEN.forEach(function (v) {
      var t = el(v.binnenkort ? 'div' : 'button', 'tile ' + (v.binnenkort ? 'off' : 'on'));
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
    leeg();
    var v = vak(id);
    root.appendChild(terug('#/', 'Alle vakken'));
    root.appendChild(el('h1', '', v.icoon + ' ' + v.naam));
    var plek = el('div'); root.appendChild(plek);
    laad(id).then(function (d) {
      if (!d) { plek.appendChild(el('p', 'sub', 'De leerstof van dit vak is nog niet klaar.')); return; }
      if (d.dekking) plek.appendChild(el('p', 'sub', d.dekking));
      (d.leerjaren || []).forEach(function (j) {
        var pr = voortgang(d, j.jaar);
        plek.appendChild(el('h2', '', j.jaar + 'e middelbaar · ' + pr.klaar + '/' + pr.totaal + ' lessen'));
        var lijst = el('div', 'lijst');
        (j.themas || []).forEach(function (t) {
          var rij = el('button', 'rij');
          var kl = (t.lessen || []).filter(function (l) { return S.scores[id + '/' + l.id] != null; }).length;
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
    leeg();
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
        var s = S.scores[id + '/' + l.id];
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
    leeg();
    root.appendChild(terug('#/' + id + '/' + tid, 'Thema'));
    var plek = el('div'); root.appendChild(plek);
    laad(id).then(function (d) {
      var t = d && vindThema(d, tid);
      var les = t && (t.lessen || []).filter(function (l) { return l.id === lid; })[0];
      if (!les) { plek.appendChild(el('p', 'sub', 'Les niet gevonden.')); return; }
      S.laatsteLes = id + '/' + tid + '/' + lid; S.laatsteTitel = les.titel; save();

      plek.appendChild(el('h1', '', les.titel));
      String(les.uitleg || '').split(/\n\s*\n/).forEach(function (a) { if (a.trim()) plek.appendChild(el('p', 'uitleg', a.trim())); });

      if (les.woorden && les.woorden.length) {
        plek.appendChild(el('h2', '', 'Woorden'));
        var w = el('div', 'woorden');
        les.woorden.forEach(function (x) {
          var r = el('div', 'woord');
          r.appendChild(el('b', '', x.doel)); r.appendChild(el('span', '', x.nl));
          if (x.voorbeeld) r.appendChild(el('i', '', x.voorbeeld));
          w.appendChild(r);
        });
        plek.appendChild(w);
      }
      if (les.oefeningen && les.oefeningen.length) {
        plek.appendChild(el('h2', '', 'Oefenen'));
        var q = el('div'); plek.appendChild(q);
        quiz(q, id, les);
      }
    });
  }

  function quiz(host, id, les) {
    var i = 0, juist = 0, n = les.oefeningen.length;
    function toon() {
      host.textContent = '';
      if (i >= n) {
        var score = juist / n, k = id + '/' + les.id;
        if (S.scores[k] == null || score > S.scores[k]) S.scores[k] = score;
        save();
        host.appendChild(el('p', 'uitleg', 'Klaar! ' + juist + ' van ' + n + ' juist' + (score === 1 ? ' – perfect! 🎉' : '.')));
        host.appendChild(knop('btn', 'Opnieuw proberen', function () { i = 0; juist = 0; toon(); }));
        return;
      }
      var o = les.oefeningen[i];
      host.appendChild(el('p', 'teller', 'Vraag ' + (i + 1) + ' van ' + n));
      host.appendChild(el('p', 'vraag', o.vraag));
      var vb = el('div', 'opties'), gedaan = false;
      o.opties.forEach(function (tekst, idx) {
        var b = knop('optie', tekst, function () {
          if (gedaan) return; gedaan = true;
          var goed = idx === o.antwoord; if (goed) juist++;
          b.classList.add(goed ? 'goed' : 'fout');
          if (!goed) vb.children[o.antwoord].classList.add('goed');
          host.appendChild(el('p', 'feedback', (goed ? '✅ Juist! ' : '❌ Niet juist. ') + (o.uitleg || '')));
          host.appendChild(knop('btn', i + 1 < n ? 'Volgende' : 'Resultaat', function () { i++; toon(); }));
        });
        vb.appendChild(b);
      });
      host.appendChild(vb);
    }
    toon();
  }

  function route() {
    var p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    if (!p.length) return home();
    if (!vak(p[0]) || vak(p[0]).binnenkort) return home();
    if (p.length === 1) return vakScherm(p[0]);
    if (p.length === 2) return themaScherm(p[0], p[1]);
    return lesScherm(p[0], p[1], p[2]);
  }
  window.addEventListener('hashchange', route);
  route();
})();
