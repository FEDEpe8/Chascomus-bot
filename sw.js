const CACHE_NAME = 'muni-chascomus-v49'; // <--- Subí la versión para forzar actualización
const assets = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './style.css',  // FALTABA ESTO
  './script.js'   // FALTABA ESTO
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(assets))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
