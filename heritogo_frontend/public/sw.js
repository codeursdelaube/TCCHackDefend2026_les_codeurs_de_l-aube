const CACHE_NAME = 'heritogo-v4';
const LOCALES = ['fr', 'en', 'es', 'zh'];

const STATIC_ASSETS = LOCALES.flatMap((locale) => [
  `/${locale}`,
  `/${locale}/lieux`,
  `/${locale}/cuisine`,
  `/${locale}/scan`,
  `/${locale}/loisirs`,
]).concat([
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]);

function shouldBypassCache(requestUrl) {
  return requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api');
}

async function cacheStaticAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)));
}

async function deleteOldCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match('/offline.html');
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || Response.error());

  return cached || network;
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheStaticAssets());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (shouldBypassCache(url)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event.request));
    return;
  }

  event.respondWith(staleWhileRevalidate(event.request));
});