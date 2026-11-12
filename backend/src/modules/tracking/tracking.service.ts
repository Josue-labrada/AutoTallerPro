import { pool } from '../../config/db.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { isValidTrackingCode } from '../work-orders/trackingCode.js';

/** Lo ÚNICO que puede ver el cliente: sin descripción interna, costos, daños ni placa completa. */
export interface TrackingInfo {
  vehicleLabel: string;
  maskedPlate: string;
  status: string;
}

interface TrackingRow {
  plate: string;
  brand: string;
  model: string;
  year: number;
  status: string;
}

export async function trackOrder(rawCode: string): Promise<TrackingInfo> {
  // Mismo error si el formato es malo o el código no existe: no da pistas para adivinar códigos.
  const notFound = new HttpError(404, 'No encontramos una orden con ese código. Revísalo e intenta de nuevo.');

  const code = rawCode.trim().toUpperCase();
  if (!isValidTrackingCode(code)) throw notFound;

  const result = await pool.query<TrackingRow>(
    `SELECT v.plate, v.brand, v.model, v.year, wo.status
     FROM work_orders wo
     JOIN vehicles v ON v.id = wo.vehicle_id
     WHERE wo.tracking_code = $1`,
    [code],
  );
  const row = result.rows[0];
  if (!row) throw notFound;

  return {
    vehicleLabel: `${row.brand} ${row.model} ${row.year}`,
    maskedPlate: `•••${row.plate.slice(-3)}`,
    status: row.status,
  };
}
