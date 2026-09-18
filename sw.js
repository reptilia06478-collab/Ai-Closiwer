/* ═══ CLOSIWER AI - Service Worker v6.0 ═══ */

const CACHE_NAME = 'closiwer-v6.0';
const ASSETS = [
    '/Ai-Closiwer/',
    '/Ai-Closiwer/index.html',
    '/Ai-Closiwer/style.css',
    '/Ai-Closiwer/script.js',
    '/Ai-Closiwer/manifest.json',
    '/Ai-Closiwer/Dev.png'
];

self.addEventListener('install', function(e) {
    console.log('[SW] Installing...');
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS).catch(function(err) {
                console.log('[SW] Cache partial:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    console.log('[SW] Activating...');
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.map(function(key) {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    if (e.request.method !== 'GET') return;
    if (!e.request.url.startsWith(self.location.origin)) return;
    
    e.respondWith(
        fetch(e.request)
            .then(function(response) {
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, clone);
                    });
                }
                return response;
            })
            .catch(function() {
                return caches.match(e.request).then(function(cached) {
                    return cached || caches.match('/Ai-Closiwer/index.html');
                });
            })
    );
});
