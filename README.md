# 📊 RentShare

RentShare es una aplicación web full-stack diseñada para gestionar gastos compartidos entre compañeros de vivienda de forma transparente, automática y organizada.

Permite administrar grupos, dividir gastos, calcular balances, gestionar tareas del hogar, controlar inventario compartido y visualizar reportes financieros en tiempo real.

---

## 🚀 Características Principales

### 💸 Gestión de Gastos

- Registro de gastos compartidos e individuales
- División automática o manual de montos
- Categorías: Renta, Servicios, Mercado, Limpieza, Internet, Otros
- Historial completo de movimientos
- Estado de pagos (pendiente/pagado)
- Auditoría de cambios

### 📊 Balance Automático

RentShare calcula automáticamente:
- **Quién** debe dinero
- **A quién** debe pagarlo
- **Cuánto** debe pagar

Además:
- Optimiza transacciones
- Evita ciclos innecesarios de deuda
- Mantiene balances claros y auditables

### 👥 Gestión de Grupos

- Crear múltiples grupos
- Roles de usuario: Admin, Miembro
- Gestión de miembros
- Solicitudes de ingreso
- Códigos de invitación seguros

### 🔗 Sistema de Invitaciones

- Códigos UUID únicos
- Expiración automática (24h)
- Solicitudes de acceso
- Aprobación/rechazo por administradores

### ✅ Tareas del Hogar

- Crear tareas compartidas
- Asignar responsables
- Fechas de vencimiento
- Estados: Pendiente, Completada
- Calendario visual

### 📦 Inventario Compartido

- Registro de artículos comunes
- Control de stock
- Alertas de stock mínimo
- Historial de modificaciones

### 📈 Reportes y Estadísticas

- Gráficos de gastos
- Estadísticas del grupo
- Gastos por usuario
- Gastos por categoría
- Filtros por fecha
- Roadmap para exportación PDF

### 🔒 Seguridad

- JWT Authentication
- Contraseñas cifradas con bcrypt
- reCAPTCHA Enterprise
- Roles y permisos
- Protección CORS

---

## 🏗️ Arquitectura del Proyecto

### Frontend

**Tecnologías:**
- HTML5
- CSS3
- JavaScript Vanilla
- Chart.js

**Estructura:**
```
rentshare/
├── index.html
├── js/
│   ├── main.js
│   ├── auth.js
│   ├── api.js
│   ├── dashboard.js
│   ├── grupos.js
│   ├── gastos.js
│   ├── balance.js
│   ├── tareas.js
│   ├── inventario.js
│   ├── reportes.js
│   └── utils.js
└── css/
    └── style.css
```

### Backend

**Tecnologías:**
- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate

**Estructura:**
```
backend-api/
└── src/main/java/com/rentshare/api/
    ├── controller/
    ├── service/
    ├── repository/
    ├── model/
    ├── dto/
    ├── security/
    ├── config/
    ├── exception/
    └── resources/
```

---

## 🛠️ Stack Tecnológico

| Área | Tecnología |
|------|-----------|
| Frontend | JavaScript ES6+ |
| Backend | Java 17 |
| Framework | Spring Boot 3 |
| Seguridad | Spring Security |
| Base de Datos | MySQL / PostgreSQL |
| ORM | Hibernate |
| Autenticación | JWT |
| Encriptación | bcrypt |
| Gráficos | Chart.js |
| Build Tool | Maven |

---

## 💾 Modelo de Datos

### Principales Entidades

- **Usuario**: Información de usuario, rol y autenticación
- **Grupo**: Agrupación de usuarios con gastos compartidos
- **Gasto**: Registro de gastos con categoría y tipo
- **DivisiónGasto**: Relación entre Gasto y Usuario con monto asignado
- **Tarea**: Tareas del hogar con asignación y vencimiento
- **ItemInventario**: Artículos compartidos con control de stock
- **InvitacionGrupo**: Códigos de invitación con expiración

---

## 🔄 Flujos Principales

### 1️⃣ Registro y Creación de Grupo
- Usuario se registra
- Backend valida reCAPTCHA
- Se genera JWT
- Usuario crea grupo
- Se asigna como administrador

### 2️⃣ Invitación de Miembros
- Admin genera código
- Comparte código
- Usuario se une al grupo
- Backend valida invitación

### 3️⃣ Registro de Gastos
- Usuario crea gasto
- Sistema divide automáticamente
- BalanceService recalcula balances

### 4️⃣ Consulta de Balance
- Visualización clara de deudas
- Confirmación de pagos
- Rebalanceo automático

---

## ⭐ Servicio Principal: BalanceService

El corazón de RentShare.

```java
public BalanceDto calcularBalance(UUID grupoId) {
    // Calcula balances y optimiza deudas
}
```

**Funciones:**
- Calcula balances netos
- Determina acreedores y deudores
- Optimiza pagos
- Simplifica transacciones

---

## 🔐 Seguridad

### Autenticación
- JWT HS256
- Expiración de tokens
- Roles y permisos

### Protección
- bcrypt hashing
- reCAPTCHA Enterprise
- CORS configurado

---

## 📡 API REST

### Autenticación
```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Grupos
```
GET    /api/v1/grupos
POST   /api/v1/grupos
GET    /api/v1/grupos/{id}
```

### Gastos
```
POST   /api/v1/gastos
GET    /api/v1/gastos
PUT    /api/v1/gastos/{id}
DELETE /api/v1/gastos/{id}
```

### Balance
```
GET /api/v1/balance
```

### Tareas
```
POST /api/v1/tareas
GET  /api/v1/tareas
```

### Inventario
```
POST /api/v1/inventario
GET  /api/v1/inventario
```

---

## 📦 Base de Datos

**Compatible con:**
- MySQL 8+
- PostgreSQL 13+

**Relaciones:**
- Usuario ↔ Grupo
- Grupo ↔ Gasto
- Gasto ↔ División
- Grupo ↔ Tareas
- Grupo ↔ Inventario

---

## 🚀 Roadmap

**Próximas Funcionalidades:**
- [ ] Docker
- [ ] CI/CD con GitHub Actions
- [ ] Exportación PDF
- [ ] Notificaciones en tiempo real
- [ ] Aplicación móvil
- [ ] Pagos integrados

---

## 📈 Estado del Proyecto

- ✅ Arquitectura profesional
- ✅ Backend robusto
- ✅ Sistema escalable
- ✅ Seguridad moderna
- ✅ API REST versionada

---

**Autor:** [@aglProgramer](https://github.com/aglProgramer)  
**Repositorio:** [rentshare](https://github.com/aglProgramer/rentshare)
