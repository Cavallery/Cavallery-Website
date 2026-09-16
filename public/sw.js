// Service Worker untuk PWA Cavallery
const CACHE_NAME = "cavallery-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/images/cava-logo-round.png",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA pre-cache warning:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Hanya tangani GET request, abaikan API & auth requests
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/data/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      })
  );
});
