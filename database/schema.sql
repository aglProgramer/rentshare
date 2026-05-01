-- ============================================================
-- RentShare - Schema Completo v2
-- Gestión de gastos compartidos de renta
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------
-- Tabla: usuarios (ya existe, se modifica solo si es necesario)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'USER', -- USER o ADMIN (global)
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- Tabla: grupos
-- Un grupo representa una casa / departamento compartido
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS grupos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    creador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- Tabla: miembros_grupo
-- Relación usuario <-> grupo con rol dentro del grupo
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS miembros_grupo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(20) DEFAULT 'MEMBER', -- ADMIN o MEMBER (dentro del grupo)
    fecha_union TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grupo_id, usuario_id)
);

-- -------------------------------------------------------
-- Tabla: invitaciones_grupo
-- Códigos seguros para unirse a un grupo
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitaciones_grupo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    codigo VARCHAR(64) UNIQUE NOT NULL, -- UUID seguro generado por el backend
    solicitante_id UUID REFERENCES usuarios(id) ON DELETE CASCADE, -- quien quiere unirse
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, ACEPTADA, RECHAZADA
    fecha_expiracion TIMESTAMP WITH TIME ZONE, -- opcional: vence en 24h
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- Tabla: gastos
-- Un gasto puede ser compartido o individual
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS gastos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    monto DECIMAL(10, 2) NOT NULL,
    pagado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo VARCHAR(20) DEFAULT 'COMPARTIDO', -- COMPARTIDO o INDIVIDUAL
    categoria VARCHAR(30) DEFAULT 'OTRO', -- RENTA, SERVICIOS, MERCADO, LIMPIEZA, INTERNET, OTRO
    fecha_gasto DATE NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------
-- Tabla: divisiones_gasto
-- A quién le corresponde qué parte de cada gasto
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS divisiones_gasto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gasto_id UUID REFERENCES gastos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    monto_asignado DECIMAL(10, 2) NOT NULL,
    pagado BOOLEAN DEFAULT FALSE,
    UNIQUE(gasto_id, usuario_id)
);

-- -------------------------------------------------------
-- Índices para rendimiento
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_miembros_grupo_grupo ON miembros_grupo(grupo_id);
CREATE INDEX IF NOT EXISTS idx_miembros_grupo_usuario ON miembros_grupo(usuario_id);
CREATE INDEX IF NOT EXISTS idx_invitaciones_codigo ON invitaciones_grupo(codigo);
CREATE INDEX IF NOT EXISTS idx_invitaciones_grupo ON invitaciones_grupo(grupo_id);
CREATE INDEX IF NOT EXISTS idx_gastos_grupo ON gastos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_gastos_pagado_por ON gastos(pagado_por);
CREATE INDEX IF NOT EXISTS idx_divisiones_gasto ON divisiones_gasto(gasto_id);
CREATE INDEX IF NOT EXISTS idx_divisiones_usuario ON divisiones_gasto(usuario_id);
