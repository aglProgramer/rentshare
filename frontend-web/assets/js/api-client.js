const API_BASE = 'http://localhost:8080/api';

export const apiClient = {
  token: localStorage.getItem('rentshare_token') || null,

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('rentshare_token', token);
    else localStorage.removeItem('rentshare_token');
  },

  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
      }
    };
    if (data) options.body = JSON.stringify(data);

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, options);
      if (!res.ok) {
        // El Service Worker puede haber devuelto un 503 al estar offline.
        if (res.status === 503 && method !== 'GET') {
           throw new Error("Offline");
        }
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `HTTP ${res.status}`);
      }
      return res.status === 204 ? null : res.json();
    } catch (err) {
      console.error(`❌ API Error [${method} ${endpoint}]:`, err);
      // Si la falla es por red
      if (err.message === "Failed to fetch" || err.message === "Offline" || err.toString().includes("NetworkError")) {
          if (method !== 'GET' && window.SyncManager) {
              console.log('📡 Guardando operación en la cola offline:', method, endpoint);
              await window.SyncManager.pushToQueue({
                  method,
                  endpoint,
                  body: data,
                  timestamp: new Date().toISOString()
              });
              if (window.Toast) window.Toast.warning('Guardado localmente. Se sincronizará cuando recuperes conexión.');
              // Hacemos un "mock" exitoso de retorno para que la UI no falle estrepitosamente
              return { id: 'temp-' + Date.now(), ...data, isOfflineMock: true };
          } else {
             throw new Error("Estás offline y no se pudo obtener esta información.");
          }
      }
      throw err;
    }
  },

  get(endpoint) { return this.request('GET', endpoint); },
  post(endpoint, data) { return this.request('POST', endpoint, data); },
  put(endpoint, data) { return this.request('PUT', endpoint, data); },
  delete(endpoint) { return this.request('DELETE', endpoint); }
};
