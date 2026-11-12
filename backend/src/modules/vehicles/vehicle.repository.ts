import { pool } from '../../config/db.js';
import type { NewVehicle, Vehicle } from './vehicle.model.js';

interface VehicleRow {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  reception_date: string;
  notes: string;
}

function toVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    plate: row.plate,
    brand: row.brand,
    model: row.model,
    year: row.year,
    mileage: row.mileage,
    receptionDate: row.reception_date,
    notes: row.notes,
  };
}

const COLUMNS = 'id, plate, brand, model, year, mileage, reception_date, notes';

/** Único lugar que habla con PostgreSQL para vehículos. Siempre con consultas parametrizadas ($1, $2…). */
export async function findAllVehicles(): Promise<Vehicle[]> {
  const result = await pool.query<VehicleRow>(
    `SELECT ${COLUMNS} FROM vehicles ORDER BY created_at DESC`,
  );
  return result.rows.map(toVehicle);
}

/** Devuelve `null` si la placa ya existe. */
export async function insertVehicle(vehicle: NewVehicle): Promise<Vehicle | null> {
  const result = await pool.query<VehicleRow>(
    `INSERT INTO vehicles (plate, brand, model, year, mileage, reception_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (plate) DO NOTHING
     RETURNING ${COLUMNS}`,
    [
      vehicle.plate,
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.mileage,
      vehicle.receptionDate,
      vehicle.notes,
    ],
  );
  const row = result.rows[0];
  return row ? toVehicle(row) : null;
}
