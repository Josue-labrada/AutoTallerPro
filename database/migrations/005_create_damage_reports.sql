-- Daños registrados por zona del vehículo en una orden. La foto (opcional) vive en MinIO; aquí solo su clave.
CREATE TABLE IF NOT EXISTS damage_reports (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id      UUID         NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    zone               VARCHAR(30)  NOT NULL CHECK (zone IN (
                           'FRONTAL', 'COFRE', 'PARABRISAS', 'TECHO', 'VIDRIO_TRASERO', 'CAJUELA', 'TRASERA',
                           'LATERAL_IZQ_DELANTERO', 'LATERAL_IZQ_TRASERO',
                           'LATERAL_DER_DELANTERO', 'LATERAL_DER_TRASERO')),
    description        VARCHAR(300) NOT NULL,
    photo_key          VARCHAR(100),
    photo_content_type VARCHAR(20),
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
    -- La clave y el tipo de la foto van juntos o no van.
    CONSTRAINT damage_photo_pair CHECK ((photo_key IS NULL) = (photo_content_type IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_damage_reports_order ON damage_reports(work_order_id);
