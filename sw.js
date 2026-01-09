const CACHE_NAME = 'vplus-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// התקנת ה-Service Worker ושמירת קבצים בסיסיים בזיכרון המטמון
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// הפעלת ה-Service Worker וניקוי מטמון ישן
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// ניהול בקשות - מאפשר לאפליקציה להיטען מהר יותר
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
