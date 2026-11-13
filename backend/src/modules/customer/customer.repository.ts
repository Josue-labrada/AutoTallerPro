import { pool } from '../../config/db.js';

/** Lo único del vehículo que ve su dueño: sin observaciones internas ni fechas de recepción. */
export interface CustomerVehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

export interface CustomerMaintenance {
  id: string;
  vehicleId: string;
  name: string;
  lastServiceKm: number;
  intervalKm: number;
  lastServiceDate: string;
  intervalMonths: number;
}

export type ClaimResult = 'claimed' | 'already-yours' | 'owned-by-other' | 'not-found';

/**
 * Enlaza el vehículo de la orden con la cuenta. Es atómico: el UPDATE solo ocurre si el vehículo
 * no tenía dueño, así dos clientes que usen el mismo código a la vez no se lo pueden "robar".
 */
export async function claimVehicleByTrackingCode(userId: string, trackingCode: string): Promise<ClaimResult> {
  const found = await pool.query<{ vehicle_id: string; owner_id: string | null }>(
    `SELECT v.id AS vehicle_id, v.owner_id
     FROM work_orders wo JOIN vehicles v ON v.id = wo.vehicle_id
     WHERE wo.tracking_code = $1`,
    [trackingCode],
  );
  const row = found.rows[0];
  if (!row) return 'not-found';
  if (row.owner_id === userId) return 'already-yours';

  const updated = await pool.query(
    'UPDATE vehicles SET owner_id = $1 WHERE id = $2 AND owner_id IS NULL',
    [userId, row.vehicle_id],
  );
  return (updated.rowCount ?? 0) > 0 ? 'claimed' : 'owned-by-other';
}

export async function findOwnVehicles(userId: string): Promise<CustomerVehicle[]> {
  const result = await pool.query<CustomerVehicle>(
    'SELECT id, plate, brand, model, year, mileage FROM vehicles WHERE owner_id = $1 ORDER BY created_at DESC',
    [userId],
  );
  return result.rows;
}

export async function findOwnMaintenance(userId: string): Promise<CustomerMaintenance[]> {
  const result = await pool.query<{
    id: string;
    vehicle_id: string;
    name: string;
    last_service_km: number;
    interval_km: number;
    last_service_date: string;
    interval_months: number;
  }>(
    `SELECT m.id, m.vehicle_id, m.name, m.last_service_km, m.interval_km, m.last_service_date, m.interval_months
     FROM maintenance_items m JOIN vehicles v ON v.id = m.vehicle_id
     WHERE v.owner_id = $1
     ORDER BY m.created_at, m.id`,
    [userId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    vehicleId: row.vehicle_id,
    name: row.name,
    lastServiceKm: row.last_service_km,
    intervalKm: row.interval_km,
    lastServiceDate: row.last_service_date,
    intervalMonths: row.interval_months,
  }));
}
