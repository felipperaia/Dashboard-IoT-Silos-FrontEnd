/*
 Service Worker minimal:
 - Cache First para assets (shell)
 - Network First para chamadas /api/
 - Atualização simples no activate (limpa caches antigos)
*/
const CACHE_NAME = "silo-static-v1";
const API_CACHE = "silo-api-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && k !== API_CACHE ? caches.delete(k) : null)))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) {
    // Network First for API
    event.respondWith(
      fetch(event.request).then(res => {
        const copy = res.clone();
        caches.open(API_CACHE).then(cache => cache.put(event.request, copy));
        return res;
      }).catch(()=> caches.match(event.request))
    );
    return;
  }

  // Cache First for assets
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// Push event: mostra notificacao local
self.addEventListener("push", function(event) {
  let data = {};
  try { data = event.data.json(); } catch(e){}
  const title = data.title || "Silo Monitor";
  const options = { body: data.body || "Nova notificação", icon: "/icon-192.png" };
  event.waitUntil(self.registration.showNotification(title, options));
});
