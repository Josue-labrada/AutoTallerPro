-- Mantenimientos preventivos programados por vehículo. Los intervalos los captura el taller (no se inventan valores).
CREATE TABLE IF NOT EXISTS maintenance_items (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id         UUID        NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    name               VARCHAR(60) NOT NULL,
    last_service_km    INTEGER     NOT NULL CHECK (last_service_km >= 0),
    interval_km        INTEGER     NOT NULL CHECK (interval_km BETWEEN 1 AND 200000),
    last_service_date  DATE        NOT NULL,
    interval_months    INTEGER     NOT NULL CHECK (interval_months BETWEEN 1 AND 120),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON maintenance_items(vehicle_id);
