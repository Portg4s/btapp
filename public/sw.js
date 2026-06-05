const CACHE_NAME = "bt-pwa-v1";
const APP_SHELL = ["/", "/offline"];

function isMusicApiRequest(url) {
  return url.pathname.startsWith("/api/music/search");
}

function isAudioRequest(request, url) {
  return request.destination === "audio" || /\.(mp3|m4a|wav|aac)$/i.test(url.pathname);
}

function isSafeStaticAsset(request, url) {
  return (
    url.origin === self.location.origin &&
    ["font", "image", "manifest", "script", "style"].includes(request.destination)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (isMusicApiRequest(url) || isAudioRequest(request, url)) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedOfflinePage = await caches.match("/offline");
        return cachedOfflinePage ?? Response.error();
      }),
    );
    return;
  }

  if (isSafeStaticAsset(request, url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        });
      }),
    );
  }
});
