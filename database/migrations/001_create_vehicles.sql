-- Tabla de vehículos registrados en el taller.
CREATE TABLE vehicles (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plate          VARCHAR(10)  NOT NULL UNIQUE,
    brand          VARCHAR(50)  NOT NULL,
    model          VARCHAR(50)  NOT NULL,
    year           INTEGER      NOT NULL CHECK (year BETWEEN 1950 AND 2100),
    mileage        INTEGER      NOT NULL CHECK (mileage BETWEEN 0 AND 2000000),
    reception_date DATE         NOT NULL,
    notes          VARCHAR(500) NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
