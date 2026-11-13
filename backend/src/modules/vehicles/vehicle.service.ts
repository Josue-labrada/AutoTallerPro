import { HttpError } from '../../middleware/errorHandler.js';
import type { Vehicle } from './vehicle.model.js';
import { findAllVehicles, insertVehicle } from './vehicle.repository.js';
import { validateNewVehicle } from './vehicle.validation.js';

export function listVehicles(): Promise<Vehicle[]> {
  return findAllVehicles();
}

/** Reglas de negocio: datos válidos y placa no repetida. */
export async function registerVehicle(body: unknown): Promise<Vehicle> {
  const result = validateNewVehicle(body);
  if (!result.ok) throw new HttpError(400, result.message);

  const created = await insertVehicle(result.value);
  if (!created) throw new HttpError(409, 'Ya existe un vehículo registrado con esa placa.');
  return created;
}
