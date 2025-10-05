const CACHE_NAME = 'hiddenviews-v1';
const OFFLINE_URL = '/offline.html';
const ALLOWED_DOMAIN = 'hiddenreviews.yashcore.app';

// Check if we're on the correct domain
const isCorrectDomain = () => {
  return self.location.hostname === ALLOWED_DOMAIN || 
         self.location.hostname === 'localhost' ||
         self.location.hostname === '127.0.0.1';
};

const urlsToCache = [
  '/',
  '/dashboard',
  '/sign-in',
  '/sign-up',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  if (!isCorrectDomain()) {
    console.log('Service worker not installed - wrong domain');
    return;
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  if (!isCorrectDomain()) {
    console.log('Service worker not activated - wrong domain');
    // Unregister this service worker if on wrong domain
    self.registration.unregister();
    return;
  }
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - minimal caching strategy
self.addEventListener('fetch', (event) => {
  // Domain check - don't intercept requests if on wrong domain
  if (!isCorrectDomain()) {
    return;
  }
  
  // Only handle GET requests for specific static assets
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip all API routes, auth routes, and dynamic content
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('/auth/') ||
      event.request.url.includes('/_next/') ||
      event.request.url.includes('/socket.io/') ||
      event.request.mode === 'navigate') {
    return;
  }

  // Only cache specific static assets (icons and manifest)
  if (event.request.url.includes('/icons/') ||
      event.request.url.includes('/manifest.json')) {
    
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version if available
          if (response) {
            return response;
          }
          
          // Fetch and cache the resource
          return fetch(event.request)
            .then((response) => {
              // Only cache successful responses
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return response;
            })
            .catch(() => {
              // Return a fallback or nothing for failed requests
              return new Response('', { status: 404 });
            });
        })
    );
  }
});