-- Datos FICTICIOS solo para desarrollo (requiere 02_dev_work_orders.sql). Sin foto. No se duplican si ya existen.
INSERT INTO damage_reports (work_order_id, zone, description)
SELECT wo.id, 'LATERAL_IZQ_DELANTERO', 'Rayón profundo en la puerta delantera izquierda.'
FROM work_orders wo
WHERE wo.tracking_code = 'ATP-7K3M-9QX2'
  AND NOT EXISTS (SELECT 1 FROM damage_reports d WHERE d.work_order_id = wo.id);
