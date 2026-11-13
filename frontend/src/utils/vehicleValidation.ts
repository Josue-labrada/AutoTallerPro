import type { VehicleFormErrors, VehicleFormValues } from '../types/vehicle';

const MIN_YEAR = 1950;
const MAX_MILEAGE = 2_000_000;
const PLATE_PATTERN = /^[A-Z0-9][A-Z0-9 -]{3,9}$/;

export const EMPTY_VEHICLE_FORM: VehicleFormValues = {
  plate: '',
  brand: '',
  model: '',
  year: '',
  mileage: '',
  receptionDate: '',
  notes: '',
};

/** Fecha local de hoy en formato AAAA-MM-DD. */
export function todayIsoDate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Normaliza la placa: sin espacios extremos y en mayúsculas. */
export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase();
}

/** Devuelve un objeto con un mensaje por cada campo inválido. Vacío = formulario válido. */
export function validateVehicleForm(
  values: VehicleFormValues,
  now: Date = new Date(),
): VehicleFormErrors {
  const errors: VehicleFormErrors = {};

  if (!PLATE_PATTERN.test(normalizePlate(values.plate))) {
    errors.plate = 'Ingresa una placa válida (4 a 10 letras, números o guiones).';
  }

  if (values.brand.trim() === '') errors.brand = 'La marca es obligatoria.';
  else if (values.brand.trim().length > 50) errors.brand = 'Máximo 50 caracteres.';

  if (values.model.trim() === '') errors.model = 'El modelo es obligatorio.';
  else if (values.model.trim().length > 50) errors.model = 'Máximo 50 caracteres.';

  const maxYear = now.getFullYear() + 1;
  const year = Number(values.year);
  if (values.year.trim() === '' || !Number.isInteger(year) || year < MIN_YEAR || year > maxYear) {
    errors.year = `El año debe estar entre ${MIN_YEAR} y ${maxYear}.`;
  }

  const mileage = Number(values.mileage);
  if (
    values.mileage.trim() === '' ||
    !Number.isInteger(mileage) ||
    mileage < 0 ||
    mileage > MAX_MILEAGE
  ) {
    errors.mileage = 'El kilometraje debe ser un número entero entre 0 y 2,000,000.';
  }

  if (values.receptionDate === '') errors.receptionDate = 'La fecha de recepción es obligatoria.';
  else if (values.receptionDate > todayIsoDate(now)) {
    errors.receptionDate = 'La fecha no puede ser futura.';
  }

  if (values.notes.length > 500) errors.notes = 'Máximo 500 caracteres.';

  return errors;
}
