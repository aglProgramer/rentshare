/**
 * API Module
 * Handles all network requests with JWT support.
 */

// LOCAL: "http://localhost:8080/api/v1"
// PROD: "https://tu-backend.onrender.com/api/v1"
const API_URL = "http://localhost:8080/api/v1";

const api = {
    /**
     * Get headers with Authorization if token exists
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = localStorage.getItem('rentshare_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    /**
     * Base request wrapper
     */
    async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders()
        };

        try {
            const response = await fetch(url, config);
            
            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid
                localStorage.removeItem('rentshare_token');
                localStorage.removeItem('rentshare_user');
                window.location.reload();
                throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.');
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error en la petición');
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    /**
     * Auth Endpoints
     */
    login: (credentials) => api.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    register: (userData) => api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    /**
     * User Endpoints
     */
    getUsers: (page = 0, size = 10) => api.request(`/usuarios?page=${page}&size=${size}`)
};

export default api;
