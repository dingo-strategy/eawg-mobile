(function () {
  var KEY = 'leren-v1';

  var VAKKEN = [
    { id: 'engels', naam: 'Engels', icoon: '🇬🇧', uitleg: 'Woorden, zinnen en spreken', actief: true },
    { id: 'wiskunde', naam: 'Wiskunde', icoon: '➗', uitleg: 'Rekenen en meetkunde' },
    { id: 'nederlands', naam: 'Nederlands', icoon: '📖', uitleg: 'Taal en spelling' },
    { id: 'frans', naam: 'Frans', icoon: '🥐', uitleg: 'Mots et phrases' },
    { id: 'wo', naam: 'Wereld', icoon: '🌍', uitleg: 'Natuur, mens en tijd' },
    { id: 'muziek', naam: 'Muziek', icoon: '🎵', uitleg: 'Noten en ritme' }
  ];

  var ENGELS = [
    { id: 'woorden', naam: 'Woordenschat', icoon: '🔤', uitleg: 'Nieuwe woorden leren' },
    { id: 'grammatica', naam: 'Grammatica', icoon: '🧩', uitleg: 'Zinnen bouwen' },
    { id: 'lezen', naam: 'Lezen', icoon: '📚', uitleg: 'Korte teksten' },
    { id: 'luisteren', naam: 'Luisteren', icoon: '🎧', uitleg: 'Wat zegt hij?' },
    { id: 'spreken', naam: 'Spreken', icoon: '🗣️', uitleg: 'Zeg het hardop' },
    { id: 'quiz', naam: 'Quiz', icoon: '🏆', uitleg: 'Test jezelf' }
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  }
  function dag(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  // Reeks = aantal opeenvolgende dagen dat de app geopend is.
  function bijwerkenReeks(s) {
    var nu = new Date(), vandaag = dag(nu);
    if (s.laatste === vandaag) return;
    var gisteren = new Date(nu); gisteren.setDate(nu.getDate() - 1);
    s.reeks = s.laatste === dag(gisteren) ? (s.reeks || 0) + 1 : 1;
    s.laatste = vandaag;
    save(s);
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function begroeting() {
    var u = new Date().getHours();
    return u < 12 ? 'Goeiemorgen' : u < 18 ? 'Goeiemiddag' : 'Goeienavond';
  }

  function tegel(item, onClick, badge) {
    var t = el(onClick ? 'button' : 'div', 'tile ' + (onClick ? 'on' : 'off'),
      '<span class="ico">' + item.icoon + '</span><b>' + item.naam + '</b><span class="s">' + item.uitleg + '</span>' +
      (badge ? '<span class="badge">' + badge + '</span>' : ''));
    if (onClick) t.addEventListener('click', onClick);
    return t;
  }

  function home(root, s) {
    root.innerHTML = '';
    var top = el('div', 'top');
    var kop = el('div', '', '<h1>' + begroeting() + '! 👋</h1><p class="sub">Wat leren we vandaag?</p>');
    top.appendChild(kop);
    top.appendChild(el('div', 'streak', '🔥 ' + (s.reeks || 1)));
    root.appendChild(top);

    var hero = el('button', 'hero',
      '<small>Verder doen</small><strong>Engels – Woordenschat</strong>' +
      '<div class="bar"><i style="width:0%"></i></div>');
    hero.addEventListener('click', function () { engels(root, s); });
    root.appendChild(hero);

    root.appendChild(el('h2', '', 'Vakken'));
    var grid = el('div', 'grid');
    VAKKEN.forEach(function (v) {
      grid.appendChild(tegel(v, v.actief ? function () { engels(root, s); } : null, v.actief ? null : 'Binnenkort'));
    });
    root.appendChild(grid);
  }

  function engels(root, s) {
    root.innerHTML = '';
    var terug = el('button', 'back', '← Terug');
    terug.addEventListener('click', function () { home(root, s); });
    root.appendChild(terug);
    root.appendChild(el('h1', '', '🇬🇧 Engels'));
    root.appendChild(el('p', 'sub', 'Kies waar je mee wil oefenen.'));
    root.appendChild(el('h2', '', 'Onderdelen'));
    var grid = el('div', 'grid');
    ENGELS.forEach(function (o) { grid.appendChild(tegel(o, null, 'Binnenkort')); });
    root.appendChild(grid);
    window.scrollTo(0, 0);
  }

  var s = load();
  bijwerkenReeks(s);
  home(document.getElementById('app'), s);
})();
