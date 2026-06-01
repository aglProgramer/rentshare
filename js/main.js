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
let currentGastos = [];

// ─── Cargar tema guardado ───────────────────────────────────
(function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    // Actualizar icono si existe
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.textContent = savedTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }
})();

// ─── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('rentshare_token');
    currentUser = JSON.parse(localStorage.getItem('rentshare_user') || 'null');

    const hasAuth = !!document.getElementById('authSection');
    const hasDashboard = !!document.getElementById('dashboardSection');
    const hasGrupo = !!document.getElementById('grupoSection');

    // Page-specific initialization
    if (hasAuth) {
        initAuth();
    }

    if (hasDashboard) {
        // If not authenticated, redirect to login
        if (!token || !currentUser) {
            window.location.href = '../index.html';
            return;
        }
        initDashboard();
        initModalesIfPresent();
        ui.showDashboard();
        loadDashboard();
    }

    if (hasGrupo) {
        if (!token || !currentUser) {
            window.location.href = '../index.html';
            return;
        }
        // dashboard init wires sidebar/bottomnav handlers
        initDashboard();
        initGrupo();
        initTareas();
        initInventario();
        initReportes();
        initModalesIfPresent();

        // Si la URL contiene ?grupoId=..., cargar ese grupo automáticamente
        (async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const gid = params.get('grupoId');
                if (gid) {
                    // buscar en misGrupos para obtener nombre y rol
                    const grupos = await api.misGrupos();
                    const g = (grupos || []).find(x => String(x.id) === String(gid));
                    if (g) {
                        currentGrupo = { id: g.id, nombre: g.nombre, rolActual: g.rolActual };
                        ui.showGrupo(currentGrupo);
                        loadGrupo(currentGrupo.id);
                    }
                }
            } catch (e) {
                console.warn('No se pudo cargar grupo desde query param', e);
            }
        })();
    }
});

function initModalesIfPresent() {
    if (document.getElementById('modalGasto')) initModales();
}

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
                console.warn('Captcha no disponible — procediendo sin token (cliente).');
            }

            const loginBody = {
                email: e.target.loginEmail.value,
                password: e.target.loginPassword.value,
            };
            if (captcha) loginBody.captchaToken = captcha;

            const res = await api.login(loginBody);
            localStorage.setItem('rentshare_token', res.token);
            localStorage.setItem('rentshare_user', JSON.stringify(res.usuario));
            currentUser = res.usuario;
            window.location.href = 'paginas/dashboard.html';
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
                console.warn('Captcha no disponible — procediendo sin token (cliente).');
            }

            const regBody = {
                nombre: e.target.regNombre.value,
                email: e.target.regEmail.value,
                password: e.target.regPassword.value
            };
            if (captcha) regBody.captchaToken = captcha;

            await api.register(regBody);
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
        // Redirigir al index (login)
        if (window.location.pathname.includes('/paginas/')) window.location.href = '../index.html';
        else window.location.href = 'index.html';
    });
}

// ─── DASHBOARD ───────────────────────────────────────────────
function initDashboard() {
    // Navegación del sidebar
    const sidebarDashboard = document.getElementById('sidebarDashboard');
    if (sidebarDashboard) {
        sidebarDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            const currentPath = window.location.pathname;
            if (currentPath.includes('/paginas/')) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'paginas/dashboard.html';
            }
        });
    }

    // Clic en grupo y acciones sobre grupos
    const gruposList = document.getElementById('gruposList');
    if (gruposList) {
        gruposList.addEventListener('click', async (e) => {
            const card = e.target.closest('.grupo-card');
            if (!card || !card.dataset.id || card.dataset.id === 'undefined') return;

            const actionButton = e.target.closest('[data-action]');
            if (actionButton) {
                const action = actionButton.dataset.action;
                const grupoId = card.dataset.id;
                if (action === 'enter') {
                    window.location.href = `grupo.html?grupoId=${grupoId}`;
                    return;
                }
                if (action === 'leave') {
                    if (!confirm('¿Salir del grupo?')) return;
                    try {
                        ui.loading(true);
                        await api.salirGrupo(grupoId);
                        ui.toast('Has salido del grupo.', 'success');
                        loadDashboard();
                    } catch (err) {
                        ui.toast(err.message, 'error');
                    } finally {
                        ui.loading(false);
                    }
                    return;
                }
                if (action === 'delete') {
                    if (!confirm('¿Eliminar el grupo? Esta acción no se puede deshacer.')) return;
                    try {
                        ui.loading(true);
                        await api.eliminarGrupo(grupoId);
                        ui.toast('Grupo eliminado.', 'success');
                        loadDashboard();
                    } catch (err) {
                        ui.toast(err.message, 'error');
                    } finally {
                        ui.loading(false);
                    }
                    return;
                }
            }

            window.location.href = `grupo.html?grupoId=${card.dataset.id}`;
        });
    }

    // Nuevo grupo modal
    const btnNuevoGrupo = document.getElementById('btnNuevoGrupo');
    if (btnNuevoGrupo) {
        btnNuevoGrupo.addEventListener('click', () => {
            document.getElementById('modalGrupo').style.display = 'flex';
        });
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const isDark = html.classList.contains('dark');
            if (isDark) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                const icon = document.getElementById('themeIcon');
                if (icon) icon.textContent = 'dark_mode';
            } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                const icon = document.getElementById('themeIcon');
                if (icon) icon.textContent = 'light_mode';
            }
        });
    }

    // Unirse a grupo
    const unirseForm = document.getElementById('unirseForm');
    if (unirseForm) {
        unirseForm.addEventListener('submit', async (e) => {
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
        document.getElementById('gastosHeaderContainer').style.display = 'flex';
        document.getElementById('tabGastos').classList.add('active');
        syncSidebarTab('tabGastos');
        if (currentGrupo) loadGastos(currentGrupo.id, currentCat);
    });

    document.getElementById('tabMiembros').addEventListener('click', async () => {
        hideAllTabs();
        document.getElementById('miembrosList').style.display = 'block';
        document.getElementById('tabMiembros').classList.add('active');
        syncSidebarTab('tabMiembros');
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
        syncSidebarTab('tabTareas');
        if (currentGrupo) loadTareas(currentGrupo.id);
    });

    document.getElementById('tabInventario').addEventListener('click', () => {
        hideAllTabs();
        document.getElementById('inventarioSection').style.display = 'block';
        document.getElementById('tabInventario').classList.add('active');
        syncSidebarTab('tabInventario');
        if (currentGrupo) loadInventario(currentGrupo.id);
    });

    document.getElementById('tabReportes').addEventListener('click', () => {
        hideAllTabs();
        document.getElementById('reportesSection').style.display = 'block';
        document.getElementById('tabReportes').classList.add('active');
        syncSidebarTab('tabReportes');
        if (currentGrupo) loadReportes(currentGrupo.id);
    });

    function hideAllTabs() {
        ['gastosList', 'gastosHeaderContainer', 'miembrosList', 'tareasList', 'inventarioSection', 'reportesSection'].forEach(id => {
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

    // Buscador de gastos
    document.getElementById('searchGastos')?.addEventListener('input', () => {
        filterAndRenderGastos();
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
            navigator.clipboard.writeText(res.codigo).catch(() => { });
            ui.toast(`Código copiado: ${res.codigo.substring(0, 16)}...`, 'success');
            alert(`Comparte este código de invitación:\n\n${res.codigo}\n\nVigencia: 24 horas`);
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });

    document.getElementById('btnLeaveGroup').addEventListener('click', async () => {
        if (!currentGrupo) return;
        if (!confirm('¿Estás seguro de que quieres salir de este grupo?')) return;
        try {
            ui.loading(true);
            await api.salirGrupo(currentGrupo.id);
            ui.toast('Has salido del grupo.', 'success');
            window.location.href = '../dashboard.html';
        } catch (err) {
            ui.toast(err.message, 'error');
        } finally {
            ui.loading(false);
        }
    });

    document.getElementById('btnDeleteGroup').addEventListener('click', async () => {
        if (!currentGrupo) return;
        if (!confirm('¿Eliminar el grupo? Esta acción no se puede deshacer.')) return;
        try {
            ui.loading(true);
            await api.eliminarGrupo(currentGrupo.id);
            ui.toast('Grupo eliminado.', 'success');
            window.location.href = '../dashboard.html';
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
    const handleNuevoGasto = async () => {
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
    };
    document.getElementById('btnNuevoGasto').addEventListener('click', handleNuevoGasto);
    const fabNuevoGasto = document.getElementById('fabNuevoGasto');
    if (fabNuevoGasto) fabNuevoGasto.addEventListener('click', handleNuevoGasto);

    // Dividir igual automáticamente
    const btnDividirIgual = document.getElementById('btnDividirIgual');

    if (btnDividirIgual) {
        btnDividirIgual.addEventListener('click', () => {
            const monto = parseFloat(document.getElementById('gMonto')?.value) || 0;
            const checks = document.querySelectorAll('#divisionesContainer input[type=checkbox]:checked');

            if (checks.length === 0) return;

            const parte = (monto / checks.length).toFixed(2);

            checks.forEach(chk => {
                const uid = chk.id.replace('chk_', '');
                const amtInput = document.getElementById(`amt_${uid}`);

                if (amtInput) {
                    amtInput.value = parte;
                }
            });
        });
    }

    // Recalcular al cambiar monto
    if (gMontoInput) {
        gMontoInput.addEventListener('input', () => {
            if (currentMiembros.length) {
                const monto = parseFloat(document.getElementById('gMonto').value) || 0;
                const checks = document.querySelectorAll('#divisionesContainer input[type=checkbox]:checked');

                if (checks.length) {
                    const parte = (monto / checks.length).toFixed(2);

                    checks.forEach(chk => {
                        const uid = chk.id.replace('chk_', '');
                        const amtInput = document.getElementById(`amt_${uid}`);

                        if (amtInput) {
                            amtInput.value = parte;
                        }
                    });
                }
            }
        });
    }
} // <- cierre de initGrupo()

async function loadGrupo(grupoId) {
    currentCat = '';
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filtro-btn[data-cat=""]').classList.add('active');
    try {
        ui.loading(true);
        const grupos = await api.misGrupos();
        const grupo = grupos.find(x => String(x.id) === String(grupoId));
        if (grupo) {
            currentGrupo = { id: grupo.id, nombre: grupo.nombre, rolActual: grupo.rolActual, descripcion: grupo.descripcion };
            ui.showGrupo(currentGrupo);
        }
        currentMiembros = await api.miembros(grupoId);
        const stats = await api.stats(grupoId).catch(() => null);
        ui.renderGroupSummary({
            miembros: currentMiembros.length,
            totalGastado: stats?.totalGastado || 0,
            categorias: stats?.gastosPorCategoria ? Object.keys(stats.gastosPorCategoria).length : 0
        });
        loadGastos(grupoId, '');
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
}

async function loadGastos(grupoId, categoria) {
    try {
        ui.loading(true);
        const page = await api.gastos(grupoId, categoria);
        currentGastos = page.content || [];
        filterAndRenderGastos();
    } catch (err) {
        ui.toast(err.message, 'error');
    } finally {
        ui.loading(false);
    }
}

function filterAndRenderGastos() {
    const searchVal = document.getElementById('searchGastos')?.value.toLowerCase().trim() || '';
    const filtered = currentGastos.filter(g =>
        g.titulo.toLowerCase().includes(searchVal) ||
        (g.descripcion && g.descripcion.toLowerCase().includes(searchVal)) ||
        g.categoria.toLowerCase().includes(searchVal) ||
        g.pagadoPorNombre.toLowerCase().includes(searchVal)
    );
    ui.renderGastos(filtered, currentUser?.id);
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
function initReportes() { }

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
    const bindClick = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.onclick = handler;
    };

    const bindSubmit = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('submit', handler);
    };

    // Cerrar modales
    bindClick('closeModalGasto', () => {
        const modal = document.getElementById('modalGasto');
        if (modal) modal.style.display = 'none';
    });
    bindClick('closeModalBalance', () => {
        const modal = document.getElementById('modalBalance');
        if (modal) modal.style.display = 'none';
    });
    bindClick('closeModalGrupo', () => {
        const modal = document.getElementById('modalGrupo');
        if (modal) modal.style.display = 'none';
    });
    bindClick('closeModalTarea', () => {
        const modal = document.getElementById('modalTarea');
        if (modal) modal.style.display = 'none';
    });
    bindClick('closeModalInventario', () => {
        const modal = document.getElementById('modalInventario');
        if (modal) modal.style.display = 'none';
    });

    // Cerrar al clic fuera
    ['modalGasto', 'modalBalance', 'modalGrupo', 'modalTarea', 'modalInventario'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', (e) => {
            if (e.target.id === id) e.target.style.display = 'none';
        });
    });

    // Crear Gasto
    bindSubmit('gastoForm', async (e) => {
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
    bindSubmit('grupoForm', async (e) => {
        e.preventDefault();
        try {
            ui.loading(true);
            await api.crearGrupo({
                nombre: document.getElementById('gNombre')?.value || '',
                descripcion: document.getElementById('gDescGrupo')?.value || ''
            });
            ui.toast('Grupo creado ✅');
            const modal = document.getElementById('modalGrupo');
            if (modal) modal.style.display = 'none';
            const form = document.getElementById('grupoForm');
            if (form) form.reset();
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

function syncSidebarTab(tabId) {
    const tabToSidebar = {
        'tabGastos': 'sidebarGastos',
        'tabTareas': 'sidebarTareas',
        'tabInventario': 'sidebarInventario',
        'tabReportes': 'sidebarReportes',
        'tabMiembros': 'sidebarMiembros',
    };
    const sid = tabToSidebar[tabId];
    if (!sid) return;
    document.querySelectorAll('.sidebar-nav-item').forEach(a => {
        a.classList.remove('active', 'bg-primary-container', 'text-on-primary-container', 'font-bold');
        a.classList.add('text-on-surface-variant', 'font-medium');
    });
    const el = document.getElementById(sid);
    if (el) {
        el.classList.add('active', 'bg-primary-container', 'text-on-primary-container', 'font-bold');
        el.classList.remove('text-on-surface-variant', 'font-medium');
    }
}
