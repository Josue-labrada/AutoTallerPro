-- Órdenes de trabajo. El estado y las transiciones permitidas las controla el backend.
CREATE TABLE IF NOT EXISTS work_orders (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id    UUID         NOT NULL REFERENCES vehicles(id),
    description   VARCHAR(300) NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'EN_RECEPCION'
                  CHECK (status IN ('EN_RECEPCION', 'EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO_PARA_ENTREGA')),
    -- Código secreto para que el cliente consulte su orden (no se usa la placa).
    tracking_code VARCHAR(14)  NOT NULL UNIQUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle ON work_orders(vehicle_id);
