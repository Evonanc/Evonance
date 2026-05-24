const CACHE_NAME = 'evonance-v1';
const STATIC_CACHE = 'evonance-static-v1';
const DYNAMIC_CACHE = 'evonance-dynamic-v1';

// Core assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.svg',
];

// External domains to never cache
const NEVER_CACHE = [
  'api.coingecko.com',
  'stream.bybit.com',
  'supabase.co',
  'googleapis.com',
];

// ── Install event ────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate event ───────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key !== STATIC_CACHE && key !== DYNAMIC_CACHE
          )
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch event — stale-while-revalidate strategy ────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external API calls — always go to network
  if (NEVER_CACHE.some(domain => url.hostname.includes(domain))) return;

  // Skip chrome-extension and non-http
  if (!url.protocol.startsWith('http')) return;

  // For navigation requests (HTML pages) — network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful navigations
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline — serve cached version or offline page
          return caches.match(event.request)
            .then(cached => cached || caches.match('/offline.html'));
        })
    );
    return;
  }

  // For assets (JS, CSS, images) — cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Serve from cache, update in background
        fetch(event.request).then(response => {
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, response);
            });
          }
        }).catch(() => {});
        return cached;
      }

      // Not in cache — fetch and cache
      return fetch(event.request).then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => caches.match('/offline.html'));
    })
  );
});

// ── Background sync ──────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-portfolio') {
    event.waitUntil(
      // In production: sync pending transactions
      Promise.resolve()
    );
  }
});

// ── Push notifications ───────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'EVONANCE', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'evonance-notification',
      data: { url: data.url || '/' },
      actions: data.actions || [],
      vibrate: [100, 50, 100],
    })
  );
});

// ── Notification click ───────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Focus existing window if open
        for (const client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
