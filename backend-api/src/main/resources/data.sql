-- ===========================
-- Datos de prueba para RentShare Multi-User
-- ===========================

-- Grupos de ejemplo
INSERT INTO app_groups (nombre, presupuesto_total, codigo_invitacion) VALUES
('Apartamento 402',      2500000.00, 'INVITE123'),
('Casa Compartida Norte', 3200000.00, 'INVITE456');

-- Usuarios de ejemplo
INSERT INTO users (nombre, email, password, role, home_group_id) VALUES
('Carlos Rodríguez', 'carlos@rentshare.com', '123456', 'ADMIN', 1),
('María García',     'maria@rentshare.com',  '123456', 'MEMBER', 1),
('Andrés López',     'andres@rentshare.com', '123456', 'MEMBER', 1);

-- Gastos de ejemplo
INSERT INTO expenses (descripcion, monto, fecha, categoria, tipo, pagado_por_id, grupo_id) VALUES
('Arriendo de abril',    850000.00, '2026-04-01', 'RENTA',    'UNIFICADO',  1, 1),
('Factura de luz',       125000.00, '2026-04-03', 'SERVICIO', 'UNIFICADO',  2, 1),
('Mercado semanal',      230000.00, '2026-04-05', 'MERCADO',  'UNIFICADO',  3, 1),
('Suscripción Netflix',   45000.00, '2026-04-07', 'OTRO',     'INDIVIDUAL', 1, 1),
('Gas del mes',           75000.00, '2026-04-08', 'SERVICIO', 'UNIFICADO',  2, 1);

-- Splits (divisiones de gastos)
INSERT INTO splits (expense_id, user_id, monto_asignado, pagado) VALUES
(1, 1, 283333.33, true),
(1, 2, 283333.33, false),
(1, 3, 283333.34, false),
(2, 1, 41666.67, false),
(2, 2, 41666.67, true),
(2, 3, 41666.66, false),
(3, 1, 76666.67, false),
(3, 2, 76666.67, false),
(3, 3, 76666.66, true);
