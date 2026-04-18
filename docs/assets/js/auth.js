const Auth = {
    isLoggedIn() {
        return !!localStorage.getItem('rentshare_token');
    },

    async login(email, password) {
        try {
            const data = await AuthAPI.login(email, password);
            localStorage.setItem('rentshare_token', data.token);
            localStorage.setItem('user_email', email);
            window.location.reload();
        } catch (err) {
            document.getElementById('login-error').textContent = err.message;
        }
    },

    async register(name, email, password) {
        try {
            const data = await AuthAPI.register(email, password, name);
            if (data.token) {
                localStorage.setItem('rentshare_token', data.token);
                localStorage.setItem('user_email', email);
                window.location.reload();
            } else {
                alert('Registro exitoso. Revisa tu correo o inicia sesión.');
                window.location.reload();
            }
        } catch (err) {
            document.getElementById('register-error').textContent = err.message;
        }
    },

    logout() {
        localStorage.clear();
        window.location.reload();
    }
};

// Event Listeners
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    Auth.login(document.getElementById('login-email').value, document.getElementById('login-password').value);
});

document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    Auth.register(
        document.getElementById('reg-name').value,
        document.getElementById('reg-email').value,
        document.getElementById('reg-password').value
    );
});
