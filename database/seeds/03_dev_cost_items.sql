-- Datos FICTICIOS solo para desarrollo (requiere 02_dev_work_orders.sql). No se duplican si ya existen.
INSERT INTO cost_items (work_order_id, kind, description, quantity, unit_price_cents)
SELECT wo.id, v.kind, v.description, v.quantity, v.unit_price_cents
FROM work_orders wo
CROSS JOIN (VALUES
    ('SERVICIO', 'Diagnóstico de suspensión', 1, 35000),
    ('MATERIAL', 'Amortiguador delantero', 2, 129050)
) AS v(kind, description, quantity, unit_price_cents)
WHERE wo.tracking_code = 'ATP-7K3M-9QX2'
  AND NOT EXISTS (SELECT 1 FROM cost_items c WHERE c.work_order_id = wo.id);
