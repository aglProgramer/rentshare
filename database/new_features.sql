-- ============================================================
-- RentShare - Nuevas Tablas v3
-- Tareas, Inventario y Notificaciones
-- ============================================================

-- Tabla: tareas
CREATE TABLE IF NOT EXISTS tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_vencimiento TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, EN_PROGRESO, COMPLETADA
    asignado_a UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    es_recurrente BOOLEAN DEFAULT false,
    frecuencia VARCHAR(20), -- DIARIA, SEMANAL, MENSUAL
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: inventario
CREATE TABLE IF NOT EXISTS inventario (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    nombre VARCHAR(150) NOT NULL,
    cantidad DECIMAL(10, 2) DEFAULT 0,
    unidad VARCHAR(20) DEFAULT 'unidades', -- unidades, kg, litros, etc.
    stock_minimo DECIMAL(10, 2) DEFAULT 0,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: notification_settings (Mejorada para RentShare)
CREATE TABLE IF NOT EXISTS notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    notif_tareas_asignadas BOOLEAN DEFAULT true,
    notif_gastos_vencidos BOOLEAN DEFAULT true,
    notif_inventario_bajo BOOLEAN DEFAULT true,
    frecuencia_email VARCHAR(20) DEFAULT 'DIARIA', -- DIARIA, SEMANAL, INMEDIATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: recordatorios_programados
CREATE TABLE IF NOT EXISTS recordatorios_programados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID REFERENCES grupos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50), -- TAREA_VENCIDA, INVENTARIO_BAJO, PAGO_PENDIENTE
    fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
    enviado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tareas_grupo ON tareas(grupo_id);
CREATE INDEX IF NOT EXISTS idx_tareas_asignado ON tareas(asignado_a);
CREATE INDEX IF NOT EXISTS idx_inventario_grupo ON inventario(grupo_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_usuario ON recordatorios_programados(usuario_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha ON recordatorios_programados(fecha_programada) WHERE enviado = false;
