const CACHE_NAME = 'munibot-v11'; // Subimos la versión para forzar la actualización
const urlsToCache = [
  './index.html',  // ¡Actualizado!
  './style.css',   // ¡Nuevo!
  './script.js',   // ¡Nuevo!
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
 
   './img-bot-normal.png',
   './img-bot-pensando.png',
   './img-bot-hablando.png'
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
        // 1. Si el archivo está en caché, lo devuelve al toque
        if (response) {
          return response;
        }
        
        // 2. Si no está en caché, lo busca en internet
        return fetch(event.request).catch(() => {
          // 3. SI FALLA INTERNET (Modo Avión) y el usuario intenta abrir la página...
          if (event.request.mode === 'navigate') {
            // ...le forzamos a mostrar el index.html guardado
            return caches.match('./index.html');
          }
        });
      })
  );
});
