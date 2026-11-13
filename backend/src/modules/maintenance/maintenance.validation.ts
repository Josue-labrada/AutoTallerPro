import { isRealIsoDate, todayIsoDate } from '../../shared/dates.js';
import { isUuid } from '../work-orders/work-order.validation.js';
import type { NewMaintenanceItem } from './maintenance.model.js';

export type MaintenanceValidationResult =
  | { ok: true; value: NewMaintenanceItem }
  | { ok: false; message: string };

function isIntInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

/** Valida formato y rangos. La regla "último servicio ≤ km actual del vehículo" la aplica el servicio. */
export function validateNewMaintenance(body: unknown, now: Date = new Date()): MaintenanceValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'El cuerpo de la petición no es válido.' };
  }
  const data = body as Record<string, unknown>;

  if (!isUuid(data['vehicleId'])) return { ok: false, message: 'Selecciona un vehículo válido.' };

  const name = typeof data['name'] === 'string' ? data['name'].trim() : '';
  if (name === '' || name.length > 60) {
    return { ok: false, message: 'El nombre del mantenimiento es obligatorio (máximo 60 caracteres).' };
  }

  const lastServiceKm = data['lastServiceKm'];
  if (!isIntInRange(lastServiceKm, 0, 2_000_000)) {
    return { ok: false, message: 'El kilometraje del último servicio debe ser un entero igual o mayor a 0.' };
  }

  const intervalKm = data['intervalKm'];
  if (!isIntInRange(intervalKm, 1, 200_000)) {
    return { ok: false, message: 'El intervalo debe ser un entero entre 1 y 200,000 km.' };
  }

  const lastServiceDate = data['lastServiceDate'];
  if (typeof lastServiceDate !== 'string' || !isRealIsoDate(lastServiceDate)) {
    return { ok: false, message: 'La fecha del último servicio no es válida (AAAA-MM-DD).' };
  }
  if (lastServiceDate > todayIsoDate(now)) {
    return { ok: false, message: 'La fecha del último servicio no puede ser futura.' };
  }

  const intervalMonths = data['intervalMonths'];
  if (!isIntInRange(intervalMonths, 1, 120)) {
    return { ok: false, message: 'El intervalo en meses debe ser un entero entre 1 y 120.' };
  }

  return {
    ok: true,
    value: { vehicleId: data['vehicleId'], name, lastServiceKm, intervalKm, lastServiceDate, intervalMonths },
  };
}
