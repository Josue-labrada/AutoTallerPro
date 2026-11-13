-- Datos FICTICIOS solo para desarrollo (requiere 01_dev_vehicles.sql). No se duplican si ya existen.
INSERT INTO maintenance_items (vehicle_id, name, last_service_km, interval_km, last_service_date, interval_months)
SELECT id, 'Cambio de aceite', 60000, 10000, DATE '2026-06-01', 6
FROM vehicles v
WHERE plate = 'ABC-123'
  AND NOT EXISTS (SELECT 1 FROM maintenance_items m WHERE m.vehicle_id = v.id AND m.name = 'Cambio de aceite');
