-- Usuarios, sesiones y dueño de cada vehículo.
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(254) NOT NULL UNIQUE CHECK (email = lower(email)),
    name          VARCHAR(100) NOT NULL,
    -- Nunca se guarda la contraseña, solo su hash con sal (scrypt).
    password_hash TEXT         NOT NULL,
    role          VARCHAR(10)  NOT NULL CHECK (role IN ('ADMIN', 'WORKER', 'CUSTOMER')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- La cookie del navegador lleva un token aleatorio; aquí solo se guarda su hash SHA-256.
CREATE TABLE IF NOT EXISTS sessions (
    token_hash CHAR(64)    PRIMARY KEY,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Cuenta de cliente dueña del vehículo (se enlaza con el código de seguimiento de una orden).
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_owner ON vehicles(owner_id);
