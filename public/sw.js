// Simple service worker for Meme Database PWA
const STATIC_CACHE = 'memedb-static-v2';
const DYNAMIC_CACHE = 'memedb-dynamic-v2';

// URLs to cache for offline access
const staticAssets = [
  '/manifest.json',
  '/icon.svg'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(staticAssets);
      })
      .then(() => {
        return self.skipWaiting(); // Force activation
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all clients
    })
  );
});

// Fetch events with network-first strategy for CSS/JS and stale-while-revalidate for other resources
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls and external requests
  if (!url.origin.includes(self.location.origin) || url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first strategy for CSS, JS, and HTML files to ensure fresh content
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'document' ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js') ||
      url.pathname.includes('/_next/')) {
    
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response for caching
          const responseClone = response.clone();
          
          // Cache the fresh response
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for images and static assets
  if (request.destination === 'image' || 
      url.pathname.includes('/uploads/') ||
      staticAssets.some(asset => url.pathname === asset)) {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request).then((response) => {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          });
        })
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    caches.match(request)
      .then((response) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return networkResponse;
        });

        return response || fetchPromise;
      })
  );
});

// Handle share target
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARE_TARGET') {
    // Handle shared content
    const shareData = event.data.shareData;
    
    // Open the upload page with shared data
    const uploadUrl = new URL('/upload', self.location.origin);
    if (shareData.title) uploadUrl.searchParams.set('title', shareData.title);
    if (shareData.text) uploadUrl.searchParams.set('text', shareData.text);
    if (shareData.url) uploadUrl.searchParams.set('url', shareData.url);
    
    event.ports[0].postMessage({
      success: true,
      redirectUrl: uploadUrl.toString()
    });
  }
});
