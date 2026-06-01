/**
 * UI Module — Renderizado de todas las vistas
 */

const ICONOS = {
    RENTA: '🏠', SERVICIOS: '💡', MERCADO: '🛒',
    LIMPIEZA: '🧹', INTERNET: '📡', OTRO: '📌'
};

const ui = {
    toast(msg, type = 'success') {
        const t = document.getElementById('status');
        t.innerText = msg;
        t.className = `toast fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-[1000] rounded-xl font-semibold text-sm px-4 py-3 shadow-xl border ${type}`;
        t.style.display = 'block';
        clearTimeout(ui._toastTimer);
        ui._toastTimer = setTimeout(() => t.style.display = 'none', 4000);
    },

    loading(show) {
        document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
    },

    // ====== AUTH ======
    showAuth() {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('grupoSection').style.display = 'none';
        document.getElementById('navbar').style.display = 'none';
        document.getElementById('sidebar').style.setProperty('display', 'none', 'important');
        const bn = document.getElementById('bottomNav');
        if (bn) bn.style.setProperty('display', 'none', 'important');
        const fab = document.getElementById('fabNuevoGasto');
        if (fab) fab.style.display = 'none';
    },

    showDashboard() {
        document.getElementById('authSection')?.style.setProperty('display', 'none');
        document.getElementById('dashboardSection')?.style.setProperty('display', 'block');
        document.getElementById('grupoSection')?.style.setProperty('display', 'none');
        document.getElementById('navbar')?.style.setProperty('display', 'flex');
        // Sidebar visible
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.style.removeProperty('display');

        // Hide group-specific sidebar items
        ['sidebarGastos', 'sidebarTareas', 'sidebarInventario', 'sidebarReportes', 'sidebarMiembros'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const bn = document.getElementById('bottomNav');
        if (bn) {
            bn.style.removeProperty('display');
            bn.style.display = 'flex';
        }

        // Hide group-specific bottom items
        ['bottomGastos', 'bottomTareas', 'bottomInventario'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        // Make Dashboard bottom icon centered
        const bDash = document.getElementById('bottomDashboard');
        if (bDash) {
            bDash.style.flex = '1';
            bDash.style.justifyContent = 'center';
        }

        const fab = document.getElementById('fabNuevoGasto');
        if (fab) fab.style.display = 'none';
        // Balance button hidden on dashboard
        const balBtn = document.getElementById('btnVerBalance');
        if (balBtn) balBtn.style.display = 'none';
        // Breadcrumb
        document.getElementById('breadcrumb')?.innerText = '';
        // User info
        const u = JSON.parse(localStorage.getItem('rentshare_user') || '{}');
        document.getElementById('dashGreeting')?.innerText = `Hola, ${u.nombre || ''}`;
        document.getElementById('navUserName')?.innerText = u.nombre || u.email || '';
        // Sidebar user info
        if (u.nombre) {
            const init = u.nombre[0]?.toUpperCase() || 'A';
            ['sidebarAvatar', 'navAvatar'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = init;
            });
            const sn = document.getElementById('sidebarUserName');
            if (sn) sn.textContent = u.nombre;
            const se = document.getElementById('sidebarUserEmail');
            if (se) se.textContent = u.email || '';
        }
        // Sidebar active: dashboard
        document.querySelectorAll('.sidebar-nav-item').forEach(a => {
            a.classList.remove('active', 'bg-primary-container', 'text-on-primary-container', 'font-bold');
            a.classList.add('text-on-surface-variant', 'font-medium');
        });
        const sd = document.getElementById('sidebarDashboard');
        if (sd) { sd.classList.add('active', 'bg-primary-container', 'text-on-primary-container', 'font-bold'); sd.classList.remove('text-on-surface-variant', 'font-medium'); }
    },

    showGrupo(grupo) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('grupoSection').style.display = 'block';
        document.getElementById('navbar').style.display = 'flex';
        // Sidebar
        const sidebar = document.getElementById('sidebar');
        sidebar.style.removeProperty('display');

        // Show group-specific sidebar items
        ['sidebarGastos', 'sidebarTareas', 'sidebarInventario', 'sidebarReportes', 'sidebarMiembros'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'flex'; // sidebar items use flex
        });

        const bn = document.getElementById('bottomNav');
        if (bn) {
            bn.style.removeProperty('display');
            bn.style.display = 'flex';
        }

        // Show group-specific bottom items
        ['bottomGastos', 'bottomTareas', 'bottomInventario'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'flex';
        });
        // Reset Dashboard bottom icon styles
        const bDash = document.getElementById('bottomDashboard');
        if (bDash) {
            bDash.style.flex = '';
        }

        // FAB
        const fab = document.getElementById('fabNuevoGasto');
        if (fab) fab.style.display = 'flex';
        // Balance button visible
        const balBtn = document.getElementById('btnVerBalance');
        if (balBtn) balBtn.style.display = 'inline-flex';
        // Group info
        document.getElementById('grupoNombre').innerText = grupo.nombre;
        document.getElementById('breadcrumb').innerText = `← Mis Grupos / ${grupo.nombre}`;
        document.getElementById('breadcrumb').style.cursor = 'pointer';
        // Sidebar group name
        const sgn = document.getElementById('sidebarGrupoName');
        if (sgn) sgn.textContent = grupo.nombre;

        const badge = document.getElementById('grupoRolBadge');
        badge.innerText = grupo.rolActual;
        badge.className = `badge badge-${grupo.rolActual === 'ADMIN' ? 'admin' : 'member'}`;

        const esAdmin = grupo.rolActual === 'ADMIN';
        document.getElementById('btnGenInvitacion').style.display = esAdmin ? 'inline-flex' : 'none';
        document.getElementById('btnSolicitudes').style.display = esAdmin ? 'inline-flex' : 'none';
        const deleteBtn = document.getElementById('btnDeleteGroup');
        if (deleteBtn) deleteBtn.style.display = esAdmin ? 'inline-flex' : 'none';

        // Sidebar active: gastos
        document.querySelectorAll('.sidebar-nav-item').forEach(a => {
            a.classList.remove('active', 'bg-primary-container', 'text-on-primary-container', 'font-bold');
            a.classList.add('text-on-surface-variant', 'font-medium');
        });
        const sg = document.getElementById('sidebarGastos');
        if (sg) { sg.classList.add('active', 'bg-primary-container', 'text-on-primary-container', 'font-bold'); sg.classList.remove('text-on-surface-variant', 'font-medium'); }
    },

    // ====== DASHBOARD ======
    renderGrupos(grupos) {
        const el = document.getElementById('gruposList');
        if (!grupos.length) {
            el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
                <div class="empty-icon">🏡</div>
                <h3>Sin grupos aún</h3>
                <p>Crea uno o únete con un código de invitación.</p>
            </div>`;
            return;
        }
        el.innerHTML = grupos.map(g => `
            <div class="grupo-card" data-id="${g.id}" data-rol="${g.rolActual}" data-nombre="${g.nombre}">
                <div class="grupo-card-content">
                    <div>
                        <h3>${g.nombre}</h3>
                        <p>${g.descripcion || 'Sin descripción'}</p>
                    </div>
                    <div class="grupo-actions">
                        <button class="btn btn-secondary" data-action="enter">Entrar</button>
                        ${g.rolActual === 'ADMIN'
                ? `<button class="btn btn-danger" data-action="delete">Eliminar</button>`
                : `<button class="btn btn-ghost" data-action="leave">Salir</button>`}
                    </div>
                </div>
                <div class="grupo-meta">
                    <span class="badge badge-${g.rolActual === 'ADMIN' ? 'admin' : 'member'}">${g.rolActual}</span>
                    <span>${g.totalMiembros} miembro${g.totalMiembros !== 1 ? 's' : ''}</span>
                </div>
            </div>
        `).join('');
    },

    renderStats(grupos) {
        document.getElementById('statsRow').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${grupos.length}</div>
                <div class="stat-label">Grupos</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${grupos.filter(g => g.rolActual === 'ADMIN').length}</div>
                <div class="stat-label">Que Administro</div>
            </div>
        `;
    },

    renderGroupSummary(summary) {
        const el = document.getElementById('groupSummary');
        if (!el) return;
        el.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${summary.miembros}</div>
                <div class="stat-label">Miembros</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">$${Number(summary.totalGastado || 0).toLocaleString()}</div>
                <div class="stat-label">Total Gastado</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${summary.categorias || 0}</div>
                <div class="stat-label">Categorías</div>
            </div>
        `;
    },

    // ====== GASTOS ======
    renderGastos(gastos, usuarioId) {
        const el = document.getElementById('gastosList');
        if (!gastos.length) {
            el.innerHTML = `<div class="empty-state">
                <div class="empty-icon">💸</div>
                <h3>Sin gastos registrados</h3>
                <p>Agrega el primer gasto del grupo.</p>
            </div>`;
            return;
        }
        el.innerHTML = gastos.map(g => {
            const miDivision = g.divisiones?.find(d => d.usuarioId === usuarioId);
            const yoPague = g.pagadoPorId === usuarioId;
            return `
            <div class="gasto-item" data-id="${g.id}">
                <div class="gasto-icon">${ICONOS[g.categoria] || '📌'}</div>
                <div class="gasto-info">
                    <h4>${g.titulo}</h4>
                    <p>${g.fechaGasto} · Pagó: <strong>${g.pagadoPorNombre}</strong> · <span class="badge badge-cat">${g.categoria}</span></p>
                    ${miDivision ? `<p style="margin-top:0.25rem;font-size:0.8rem;color:${miDivision.pagado ? 'var(--success)' : 'var(--warning)'}">
                        Tu parte: $${Number(miDivision.montoAsignado).toLocaleString()} — ${miDivision.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                    </p>` : ''}
                </div>
                <div class="gasto-amount">
                    <div class="monto">$${Number(g.monto).toLocaleString()}</div>
                    <div class="gasto-actions">
                        ${miDivision && !miDivision.pagado && !yoPague
                    ? `<button class="btn btn-success" style="font-size:0.75rem;padding:0.3rem 0.7rem;" onclick="window._pagarDivision('${g.id}')">Marcar Pagado</button>`
                    : ''}
                        ${yoPague
                    ? `<button class="btn btn-danger" style="font-size:0.75rem;padding:0.3rem 0.7rem;" onclick="window._eliminarGasto('${g.id}')">🗑</button>`
                    : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // ====== BALANCE ======
    renderBalance(balance) {
        const el = document.getElementById('balanceContent');
        el.innerHTML = `
            <p style="color:var(--text-muted);margin-bottom:1.5rem;">Total de gastos del grupo: <strong style="color:var(--text)">$${Number(balance.totalGastos).toLocaleString()}</strong></p>
            ${balance.balances.map(b => {
            const val = Number(b.balance);
            const cls = val > 0 ? 'balance-positivo' : val < 0 ? 'balance-negativo' : 'balance-neutro';
            const estado = val > 0 ? `Le deben $${val.toLocaleString()}` : val < 0 ? `Debe $${Math.abs(val).toLocaleString()}` : 'Al día ✅';
            return `<div class="balance-item ${cls}">
                    <div style="display:flex;align-items:center;gap:0.75rem;">
                        <div class="avatar">${b.nombre[0].toUpperCase()}</div>
                        <div>
                            <strong>${b.nombre}</strong>
                            <p style="font-size:0.8rem;color:var(--text-muted)">Pagó: $${Number(b.totalPagado).toLocaleString()} · Debe: $${Number(b.totalDebido).toLocaleString()}</p>
                        </div>
                    </div>
                    <strong style="color:${val > 0 ? 'var(--success)' : val < 0 ? 'var(--error)' : 'var(--text-muted)'}">${estado}</strong>
                </div>`;
        }).join('')}
        `;
    },

    // ====== MIEMBROS ======
    renderMiembros(miembros) {
        document.getElementById('miembrosList').innerHTML = miembros.map(m => `
            <div class="miembro-item">
                <div class="avatar">${m.nombre[0].toUpperCase()}</div>
                <div style="flex:1;">
                    <strong>${m.nombre}</strong>
                    <p style="font-size:0.8rem;color:var(--text-muted)">${m.email}</p>
                </div>
                <span class="badge badge-${m.rol === 'ADMIN' ? 'admin' : 'member'}">${m.rol}</span>
            </div>
        `).join('');
    },

    // ====== MODAL GASTO — Divisiones ======
    renderDivisiones(miembros, monto) {
        const container = document.getElementById('divisionesContainer');
        container.innerHTML = miembros.map(m => `
            <div class="division-row" data-uid="${m.id}">
                <div class="division-check">
                    <input type="checkbox" id="chk_${m.id}" checked>
                    <label for="chk_${m.id}">${m.nombre}</label>
                </div>
                <input type="number" id="amt_${m.id}" value="${(Number(monto) / miembros.length).toFixed(2)}" min="0.01" step="0.01" style="width:120px;">
                <span style="color:var(--text-muted);font-size:0.8rem;">$</span>
            </div>
        `).join('');
    },

    getDivisiones() {
        const rows = document.querySelectorAll('#divisionesContainer .division-row');
        const result = [];
        rows.forEach(row => {
            const uid = row.dataset.uid;
            const chk = row.querySelector('input[type=checkbox]');
            const amt = row.querySelector('input[type=number]');
            if (chk.checked && amt.value) {
                result.push({ usuarioId: uid, montoAsignado: Number(amt.value) });
            }
        });
        return result;
    },

    // ====== TAREAS ======
    renderTareas(tareas) {
        const el = document.getElementById('tareasGrid');
        if (!tareas.length) {
            el.innerHTML = '<div class="empty-state"><h3>No hay tareas</h3><p>Todo está al día.</p></div>';
            return;
        }
        el.innerHTML = tareas.map(t => {
            const date = t.fechaVencimiento ? new Date(t.fechaVencimiento).toLocaleString() : 'Sin fecha';
            const statusCls = t.estado === 'COMPLETADA' ? 'success' : 'warning';
            return `
            <div class="card tarea-card" data-id="${t.id}">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
                    <span class="badge badge-${statusCls}">${t.estado}</span>
                    <button class="btn-close" onclick="window._eliminarTarea('${t.id}')">✕</button>
                </div>
                <h4>${t.titulo}</h4>
                <p style="font-size:0.85rem;color:var(--text-muted);margin:0.5rem 0;">${t.descripcion || 'Sin descripción'}</p>
                <div style="font-size:0.8rem;border-top:1px solid var(--border);padding-top:0.5rem;margin-top:0.5rem;">
                    <div>📅 ${date}</div>
                    <div style="margin-top:0.25rem;">👤 ${t.asignadoANombre}</div>
                </div>
                ${t.estado !== 'COMPLETADA' ? `
                <button class="btn btn-primary btn-block" style="margin-top:1rem;font-size:0.8rem;" onclick="window._completarTarea('${t.id}')">Marcar Completada</button>
                ` : ''}
            </div>`;
        }).join('');
    },

    // ====== INVENTARIO ======
    renderInventario(items) {
        const el = document.getElementById('inventarioList');
        if (!items.length) {
            el.innerHTML = '<div class="empty-state"><h3>Inventario vacío</h3><p>Agrega productos que falten.</p></div>';
            return;
        }
        el.innerHTML = items.map(i => {
            const bajo = i.cantidad <= i.stockMinimo;
            return `
            <div class="card inventario-item" data-id="${i.id}">
                <div style="display:flex;justify-content:space-between;">
                    <h4>${i.nombre}</h4>
                    <button class="btn-close" onclick="window._eliminarItem('${i.id}')">✕</button>
                </div>
                <div style="margin-top:1rem;display:flex;align-items:center;gap:1rem;">
                    <div class="stat-value" style="font-size:1.8rem;color:${bajo ? 'var(--error)' : 'var(--success)'}">${i.cantidad}</div>
                    <div style="flex:1;">
                        <div style="font-size:0.8rem;color:var(--text-muted)">${i.unidad || 'unidades'}</div>
                        ${bajo ? '<span class="badge badge-admin" style="font-size:0.6rem;">¡STOCK BAJO!</span>' : ''}
                    </div>
                </div>
                <div style="margin-top:1rem;display:flex;gap:0.5rem;">
                    <button class="btn btn-ghost" style="flex:1;padding:0.25rem;" onclick="window._updateStock('${i.id}', ${Number(i.cantidad) - 1})">-1</button>
                    <button class="btn btn-ghost" style="flex:1;padding:0.25rem;" onclick="window._updateStock('${i.id}', ${Number(i.cantidad) + 1})">+1</button>
                </div>
            </div>`;
        }).join('');
    },

    // ====== REPORTES ======
    renderReportes(stats) {
        document.getElementById('statsReportes').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">$${Number(stats.totalGastado).toLocaleString()}</div>
                <div class="stat-label">Total Gastado</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Object.keys(stats.gastosPorCategoria).length}</div>
                <div class="stat-label">Categorías</div>
            </div>
        `;

        // Render Charts
        const ctxCat = document.getElementById('chartCategorias').getContext('2d');
        const ctxUsr = document.getElementById('chartUsuarios').getContext('2d');

        if (ui._chartCat) ui._chartCat.destroy();
        if (ui._chartUsr) ui._chartUsr.destroy();

        ui._chartCat = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: Object.keys(stats.gastosPorCategoria),
                datasets: [{
                    data: Object.values(stats.gastosPorCategoria),
                    backgroundColor: ['#6366f1', '#f59e0b', '#22c55e', '#06b6d4', '#8b5cf6', '#94a3b8']
                }]
            },
            options: { plugins: { legend: { position: 'bottom', labels: { color: '#f1f5f9' } } } }
        });

        ui._chartUsr = new Chart(ctxUsr, {
            type: 'bar',
            data: {
                labels: Object.keys(stats.gastosPorUsuario),
                datasets: [{
                    label: 'Gastos por Usuario',
                    data: Object.values(stats.gastosPorUsuario),
                    backgroundColor: '#6366f1'
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#64748b' } },
                    x: { grid: { display: false }, ticks: { color: '#64748b' } }
                }
            }
        });
    }
};

export default ui;
