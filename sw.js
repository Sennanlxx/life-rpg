const CACHE_NAME = 'life-rpg-v1';
const ASSETS = [
  '/life-rpg/index.html',
  '/life-rpg/style.css',
  '/life-rpg/app.js',
  '/life-rpg/data.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
