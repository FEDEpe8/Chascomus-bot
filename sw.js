const CACHE_NAME = 'munibot-v10'; // Subimos la versión para forzar la actualización
const urlsToCache = [
  './index.html',  // ¡Actualizado!
  './style.css',   // ¡Nuevo!
  './script.js',   // ¡Nuevo!
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
  // Si querés que las imágenes de la mascota también carguen sin internet, agregalas acá sin las barras '//':
  // './img-bot-normal.png',
  // './img-bot-pensando.png',
  // './img-bot-hablando.png'
];

// Instalar el Service Worker y guardar en caché los archivos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos nuevos');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Fuerza a que el SW nuevo tome el control rápido
  );
});

// Activar y limpiar cachés viejas (borra el rastro de index.php)
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
    .then(() => self.clients.claim()) 
  );
});

// Interceptar peticiones para que cargue offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve lo que está en caché o hace la petición a la red
        return response || fetch(event.request);
      })
  );
});
