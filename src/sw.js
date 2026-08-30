import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Runtime caching for deterministic metabolic engines
registerRoute(
  /.*(?:metabolicEngine|excursionEngine|recommendationEngine).*/i,
  new StaleWhileRevalidate({
    cacheName: 'clinical-math-engines',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
      }),
    ],
  })
);

// 2. Runtime caching for Strapi clinical records
registerRoute(
  /^https?:\/\/.*\/api\/(?:client-profiles|prescribed-meal-plans|recipes|ingredients|clinics).*/i,
  new NetworkFirst({
    cacheName: 'strapi-clinical-data',
    networkTimeoutSeconds: 3,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 Days
      }),
    ],
  })
);

// 3. Clinical Push Notification Click Handler — Focus or open target cook / meal view
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
