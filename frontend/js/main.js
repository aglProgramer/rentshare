/**
 * Main Application Logic
 */
import api from './modules/api.js';
import ui from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial State Check
    const token = localStorage.getItem('rentshare_token');
    ui.toggleView(!!token);

    if (token) {
        loadDashboard();
    }

    // 2. Auth Listeners
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const credentials = {
                email: e.target.loginEmail.value,
                password: e.target.loginPassword.value
            };

            try {
                ui.showLoading(true);
                const response = await api.login(credentials);
                
                localStorage.setItem('rentshare_token', response.token);
                localStorage.setItem('rentshare_user', JSON.stringify(response.usuario));
                
                ui.showStatus('Bienvenido de nuevo!');
                ui.toggleView(true);
                loadDashboard();
            } catch (error) {
                ui.showStatus(error.message, 'error');
            } finally {
                ui.showLoading(false);
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                nombre: e.target.regNombre.value,
                email: e.target.regEmail.value,
                password: e.target.regPassword.value
            };

            try {
                ui.showLoading(true);
                await api.register(userData);
                ui.showStatus('Cuenta creada! Por favor inicia sesión.');
                e.target.reset();
            } catch (error) {
                ui.showStatus(error.message, 'error');
            } finally {
                ui.showLoading(false);
            }
        });
    }

    // 3. Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('rentshare_token');
            localStorage.removeItem('rentshare_user');
            ui.toggleView(false);
            ui.showStatus('Sesión cerrada.');
        });
    }

    // 4. Dashboard Logic
    async function loadDashboard() {
        try {
            ui.showLoading(true);
            const users = await api.getUsers();
            ui.renderUsers(users);
        } catch (error) {
            ui.showStatus(error.message, 'error');
        } finally {
            ui.showLoading(false);
        }
    }
    
    // Manual Refresh
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadDashboard);
    }
});
