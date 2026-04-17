import { apiClient } from './api-client.js';
import { showLoading, hideLoading, showToast } from './utils.js';

export const Auth = {
  async login(email, password) {
    showLoading('Iniciando sesión...');
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      apiClient.setToken(res.token);
      localStorage.setItem('user_id', res.userId);
      localStorage.setItem('user_name', res.nombre);
      hideLoading();
      showToast('✅ Bienvenido, ' + res.nombre, 'success');
      window.location.href = '/index.html';
      return res;
    } catch (err) {
      hideLoading();
      showToast('❌ ' + err.message, 'error');
      throw err;
    }
  },

  logout() {
    apiClient.setToken(null);
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    window.location.href = '/login.html';
  },

  checkSession() {
    const token = localStorage.getItem('rentshare_token');
    const userId = localStorage.getItem('user_id');
    if (!token || !userId) window.location.href = '/login.html';
    return { token, userId, nombre: localStorage.getItem('user_name') };
  }
};
