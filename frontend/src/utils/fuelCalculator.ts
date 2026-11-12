export interface FuelInputs {
  distanceKm: string;
  efficiencyKmPerLiter: string;
  pricePerLiter: string;
}

export type FuelErrors = Partial<Record<keyof FuelInputs, string>>;

export interface FuelEstimate {
  liters: number;
  totalCost: number;
}

/** Convierte texto a número finito; devuelve `null` si está vacío o no es un número. */
function toNumber(text: string): number | null {
  if (text.trim() === '') return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/** Valida las entradas. Objeto vacío = todo válido. */
export function validateFuelInputs(inputs: FuelInputs): FuelErrors {
  const errors: FuelErrors = {};

  const distance = toNumber(inputs.distanceKm);
  if (distance === null || distance < 0) {
    errors.distanceKm = 'La distancia debe ser un número igual o mayor a 0.';
  }

  const efficiency = toNumber(inputs.efficiencyKmPerLiter);
  if (efficiency === null || efficiency <= 0) {
    errors.efficiencyKmPerLiter = 'El rendimiento debe ser un número mayor a 0.';
  }

  const price = toNumber(inputs.pricePerLiter);
  if (price === null || price < 0) {
    errors.pricePerLiter = 'El precio debe ser un número igual o mayor a 0.';
  }

  return errors;
}

/**
 * liters = distancia / rendimiento
 * costo  = liters * precio por litro
 * Lanza un Error si las entradas no son válidas.
 */
export function calculateFuel(inputs: FuelInputs): FuelEstimate {
  if (Object.keys(validateFuelInputs(inputs)).length > 0) {
    throw new Error('Entradas inválidas.');
  }
  const liters = Number(inputs.distanceKm) / Number(inputs.efficiencyKmPerLiter);
  return { liters, totalCost: liters * Number(inputs.pricePerLiter) };
}
