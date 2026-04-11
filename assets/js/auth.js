/**
 * auth.js — RentShare Frontend
 * 
 * Maneja la sesión real con la API:
 * - Login y Registro reales consumiendo AuthAPI
 * - Almacenamiento en sessionStorage (desaparece al cerrar pestaña)
 * - Protección de rutas 
 */

const Auth = {
    getUser() {
        const userJson = sessionStorage.getItem('rentshare_user');
        return userJson ? JSON.parse(userJson) : null;
    },

    setUser(userData) {
        sessionStorage.setItem('rentshare_user', JSON.stringify(userData));
    },

    logout() {
        sessionStorage.removeItem('rentshare_user');
        window.location.reload();
    },

    requireAuth() {
        const user = this.getUser();
        const loginContainer = document.getElementById('login-screen');
        const dashboardContainer = document.getElementById('app');
        const userNameDisplays = document.querySelectorAll('.user-name, #user-name');

        if (!user) {
            loginContainer.style.display = 'flex';
            dashboardContainer.style.display = 'none';
        } else {
            loginContainer.style.display = 'none';
            dashboardContainer.style.display = 'block';
            
            // Mostrar nombre del usuario logueado y código de invitación
            userNameDisplays.forEach(el => el.textContent = user.nombre);
            
            const groupNameDisplay = document.getElementById('group-name-display');
            if (groupNameDisplay) groupNameDisplay.textContent = user.homeGroupNombre;
            
            const inviteCodeDisplay = document.getElementById('invite-code-display');
            if (inviteCodeDisplay) inviteCodeDisplay.textContent = user.inviteCode;

            // Iniciar UI
            UI.init();
        }
    },

    async handleLogin(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Verificando...';

        try {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const userParams = await AuthAPI.login({ email, password });
            
            Auth.setUser(userParams);
            Toast.success(`¡Hola de nuevo, ${userParams.nombre}!`);
            Auth.requireAuth();

        } catch (error) {
            Toast.error(error.message || 'Error al iniciar sesión');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Iniciar Sesión';
        }
    },
    
    async handleRegister(e) {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Creando cuenta...';

        try {
            const nombre = document.getElementById('reg-nombre').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const inviteCode = document.getElementById('reg-invite').value;

            const payload = { nombre, email, password };
            if (inviteCode.trim() !== "") payload.inviteCode = inviteCode;
            
            const userParams = await AuthAPI.register(payload);
            
            Auth.setUser(userParams);
            Toast.success(`¡Cuenta creada con éxito! Bienvenido al grupo.`);
            Auth.requireAuth();

        } catch (error) {
            if (error.fieldErrors) {
                Toast.warning('Revisa los datos ingresados');
                // Podríamos pintar los campos aquí igual que en gastos
            } else {
                Toast.error(error.message || 'Error al registrar usuario');
            }
        } finally {
            btn.disabled = false;
            btn.textContent = 'Registrarse';
        }
    },

    toggleForms() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm.style.display === 'none') {
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        }
    }
};

// ===========================
// Setup Inicial
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    Auth.requireAuth();
    
    document.getElementById('login-form')?.addEventListener('submit', Auth.handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', Auth.handleRegister);
    
    document.getElementById('btn-logout')?.addEventListener('click', () => Auth.logout());
    
    document.getElementById('toggle-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.toggleForms();
    });
    document.getElementById('toggle-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.toggleForms();
    });
    
    // Configurar clic en el código para copiar al portapapeles
    document.getElementById('box-invite-code')?.addEventListener('click', () => {
        const code = document.getElementById('invite-code-display').textContent;
        navigator.clipboard.writeText(code);
        Toast.success('Código copiado al portapapeles');
    });
});
