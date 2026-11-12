-- Datos FICTICIOS solo para desarrollo (requiere 01_dev_vehicles.sql).
INSERT INTO work_orders (vehicle_id, description, status, tracking_code)
SELECT id, 'Ruido en la suspensión delantera.', 'EN_DIAGNOSTICO', 'ATP-7K3M-9QX2'
FROM vehicles WHERE plate = 'ABC-123'
ON CONFLICT (tracking_code) DO NOTHING;

INSERT INTO work_orders (vehicle_id, description, status, tracking_code)
SELECT id, 'Cambio de aceite y revisión de frenos.', 'EN_RECEPCION', 'ATP-4HTR-2WNB'
FROM vehicles WHERE plate = 'XYZ-789'
ON CONFLICT (tracking_code) DO NOTHING;
