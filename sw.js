// Service Worker - makes the app installable and usable offline
const VERSION = 'v1';
const SHELL = 'shell-' + VERSION;
const RUNTIME = 'runtime-' + VERSION;
const IMAGES = 'quran-pages-' + VERSION;
const MAX_IMAGES = 40; // opaque responses are counted large by browsers, so keep this small
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => ![SHELL, RUNTIME, IMAGES].includes(k)).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page navigation: network first, fall back to the cached app shell
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone();
          caches.open(SHELL).then((c) => c.put('./index.html', copy));
          return r;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Mushaf page images: cache first (pages you read once work offline)
  if (url.hostname === 'android.quran.com') {
    e.respondWith(
      caches.open(IMAGES).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        try {
          const r = await fetch(req);
          if (r && (r.ok || r.type === 'opaque')) {
            await c.put(req, r.clone());
            trim(c, MAX_IMAGES);
          }
          return r;
        } catch (err) {
          return Response.error();
        }
      })
    );
    return;
  }

  // Live GitHub commit info: always network
  if (url.hostname === 'api.github.com') return;

  // App files + Quran/Zikr data APIs: serve cached copy fast, refresh in background
  if (url.origin === location.origin || ['api.quran.com', 'www.hisnmuslim.com'].includes(url.hostname)) {
    e.respondWith(
      caches.open(RUNTIME).then(async (c) => {
        const hit = await c.match(req);
        const net = fetch(req)
          .then((r) => { if (r && r.ok) c.put(req, r.clone()); return r; })
          .catch(() => hit);
        return hit || net;
      })
    );
  }
});
