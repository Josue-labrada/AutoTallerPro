import { pool } from '../../config/db.js';
import type { AuthUser, Role } from './auth.model.js';

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  created_at: Date;
}

function toUser(row: UserRow): AuthUser {
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function findCredentialsByEmail(
  email: string,
): Promise<{ user: AuthUser; passwordHash: string } | null> {
  const result = await pool.query<UserRow & { password_hash: string }>(
    'SELECT id, email, name, role, created_at, password_hash FROM users WHERE email = $1',
    [email],
  );
  const row = result.rows[0];
  return row ? { user: toUser(row), passwordHash: row.password_hash } : null;
}

/** Devuelve `null` si el correo ya estaba registrado. */
export async function insertUser(
  email: string,
  name: string,
  passwordHash: string,
  role: Role,
): Promise<AuthUser | null> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, name, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, name, role, created_at`,
    [email, name, passwordHash, role],
  );
  const row = result.rows[0];
  return row ? toUser(row) : null;
}

export async function insertSession(tokenHash: string, userId: string, hours: number): Promise<void> {
  // Aprovecha para limpiar las sesiones ya vencidas.
  await pool.query('DELETE FROM sessions WHERE expires_at < now()');
  await pool.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(hours => $3))`,
    [tokenHash, userId, hours],
  );
}

export async function findUserBySession(tokenHash: string): Promise<AuthUser | null> {
  const result = await pool.query<UserRow>(
    `SELECT u.id, u.email, u.name, u.role, u.created_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [tokenHash],
  );
  const row = result.rows[0];
  return row ? toUser(row) : null;
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
}

export async function countUsers(): Promise<number> {
  const result = await pool.query<{ count: string }>('SELECT count(*) FROM users');
  return Number(result.rows[0]?.count ?? 0);
}
