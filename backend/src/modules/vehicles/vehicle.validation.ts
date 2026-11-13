import { isRealIsoDate, todayIsoDate } from '../../shared/dates.js';
import type { NewVehicle } from './vehicle.model.js';

const MIN_YEAR = 1950;
const MAX_MILEAGE = 2_000_000;
const PLATE_PATTERN = /^[A-Z0-9][A-Z0-9 -]{3,9}$/;

export type ValidationResult =
  | { ok: true; value: NewVehicle }
  | { ok: false; message: string };

/**
 * Valida el cuerpo de la petición. Nunca confía en lo que manda el frontend:
 * revisa tipos, rangos y formato, y devuelve el vehículo ya limpio.
 */
export function validateNewVehicle(body: unknown, now: Date = new Date()): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'El cuerpo de la petición no es válido.' };
  }
  const data = body as Record<string, unknown>;

  const plate = typeof data['plate'] === 'string' ? data['plate'].trim().toUpperCase() : '';
  if (!PLATE_PATTERN.test(plate)) {
    return { ok: false, message: 'Placa inválida (4 a 10 letras, números o guiones).' };
  }

  const brand = typeof data['brand'] === 'string' ? data['brand'].trim() : '';
  if (brand === '' || brand.length > 50) {
    return { ok: false, message: 'La marca es obligatoria (máximo 50 caracteres).' };
  }

  const model = typeof data['model'] === 'string' ? data['model'].trim() : '';
  if (model === '' || model.length > 50) {
    return { ok: false, message: 'El modelo es obligatorio (máximo 50 caracteres).' };
  }

  const year = data['year'];
  const maxYear = now.getFullYear() + 1;
  if (typeof year !== 'number' || !Number.isInteger(year) || year < MIN_YEAR || year > maxYear) {
    return { ok: false, message: `El año debe estar entre ${MIN_YEAR} y ${maxYear}.` };
  }

  const mileage = data['mileage'];
  if (
    typeof mileage !== 'number' ||
    !Number.isInteger(mileage) ||
    mileage < 0 ||
    mileage > MAX_MILEAGE
  ) {
    return { ok: false, message: 'El kilometraje debe ser un entero entre 0 y 2,000,000.' };
  }

  const receptionDate = data['receptionDate'];
  if (typeof receptionDate !== 'string' || !isRealIsoDate(receptionDate)) {
    return { ok: false, message: 'La fecha de recepción no es válida (AAAA-MM-DD).' };
  }
  if (receptionDate > todayIsoDate(now)) {
    return { ok: false, message: 'La fecha de recepción no puede ser futura.' };
  }

  const rawNotes = data['notes'];
  const notes = typeof rawNotes === 'string' ? rawNotes.trim() : '';
  if (rawNotes !== undefined && typeof rawNotes !== 'string') {
    return { ok: false, message: 'Las observaciones deben ser texto.' };
  }
  if (notes.length > 500) {
    return { ok: false, message: 'Las observaciones admiten máximo 500 caracteres.' };
  }

  return { ok: true, value: { plate, brand, model, year, mileage, receptionDate, notes } };
}
