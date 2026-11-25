const CACHE = 'missionphoto-v5-static-r43';
const FILES = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './google-drive.png', './jspdf.umd.min.js', './sitereport-logo.svg', './config.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache =>
    cache.addAll(FILES.map(file => new Request(file, {cache: 'reload'})))
  ).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('missionphoto-v5-static') && key !== CACHE)
      .map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const {request} = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const page = new URL('./index.html', self.registration.scope).href;
  const asset = FILES.find(file => new URL(file, self.registration.scope).href === url.href);
  const navigation = request.mode === 'navigate' && url.href.startsWith(self.registration.scope);
  if (!asset && !navigation) return;

  event.respondWith(fetch(request).catch(async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(navigation ? page : url.href) || Response.error();
  }));
});
