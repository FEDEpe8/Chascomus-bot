const CACHE_NAME = 'muni-chascomus-v12';
// Solo lo vital para que arranque el motor
const assets = [ 
  './index.html', 
  './style.css', 
  './script.js', 
  './manifest.json' 
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets)));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(ks => Promise.all(
        ks.map(k => k !== CACHE_NAME && caches.delete(k))
    )));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(res => {
            if (res) return res; // Si está en caché, lo usa
            return fetch(e.request).then(netRes => {
                return caches.open(CACHE_NAME).then(cache => {
                    // Guarda automáticamente lo que vayas usando (fotos, etc.)
                    if (netRes.status === 200) cache.put(e.request, netRes.clone());
                    return netRes;
                });
            }).catch(() => {
                // Si no hay internet, devuelve el index guardado
                if (e.request.mode === 'navigate') return caches.match('./index.html');
            });
        })
    );
});
