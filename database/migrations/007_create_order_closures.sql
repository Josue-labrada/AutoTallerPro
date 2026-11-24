-- US12: cierre de órdenes y conservación del resumen de costos.
-- Cada orden puede cerrarse una sola vez.

CREATE TABLE IF NOT EXISTS work_order_closures (
    work_order_id UUID PRIMARY KEY
        REFERENCES work_orders(id) ON DELETE RESTRICT,

    closed_by UUID NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    closed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    items_snapshot JSONB NOT NULL
        DEFAULT '[]'::jsonb
        CHECK (jsonb_typeof(items_snapshot) = 'array'),

    total_cents BIGINT NOT NULL
        CHECK (total_cents >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_closures_closed_by
    ON work_order_closures(closed_by);

CREATE INDEX IF NOT EXISTS idx_order_closures_closed_at
    ON work_order_closures(closed_at);
