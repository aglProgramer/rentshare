const API_BASE = 'https://backend-rentshare-production.up.railway.app/api'; // Ajustar según despliegue

const apiClient = {
    getToken() {
        return localStorage.getItem('rentshare_token');
    },

    async request(method, endpoint, body = null) {
        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (response.status === 401) {
            localStorage.clear();
            window.location.reload();
        }
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error en la petición');
        }
        return response.status === 204 ? null : response.json();
    }
};

const AuthAPI = {
    login: (email, password) => apiClient.request('POST', '/auth/login', { email, password })
};

const GroupAPI = {
    getAll: () => apiClient.request('GET', '/groups'),
    create: (data) => apiClient.request('POST', '/groups', data)
};

const ExpenseAPI = {
    getAllByGroup: (groupId) => apiClient.request('GET', `/expenses?groupId=${groupId}`),
    create: (data) => apiClient.request('POST', '/expenses', data)
};
