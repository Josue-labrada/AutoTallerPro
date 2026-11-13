-- Servicios y materiales de cada orden. El dinero se guarda en CENTAVOS (entero) para evitar errores de decimales.
CREATE TABLE IF NOT EXISTS cost_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id    UUID         NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    kind             VARCHAR(10)  NOT NULL CHECK (kind IN ('SERVICIO', 'MATERIAL')),
    description      VARCHAR(100) NOT NULL,
    quantity         INTEGER      NOT NULL CHECK (quantity BETWEEN 1 AND 9999),
    unit_price_cents INTEGER      NOT NULL CHECK (unit_price_cents BETWEEN 1 AND 999999999),
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cost_items_order ON cost_items(work_order_id);
