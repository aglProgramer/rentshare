/**
 * ui-render.js — RentShare Frontend
 * 
 * Contiene toda la lógica de renderizado de la UI:
 * - Tabla de gastos (con datos del backend)
 * - Formulario de nuevo gasto
 * - Notificaciones toast
 * - Estadísticas del dashboard
 * - Manejo del estado de carga (skeleton loaders)
 */

// ===========================
// Sistema de Notificaciones Toast
// ===========================
const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    show(message, type = 'info', duration = 4000) {
        if (!this.container) {
            this.container = document.getElementById('toast-container');
            if (!this.container) {
                console.warn("Toast:", message);
                return;
            }
        }
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        const icons = {
            success: '✅',
            error:   '❌',
            warning: '⚠️',
            info:    'ℹ️',
        };

        toast.innerHTML = `
            <span class="toast__icon">${icons[type] || icons.info}</span>
            <span class="toast__message">${message}</span>
            <button class="toast__close" onclick="this.parentElement.remove()">✕</button>
        `;

        this.container.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => toast.classList.add('toast--visible'));

        // Auto-remover
        setTimeout(() => {
            toast.classList.remove('toast--visible');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success: (msg) => Toast.show(msg, 'success'),
    error:   (msg) => Toast.show(msg, 'error', 6000),
    warning: (msg) => Toast.show(msg, 'warning'),
    info:    (msg) => Toast.show(msg, 'info'),
};

// ===========================
// Formateadores
// ===========================
const Format = {
    /** Formatea un número como moneda colombiana */
    currency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style:    'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(amount);
    },

    /** Formatea una fecha ISO a dd/mm/yyyy */
    date(isoDate) {
        if (!isoDate) return '—';
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
    },
};

// ===========================
// Labels de Enums
// ===========================
const Labels = {
    categoria: {
        RENTA:    { text: 'Renta',    icon: '🏠', class: 'badge--renta'    },
        SERVICIO: { text: 'Servicio', icon: '⚡', class: 'badge--servicio' },
        MERCADO:  { text: 'Mercado',  icon: '🛒', class: 'badge--mercado'  },
        OTRO:     { text: 'Otro',     icon: '📦', class: 'badge--otro'     },
    },
    tipo: {
        INDIVIDUAL: { text: 'Individual', icon: '👤', class: 'badge--individual' },
        UNIFICADO:  { text: 'Unificado',  icon: '👥', class: 'badge--unificado'  },
    },
};

// ===========================
// Renderizado de Tabla de Gastos
// ===========================
const ExpenseTable = {
    tableBody: null,
    emptyState: null,
    totalEl: null,

    init() {
        this.tableBody  = document.getElementById('expenses-tbody');
        this.emptyState = document.getElementById('empty-state');
        this.totalEl    = document.getElementById('total-amount');

        // Event delegation para botones de editar y eliminar
        this.tableBody.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                 const id = deleteBtn.getAttribute('data-id');
                 if (id) UI.deleteExpense(id);
                 return;
            }
            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                 const id = editBtn.getAttribute('data-id');
                 if (id) UI.editExpense(id);
            }
        });
    },

    /** Muestra skeleton loaders mientras carga */
    showSkeleton(rows = 5) {
        this.tableBody.innerHTML = Array(rows).fill(`
            <tr class="skeleton-row">
                ${Array(6).fill('<td><div class="skeleton"></div></td>').join('')}
            </tr>
        `).join('');
    },

    /** Renderiza la lista de gastos en la tabla */
    render(expenses) {
        if (!expenses || expenses.length === 0) {
            this.tableBody.innerHTML = '';
            this.emptyState.style.display = 'flex';
            this.updateTotals([]);
            return;
        }

        this.emptyState.style.display = 'none';

        this.tableBody.innerHTML = expenses.map(expense => {
            const cat   = Labels.categoria[expense.categoria] || Labels.categoria.OTRO;
            const tipo  = Labels.tipo[expense.tipo]           || Labels.tipo.INDIVIDUAL;
            
            const badgeTypeClass = expense.tipo === 'INDIVIDUAL' ? 'badge-tipo-ind' : 'badge-tipo-uni';
            
            return `
            <tr class="expense-row" data-id="${expense.id}">
                <td>
                    <div class="expense-desc">
                        <span class="expense-desc__icon">${cat.icon}</span>
                        <span class="expense-desc__text">${expense.descripcion}</span>
                    </div>
                </td>
                <td>
                    <span class="amount">${Format.currency(expense.monto)}</span>
                </td>
                <td>
                    <span class="badge ${cat.class}">${cat.text}</span>
                </td>
                <td>
                    <span class="badge ${tipo.class}">${tipo.icon} ${tipo.text}</span>
                </td>
                <td>
                    <div class="user-chip">
                        <span class="user-chip__avatar">${expense.pagadoPorNombre?.charAt(0) || '?'}</span>
                        <span class="user-chip__name">${expense.pagadoPorNombre || '—'}</span>
                    </div>
                </td>
                <td class="date-cell">${Format.date(expense.fecha)}</td>
                <td>
                    <button class="btn-icon btn-edit" data-id="${expense.id}" title="Editar gasto">✏️</button>
                    <button class="btn-delete" data-id="${expense.id}" title="Eliminar gasto">🗑️</button>
                </td>
            </tr>`;
        }).join('');

        this.updateTotals(expenses);
    },

    /** Actualiza el panel de totales y estadísticas */
    updateTotals(expenses) {
        const total = expenses.reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);

        if (this.totalEl) {
            this.totalEl.textContent = Format.currency(total);
        }

        // Actualizar stats cards
        const updateStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        updateStat('stat-total-count', expenses.length);
        updateStat('stat-shared-amount',
            Format.currency(
                expenses.filter(e => e.tipo === 'UNIFICADO')
                        .reduce((s, e) => s + parseFloat(e.monto), 0)
            )
        );
        updateStat('stat-individual-count',
            expenses.filter(e => e.tipo === 'INDIVIDUAL').length
        );
    },
};

// ===========================
// Controlador principal de la UI
// ===========================
const UI = {
    isLoading: false,
    currentEditId: null,

    /** Inicializa toda la UI */
    async init() {
        Toast.init();
        ExpenseTable.init();
        this.setupForm();
        this.renderUserInfo();
        await this.loadExpenses();
        await this.loadBalance();
    },

    /** Carga y renderiza el resumen de deuda */
    async loadBalance() {
        try {
            const balance = await GroupAPI.getBalance();
            if (!balance) return;
            
            document.getElementById('stat-total-grupal').textContent = Format.currency(balance.totalGrupal);
            document.getElementById('stat-tu-aporte').textContent = Format.currency(balance.tuAporte);
            
            const cardBalance = document.getElementById('card-tu-balance');
            const statBalance = document.getElementById('stat-tu-balance');
            const labelBalance = document.getElementById('label-tu-balance');
            
            statBalance.textContent = Format.currency(Math.abs(balance.tuBalance));
            
            if (balance.tuBalance > 0) {
                cardBalance.style.borderColor = 'var(--success)';
                statBalance.className = 'stat-card__value text-success';
                labelBalance.textContent = '🌟 Te deben dinero';
            } else if (balance.tuBalance < 0) {
                cardBalance.style.borderColor = 'var(--danger)';
                statBalance.className = 'stat-card__value text-danger';
                labelBalance.textContent = '⚠️ Debes dinero';
            } else {
                cardBalance.style.borderColor = 'var(--accent)';
                statBalance.className = 'stat-card__value text-accent';
                labelBalance.textContent = '✅ Vas al día';
            }
            
            // Settlement Section 
            const settlementSection = document.getElementById('settlement-section');
            const deudasList = document.getElementById('deudas-list');
            
            if (balance.detallesDeuda && balance.detallesDeuda.length > 0) {
                settlementSection.style.display = 'block';
                deudasList.innerHTML = balance.detallesDeuda.map(d => 
                    `<li style="padding:12px; background:var(--bg-900); border-radius:8px; border-left: 4px solid var(--accent); margin-bottom: 8px;">
                     👤 <strong>${d.deudor}</strong> debe pagarle a <strong>${d.acreedor}</strong>: <span class="text-accent fw-bold" style="font-size: 1.1em">${Format.currency(d.monto)}</span>
                     </li>`
                ).join('');
            } else {
                 settlementSection.style.display = 'none';
            }
        } catch (err) {
            console.error('Error al cargar balance:', err);
        }
    },

    /** Renderiza info del usuario en la sesión */
    renderUserInfo() {
        const user = Auth.getUser();
        if (!user) return;

        const avatarEl = document.getElementById('user-avatar');
        const nameEl   = document.getElementById('user-name');
        
        if (avatarEl) {
            if (user.avatar) {
                 avatarEl.innerHTML = `<img src="${user.avatar}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
                 avatarEl.style.padding = "0"; // Quitar padding si la imagen cubre todo el chip
            } else {
                 avatarEl.textContent = user.nombre?.charAt(0) || '?';
            }
        }
        
        if (nameEl) nameEl.textContent = user.nombre;

        // Poblar select de "pagado por" con el usuario actual logueado
        // (En una app completa aquí se pediría /api/groups/members al backend)
        const select = document.getElementById('pagado-por');
        if (select) {
            select.innerHTML = '';
            const opt = document.createElement('option');
            opt.value       = user.id;
            opt.textContent = user.nombre + " (Yo)";
            opt.selected    = true;
            select.appendChild(opt);
        }
    },

    /** Carga gastos desde el backend */
    async loadExpenses() {
        ExpenseTable.showSkeleton();
        try {
            const expenses = await ExpenseAPI.getAll();
            ExpenseTable.render(expenses);
        } catch (error) {
            ExpenseTable.render([]);
            Toast.error(error.message);
        }
    },

    /** Configura el formulario de nuevo gasto */
    setupForm() {
        const form = document.getElementById('expense-form');
        if (!form) return;

        // Fecha por defecto: hoy
        const fechaInput = document.getElementById('fecha');
        if (fechaInput) {
            fechaInput.value = new Date().toISOString().split('T')[0];
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitExpense(form);
        });

        // Configurar formulario del Perfil
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                 e.preventDefault();
                 await this.submitProfile(profileForm);
            });
        }
    },

    /** Procesa el submit del formulario */
    async submitExpense(form) {
        if (this.isLoading) return;
        this.isLoading = true;

        // Limpieza de feedback de errores visuales de la ocasión anterior
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());

        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Guardando...';
        submitBtn.disabled = true;

        try {
            const data = {
                descripcion: document.getElementById('descripcion').value.trim(),
                monto:       parseFloat(document.getElementById('monto').value),
                fecha:       document.getElementById('fecha').value,
                categoria:   document.getElementById('categoria').value,
                tipo:        document.getElementById('tipo').value,
                pagadoPorId: parseInt(document.getElementById('pagado-por').value),
                grupoId:     1, // Grupo por defecto para desarrollo
            };

            if (this.currentEditId) {
                await ExpenseAPI.update(this.currentEditId, data);
                Toast.success(`✅ Gasto actualizado exitosamente`);
            } else {
                const created = await ExpenseAPI.create(data);
                Toast.success(`✅ Gasto "${created.descripcion}" registrado exitosamente`);
            }

            form.reset();
            document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
            this.currentEditId = null;

            // Recargar tabla
            await this.loadExpenses();

            // Cerrar modal si existe
            const modal = document.getElementById('expense-modal');
            if (modal) modal.classList.remove('modal--open');

        } catch (error) {
            if (error.status === 400 && error.fieldErrors) {
                Toast.warning(`⚠️ Por favor, revisa los campos señalados en rojo.`);
                
                // Mapeo enriquecido - Backend DTO -> Frontend DOM
                Object.entries(error.fieldErrors).forEach(([field, msg]) => {
                    const inputElement = document.getElementById(field);
                    if (inputElement) {
                        inputElement.classList.add('is-invalid'); // Añade borde rojo
                        
                        // Creación dinámica del helper text de error
                        const errorFeedback = document.createElement('div');
                        errorFeedback.className = 'invalid-feedback';
                        errorFeedback.textContent = msg; // Ej: "El monto no puede ser negativo"
                        
                        inputElement.parentNode.appendChild(errorFeedback);
                    }
                });
            } else if (error.status === 400) {
                Toast.warning(`⚠️ Datos inválidos: ${error.message}`);
            } else if (error.status === 0) {
                Toast.error(error.message);
            } else {
                Toast.error(`Error al guardar: ${error.message}`);
            }
        } finally {
            this.isLoading = false;
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    },

    async deleteExpense(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) return;

        try {
            await ExpenseAPI.delete(id);
            Toast.success('Gasto eliminado correctamente');
            await this.loadExpenses();
            await this.loadBalance();
        } catch (error) {
            Toast.error(`No se pudo eliminar: ${error.message}`);
        }
    },

    /** Carga los datos de un gasto para editarlo */
    async editExpense(id) {
        try {
            const expense = await ExpenseAPI.getById(id);
            this.currentEditId = id;
            
            document.getElementById('modal-title').textContent = '✏️ Editar Gasto';
            document.getElementById('descripcion').value = expense.descripcion;
            document.getElementById('monto').value = Math.abs(expense.monto);
            
            // Format date for inputs (YYYY-MM-DD): The API already returns it formatted if it's LocalDate without time.
            document.getElementById('fecha').value = expense.fecha;
            
            document.getElementById('categoria').value = expense.categoria; 
            document.getElementById('tipo').value = expense.tipo;
            document.getElementById('pagado-por').value = expense.pagadoPorId;
            
            const btn = document.getElementById('submit-expense-btn');
            if (btn) btn.innerHTML = '🔄 Actualizar Gasto';
            
            const modal = document.getElementById('expense-modal');
            if (!modal.classList.contains('modal--open')) {
                modal.classList.add('modal--open');
            }
        } catch(e) {
            Toast.error('No se pudo cargar el gasto');
        }
    },

    /** Abre y cierra el modal de nuevo gasto */
    toggleModal() {
        const modal = document.getElementById('expense-modal');
        if (modal.classList.contains('modal--open')) {
            // closing => reset the form to "create" state
            this.currentEditId = null;
            const form = document.getElementById('expense-form');
            if (form) {
                form.reset();
                form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
                form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
            }
            document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
            document.getElementById('modal-title').textContent = '✚ Nuevo Gasto';
            const btn = document.getElementById('submit-expense-btn');
            if (btn) btn.innerHTML = '💾 Guardar Gasto';
        }
        modal.classList.toggle('modal--open');
    },

    // ================== PERFIL MODULE ==================
    toggleProfile() {
        const modal = document.getElementById('profile-modal');
        if (!modal.classList.contains('modal--open')) {
            const user = Auth.getUser();
            document.getElementById('profile-nombre').value = user.nombre || '';
            document.getElementById('profile-celular').value = user.celular || '';
            document.getElementById('profile-direccion').value = user.direccion || '';
            document.getElementById('profile-inviteCode').value = user.inviteCode || '';
            
            const preview = document.getElementById('profile-avatar-preview');
            // Mock de silueta base si no hay foto
            preview.src = user.avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ecf0f1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
        }
        modal.classList.toggle('modal--open');
    },

    previewAvatar(event) {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 500 * 1024) { 
                Toast.error("⚠️ La imagen supera el umbral límite de 500 KB de este dispositivo. Por favor, recórtala.");
                event.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('profile-avatar-preview').src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    },

    async submitProfile(form) {
        if (this.isLoading) return;
        this.isLoading = true;
        
        const btn = form.querySelector('[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Guardando...';
        btn.disabled = true;

        try {
            const user = Auth.getUser();
            const previewSrc = document.getElementById('profile-avatar-preview').src;
            
            const data = {
                nombre: document.getElementById('profile-nombre').value.trim(),
                celular: document.getElementById('profile-celular').value.trim(),
                direccion: document.getElementById('profile-direccion').value.trim(),
                inviteCode: document.getElementById('profile-inviteCode').value.trim(),
                avatar: previewSrc.startsWith('data:image/svg') ? null : previewSrc
            };
            
            await AuthAPI.updateProfile(user.id, data);
            
            Toast.success('Perfil actualizado correctamente y sincronizado ✨');
            
            this.toggleProfile();
            this.renderUserInfo();
            
            // Refrescar página para empujar recálculo completo del grupo
            document.getElementById('invite-code-display').textContent = data.inviteCode;
            await this.loadExpenses();
            await this.loadBalance();
        } catch(e) {
            Toast.error(e.message);
        } finally {
            this.isLoading = false;
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }
};

window.UI = UI;
window.Toast = Toast;
