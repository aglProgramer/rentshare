/**
 * UI Module
 * Handles all DOM manipulations.
 */

const ui = {
    /**
     * DOM Elements
     */
    elements: {
        userList: document.getElementById('userList'),
        statusToast: document.getElementById('status'),
        loadingIndicator: document.getElementById('loading'),
        authSection: document.getElementById('authSection'),
        dashboardSection: document.getElementById('dashboardSection'),
        userDisplayName: document.getElementById('userDisplayName'),
        logoutBtn: document.getElementById('logoutBtn')
    },

    /**
     * Show/Hide Loading
     */
    showLoading(show) {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = show ? 'block' : 'none';
        }
    },

    /**
     * Show Status Toast
     */
    showStatus(message, type = 'success') {
        const toast = this.elements.statusToast;
        if (!toast) return;

        toast.innerText = message;
        toast.style.display = 'block';
        toast.style.background = type === 'success' ? '#22c55e' : '#ef4444';
        
        setTimeout(() => {
            toast.style.display = 'none';
        }, 4000);
    },

    /**
     * Render Users Table/List
     */
    renderUsers(usersPage) {
        const list = this.elements.userList;
        if (!list) return;

        list.innerHTML = '';
        const users = usersPage.content || [];

        if (users.length === 0) {
            list.innerHTML = '<li class="user-item"><p style="color: #94a3b8">No hay usuarios registrados.</p></li>';
            return;
        }

        users.forEach(user => {
            const li = document.createElement('li');
            li.className = 'user-item';
            li.innerHTML = `
                <div class="user-info">
                    <h4>${user.nombre}</h4>
                    <p>${user.email}</p>
                </div>
                <span class="badge">${user.rol}</span>
            `;
            list.appendChild(li);
        });
    },

    /**
     * Toggle View (Auth vs Dashboard)
     */
    toggleView(isAuthenticated) {
        if (isAuthenticated) {
            this.elements.authSection.style.display = 'none';
            this.elements.dashboardSection.style.display = 'block';
            this.elements.logoutBtn.style.display = 'block';
            
            const user = JSON.parse(localStorage.getItem('rentshare_user'));
            if (user && this.elements.userDisplayName) {
                this.elements.userDisplayName.innerText = `Bienvenido, ${user.nombre}`;
            }
        } else {
            this.elements.authSection.style.display = 'grid';
            this.elements.dashboardSection.style.display = 'none';
            this.elements.logoutBtn.style.display = 'none';
        }
    }
};

export default ui;
