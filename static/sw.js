const CACHE_VERSION = 3;
const CURRENT_CACHE = `main-${CACHE_VERSION}`;
const cacheFiles = [
  "static/assets/style/style.css",
];
self.addEventListener("activate", (evt) =>
  evt.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  )
);
self.addEventListener("install", (evt) =>
  evt.waitUntil(
    caches.open(CURRENT_CACHE).then((cache) => {
      return cache.addAll(cacheFiles);
    })
  )
);
const fromNetwork = (request, timeout) =>
  new Promise((fulfill, reject) => {
    const timeoutId = setTimeout(reject, timeout);
    fetch(request).then((response) => {
      clearTimeout(timeoutId);
      fulfill(response);
      update(request);
    }, reject);
  });
const fromCache = (request) =>
  caches
    .open(CURRENT_CACHE)
    .then((cache) =>
      cache
        .match(request)
        .then((matching) => matching || cache.match("/offline/"))
    );
const update = (request) =>
  caches.open(CURRENT_CACHE).then((cache) => {
    if (
      request.method === "GET" &&
      request.url.startsWith("http") &&
      !request.url.includes("extension") &&
      !request.url.startsWith("chrome-extension")
    ) {
      return fetch(request).then((response) => cache.put(request, response));
    }
  });
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    fromNetwork(evt.request, 5000).catch(() => fromCache(evt.request))
  );
  evt.waitUntil(update(evt.request));
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.open(RUNTIME).then((cache) => {
          return fetch(event.request).then((response) => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});
