/**
 * RentShare Offline Sync System
 * Usa IndexedDB para almacenar operaciones que fallaron por falta de red
 * y Background Sync (o listeners de red en el navegador) para reenviarlas.
 */

const SyncManager = {
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('RentShareOfflineDB', 1);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('sync-queue')) {
                    db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = event => {
                this.db = event.target.result;
                console.log('📦 IndexedDB Inicializado');
                resolve();
            };

            request.onerror = event => {
                console.error('❌ Error IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    async pushToQueue(operation) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sync-queue', 'readwrite');
            const store = tx.objectStore('sync-queue');
            store.add(operation);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async getQueue() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sync-queue', 'readonly');
            const store = tx.objectStore('sync-queue');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async removeFromQueue(id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sync-queue', 'readwrite');
            const store = tx.objectStore('sync-queue');
            store.delete(id);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },

    async syncAll() {
        if (!navigator.onLine) {
            console.log('Sigue offline, no se puede sincronizar.');
            return;
        }

        console.log('🔄 Sincronizando datos almacenados offline...');
        const queue = await this.getQueue();
        
        if (queue.length === 0) return;

        // Para evitar dependencias cíclicas si lo cargamos antes, 
        // usamos el objeto de window.apiClient (o hacemos requests nativos)
        
        // Recuperamos el token
        const token = localStorage.getItem('rentshare_token');
        
        for (const item of queue) {
            try {
                const options = {
                    method: item.method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    }
                };
                if (item.body) options.body = JSON.stringify(item.body);

                const syncBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                    ? 'http://localhost:8080/api'
                    : 'https://backend-rentshare-production.up.railway.app/api';
                const res = await fetch(`${syncBase}${item.endpoint}`, options);
                
                if (res.ok) {
                    await this.removeFromQueue(item.id);
                    console.log(`✅ Sincronizado: [${item.method}] ${item.endpoint}`);
                }
            } catch (err) {
                console.error(`❌ Fallo sincronización (se reintentará):`, err);
            }
        }
        
        // Recargar UI si estamos en ella
        if (window.UI && typeof window.UI.loadExpenses === 'function') {
            window.UI.loadExpenses();
            if (window.Toast) window.Toast.success('Sincronización offline completada');
        }
    }
};

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => {
                console.log('✅ Service Worker registrado con éxito:', reg.scope);
            })
            .catch(err => {
                console.error('❌ Registro falló:', err);
            });
    });

    // Escuchar mensajes del SW indicando que es buen momento para sincronizar
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'SYNC_NOW') {
            SyncManager.syncAll();
        }
    });
}

// Listeners de Red (Alternativa al sync event para asegurar que funcione al volver el internet)
window.addEventListener('online', () => {
    console.log('🟢 Conexión recuperada. Intentando sincronizar...');
    if (window.Toast) window.Toast.success('Conexión recuperada. Sincronizando datos...');
    SyncManager.syncAll();
});

window.addEventListener('offline', () => {
    console.log('🔴 Sin conexión. Operando en modo offline.');
    if (window.Toast) window.Toast.warning('Operando sin conexión. Los cambios se guardarán localmente.');
});

// Inicializamos la base de datos al cargar este script
SyncManager.init();

// Exportamos globalmente para que api-client.js pueda usarlo
window.SyncManager = SyncManager;
