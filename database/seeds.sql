-- ============================================================
-- RentShare - Seeds v2
-- ============================================================

-- Usuarios de prueba (password: password123)
INSERT INTO usuarios (id, nombre, email, password, rol) VALUES
('d1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1', 'Alex Johnson', 'alex.j@example.com', '$2a$12$I9Y.y6Gz/D5/Xm2z.5X.9O7p7u8w0O8z9Y7z8Y7z8Y7z8Y7z8Y7z8', 'USER'),
('d2b2e2b2-e2b2-4b2b-b2b2-e2b2e2b2e2b2', 'Maria Garcia', 'maria.g@example.com', '$2a$12$I9Y.y6Gz/D5/Xm2z.5X.9O7p7u8w0O8z9Y7z8Y7z8Y7z8Y7z8Y7z8', 'USER'),
('d3b3e3b3-e3b3-4b3b-b3b3-e3b3e3b3e3b3', 'Kenji Sato', 'kenji.s@example.com', '$2a$12$I9Y.y6Gz/D5/Xm2z.5X.9O7p7u8w0O8z9Y7z8Y7z8Y7z8Y7z8Y7z8', 'USER')
ON CONFLICT (email) DO NOTHING;

-- Grupo de prueba
INSERT INTO grupos (id, nombre, descripcion, creador_id) VALUES
('a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1', 'Apartamento 201', 'Gastos del aparta en el centro', 'd1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1');

-- Miembros del grupo
INSERT INTO miembros_grupo (grupo_id, usuario_id, rol) VALUES
('a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1', 'd1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1', 'ADMIN'),
('a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1', 'd2b2e2b2-e2b2-4b2b-b2b2-e2b2e2b2e2b2', 'MEMBER'),
('a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1', 'd3b3e3b3-e3b3-4b3b-b3b3-e3b3e3b3e3b3', 'MEMBER');

-- Gastos de prueba
INSERT INTO gastos (id, grupo_id, titulo, monto, pagado_por, tipo, categoria, fecha_gasto) VALUES
('g1g1g1g1-g1g1-4g1g-g1g1-g1g1g1g1g1g1', 'a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1', 'Renta Abril', 1500000.00, 'd1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1', 'COMPARTIDO', 'RENTA', CURRENT_DATE),
('g2g2g2g2-g2g2-4g2g-g2g2-g2g2g2g2g2g2', 'a1a1a1a1-a1a1-4a1a-a1a1-a1a1a1a1a1a1', 'Mercado', 150000.00, 'd2b2e2b2-e2b2-4b2b-b2b2-e2b2e2b2e2b2', 'COMPARTIDO', 'MERCADO', CURRENT_DATE);

-- Divisiones (3 personas, partes iguales)
INSERT INTO divisiones_gasto (gasto_id, usuario_id, monto_asignado, pagado) VALUES
('g1g1g1g1-g1g1-4g1g-g1g1-g1g1g1g1g1g1', 'd1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1', 500000.00, TRUE),
('g1g1g1g1-g1g1-4g1g-g1g1-g1g1g1g1g1g1', 'd2b2e2b2-e2b2-4b2b-b2b2-e2b2e2b2e2b2', 500000.00, FALSE),
('g1g1g1g1-g1g1-4g1g-g1g1-g1g1g1g1g1g1', 'd3b3e3b3-e3b3-4b3b-b3b3-e3b3e3b3e3b3', 500000.00, FALSE),
('g2g2g2g2-g2g2-4g2g-g2g2-g2g2g2g2g2g2', 'd1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1', 50000.00, FALSE),
('g2g2g2g2-g2g2-4g2g-g2g2-g2g2g2g2g2g2', 'd2b2e2b2-e2b2-4b2b-b2b2-e2b2e2b2e2b2', 50000.00, TRUE),
('g2g2g2g2-g2g2-4g2g-g2g2-g2g2g2g2g2g2', 'd3b3e3b3-e3b3-4b3b-b3b3-e3b3e3b3e3b3', 50000.00, FALSE);
