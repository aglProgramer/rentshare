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
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `HTTP ${res.status}`);
      }
      return res.status === 204 ? null : res.json();
    } catch (err) {
      console.error(`❌ API Error [${method} ${endpoint}]:`, err);
      throw err;
    }
  },

  get(endpoint) { return this.request('GET', endpoint); },
  post(endpoint, data) { return this.request('POST', endpoint, data); },
  put(endpoint, data) { return this.request('PUT', endpoint, data); },
  delete(endpoint) { return this.request('DELETE', endpoint); }
};
