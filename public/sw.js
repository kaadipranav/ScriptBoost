const CACHE_NAME = 'scriptboost-static-v1';
const ASSET_PATTERNS = [/\.(?:css|js)$/, /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : undefined))))
  );
  self.clients.claim();
});

function matchesAsset(url) {
  return ASSET_PATTERNS.some((re) => re.test(url.pathname));
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Cache-first for static assets
  if (matchesAsset(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) {
          // Revalidate in background
          event.waitUntil(fetch(event.request).then((res) => { if (res && res.ok) cache.put(event.request, res.clone()); }));
          return cached;
        }
        const res = await fetch(event.request);
        if (res && res.ok) cache.put(event.request, res.clone());
        return res;
      })
    );
    return;
  }

  // For navigation fallback, just proceed network-first
});
