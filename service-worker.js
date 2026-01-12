/* service-worker.js
 * Offline-first simples:
 * - Cacheia assets essenciais na instalação
 * - Serve cache quando offline
 */

const CACHE_NAME = "pausa-interna-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/manifest.json",
  "/service-worker.js",
  "/assets/icon.svg",
  "/js/main.js",
  "/js/ui.js",
  "/js/storage.js",
  "/js/utils.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Apenas GET
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      // Cache-first para app shell
      if (cached) return cached;

      // Network fallback + cache
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => {
          // Se offline e pediu uma navegação, devolve index.html
          if (req.mode === "navigate") {
            return caches.match("/index.html");
          }
          return cached;
        });
    })
  );
});