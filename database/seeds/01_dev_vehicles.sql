-- Datos FICTICIOS solo para desarrollo. Nunca uses datos reales de clientes en este repositorio.
INSERT INTO vehicles (plate, brand, model, year, mileage, reception_date, notes) VALUES
    ('ABC-123', 'Toyota', 'Corolla', 2019, 68500, '2026-11-03', 'Ruido en la suspensión delantera.'),
    ('XYZ-789', 'Nissan', 'Versa', 2021, 32100, '2026-11-10', '')
ON CONFLICT (plate) DO NOTHING;
