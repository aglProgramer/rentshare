/**
 * RentShare WebSocket Service
 * Maneja la comunicación en tiempo real con el servidor.
 */
const WS = {
    stompClient: null,
    connected: false,
    retryCount: 0,
    maxRetries: 10,

    connect() {
        console.log("🔌 Intentando conectar a WebSocket...");
        const wsBase = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
            ? 'http://localhost:8080' 
            : 'https://backend-rentshare-production.up.railway.app';
        const socket = new SockJS(wsBase + '/ws-rentshare');
        this.stompClient = Stomp.over(socket);
        
        // Desactiva logs de STOMP en consola para un look más limpio (opcional)
        // this.stompClient.debug = null;

        this.stompClient.connect({}, (frame) => {
            this.connected = true;
            this.retryCount = 0;
            console.log("✅ Conectado a WebSocket: " + frame);
            
            // Suscribirse al canal de gastos (Broadcast)
            this.stompClient.subscribe('/topic/expenses', (message) => {
                const notification = JSON.parse(message.body);
                this.handleExpenseNotification(notification);
            });

            // Suscribirse al canal de notificaciones personales
            // En el futuro podemos usar el ID del usuario: /topic/notifications/123
            this.stompClient.subscribe('/topic/notifications', (message) => {
                const notification = JSON.parse(message.body);
                this.showToast(notification.message);
            });
        }, (error) => {
            console.error("❌ Error en WebSocket:", error);
            this.connected = false;
            this.handleReconnect();
        });
    },

    handleReconnect() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000); // Backoff exponencial
            console.log(`🔄 Reintentando conexión en ${delay/1000}s... (Intento ${this.retryCount})`);
            setTimeout(() => this.connect(), delay);
        }
    },

    handleExpenseNotification(notification) {
        console.log("🔔 Notificación recibida:", notification);
        
        // 1. Mostrar el Toast Premium
        this.showToast(notification.message, notification.type);

        // 2. Refrescar los datos en la UI (Si la función UI.loadExpenses existe)
        if (window.UI && typeof window.UI.loadExpenses === 'function') {
            window.UI.loadExpenses();
        }
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast--${type.toLowerCase()}`;
        
        // Estética Premium: Icono según tipo
        let icon = '🔔';
        if (type === 'EXPENSE_CREATED') icon = '💰';
        
        toast.innerHTML = `
            <div class="toast__content">
                <span class="toast__icon">${icon}</span>
                <span class="toast__message">${message}</span>
            </div>
            <div class="toast__progress"></div>
        `;

        container.appendChild(toast);

        // Eliminar después de 5 segundos
        setTimeout(() => {
            toast.classList.add('toast--exit');
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    },

    disconnect() {
        if (this.stompClient !== null) {
            this.stompClient.disconnect();
        }
        this.connected = false;
        console.log("🔌 Desconectado");
    }
};

// Iniciar conexión al cargar el script o cuando el usuario esté autenticado
document.addEventListener('DOMContentLoaded', () => {
    WS.connect(); 
});
