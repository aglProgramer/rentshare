export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function showLoading(message = 'Procesando...') {
  let loader = document.getElementById('global-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `<div class="spinner"></div><p>${message}</p>`;
    loader.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;color:#fff;';
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}

export function hideLoading() {
  const loader = document.getElementById('global-loader');
  if (loader) loader.style.display = 'none';
}

export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:8px;color:#fff;z-index:9999;font-weight:500;opacity:0;transform:translateY(20px);transition:all 0.3s ease;`;
  toast.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}
