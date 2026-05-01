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
        t.style.display = 'block';
        t.style.background = type === 'success' ? '#16a34a' : type === 'warning' ? '#d97706' : '#dc2626';
        t.style.color = 'white';
        clearTimeout(ui._toastTimer);
        ui._toastTimer = setTimeout(() => t.style.display = 'none', 4000);
    },

    loading(show) {
        document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
    },

    // ====== AUTH ======
    showAuth() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('grupoSection').style.display = 'none';
        document.getElementById('navbar').style.display = 'none';
    },

    showDashboard() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        document.getElementById('grupoSection').style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('breadcrumb').innerText = '';
        const u = JSON.parse(localStorage.getItem('rentshare_user') || '{}');
        document.getElementById('dashGreeting').innerText = `Hola, ${u.nombre || ''}`;
        document.getElementById('navUserName').innerText = u.email || '';
    },

    showGrupo(grupo) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'none';
        document.getElementById('grupoSection').style.display = 'block';
        document.getElementById('navbar').style.display = 'flex';
        document.getElementById('grupoNombre').innerText = grupo.nombre;
        document.getElementById('breadcrumb').innerText = `← Mis Grupos / ${grupo.nombre}`;
        document.getElementById('breadcrumb').style.cursor = 'pointer';

        const badge = document.getElementById('grupoRolBadge');
        badge.innerText = grupo.rolActual;
        badge.className = `badge badge-${grupo.rolActual === 'ADMIN' ? 'admin' : 'member'}`;

        const esAdmin = grupo.rolActual === 'ADMIN';
        document.getElementById('btnGenInvitacion').style.display = esAdmin ? 'inline-flex' : 'none';
        document.getElementById('btnSolicitudes').style.display = esAdmin ? 'inline-flex' : 'none';
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
                <h3>${g.nombre}</h3>
                <p>${g.descripcion || 'Sin descripción'}</p>
                <div class="grupo-meta">
                    <span class="badge badge-${g.rolActual === 'ADMIN' ? 'admin' : 'member'}">${g.rolActual}</span>
                    <span style="color:var(--text-muted);font-size:0.8rem;">👥 ${g.totalMiembros} miembro${g.totalMiembros !== 1 ? 's' : ''}</span>
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
    }
};

export default ui;
