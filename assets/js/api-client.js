/**
 * api-client.js — RentShare Frontend (Modo LocalStorage / GitHub Pages)
 * 
 * ¡Modo Serverless Activado! Todo el backend de Java ha sido sustituido por 
 * una base de datos local en el navegador del usuario usando LocalStorage.
 * Esto hace la app 100% estática y funcional gratis para siempre en Github Pages.
 */

class ApiError extends Error {
    constructor(message, statusCode, fieldErrors = null) {
        super(message);
        this.name = 'ApiError';
        this.status = statusCode;
        this.fieldErrors = fieldErrors;
    }
}

// Simulador de Base de Datos
const LocalDB = {
    load: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    save: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    
    get users() { return this.load('rentshare_users'); },
    set users(data) { this.save('rentshare_users', data); },
    
    get expenses() { return this.load('rentshare_expenses'); },
    set expenses(data) { this.save('rentshare_expenses', data); },

    getCurrentUser: () => JSON.parse(sessionStorage.getItem('rentshare_user'))
};

// Generador de Códigos
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// Simulador de retraso de red (UX suave)
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));


// ===========================
// Servicios Auth
// ===========================
const AuthAPI = {
    login: async (credentials) => {
        await delay();
        const users = LocalDB.users;
        const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
        
        if (!user) throw new ApiError('Credenciales incorrectas', 400);

        // Ocultar contraseña en el token
        const tokenUser = { ...user };
        delete tokenUser.password;
        return { user: tokenUser, token: "local-jwt-token" };
    },

    register: async (userData) => {
        await delay();
        const users = LocalDB.users;
        if (users.find(u => u.email === userData.email)) {
            throw new ApiError('❌ El correo electrónico ya está registrado', 400);
        }

        const newUser = {
            id: Date.now(),
            nombre: userData.nombre,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'MEMBER',
            inviteCode: userData.inviteCode || generateCode()
        };

        if (!userData.inviteCode) {
            newUser.role = 'ADMIN'; // Creadores de grupos nuevos siempre son admin
        }

        users.push(newUser);
        LocalDB.users = users;

        const tokenUser = { ...newUser };
        delete tokenUser.password;
        return { user: tokenUser, token: "local-jwt-token" };
    },

    updateProfile: async (id, data) => {
        await delay();
        const users = LocalDB.users;
        const index = users.findIndex(u => u.id === id);
        if (index === -1) throw new ApiError('Usuario no encontrado', 404);
        
        users[index] = { ...users[index], ...data };
        LocalDB.users = users;

        const tokenUser = { ...users[index] };
        delete tokenUser.password;
        sessionStorage.setItem('rentshare_user', JSON.stringify(tokenUser));
        return tokenUser;
    }
};

// ===========================
// Servicios de Gastos
// ===========================
const ExpenseAPI = {
    async getAll() {
        await delay();
        const me = LocalDB.getCurrentUser();
        if (!me) throw new ApiError('No autorizado', 401);

        const all = LocalDB.expenses;
        // Solo retornar gastos del mismo Code Group y ordenados por fecha descendente
        return all
            .filter(e => e.inviteCode === me.inviteCode)
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    },

    async getById(id) {
        await delay();
        const expense = LocalDB.expenses.find(e => e.id === Number(id));
        if (!expense) throw new ApiError('Gasto no encontrado', 404);
        return expense;
    },

    async create(data) {
        await delay();
        const me = LocalDB.getCurrentUser();
        
        if (data.monto <= 0) {
            throw new ApiError('Datos inválidos', 400, { monto: "El monto no puede ser negativo o cero" });
        }

        const expense = {
            id: Date.now(),
            ...data,
            monto: parseFloat(data.monto),
            pagadoPorId: me.id,
            pagadoPorNombre: me.nombre,
            inviteCode: me.inviteCode
        };

        const list = LocalDB.expenses;
        list.push(expense);
        LocalDB.expenses = list;
        return expense;
    },

    async update(id, data) {
        await delay();
        const me = LocalDB.getCurrentUser();
        const list = LocalDB.expenses;
        const index = list.findIndex(e => e.id === Number(id));
        
        if (index === -1) throw new ApiError('Gasto no encontrado', 404);
        
        const oldExpense = list[index];

        // Fix de seguridad de asignación de IDs: Preserve true Ownership origin
        list[index] = { 
            ...oldExpense, 
            ...data, 
            monto: parseFloat(data.monto), 
            pagadoPorId: oldExpense.pagadoPorId, // Nunca sobrescribir con parseInt desbordados de la UI
            pagadoPorNombre: oldExpense.pagadoPorNombre
        };
        LocalDB.expenses = list;
        return list[index];
    },

    async delete(id) {
        await delay();
        const me = LocalDB.getCurrentUser();
        const list = LocalDB.expenses;
        const index = list.findIndex(e => e.id === Number(id));
        
        if (index === -1) throw new ApiError('Gasto no encontrado', 404);
        
        const oldExpense = list[index];

        list.splice(index, 1);
        LocalDB.expenses = list;
        return null;
    }
};

// ===========================
// Simulación Algoritmo de Conciliación y Deudas (Backend Ported a JS)
// ===========================
const GroupAPI = {
    async getBalance() {
        await delay();
        const currentUser = LocalDB.getCurrentUser();
        const groupCode = currentUser.inviteCode;
        
        if (!groupCode) return { totalGrupal: 0, miAporte: 0, balancePesos: 0, isDeudor: false, balanceStatus: 'Sin Grupo', debts: [] };

        const groupExpenses = LocalDB.expenses.filter(e => e.inviteCode === groupCode);
        const groupUsers = LocalDB.users.filter(u => u.inviteCode === groupCode);
        
        let totalGrupal = 0;
        let miAporte = 0;
        
        // Inicializar balances de usuarios
        const balances = {}; 
        groupUsers.forEach(u => balances[u.id] = 0);
        
        groupExpenses.forEach(exp => {
            const amount = parseFloat(exp.monto);
            totalGrupal += amount;
            if (exp.pagadoPorId === currentUser.id) miAporte += amount;
            
            if (balances[exp.pagadoPorId] !== undefined) {
                balances[exp.pagadoPorId] += amount;
            }
        });
        
        const numMembers = groupUsers.length || 1;
        const fairShare = totalGrupal / numMembers; // Cota Justa
        
        let miEstado = 0;
        let balanceStatus = "Vas al día";
        let isDeudor = false;
        
        const creditors = []; 
        const debtors = [];
        
        for (const userId of Object.keys(balances)) {
            const id = parseInt(userId);
            const net = balances[id] - fairShare; // Positivo = Le Deben. Negativo = El debe.
            const userObj = groupUsers.find(u => u.id === id);
            
            if (id === currentUser.id) {
                miEstado = net;
                if (net <= -1) {
                    balanceStatus = "Debes dinero";
                    isDeudor = true;
                } else if (net >= 1) {
                    balanceStatus = "Te deben dinero";
                }
            }
            
            if (net > 0.01) creditors.push({ id, name: userObj.nombre, amount: net });
            else if (net < -0.01) debtors.push({ id, name: userObj.nombre, amount: Math.abs(net) });
        }
        
        // Algoritmo Greedy de Simplificación de Deudas
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);
        
        const debts = [];
        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            let debtor = debtors[i];
            let creditor = creditors[j];
            
            let amount = Math.min(debtor.amount, creditor.amount);
            
            if (amount > 0.01) {
                debts.push({
                    deudorNombre: debtor.name,
                    acreedorNombre: creditor.name,
                    monto: amount,
                    isMiDeuda: (debtor.id === currentUser.id) || (creditor.id === currentUser.id)
                });
            }
            
            debtor.amount -= amount;
            creditor.amount -= amount;
            
            if (debtor.amount < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }
        
        return {
            totalGrupal,
            miAporte,
            balancePesos: isDeudor ? Math.abs(miEstado) : miEstado, // Enviar en absoluto si es deuda para UI
            isDeudor,
            balanceStatus,
            debts
        };
    }
};

window.AuthAPI    = AuthAPI;
window.GroupAPI   = GroupAPI;
window.ExpenseAPI = ExpenseAPI;
window.ApiError   = ApiError;
