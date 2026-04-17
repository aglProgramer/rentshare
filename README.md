# 🏠 RentShare — Gestión de Gastos Compartidos

**RentShare** es una aplicación full-stack para gestionar y dividir gastos entre compañeros de vivienda. Registra arriendos, servicios, mercado y más de forma organizada.

---

## 📁 Estructura del Proyecto

```
rentshare-app/
├── backend-api/            ← Spring Boot REST API
│   ├── src/main/java/com/rentshare/
│   │   ├── controller/     ← Endpoints HTTP (ExpenseController)
│   │   ├── service/        ← Lógica de negocio (ExpenseService)
│   │   ├── repository/     ← Acceso a DB con JPA
│   │   ├── model/          ← Entidades: User, Group, Expense, Split
│   │   ├── dto/            ← DTOs: Request/Response/Error
│   │   ├── exception/      ← GlobalExceptionHandler, excepciones custom
│   │   └── security/       ← Configuración CORS
│   └── src/main/resources/
│       ├── application.properties
│       └── data.sql        ← Datos de prueba automáticos
│
├── frontend-web/           ← Dashboard HTML/CSS/JS puro
│   ├── index.html          ← Dashboard principal + Login + Modal
│   └── assets/
│       ├── css/styles.css  ← Tema oscuro premium (glassmorphism)
│       └── js/
│           ├── api-client.js  ← fetch() centralizado + manejo de errores
│           ├── auth.js        ← Gestión de sesión (localStorage)
│           └── ui-render.js   ← Renderizado de tabla, toasts, formularios
│
└── database/
    └── init.sql            ← Script MySQL para producción
```

---

## 🚀 Cómo Ejecutar

### Backend (Spring Boot)

**Requisitos:** Java 17+, Maven 3.8+

```bash
cd backend-api
mvn spring-boot:run
```

La API arranca en: **http://localhost:8080**
Consola H2 en:    **http://localhost:8080/h2-console**

> **DB en memoria:** Spring Boot usa H2 automáticamente.  
> Los datos de `data.sql` se cargan al iniciar y se borran al apagar.

### Frontend

Abrir directamente en el navegador:
```
frontend-web/index.html
```

O servir con Live Server (VSCode) / `http-server`:
```bash
cd frontend-web
npx http-server . -p 5500
# Abrir: http://localhost:5500
```

**Usuarios de prueba:**
| Email                     | Contraseña |
|---------------------------|-----------|
| carlos@rentshare.com      | 123456    |
| maria@rentshare.com       | 123456    |
| andres@rentshare.com      | 123456    |

---

## 📡 API Endpoints

Base URL: `http://localhost:8080/api`

| Método | Ruta               | Descripción              | Status OK |
|--------|--------------------|--------------------------|-----------|
| GET    | `/expenses`        | Listar todos los gastos  | 200       |
| GET    | `/expenses/{id}`   | Obtener gasto por ID     | 200       |
| POST   | `/expenses`        | Crear nuevo gasto        | 201       |
| DELETE | `/expenses/{id}`   | Eliminar gasto           | 204       |

### Ejemplo: Crear un gasto (POST `/api/expenses`)

```json
{
  "descripcion": "Factura de Internet",
  "monto": 85000.00,
  "fecha": "2026-04-11",
  "categoria": "SERVICIO",
  "tipo": "UNIFICADO",
  "pagadoPorId": 1,
  "grupoId": 1
}
```

**Respuesta 201:**
```json
{
  "id": 6,
  "descripcion": "Factura de Internet",
  "monto": 85000.00,
  "fecha": "2026-04-11",
  "categoria": "SERVICIO",
  "tipo": "UNIFICADO",
  "pagadoPorId": 1,
  "pagadoPorNombre": "Carlos Rodríguez",
  "grupoId": 1,
  "grupoNombre": "Apartamento 402"
}
```

**Respuesta 404 (ID inválido):**
```json
{
  "status": 404,
  "error": "Recurso no encontrado",
  "mensaje": "Usuario con id: 99 no fue encontrado",
  "timestamp": "2026-04-11T11:30:00",
  "path": "/api/expenses"
}
```

---

## 🏗️ Modelo de Datos

```text
User (1) ──── (N) Expense ──── (N) Split
Group (1) ─────────────────────────────┘
```

| Entidad | Campos clave |
|---------|-------------|
| **User** | id, nombre, email, password |
| **Group** | id, nombre, presupuesto_total |
| **Expense** | id, descripcion, monto, fecha, categoria (Enum), tipo (Enum), pagadoPor, grupo |
| **Split** | id, expense, user, monto_asignado, pagado |

**Categorías:** `RENTA` · `SERVICIO` · `MERCADO` · `OTRO`  
**Tipos:** `INDIVIDUAL` · `UNIFICADO`

---

## ⚙️ Configuración para MySQL (Producción)

En `application.properties`, descomenta:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rentsharedb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=tu_password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```

Ejecuta el script de inicialización:
```bash
mysql -u root -p < database/init.sql
```

---

## 🧪 Tests

```bash
cd backend-api
mvn test
```

Los tests unitarios usan **Mockito** y cubren:
- ✅ Listar gastos exitosamente
- ✅ Crear gasto con datos válidos
- ✅ Error 404 si el usuario no existe al crear
- ✅ Error 404 al buscar ID inexistente
- ✅ Error 404 al eliminar ID inexistente

---

## 🔮 Próximos pasos (Roadmap)

- [ ] Autenticación JWT con Spring Security
- [ ] Cálculo automático de divisiones (Split engine)
- [ ] Notificaciones de deudas pendientes
- [ ] Exportar gastos a PDF/Excel
- [ ] Gráficas de gastos por categoría (Chart.js)
- [ ] Migraciones con Flyway/Liquibase

---

## 🛠 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Spring Boot 3.2, Spring Data JPA, Bean Validation |
| Base de datos | H2 (dev) / MySQL (prod) |
| Frontend | HTML5, CSS3, JavaScript ES2022 (Vanilla) |
| Fuentes | Google Fonts — Inter |
| Tests | JUnit 5, Mockito |

---

*Desarrollado con ❤️ — RentShare v1.0.0*
