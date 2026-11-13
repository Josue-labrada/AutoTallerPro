import { pool } from '../../config/db.js';
import type { Role } from '../auth/auth.model.js';

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export async function findAllUsers(): Promise<UserSummary[]> {
  const result = await pool.query<{ id: string; email: string; name: string; role: Role; created_at: Date }>(
    'SELECT id, email, name, role, created_at FROM users ORDER BY created_at, id',
  );
  return result.rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at.toISOString(),
  }));
}

export async function deleteUserById(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
