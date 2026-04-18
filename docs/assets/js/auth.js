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

    logout() {
        localStorage.clear();
        window.location.reload();
    }
};

document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    Auth.login(email, password);
});
