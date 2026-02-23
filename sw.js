const CACHE_NAME = 'munibot-cache-v42';
const assets = [
  './',           // La raíz del sitio
  './index.php',  // El archivo principal
  './manifest.json'
  // Podes agregar aquí los íconos si querés que también estén offline:
  // './icon-192.png',
  // './icon-512.png'
];

// INSTALACIÓN: Guarda los archivos en la caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos');
        return cache.addAll(assets);
      })
      .then(() => self.skipWaiting()) // Fuerza a que el SW nuevo tome el control
  );
});

// ACTIVACIÓN: Limpia cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Borrando caché antigua', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim()) // Toma el control de la página inmediatamente
  );
});

// PETICIONES: Sirve desde la caché si existe, si no, va a la red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si está en caché, lo devuelve. Si no, hace la petición a la red.
      return response || fetch(event.request);
    })
  );
});
