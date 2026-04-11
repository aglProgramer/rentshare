/**
 * api-client.js — RentShare Frontend
 * 
 * Centraliza TODAS las llamadas fetch() al backend.
 * Incluye manejo robusto de errores con mensajes legibles en español.
 * Todos los endpoints usan async/await con try/catch centralizado.
 */

const API_BASE_URL = 'http://localhost:8080/api';

// ===========================
// Función base de fetch
// ===========================

/**
 * Ejecuta un fetch y parsea la respuesta.
 * Lanza errores descriptivos en español si el servidor falla.
 */
async function apiFetch(endpoint, method = 'GET', body = null, customHeaders = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
        ...customHeaders
    };

    // Se inyecta cabecera X-User-Id si el usuario está logueado
    const userJson = sessionStorage.getItem('rentshare_user');
    if (userJson) {
        const user = JSON.parse(userJson);
        headers['X-User-Id'] = user.id;
    }

    const config = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
    };

    try {
        const response = await fetch(url, config);

        // 204 No Content (ej: DELETE exitoso)
        if (response.status === 204) return null;

        const data = await response.json();

        if (!response.ok) {
            // El GlobalExceptionHandler del backend devuelve { status, error, mensaje, fieldErrors }
            const mensajeError = data?.mensaje || data?.error || 'Error desconocido del servidor';
            const statusCode   = data?.status  || response.status;
            const fieldErrors  = data?.fieldErrors || null;

            throw new ApiError(mensajeError, statusCode, fieldErrors);
        }

        return data;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error; // Re-lanzar errores ya procesados
        }

        // Error de red (servidor apagado, CORS, timeout, sin internet)
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new ApiError(
                '❌ No se puede conectar con el servidor. ¿Está corriendo el backend en http://localhost:8080?',
                0
            );
        }

        throw new ApiError(`Error de conexión: ${error.message}`, 0);
    }
}

// ===========================
// Clase de error personalizada
// ===========================
class ApiError extends Error {
    constructor(message, statusCode, fieldErrors = null) {
        super(message);
        this.name        = 'ApiError';
        this.status      = statusCode;
        this.fieldErrors = fieldErrors;
    }
}

// ===========================
// API de Gastos (Expenses)
// ===========================
const ExpenseAPI = {

    /**
     * Obtiene todos los gastos, ordenados por fecha descendente.
     * GET /api/expenses
     */
    async getAll() {
        return await apiFetch('/expenses');
    },

    /**
     * Obtiene un gasto específico por ID.
     * GET /api/expenses/:id
     */
    async getById(id) {
        return await apiFetch(`/expenses/${id}`);
    },

    /**
     * Crea un nuevo gasto.
     * POST /api/expenses
     * @param {Object} expenseData - { descripcion, monto, fecha, categoria, tipo, pagadoPorId, grupoId? }
     */
    async create(expenseData) {
        return await apiFetch('/expenses', 'POST', expenseData);
    },

    /**
     * Actualiza un gasto.
     * PUT /api/expenses/:id
     */
    async update(id, expenseData) {
        return await apiFetch(`/expenses/${id}`, 'PUT', expenseData);
    },

    /**
     * Elimina un gasto por ID.
     * DELETE /api/expenses/:id
     */
    async delete(id) {
        return await apiFetch(`/expenses/${id}`, 'DELETE');
    },
};

// ===========================
// Servicios Auth (AuthAPI)
// ===========================
const AuthAPI = {
    login: async (credentials) => {
        return await apiFetch('/auth/login', 'POST', credentials);
    },
    register: async (userData) => {
        return await apiFetch('/auth/register', 'POST', userData);
    }
};

// ===========================
// Servicios de Grupo (GroupAPI)
// ===========================
const GroupAPI = {
    getBalance: async () => {
        return await apiFetch('/groups/balance', 'GET');
    }
};

// ===========================
// Exportar para uso global
// ===========================
window.AuthAPI    = AuthAPI;
window.GroupAPI   = GroupAPI;
window.ExpenseAPI = ExpenseAPI;
window.ApiError   = ApiError;
