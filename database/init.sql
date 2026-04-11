-- ============================================
-- RentShare — Script de Inicialización DB
-- Compatible con MySQL / PostgreSQL
-- ============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS rentsharedb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE rentsharedb;

-- ——————————————————————————
-- Tabla: users
-- ——————————————————————————
CREATE TABLE IF NOT EXISTS users (
    id       BIGINT       AUTO_INCREMENT PRIMARY KEY,
    nombre   VARCHAR(100) NOT NULL,
    email    VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT chk_email CHECK (email LIKE '%@%.%')
);

-- ——————————————————————————
-- Tabla: app_groups
-- ——————————————————————————
CREATE TABLE IF NOT EXISTS app_groups (
    id                BIGINT        AUTO_INCREMENT PRIMARY KEY,
    nombre            VARCHAR(100)  NOT NULL,
    presupuesto_total DECIMAL(15,2) DEFAULT 0.00
);

-- ——————————————————————————
-- Tabla: expenses
-- ——————————————————————————
CREATE TABLE IF NOT EXISTS expenses (
    id            BIGINT        AUTO_INCREMENT PRIMARY KEY,
    descripcion   VARCHAR(200)  NOT NULL,
    monto         DECIMAL(15,2) NOT NULL,
    fecha         DATE          NOT NULL,
    categoria     ENUM('RENTA', 'SERVICIO', 'MERCADO', 'OTRO') NOT NULL,
    tipo          ENUM('INDIVIDUAL', 'UNIFICADO')              NOT NULL,
    pagado_por_id BIGINT        NOT NULL,
    grupo_id      BIGINT,
    CONSTRAINT fk_expense_user  FOREIGN KEY (pagado_por_id) REFERENCES users(id)  ON DELETE RESTRICT,
    CONSTRAINT fk_expense_group FOREIGN KEY (grupo_id)      REFERENCES app_groups(id) ON DELETE SET NULL
);

-- ——————————————————————————
-- Tabla: splits
-- ——————————————————————————
CREATE TABLE IF NOT EXISTS splits (
    id              BIGINT        AUTO_INCREMENT PRIMARY KEY,
    expense_id      BIGINT        NOT NULL,
    user_id         BIGINT        NOT NULL,
    monto_asignado  DECIMAL(15,2) NOT NULL,
    pagado          BOOLEAN       NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_split_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    CONSTRAINT fk_split_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE RESTRICT,
    UNIQUE KEY uq_split_expense_user (expense_id, user_id)
);

-- ——————————————————————————
-- Índices para performance
-- ——————————————————————————
CREATE INDEX idx_expenses_grupo    ON expenses(grupo_id);
CREATE INDEX idx_expenses_pagador  ON expenses(pagado_por_id);
CREATE INDEX idx_expenses_fecha    ON expenses(fecha);
CREATE INDEX idx_expenses_categoria ON expenses(categoria);
CREATE INDEX idx_splits_expense    ON splits(expense_id);
CREATE INDEX idx_splits_user       ON splits(user_id);

-- ——————————————————————————
-- Datos de Prueba
-- ——————————————————————————
INSERT INTO users (nombre, email, password) VALUES
('Carlos Rodríguez', 'carlos@rentshare.com', '$2a$10$placeholder_hash'),
('María García',     'maria@rentshare.com',  '$2a$10$placeholder_hash'),
('Andrés López',     'andres@rentshare.com', '$2a$10$placeholder_hash');

INSERT INTO app_groups (nombre, presupuesto_total) VALUES
('Apartamento 402', 2500000.00),
('Casa Compartida Norte', 3200000.00);

INSERT INTO expenses (descripcion, monto, fecha, categoria, tipo, pagado_por_id, grupo_id) VALUES
('Arriendo de abril',   850000.00, '2026-04-01', 'RENTA',    'UNIFICADO',  1, 1),
('Factura de luz',      125000.00, '2026-04-03', 'SERVICIO', 'UNIFICADO',  2, 1),
('Mercado semanal',     230000.00, '2026-04-05', 'MERCADO',  'UNIFICADO',  3, 1),
('Suscripción Netflix',  45000.00, '2026-04-07', 'OTRO',     'INDIVIDUAL', 1, 1),
('Gas del mes',          75000.00, '2026-04-08', 'SERVICIO', 'UNIFICADO',  2, 1);
