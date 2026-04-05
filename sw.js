const CACHE_NAME = 'faujiadda-v11';
const SHELL_FILES = [
  '/',
  '/index.html',
  '/app.html',
  '/about.html',
  '/terms.html',
  '/privacy.html',
  '/contact.html',
  '/manifest.json',
  '/main.js',
  '/map.js',
  '/ui.js',
  '/data.js',
  '/firebase.js',
  '/suggest.js',
  '/chat.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

// Install — pre-cache shell
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can, silently ignore failures (CDN throttle etc)
      return Promise.allSettled(SHELL_FILES.map(url => cache.add(url)));
    })
  );
});

// Activate — delete old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', (e) => {
  // Never intercept: POST, Firebase, Cloudinary, identity toolkit
  if (
    e.request.method !== 'GET' ||
    e.request.url.includes('firestore.googleapis.com') ||
    e.request.url.includes('firebase.googleapis.com') ||
    e.request.url.includes('identitytoolkit.googleapis.com') ||
    e.request.url.includes('securetoken.googleapis.com') ||
    e.request.url.includes('cloudinary.com') ||
    e.request.url.includes('nominatim.openstreetmap.org')
  ) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Cache successful GET responses for shell files
        if (response.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline fallback — serve from cache
        return caches.match(e.request).then(cached => {
          if (cached) return cached;
          // If HTML page is requested offline and not cached, show index
          if (e.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Listen for skip-waiting message from client
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
