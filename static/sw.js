const PRECACHE = "precache";
const PRECACHE_URLS = [
  "static/index.html",
  "static/style.css",
  "static/bundle.js",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
