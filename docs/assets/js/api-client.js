/**
 * api-client.js — RentShare API Client
 * 
 * Centraliza todas las llamadas HTTP al backend.
 * Maneja token JWT, errores, y modo offline.
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : 'https://backend-rentshare-production.up.railway.app/api';

const apiClient = {
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

      if (res.status === 401) {
        Auth.logout();
        throw new Error('Sesión expirada. Inicia sesión nuevamente.');
      }

      if (!res.ok) {
        if (res.status === 503 && method !== 'GET') {
          throw new Error("Offline");
        }
        const error = await res.json().catch(() => ({ message: res.statusText }));
        const err = new Error(error.message || `HTTP ${res.status}`);
        err.status = res.status;
        err.fieldErrors = error.details || null;
        throw err;
      }
      return res.status === 204 ? null : res.json();
    } catch (err) {
      console.error(`❌ API Error [${method} ${endpoint}]:`, err);
      if (err.message === "Failed to fetch" || err.message === "Offline" || err.toString().includes("NetworkError")) {
        // No devolver mocks para Auth, el login/registro REQUIERE servidor
        if (method !== 'GET' && window.SyncManager && !endpoint.includes('/auth/')) {
          console.log('📡 Guardando operación en la cola offline:', method, endpoint);
          await window.SyncManager.pushToQueue({
            method,
            endpoint,
            body: data,
            timestamp: new Date().toISOString()
          });
          if (window.Toast) window.Toast.warning('Guardado localmente. Se sincronizará cuando recuperes conexión.');
          return { id: 'temp-' + Date.now(), ...data, isOfflineMock: true };
        } else {
          throw new Error("El servidor no está disponible. Verifica tu conexión.");
        }
      }
      throw err;
    }
  },

  get(endpoint)       { return this.request('GET', endpoint); },
  post(endpoint, data){ return this.request('POST', endpoint, data); },
  put(endpoint, data) { return this.request('PUT', endpoint, data); },
  delete(endpoint)    { return this.request('DELETE', endpoint); }
};

// ===========================
// API de Autenticación (Proxy al backend -> Supabase)
// ===========================
const AuthAPI = {
  login(email, password) {
    return apiClient.post('/auth/login', { email, password });
  },

  register(email, password, nombre) {
    return apiClient.post('/auth/register', { email, password, nombre });
  },

  async updateProfile(userId, data) {
    // Futuro: PUT /api/profiles/{id}
    console.log('Profile update pendiente de implementar en backend:', userId, data);
  },

  async deleteAccount(userId) {
    console.log('Delete account pendiente:', userId);
  }
};

// ===========================
// API de Gastos
// ===========================
const ExpenseAPI = {
  getAll() {
    return apiClient.get('/expenses');
  },

  getById(id) {
    return apiClient.get(`/expenses/${id}`);
  },

  create(data) {
    return apiClient.post('/expenses', data);
  },

  update(id, data) {
    return apiClient.put(`/expenses/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`/expenses/${id}`);
  }
};

// ===========================
// API de Grupos
// ===========================
const GroupAPI = {
  getAll() {
    return apiClient.get('/groups');
  },

  getById(id) {
    return apiClient.get(`/groups/${id}`);
  },

  create(data) {
    return apiClient.post('/groups', data);
  },

  addMember(groupId, profileId) {
    return apiClient.post(`/groups/${groupId}/members`, { profile: { id: profileId } });
  },

  async getBalance() {
    // Futuro: GET /api/groups/{id}/balance
    return {
      totalGeneral: 0,
      totalGrupal: 0,
      miAporte: 0,
      balancePesos: 0,
      isDeudor: false,
      debts: []
    };
  }
};

// ===========================
// API de Categorías
// ===========================
const CategoryAPI = {
  getAll() {
    return apiClient.get('/categories');
  },

  create(data) {
    return apiClient.post('/categories', data);
  }
};

window.apiClient = apiClient;
window.AuthAPI = AuthAPI;
window.ExpenseAPI = ExpenseAPI;
window.GroupAPI = GroupAPI;
window.CategoryAPI = CategoryAPI;
