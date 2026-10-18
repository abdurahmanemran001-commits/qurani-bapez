// Service Worker v2
// - app pages (html/js/css/json): NETWORK FIRST, so every change you push shows up right away;
//   cached copy is only used when offline.
// - heavy mushaf data (fonts / page images under /data/): cache first, size-limited.
const VERSION = 'v3';
const SHELL = 'shell-' + VERSION;
const PAGES = 'pages-' + VERSION;
const DATA = 'data-' + VERSION;
const IMAGES = 'quran-pages-' + VERSION;
const API = 'api-' + VERSION;
const MAX_PAGES = 150;
const MAX_DATA = 400;
const MAX_IMAGES = 40;
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
const KEEP = [SHELL, PAGES, DATA, IMAGES, API];
const HEAVY = /\.(woff2?|ttf|otf|webp|png|jpe?g|gif)$/i;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  try {
    const r = await fetch(req);
    if (r && r.status === 200) {
      await cache.put(req, r.clone());
      trim(cache, MAX_PAGES);
    }
    return r;
  } catch (err) {
    const hit = (await cache.match(req)) || (await caches.match(req));
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }
    return Response.error();
  }
}

async function cacheFirst(req, name, max) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const r = await fetch(req);
    if (r && r.status === 200) {
      await cache.put(req, r.clone());
      trim(cache, max);
    }
    return r;
  } catch (err) {
    return Response.error();
  }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const net = fetch(req)
    .then((r) => { if (r && r.status === 200) cache.put(req, r.clone()); return r; })
    .catch(() => hit || Response.error());
  return hit || net;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return; // audio/video range requests: leave to the browser
  const url = new URL(req.url);

  if (url.hostname === 'api.github.com') return; // live commit info: always network

  // Madani mushaf page images (home page reader)
  if (url.hostname === 'android.quran.com') {
    e.respondWith((async () => {
      const c = await caches.open(IMAGES);
      const hit = await c.match(req);
      if (hit) return hit;
      try {
        const r = await fetch(req);
        if (r && (r.status === 200 || r.type === 'opaque')) {
          await c.put(req, r.clone());
          trim(c, MAX_IMAGES);
        }
        return r;
      } catch (err) {
        return Response.error();
      }
    })());
    return;
  }

  // Quran / Zikr data APIs
  if (url.hostname === 'api.quran.com' || url.hostname === 'www.hisnmuslim.com') {
    e.respondWith(staleWhileRevalidate(req, API));
    return;
  }

  if (url.origin !== location.origin) return; // everything else cross-origin (audio CDNs...): browser handles it

  // heavy static mushaf data: cache first
  if (url.pathname.includes('/data/') && HEAVY.test(url.pathname)) {
    e.respondWith(cacheFirst(req, DATA, MAX_DATA));
    return;
  }

  // everything else of the app: network first (updates show immediately)
  e.respondWith(networkFirst(req));
});
