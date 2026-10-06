// ── Cache version — à incrémenter à chaque déploiement ──────────────────────
// IMPORTANT : changer ce nom force le SW à se réinstaller et vider l'ancien cache.
// Cela évite les 404 causés par des HTML périmées qui référencent des chunks obsolètes.
const CACHE_NAME = 'heritogo-v7';

const LOCALES = ['fr', 'en', 'es', 'zh'];

// Seuls les ASSETS STATIQUES sont mis en cache (images, manifest, page offline).
// Les pages HTML de navigation NE sont PAS mises en cache pour éviter de servir
// une version périmée après un nouveau déploiement (ce qui cause les 404 JS chunks).
const STATIC_ASSETS = [
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

function shouldBypassCache(requestUrl, request) {
  // Ignorer les requêtes externes
  if (requestUrl.origin !== self.location.origin) return true;
  // Ne jamais cacher les routes API
  if (requestUrl.pathname.startsWith('/api')) return true;
  // Ne jamais intercepter les chunks et assets Next.js (gérés par le cache HTTP immuable de Next)
  if (requestUrl.pathname.startsWith('/_next/')) return true;
  // Ne jamais cacher les requêtes RSC (React Server Components payload pour la navigation client)
  if (requestUrl.searchParams.has('_rsc')) return true;
  if (request && request.headers && request.headers.get('RSC') === '1') return true;
  // Ne pas cacher les routes d'authentification
  if (requestUrl.pathname.startsWith('/auth/')) return true;
  return false;
}

async function cacheStaticAssets() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(STATIC_ASSETS.map((url) => cache.add(url)));
}

async function deleteOldCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
}

// Navigation : toujours réseau en premier, fallback offline uniquement si hors ligne.
// On NE MET PAS en cache les pages HTML pour éviter de servir du contenu périmé.
async function networkOnlyNavigation(request) {
  try {
    const response = await fetch(request);
    // Si le serveur répond 404 ou 500, ne pas mettre en cache
    if (!response.ok) return response;
    return response;
  } catch {
    // Hors ligne → fallback sur la page offline
    const cached = await caches.match('/offline.html');
    return cached || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || Response.error());

  return cached || network;
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheStaticAssets());
  // Activer immédiatement sans attendre que les anciens clients se ferment
  self.skipWaiting();
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
  if (shouldBypassCache(url, event.request)) return;

  // Navigation HTML → toujours réseau, jamais de cache
  if (event.request.mode === 'navigate') {
    event.respondWith(networkOnlyNavigation(event.request));
    return;
  }

  // Assets statiques → stale-while-revalidate
  event.respondWith(staleWhileRevalidate(event.request));
});