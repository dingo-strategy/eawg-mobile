// VERSIE moet gelijk zijn aan het getal in index.html (game.js?v=NN). Bij live zetten beide samen verhogen.
const VERSIE = 44;
const CACHE = 'eawg-v' + VERSIE;
// zonder deze bestanden start de game niet: alles of niets
const KERN = ['./', 'index.html', 'game.js?v=' + VERSIE, 'manifest.json', 'icon-192.png', 'icon-512.png'];
// handig maar niet nodig om te starten: een fout hier blokkeert de installatie niet
const EXTRA = ['roster.json', 'players.json', 'achtergrond.png', 'menu.mp3'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(KERN.map(u => new Request(u, { cache: 'reload' })))
    .then(() => Promise.all(EXTRA.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).pathname.indexOf('/api/') === 0) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && r.type === 'basic' && r.status === 200) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(m => m || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});

self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
