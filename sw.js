const CACHE_NAME = 'juliocastillodev-cache-v1'
const urlsToCache = [
  '/',
  '/assets/css/main.css',
  '/assets/img/gentle.webp',
  '/assets/img/hero-lit-html.webp',
  '/assets/img/lit-html-web-components.webp',
  '/assets/img/litelement-depth.webp',
  '/assets/img/litelement.webp',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request);
        }
      )
    );
  });

  self.addEventListener('activate', function(event) {

    const cacheWhitelist = [CACHE_NAME];
  
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });