// LOCAL: "http://localhost:8080/api/v1"
// PROD: "https://rentshare.onrender.com/api/v1"
const API_URL = "https://rentshare.onrender.com/api/v1";

const api = {
    getHeaders() {
        const h = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('rentshare_token');
        if (token) h['Authorization'] = `Bearer ${token}`;
        return h;
    },

    async request(endpoint, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: this.getHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.reload();
            throw new Error('Sesión expirada.');
        }

        const data = response.status === 204 ? null : await response.json();
        if (!response.ok) throw new Error(data?.message || 'Error en la petición');
        return data;
    },

    // AUTH
    login: (body) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body) => api.request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

    // USUARIOS
    getUsers: (page = 0, size = 10) => api.request(`/usuarios?page=${page}&size=${size}`),

    // GRUPOS
    crearGrupo: (body) => api.request('/grupos', { method: 'POST', body: JSON.stringify(body) }),
    misGrupos: () => api.request('/grupos/mis'),
    miembros: (grupoId) => api.request(`/grupos/${grupoId}/miembros`),
    generarInvitacion: (grupoId) => api.request(`/grupos/${grupoId}/invitacion`, { method: 'POST' }),
    solicitarUnion: (codigo) => api.request('/grupos/unirse', { method: 'POST', body: JSON.stringify({ codigo }) }),
    solicitudesPendientes: (grupoId) => api.request(`/grupos/${grupoId}/solicitudes`),
    responderSolicitud: (invId, aceptar) => api.request(`/grupos/solicitudes/${invId}/responder`, { method: 'POST', body: JSON.stringify({ aceptar }) }),
    balance: (grupoId) => api.request(`/grupos/${grupoId}/balance`),

    // GASTOS
    gastos: (grupoId, categoria = '', page = 0) => api.request(`/gastos?grupoId=${grupoId}&categoria=${categoria}&page=${page}&size=20&sort=fechaGasto,desc`),
    crearGasto: (body) => api.request('/gastos', { method: 'POST', body: JSON.stringify(body) }),
    eliminarGasto: (gastoId) => api.request(`/gastos/${gastoId}`, { method: 'DELETE' }),
    marcarPagado: (gastoId) => api.request(`/gastos/${gastoId}/pagar`, { method: 'PATCH' }),
};

export default api;
