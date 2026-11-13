import { pool } from '../../config/db.js';
import type { MaintenanceItem, NewMaintenanceItem } from './maintenance.model.js';

interface MaintenanceRow {
  id: string;
  vehicle_id: string;
  name: string;
  last_service_km: number;
  interval_km: number;
  last_service_date: string;
  interval_months: number;
}

const COLUMNS = 'id, vehicle_id, name, last_service_km, interval_km, last_service_date, interval_months';

function toItem(row: MaintenanceRow): MaintenanceItem {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    name: row.name,
    lastServiceKm: row.last_service_km,
    intervalKm: row.interval_km,
    lastServiceDate: row.last_service_date,
    intervalMonths: row.interval_months,
  };
}

export async function findAllMaintenance(): Promise<MaintenanceItem[]> {
  const result = await pool.query<MaintenanceRow>(`SELECT ${COLUMNS} FROM maintenance_items ORDER BY created_at, id`);
  return result.rows.map(toItem);
}

/** Kilometraje actual del vehículo, o `null` si el vehículo no existe. */
export async function findVehicleMileage(vehicleId: string): Promise<number | null> {
  const result = await pool.query<{ mileage: number }>('SELECT mileage FROM vehicles WHERE id = $1', [vehicleId]);
  return result.rows[0]?.mileage ?? null;
}

export async function insertMaintenance(item: NewMaintenanceItem): Promise<MaintenanceItem> {
  const result = await pool.query<MaintenanceRow>(
    `INSERT INTO maintenance_items (vehicle_id, name, last_service_km, interval_km, last_service_date, interval_months)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [item.vehicleId, item.name, item.lastServiceKm, item.intervalKm, item.lastServiceDate, item.intervalMonths],
  );
  const row = result.rows[0];
  if (!row) throw new Error('No se pudo guardar el mantenimiento.');
  return toItem(row);
}

export async function deleteMaintenance(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM maintenance_items WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
