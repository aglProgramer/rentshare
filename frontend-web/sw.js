const CACHE_NAME = 'rentshare-v2';
const DYNAMIC_CACHE = 'rentshare-dynamic-v2';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './assets/css/styles.css',
    './assets/js/api-client.js',
    './assets/js/auth.js',
    './assets/js/ui-render.js',
    './assets/js/websocket.js',
    './assets/js/offline-sync.js',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js'
];

// Instalación: Cachea los recursos estáticos (App Shell)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Cacheando App Shell (Rutas Relativas)');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// Activación: Limpia caches antiguos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
                .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Estrategias de Intercepción
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    // Identificar llamadas a la API (backend externo o subpath /api)
    const isApiCall = url.hostname.includes('railway.app') || url.pathname.includes('/api/');

    if (isApiCall) {
        // Estrategia Network-First para llamadas a la API
        event.respondWith(
            fetch(req).then(networkRes => {
                // No cacheamos POST/PUT/DELETE, solo GET
                if (req.method === 'GET' && networkRes.ok) {
                    return caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(req, networkRes.clone());
                        return networkRes;
                    });
                }
                return networkRes;
            }).catch(async () => {
                // Si la red falla, buscamos en el cache dinámico
                const cachedRes = await caches.match(req);
                return cachedRes || new Response(JSON.stringify({ error: "Offline" }), {
                    headers: { 'Content-Type': 'application/json' },
                    status: 503
                });
            })
        );
    } 
    // Estrategia Cache-First para assets estáticos
    else {
        event.respondWith(
            caches.match(req).then(cachedRes => {
                return cachedRes || fetch(req).then(networkRes => {
                    return caches.open(DYNAMIC_CACHE).then(cache => {
                        // Solo cachear peticiones exitosas de assets
                        if (networkRes.ok && req.method === 'GET' && req.url.startsWith('http')) {
                            cache.put(req, networkRes.clone());
                        }
                        return networkRes;
                    });
                }).catch(() => {
                    // Si falla el fetch de un asset y estamos offline
                    if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
                        return caches.match('./index.html');
                    }
                });
            })
        );
    }
});

// Notificar a la UI para sincronización
self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        event.waitUntil(
            self.clients.matchAll().then(clients => {
                clients.forEach(client => client.postMessage({ type: 'SYNC_NOW' }));
            })
        );
    }
});
