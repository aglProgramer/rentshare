const CACHE_NAME = 'rentshare-v1';
const DYNAMIC_CACHE = 'rentshare-dynamic-v1';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/styles.css',
    '/assets/js/api-client.js',
    '/assets/js/auth.js',
    '/assets/js/ui-render.js',
    '/assets/js/websocket.js',
    '/assets/js/offline-sync.js', // Se creará en el siguiente paso
    '/assets/offline.html',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js'
];

// Instalación: Cachea los recursos estáticos (App Shell)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Cacheando App Shell');
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

    // Estrategia Network-First para llamadas a la API
    if (url.pathname.startsWith('/api')) {
        event.respondWith(
            fetch(req).then(networkRes => {
                return caches.open(DYNAMIC_CACHE).then(cache => {
                    // Guardamos una copia en el cache dinámico
                    if (req.method === 'GET') {
                        cache.put(req, networkRes.clone());
                    }
                    return networkRes;
                });
            }).catch(async err => {
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
                        // Omitir cache de chrome-extensions, etc.
                        if (req.url.startsWith('http') && req.method === 'GET') {
                            cache.put(req, networkRes.clone());
                        }
                        return networkRes;
                    });
                }).catch(() => {
                    // Si falla el fetch de un asset y estamos offline
                    if (req.headers.get('accept').includes('text/html')) {
                        return caches.match('/assets/offline.html');
                    }
                });
            })
        );
    }
});

// Sincronización en Background (Background Sync API)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-expenses') {
        console.log('[Service Worker] Background Sync ejecutándose');
        event.waitUntil(syncExpenses());
    }
});

async function syncExpenses() {
    // La lógica de sincronización (IndexedDB a Backend) 
    // se maneja compartiendo IndexedDB o delegándola a la UI.
    // Un simple broadcast para notificar a la UI que puede sincronizar
    self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SYNC_NOW' }));
    });
}
