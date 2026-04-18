/**
 * auth.js — RentShare Authentication
 * 
 * Maneja login, registro, sesión y logout.
 * Trabaja con el backend que hace proxy a Supabase Auth.
 */

const Auth = {
  async login(email, password) {
    const loginBtn = document.getElementById('login-btn');
    const errorEl = document.getElementById('login-error');
    
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = '⏳ Iniciando sesión...';
    }
    if (errorEl) errorEl.textContent = '';

    try {
      const res = await AuthAPI.login(email, password);

      apiClient.setToken(res.token);
      localStorage.setItem('user_id', res.userId);
      localStorage.setItem('user_name', res.nombre || 'Usuario');
      localStorage.setItem('user_email', email);

      // Mostrar app y ocultar login
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'block';

      if (window.Toast) Toast.success('✅ Bienvenido, ' + (res.nombre || 'Usuario'));
      
      // Inicializar la UI principal
      if (window.UI) await UI.init();

      return res;
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = '❌ ' + (err.message || 'Error al iniciar sesión');
        errorEl.style.cssText = 'color:#ef4444; background:rgba(239,68,68,0.1); padding:10px; border-radius:8px; margin-bottom:10px; text-align:center;';
      }
      throw err;
    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = '🔑 Iniciar sesión';
      }
    }
  },

  async register(nombre, email, password) {
    const regBtn = document.getElementById('register-btn');
    const errorEl = document.getElementById('login-error');
    
    if (regBtn) {
      regBtn.disabled = true;
      regBtn.textContent = '⏳ Registrando...';
    }
    if (errorEl) errorEl.textContent = '';

    try {
      const res = await AuthAPI.register(email, password, nombre);
      
      if (res.token) {
        apiClient.setToken(res.token);
        localStorage.setItem('user_id', res.userId);
        localStorage.setItem('user_name', res.nombre || nombre);
        localStorage.setItem('user_email', email);

        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';

        if (window.Toast) Toast.success('✅ Registro exitoso. Bienvenido, ' + (res.nombre || nombre));
        if (window.UI) await UI.init();
      } else {
        if (window.Toast) Toast.info('📧 Se envió un correo de confirmación a ' + email);
      }
      return res;
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = '❌ ' + (err.message || 'Error al registrarse');
        errorEl.style.cssText = 'color:#ef4444; background:rgba(239,68,68,0.1); padding:10px; border-radius:8px; margin-bottom:10px; text-align:center;';
      }
      throw err;
    } finally {
      if (regBtn) {
        regBtn.disabled = false;
        regBtn.textContent = '📝 Registrarse';
      }
    }
  },

  logout() {
    apiClient.setToken(null);
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');

    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  },

  getUser() {
    return {
      id: localStorage.getItem('user_id'),
      nombre: localStorage.getItem('user_name'),
      email: localStorage.getItem('user_email'),
      avatar: null,
      inviteCode: localStorage.getItem('user_invite_code') || '---',
      celular: localStorage.getItem('user_celular') || '',
      direccion: localStorage.getItem('user_direccion') || ''
    };
  },

  isLoggedIn() {
    return !!localStorage.getItem('rentshare_token') && !!localStorage.getItem('user_id');
  },

  /** Auto-check on page load */
  requireAuth() {
    if (this.isLoggedIn()) {
      apiClient.token = localStorage.getItem('rentshare_token');
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      if (window.UI) UI.init();
    } else {
      document.getElementById('login-screen').style.display = 'flex';
      document.getElementById('app').style.display = 'none';
    }
  }
};

// ===========================
// Setup event listeners on DOM ready
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      try { await Auth.login(email, password); } catch (err) {}
    });
  }

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nombre = document.getElementById('reg-nombre').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
      try { await Auth.register(nombre, email, password); } catch (err) {}
    });
  }

  // Toggle between login and register
  const showRegister = document.getElementById('toggle-register');
  if (showRegister) {
    showRegister.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('register-form').style.display = 'block';
    });
  }

  const showLogin = document.getElementById('toggle-login');
  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('register-form').style.display = 'none';
      document.getElementById('login-form').style.display = 'block';
    });
  }

  // Auto-check session
  Auth.requireAuth();
});

window.Auth = Auth;
