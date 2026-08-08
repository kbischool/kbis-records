/* KBIS Schools — service worker
   Cache-first app shell, stale-while-revalidate data, offline fallback.
   Bump CACHE_VERSION whenever you change any file in APP_SHELL. */
const CACHE_VERSION = 'kbis-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/config.js',
  './js/app.js',
  './img/logo.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
];
const DATA_FILES = ['./data/students.json', './data/invoice.json', './data/meta.json'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(APP_SHELL).catch(() => {});
    const data = await caches.open(DATA_CACHE);
    await data.addAll(DATA_FILES).catch(() => {});
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

function isDataRequest(url) { return DATA_FILES.some((f) => url.pathname.endsWith(f.replace('./', '/'))); }

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // let cross-origin (fonts CDN) pass through normally

  // Navigations: network-first, fallback to cached shell (works offline)
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch (e) {
        const cache = await caches.open(SHELL_CACHE);
        return (await cache.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Data JSON: stale-while-revalidate
  if (isDataRequest(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(DATA_CACHE);
      const cached = await cache.match(req);
      const networkFetch = fetch(req).then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      return cached || (await networkFetch) || Response.error();
    })());
    return;
  }

  // Everything else (app shell assets): cache-first, update in background
  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const cached = await cache.match(req);
    const networkFetch = fetch(req).then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return cached || (await networkFetch) || Response.error();
  })());
});
