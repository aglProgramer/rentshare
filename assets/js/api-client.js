/**
 * api-client.js — RentShare Frontend (Modo Cloud: SUPABASE)
 * 
 * ¡Modo NUBE Activado! Los datos ahora se sincronizan en tiempo real
 * con tu proyecto en Supabase.
 */

const SUPABASE_URL = "https://fcwbsbykxvsxwhkjvezg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjd2JzYnlreHZzeHdoa2p2ZXpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzQxNzQsImV4cCI6MjA5MTUxMDE3NH0.8XikD3kBqX0aSvInlOauB82B47DIjnoCtpM94BXJNqM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class ApiError extends Error {
    constructor(message, statusCode, fieldErrors = null) {
        super(message);
        this.name = 'ApiError';
        this.status = statusCode;
        this.fieldErrors = fieldErrors;
    }
}

// Helper para manejar usuarios en sesión
const Auth = {
    getUser: () => JSON.parse(sessionStorage.getItem('rentshare_user')),
    setUser: (user) => sessionStorage.setItem('rentshare_user', JSON.stringify(user)),
    clear: () => sessionStorage.clear()
};

// ===========================
// Servicios Auth (Supabase)
// ===========================
const AuthAPI = {
    async login(credentials) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
        });
        
        if (error) throw new ApiError('Usuario o contraseña incorrectos', 400);

        // Obtener el perfil extendido
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        const fullUser = { ...data.user, ...profile };
        Auth.setUser(fullUser);
        return { user: fullUser };
    },

    async register(userData) {
        const { data, error } = await supabaseClient.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    nombre: userData.nombre
                }
            }
        });

        if (error) throw new ApiError(error.message, 400);
        return { user: data.user };
    },

    async updateProfile(id, updateData) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new ApiError('Error al actualizar perfil', 400);
        
        const currentUser = Auth.getUser();
        Auth.setUser({ ...currentUser, ...data });
        return data;
    },

    async nuke() {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
    }
};

// ===========================
// Servicios de Gastos (Supabase)
// ===========================
const ExpenseAPI = {
    async getAll() {
        const user = Auth.getUser();
        if (!user) throw new ApiError('No autorizado', 401);

        const { data, error } = await supabaseClient
            .from('expenses')
            .select('*')
            .eq('invite_code', user.invite_code)
            .order('fecha', { ascending: false });

        if (error) throw new ApiError('Error al cargar gastos', 400);
        return data;
    },

    async create(expenseData) {
        const user = Auth.getUser();
        const { data, error } = await supabaseClient
            .from('expenses')
            .insert([{
                ...expenseData,
                pagado_por_id: user.id,
                pagado_por_nombre: user.nombre,
                invite_code: user.invite_code
            }])
            .select()
            .single();

        if (error) throw new ApiError(error.message, 400);
        return data;
    },

    async update(id, expenseData) {
        const { data, error } = await supabaseClient
            .from('expenses')
            .update(expenseData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new ApiError('Error al actualizar gasto', 400);
        return data;
    },

    async delete(id) {
        const { error } = await supabaseClient
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw new ApiError('Error al borrar gasto', 400);
        return true;
    }
};

// ===========================
// Servicios de Balance (Cloud logic)
// ===========================
const GroupAPI = {
    async getBalance() {
        const user = Auth.getUser();
        if (!user) return null;

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // 1. GASTO ACUMULADO TOTAL (Mes actual)
        // Usamos una consulta filtrada por fecha
        const { data: monthExpenses, error } = await supabaseClient
            .from('expenses')
            .select('*')
            .gte('fecha', `${currentYear}-${String(currentMonth).padStart(2,'0')}-01`)
            .lte('fecha', `${currentYear}-${String(currentMonth).padStart(2,'0')}-31`);

        if (error || !monthExpenses) return null;

        const totalGeneral = monthExpenses.reduce((sum, e) => sum + Number(e.monto || 0), 0);

        // 2. LÓGICA GRUPAL
        if (!user.invite_code || user.invite_code === '---') {
            return {
                totalGeneral,
                totalGrupal: 0,
                miAporte: 0,
                balancePesos: 0,
                isDeudor: false,
                balanceStatus: 'Sin Casa Activa',
                debts: []
            };
        }

        // Obtener miembros del grupo
        const { data: members } = await supabaseClient
            .from('profiles')
            .select('id, nombre')
            .eq('invite_code', user.invite_code);

        const groupExpenses = monthExpenses.filter(e => e.invite_code === user.invite_code && e.tipo === 'UNIFICADO');
        
        let totalGrupal = 0;
        let miAporte = 0;
        const balances = {};
        members.forEach(m => balances[m.id] = 0);

        groupExpenses.forEach(exp => {
            const amount = Number(exp.monto);
            totalGrupal += amount;
            if (exp.pagado_por_id === user.id) miAporte += amount;
            if (balances[exp.pagado_por_id] !== undefined) {
                balances[exp.pagado_por_id] += amount;
            }
        });

        const numMembers = members.length || 1;
        const fairShare = totalGrupal / numMembers;
        
        let miEstado = balances[user.id] - fairShare;
        let isDeudor = miEstado < -1;

        // Cálculos de deudas entre miembros (Algoritmo Greedy)
        const creditors = [];
        const debtors = [];
        members.forEach(m => {
            const net = balances[m.id] - fairShare;
            if (net > 1) creditors.push({ name: m.nombre, amount: net });
            else if (net < -1) debtors.push({ name: m.nombre, amount: Math.abs(net) });
        });

        const debts = [];
        let i = 0, j = 0;
        while (i < debtors.length && j < creditors.length) {
            let amount = Math.min(debtors[i].amount, creditors[j].amount);
            debts.push({ deudorNombre: debtors[i].name, acreedorNombre: creditors[j].name, monto: amount });
            debtors[i].amount -= amount;
            creditors[j].amount -= amount;
            if (debtors[i].amount <= 1) i++;
            if (creditors[j].amount <= 1) j++;
        }

        return {
            totalGeneral,
            totalGrupal,
            miAporte,
            balancePesos: Math.abs(miEstado),
            isDeudor,
            balanceStatus: isDeudor ? 'Debes dinero' : (miEstado > 1 ? 'Te deben dinero' : 'Vas al día'),
            debts
        };
    }
};

// Exportar a global para compatibilidad con código existente
window.AuthAPI    = AuthAPI;
window.ExpenseAPI = ExpenseAPI;
window.GroupAPI   = GroupAPI;
window.ApiError   = ApiError;
window.LocalDB    = { nuke: AuthAPI.nuke }; // Mock de LocalDB para compatibilidad
