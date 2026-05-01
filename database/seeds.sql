-- Initial data for RentShare
-- Realistic test data

-- Insert Users (Password: password123)
INSERT INTO usuarios (id, nombre, email, password, rol) VALUES
('d1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1', 'Alex Johnson', 'alex.j@example.com', '$2a$12$I9Y.y6Gz/D5/Xm2z.5X.9O7p7u8w0O8z9Y7z8Y7z8Y7z8Y7z8Y7z8', 'ADMIN'),
('d2b2e2b2-e2b2-4b2b-b2b2-e2b2e2b2e2b2', 'Maria Garcia', 'maria.g@example.com', '$2a$12$I9Y.y6Gz/D5/Xm2z.5X.9O7p7u8w0O8z9Y7z8Y7z8Y7z8Y7z8Y7z8', 'USER'),
('d3b3e3b3-e3b3-4b3b-b3b3-e3b3e3b3e3b3', 'Kenji Sato', 'kenji.s@example.com', '$2a$12$I9Y.y6Gz/D5/Xm2z.5X.9O7p7u8w0O8z9Y7z8Y7z8Y7z8Y7z8Y7z8', 'USER');

-- Insert Products (Linked to Alex and Maria)
INSERT INTO productos (id, nombre, descripcion, precio_dia, propietario_id) VALUES
(uuid_generate_v4(), 'Professional Camera Kit', 'Sony A7III with 24-70mm lens, perfect for events.', 45.00, 'd1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1'),
(uuid_generate_v4(), 'Electric Scooter', 'Xiaomi M365, 30km range. Ideal for city commuting.', 15.00, 'd1b1e1b1-e1b1-4b1b-b1b1-e1b1e1b1e1b1'),
(uuid_generate_v4(), 'Camping Tent (4 person)', 'Weatherproof, easy to setup. Includes sleeping bags.', 10.00, 'd2b2e2b2-e2b2-4b2b-b2b2-e2b2e2b2e2b2'),
(uuid_generate_v4(), 'Gaming Laptop', 'RTX 3070, 16GB RAM. High performance gaming.', 30.00, 'd2b2e2b2-e2b2-4b2b-b2b2-e2b2e2b2e2b2');

-- Insert Rentals (Kenji renting from others)
INSERT INTO alquileres (usuario_id, producto_id, fecha_inicio, fecha_fin, total, estado)
SELECT 
    'd3b3e3b3-e3b3-4b3b-b3b3-e3b3e3b3e3b3', 
    id, 
    CURRENT_DATE + INTERVAL '1 day', 
    CURRENT_DATE + INTERVAL '4 days', 
    precio_dia * 3, 
    'PENDIENTE'
FROM productos 
WHERE nombre = 'Professional Camera Kit'
LIMIT 1;
