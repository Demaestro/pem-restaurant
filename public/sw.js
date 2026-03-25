const CACHE_NAME = "pem-pwa-v3";
const APP_SHELL = ["/", "/manifest.webmanifest", "/pem-icon.jpeg", "/offline.html"];
const RUNTIME_CACHE = "pem-runtime-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(async () => (await caches.match(event.request)) || caches.match("/offline.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(async (cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch {
        if (event.request.destination === "image") {
          return caches.match("/pem-icon.jpeg");
        }
        return caches.match("/offline.html");
      }
    }),
  );
});
