const CACHE_NAME = 'life-rpg-v2';
const ASSETS = [
  '/life-rpg/index.html',
  '/life-rpg/style.css',
  '/life-rpg/app.js',
  '/life-rpg/data.js',
  '/life-rpg/manifest.json'
];

// 清除旧缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
});

// 网络优先，失败才用缓存
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(r => {
        // 更新缓存
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
