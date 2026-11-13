import { pool } from '../../config/db.js';
import type { DamageReport, DamageZone } from './damage.model.js';

interface DamageRow {
  id: string;
  work_order_id: string;
  zone: DamageZone;
  description: string;
  photo_key: string | null;
  created_at: Date;
}

const COLUMNS = 'id, work_order_id, zone, description, photo_key, created_at';

function toReport(row: DamageRow): DamageReport {
  return {
    id: row.id,
    orderId: row.work_order_id,
    zone: row.zone,
    description: row.description,
    photoUrl: row.photo_key ? `/api/work-orders/${row.work_order_id}/damages/${row.id}/photo` : null,
    createdAt: row.created_at.toISOString(),
  };
}

export async function orderExists(orderId: string): Promise<boolean> {
  const result = await pool.query('SELECT 1 FROM work_orders WHERE id = $1', [orderId]);
  return (result.rowCount ?? 0) > 0;
}

export async function findDamages(orderId: string): Promise<DamageReport[]> {
  const result = await pool.query<DamageRow>(
    `SELECT ${COLUMNS} FROM damage_reports WHERE work_order_id = $1 ORDER BY created_at DESC, id`,
    [orderId],
  );
  return result.rows.map(toReport);
}

export async function insertDamage(
  orderId: string,
  zone: DamageZone,
  description: string,
  photo: { key: string; contentType: string } | null,
): Promise<DamageReport> {
  const result = await pool.query<DamageRow>(
    `INSERT INTO damage_reports (work_order_id, zone, description, photo_key, photo_content_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [orderId, zone, description, photo?.key ?? null, photo?.contentType ?? null],
  );
  const row = result.rows[0];
  if (!row) throw new Error('No se pudo guardar el daño.');
  return toReport(row);
}

/** Clave y tipo de la foto de un daño de esa orden, o `null` si no existe o no tiene foto. */
export async function findPhoto(
  orderId: string,
  damageId: string,
): Promise<{ key: string; contentType: string } | null> {
  const result = await pool.query<{ photo_key: string | null; photo_content_type: string | null }>(
    'SELECT photo_key, photo_content_type FROM damage_reports WHERE id = $1 AND work_order_id = $2',
    [damageId, orderId],
  );
  const row = result.rows[0];
  if (!row?.photo_key || !row.photo_content_type) return null;
  return { key: row.photo_key, contentType: row.photo_content_type };
}
