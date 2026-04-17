# 🏠 RentShare - Definición del Proyecto

**RentShare** es una plataforma integral diseñada para simplificar la gestión de gastos compartidos entre compañeros de vivienda (roommates). Permite registrar gastos, categorizarlos y calcular automáticamente las divisiones (splits) para mantener un balance justo.

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura desacoplada:

1.  **Backend (Spring Boot 3.2)**: 
    *   API RESTful que gestiona la persistencia de datos y la lógica de negocio.
    *   Uso de **Spring Data JPA** con base de datos **H2** en memoria.
    *   Manejo global de excepciones y validación de DTOs.
    
2.  **Frontend (Vanilla JavaScript)**:
    *   Interfaz moderna basada en HTML5/CSS3 con diseño **Glassmorphism**.
    *   Cliente de API centralizado (`api-client.js`) para consumo de recursos.
    *   Gestión de sesión simple mediante tokens mock.

## 📡 Endpoints de la API

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Autenticación de usuarios y obtención de token. |
| `GET` | `/api/expenses` | Listar todos los gastos registrados. |
| `POST` | `/api/expenses` | Registrar un nuevo gasto. |
| `DELETE` | `/api/expenses/{id}` | Eliminar un gasto existente. |

## 🛠️ Lógica de Negocio: Split Engine

El servicio `SplitCalculatorService` se encarga de dividir un monto total entre una lista de participantes de forma equitativa, aplicando redondeo a dos decimales (`RoundingMode.HALF_UP`).

## 🚀 Guía de Ejecución

### Backend
```bash
cd backend-api
mvn spring-boot:run
```
*   API: `http://localhost:8080`
*   Consola H2: `http://localhost:8080/h2-console`

### Frontend
```bash
cd frontend-web
npx http-server . -p 5500
```
*   Acceso: `http://localhost:5500/login.html`

## 👥 Credenciales Demo
*   **Email**: `carlos@rentshare.com`
*   **Contraseña**: `123456`
