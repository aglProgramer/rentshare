/**
 * main.js — Orquestador principal de RentShare
 */
import api from './modules/api.js';
import ui from './modules/ui.js';

// ─── Estado de la app ───────────────────────────────────────
let currentUser = null;
let currentGrupo = null;
let currentMiembros = [];
let currentCat = '';

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('rentshare_token');
    currentUser = JSON.parse(localStorage.getItem('rentshare_user') || 'null');

    if (token && currentUser) {
        ui.showDashboard();
        loadDashboard();
    } else {
        ui.showAuth();
    }

    initAuth();
    initDashboard();
    initGrupo();
    initTareas();
    initInventario();
    initReportes();
    initModales();
});

// ─── AUTH ────────────────────────────────────────────────────
function initAuth() {
    // Tabs login/register
    // Helper para reCAPTCHA Enterprise
    async function getCaptchaToken(action) {
        if (!window.grecaptcha || !grecaptcha.enterprise) {
            console.error('reCAPTCHA Enterprise not loaded');
            return null;
        }
        return new Promise((resolve) => {
            grecaptcha.enterprise.ready(async () => {
                try {
                    const token = await grecaptcha.enterprise.execute('6Lfrd-EsAAAAADV0hu4mT3ztOeJk8fZfmdO838JW', { action });
                    resolve(token);
                } catch (e) {
                    console.error('reCAPTCHA execution failed', e);
                    resolve(null);
                }
            });
        });
    }

    document.getElementById('tabLoginBtn').addEventListener('click', () => {
        document.getElementById('loginPanel').style.display = 'block';
        document.getElementById('registerPanel').style.display = 'none';
        document.getElementById('tabLoginBtn').classList.add('active');
        document.getElementById('tabRegisterBtn').classList.remove('active');
    });
    document.getElementById('tabRegisterBtn').addEventListener('click', () => {
        document.getElementById('loginPanel').style.display = 'none';
        document.getElementById('registerPanel').style.display = 'block';
        document.getElementById('tabLoginBtn').classList.remove('active');
        document.getElementById('tabRegisterBtn').classList.add('active');
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            ui.loading(true);
            const captcha = await getCaptchaToken('LOGIN');
            if (!captcha) {
                ui.toast('Error de verificación (Captcha)', 'error');
                return;
            }

            const res = await api.login({
                email: e.target.loginEmail.value,
                password: e.target.loginPassword.value,
                captchaToken: captcha
            });
            localStorage.setItem('rentshare_token', res.token);
            localStorage.setItem('rentshare_user', JSON.stringify(res.usuario));
            currentUser = res.usuario;
            ui.showDashboard();
            loadDashboard();
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            ui.loading(true);
            const captcha = await getCaptchaToken('REGISTER');
            if (!captcha) {
                ui.toast('Error de verificación (Captcha)', 'error');
                return;
            }

            await api.register({
                nombre: e.target.regNombre.value,
                email: e.target.regEmail.value,
                password: e.target.regPassword.value,
                captchaToken: captcha
            });
            ui.toast('Cuenta creada. Ahora inicia sesión.');
            e.target.reset();
            document.getElementById('tabLoginBtn').click();
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        currentUser = null;
        currentGrupo = null;
        ui.showAuth();
    });
}

// ─── DASHBOARD ───────────────────────────────────────────────
function initDashboard() {
    // Clic en grupo
    document.getElementById('gruposList').addEventListener('click', (e) => {
        const card = e.target.closest('.grupo-card');
        if (!card || !card.dataset.id || card.dataset.id === 'undefined') return;
        
        currentGrupo = { id: card.dataset.id, nombre: card.dataset.nombre, rolActual: card.dataset.rol };
        ui.showGrupo(currentGrupo);
        document.getElementById('breadcrumb').onclick = () => { ui.showDashboard(); loadDashboard(); };
        loadGrupo(currentGrupo.id);
    });

    // Nuevo grupo modal
    document.getElementById('btnNuevoGrupo').addEventListener('click', () => {
        document.getElementById('modalGrupo').style.display = 'flex';
    });

    // Unirse a grupo
    document.getElementById('unirseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const codigo = document.getElementById('codigoInvitacion').value.trim();
        if (!codigo) return;
        try {
            ui.loading(true);
            await api.solicitarUnion(codigo);
            ui.toast('¡Solicitud enviada! El admin debe aprobarla.', 'warning');
            document.getElementById('codigoInvitacion').value = '';
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });
}

async function loadDashboard() {
    try {
        ui.loading(true);
        const grupos = await api.misGrupos();
        ui.renderGrupos(grupos);
        ui.renderStats(grupos);
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
}

// ─── GRUPO ───────────────────────────────────────────────────
function initGrupo() {
    document.getElementById('tabGastos').addEventListener('click', () => {
        hideAllTabs();
        document.getElementById('gastosList').style.display = 'block';
        document.getElementById('filtrosGastos').style.display = 'flex';
        document.getElementById('tabGastos').classList.add('active');
        if (currentGrupo) loadGastos(currentGrupo.id, currentCat);
    });

    document.getElementById('tabMiembros').addEventListener('click', async () => {
        hideAllTabs();
        document.getElementById('miembrosList').style.display = 'block';
        document.getElementById('tabMiembros').classList.add('active');
        if (currentGrupo) {
            try {
                const miembros = await api.miembros(currentGrupo.id);
                ui.renderMiembros(miembros);
            } catch (err) { ui.toast(err.message, 'error'); }
        }
    });

    document.getElementById('tabTareas').addEventListener('click', () => {
        hideAllTabs();
        document.getElementById('tareasList').style.display = 'block';
        document.getElementById('tabTareas').classList.add('active');
        if (currentGrupo) loadTareas(currentGrupo.id);
    });

    document.getElementById('tabInventario').addEventListener('click', () => {
        hideAllTabs();
        document.getElementById('inventarioSection').style.display = 'block';
        document.getElementById('tabInventario').classList.add('active');
        if (currentGrupo) loadInventario(currentGrupo.id);
    });

    document.getElementById('tabReportes').addEventListener('click', () => {
        hideAllTabs();
        document.getElementById('reportesSection').style.display = 'block';
        document.getElementById('tabReportes').classList.add('active');
        if (currentGrupo) loadReportes(currentGrupo.id);
    });

    function hideAllTabs() {
        ['gastosList', 'filtrosGastos', 'miembrosList', 'tareasList', 'inventarioSection', 'reportesSection'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        document.querySelectorAll('.tabs .tab-btn').forEach(b => b.classList.remove('active'));
    }

    // Filtros categoría
    document.getElementById('filtrosGastos').addEventListener('click', (e) => {
        const btn = e.target.closest('.filtro-btn');
        if (!btn) return;
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCat = btn.dataset.cat;
        if (currentGrupo) loadGastos(currentGrupo.id, currentCat);
    });

    // Balance
    document.getElementById('btnVerBalance').addEventListener('click', async () => {
        if (!currentGrupo) return;
        try {
            ui.loading(true);
            const bal = await api.balance(currentGrupo.id);
            ui.renderBalance(bal);
            document.getElementById('modalBalance').style.display = 'flex';
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });

    // Generar invitación (admin)
    document.getElementById('btnGenInvitacion').addEventListener('click', async () => {
        if (!currentGrupo) return;
        try {
            ui.loading(true);
            const res = await api.generarInvitacion(currentGrupo.id);
            navigator.clipboard.writeText(res.codigo).catch(() => {});
            ui.toast(`Código copiado: ${res.codigo.substring(0,16)}...`, 'success');
            alert(`Comparte este código de invitación:\n\n${res.codigo}\n\nVigencia: 24 horas`);
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });

    // Ver solicitudes pendientes (admin)
    document.getElementById('btnSolicitudes').addEventListener('click', async () => {
        if (!currentGrupo) return;
        try {
            ui.loading(true);
            const solicitudes = await api.solicitudesPendientes(currentGrupo.id);
            if (!solicitudes.length) { ui.toast('No hay solicitudes pendientes.'); return; }
            const lista = solicitudes.map(s => `${s.solicitanteNombre} (${s.solicitanteEmail})`).join('\n');
            const respuesta = confirm(`Solicitudes pendientes:\n\n${lista}\n\n¿Aceptar todas?`);
            if (respuesta) {
                for (const s of solicitudes) {
                    await api.responderSolicitud(s.id, true);
                }
                ui.toast('Solicitudes aceptadas.');
            }
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });

    // Nuevo gasto
    document.getElementById('btnNuevoGasto').addEventListener('click', async () => {
        if (!currentGrupo) return;
        try {
            currentMiembros = await api.miembros(currentGrupo.id);
            const monto = document.getElementById('gMonto').value || 0;
            ui.renderDivisiones(currentMiembros, monto);
            document.getElementById('gFecha').value = new Date().toISOString().split('T')[0];
            document.getElementById('modalGasto').style.display = 'flex';
        } catch (err) {
            ui.toast(err.message, 'error');
        }
    });

    // Dividir igual automáticamente
    document.getElementById('btnDividirIgual').addEventListener('click', () => {
        const monto = parseFloat(document.getElementById('gMonto').value) || 0;
        const checks = document.querySelectorAll('#divisionesContainer input[type=checkbox]:checked');
        const parte = (monto / checks.length).toFixed(2);
        checks.forEach(chk => {
            const uid = chk.id.replace('chk_', '');
            const amtInput = document.getElementById(`amt_${uid}`);
            if (amtInput) amtInput.value = parte;
        });
    });

    // Recalcular al cambiar monto
    document.getElementById('gMonto').addEventListener('input', () => {
        if (currentMiembros.length) {
            const monto = parseFloat(document.getElementById('gMonto').value) || 0;
            const checks = document.querySelectorAll('#divisionesContainer input[type=checkbox]:checked');
            if (checks.length) {
                const parte = (monto / checks.length).toFixed(2);
                checks.forEach(chk => {
                    const uid = chk.id.replace('chk_', '');
                    const amtInput = document.getElementById(`amt_${uid}`);
                    if (amtInput) amtInput.value = parte;
                });
            }
        }
    });
}

async function loadGrupo(grupoId) {
    currentCat = '';
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filtro-btn[data-cat=""]').classList.add('active');
    loadGastos(grupoId, '');
    currentMiembros = await api.miembros(grupoId);
}

async function loadGastos(grupoId, categoria) {
    try {
        ui.loading(true);
        const page = await api.gastos(grupoId, categoria);
        ui.renderGastos(page.content || [], currentUser?.id);
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
}

// ─── TAREAS ──────────────────────────────────────────────────
function initTareas() {
    document.getElementById('btnNuevaTarea').onclick = async () => {
        const miembros = await api.miembros(currentGrupo.id);
        const sel = document.getElementById('tAsignadoA');
        sel.innerHTML = '<option value="">Sin asignar</option>' + 
            miembros.map(m => `<option value="${m.usuarioId}">${m.nombre}</option>`).join('');
        document.getElementById('modalTarea').style.display = 'flex';
    };

    document.getElementById('tareaForm').onsubmit = async (e) => {
        e.preventDefault();
        const body = {
            grupoId: currentGrupo.id,
            titulo: document.getElementById('tTitulo').value,
            descripcion: document.getElementById('tDescripcion').value,
            fechaVencimiento: document.getElementById('tVencimiento').value || null,
            asignadoAId: document.getElementById('tAsignadoA').value || null
        };
        try {
            ui.loading(true);
            await api.crearTarea(body);
            ui.toast('Tarea creada ✅');
            document.getElementById('modalTarea').style.display = 'none';
            e.target.reset();
            loadTareas(currentGrupo.id);
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    };
}

async function loadTareas(grupoId) {
    try {
        ui.loading(true);
        const res = await api.tareas(grupoId);
        ui.renderTareas(res);
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
}

// ─── INVENTARIO ──────────────────────────────────────────────
function initInventario() {
    document.getElementById('btnNuevoItem').onclick = () => {
        document.getElementById('modalInventario').style.display = 'flex';
    };

    document.getElementById('inventarioForm').onsubmit = async (e) => {
        e.preventDefault();
        const body = {
            grupoId: currentGrupo.id,
            nombre: document.getElementById('iNombre').value,
            cantidad: parseFloat(document.getElementById('iCantidad').value),
            unidad: document.getElementById('iUnidad').value,
            stockMinimo: parseFloat(document.getElementById('iStockMinimo').value)
        };
        try {
            ui.loading(true);
            await api.guardarItem(body);
            ui.toast('Item guardado ✅');
            document.getElementById('modalInventario').style.display = 'none';
            e.target.reset();
            loadInventario(currentGrupo.id);
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    };
}

async function loadInventario(grupoId) {
    try {
        ui.loading(true);
        const res = await api.inventario(grupoId);
        ui.renderInventario(res);
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
}

// ─── REPORTES ───────────────────────────────────────────────
function initReportes() {}

async function loadReportes(grupoId) {
    try {
        ui.loading(true);
        const res = await api.stats(grupoId);
        ui.renderReportes(res);
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
}

// ─── MODALES ─────────────────────────────────────────────────
function initModales() {
    // Cerrar modales
    document.getElementById('closeModalGasto').onclick = () =>
        document.getElementById('modalGasto').style.display = 'none';
    document.getElementById('closeModalBalance').onclick = () =>
        document.getElementById('modalBalance').style.display = 'none';
    document.getElementById('closeModalGrupo').onclick = () =>
        document.getElementById('modalGrupo').style.display = 'none';
    document.getElementById('closeModalTarea').onclick = () =>
        document.getElementById('modalTarea').style.display = 'none';
    document.getElementById('closeModalInventario').onclick = () =>
        document.getElementById('modalInventario').style.display = 'none';

    // Cerrar al clic fuera
    ['modalGasto', 'modalBalance', 'modalGrupo', 'modalTarea', 'modalInventario'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', (e) => {
            if (e.target.id === id) e.target.style.display = 'none';
        });
    });

    // Crear Gasto
    document.getElementById('gastoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const divisiones = ui.getDivisiones();
        if (!divisiones.length) { ui.toast('Selecciona al menos un participante.', 'error'); return; }

        const body = {
            grupoId: currentGrupo.id,
            titulo: document.getElementById('gTitulo').value,
            descripcion: document.getElementById('gDescripcion').value,
            monto: parseFloat(document.getElementById('gMonto').value),
            tipo: document.getElementById('gTipo').value,
            categoria: document.getElementById('gCategoria').value,
            fechaGasto: document.getElementById('gFecha').value,
            divisiones
        };

        try {
            ui.loading(true);
            await api.crearGasto(body);
            ui.toast('Gasto registrado ✅');
            document.getElementById('modalGasto').style.display = 'none';
            document.getElementById('gastoForm').reset();
            loadGastos(currentGrupo.id, currentCat);
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });

    // Crear Grupo
    document.getElementById('grupoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            ui.loading(true);
            await api.crearGrupo({
                nombre: document.getElementById('gNombre').value,
                descripcion: document.getElementById('gDescGrupo').value
            });
            ui.toast('Grupo creado ✅');
            document.getElementById('modalGrupo').style.display = 'none';
            document.getElementById('grupoForm').reset();
            loadDashboard();
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });
}

// ─── Acciones globales (desde HTML renderizado) ───────────────
window._eliminarGasto = async (gastoId) => {
    if (!confirm('¿Seguro que quieres eliminar este gasto?')) return;
    try {
        ui.loading(true);
        await api.eliminarGasto(gastoId);
        ui.toast('Gasto eliminado.');
        loadGastos(currentGrupo.id, currentCat);
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
};

window._pagarDivision = async (gastoId) => {
    try {
        ui.loading(true);
        await api.marcarPagado(gastoId);
        ui.toast('Marcado como pagado ✅');
        loadGastos(currentGrupo.id, currentCat);
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
};

// TAREAS ACTIONS
window._eliminarTarea = async (id) => {
    if (!confirm('¿Eliminar tarea?')) return;
    try {
        await api.eliminarTarea(id);
        loadTareas(currentGrupo.id);
    } catch (err) { ui.toast(err.message, 'error'); }
};

window._completarTarea = async (id) => {
    try {
        await api.cambiarEstadoTarea(id, 'COMPLETADA');
        loadTareas(currentGrupo.id);
    } catch (err) { ui.toast(err.message, 'error'); }
};

// INVENTARIO ACTIONS
window._eliminarItem = async (id) => {
    if (!confirm('¿Eliminar item?')) return;
    try {
        await api.eliminarItem(id);
        loadInventario(currentGrupo.id);
    } catch (err) { ui.toast(err.message, 'error'); }
};

window._updateStock = async (id, val) => {
    try {
        await api.actualizarStock(id, val);
        loadInventario(currentGrupo.id);
    } catch (err) { ui.toast(err.message, 'error'); }
};
