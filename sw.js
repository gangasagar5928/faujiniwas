const CACHE_NAME = 'rent-v10-clean';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force new worker to take over
});

self.addEventListener('activate', (e) => {
  // Delete all old, corrupted caches
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // THE FIX: Do not intercept POST requests (Firebase/Cloudinary)
  if (e.request.method !== 'GET' ||
      e.request.url.includes('firestore.googleapis.com') ||
      e.request.url.includes('cloudinary.com')) {
      return; // Let the browser handle the database normally
  }

  // Only cache normal website files
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
