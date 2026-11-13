import { HttpError } from '../../middleware/errorHandler.js';
import { isUuid } from '../work-orders/work-order.validation.js';
import type { MaintenanceItem } from './maintenance.model.js';
import {
  deleteMaintenance,
  findAllMaintenance,
  findVehicleMileage,
  insertMaintenance,
} from './maintenance.repository.js';
import { validateNewMaintenance } from './maintenance.validation.js';

export function listMaintenance(): Promise<MaintenanceItem[]> {
  return findAllMaintenance();
}

export async function addMaintenance(body: unknown): Promise<MaintenanceItem> {
  const result = validateNewMaintenance(body);
  if (!result.ok) throw new HttpError(400, result.message);

  const mileage = await findVehicleMileage(result.value.vehicleId);
  if (mileage === null) throw new HttpError(404, 'El vehículo seleccionado no existe.');
  if (result.value.lastServiceKm > mileage) {
    throw new HttpError(400, 'El último servicio no puede ser posterior al kilometraje actual del vehículo.');
  }
  return insertMaintenance(result.value);
}

export async function removeMaintenance(id: string): Promise<void> {
  if (!isUuid(id) || !(await deleteMaintenance(id))) throw new HttpError(404, 'El mantenimiento no existe.');
}
