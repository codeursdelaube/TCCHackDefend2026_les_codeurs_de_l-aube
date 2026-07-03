const CACHE_NAME = 'heritogo-v3';
const LOCALES = ['fr', 'en', 'es', 'zh'];

const STATIC_ASSETS = LOCALES.flatMap((l) => [
  `/${l}`,
  `/${l}/lieux`,
  `/${l}/cuisine`,
  `/${l}/scan`,
  `/${l}/loisirs`,
]).concat(['/manifest.json', '/offline.html']);

// Endpoints qui ne doivent JAMAIS être mis en cache (action en temps réel)
const NEVER_CACHE = ['/api/scan', '/api/chatbot', '/api/booking', '/api/guides/reserve', '/api/auth'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)))
      // allSettled : une URL en échec ne bloque plus les autres
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;

  // Jamais caché : actions temps réel
  if (NEVER_CACHE.some((p) => url.pathname.startsWith(p))) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (cached) return cached;

          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }

          return Response.error();
        });

      // Stale-while-revalidate : sers le cache tout de suite si dispo, sinon attends le réseau
      return cached || network;
    })
  );
});

