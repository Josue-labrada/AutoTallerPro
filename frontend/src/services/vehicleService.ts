import type { Vehicle, VehicleFormValues } from '../types/vehicle';
import { normalizePlate } from '../utils/vehicleValidation';

/*
 * Servicio temporal en memoria. Cuando exista el backend, solo hay que
 * cambiar estas funciones para que llamen a la API; las pantallas no cambian.
 */
let vehicles: Vehicle[] = [
  {
    id: 'demo-1',
    plate: 'ABC-123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2019,
    mileage: 68_500,
    receptionDate: '2026-11-03',
    notes: 'Ruido en la suspensión delantera.',
  },
  {
    id: 'demo-2',
    plate: 'XYZ-789',
    brand: 'Nissan',
    model: 'Versa',
    year: 2021,
    mileage: 32_100,
    receptionDate: '2026-11-10',
    notes: '',
  },
];

export async function listVehicles(): Promise<Vehicle[]> {
  return [...vehicles];
}

/** Registra un vehículo ya validado. Rechaza placas duplicadas. */
export async function createVehicle(values: VehicleFormValues): Promise<Vehicle> {
  const plate = normalizePlate(values.plate);
  if (vehicles.some((vehicle) => vehicle.plate === plate)) {
    throw new Error('Ya existe un vehículo registrado con esa placa.');
  }

  const vehicle: Vehicle = {
    id: crypto.randomUUID(),
    plate,
    brand: values.brand.trim(),
    model: values.model.trim(),
    year: Number(values.year),
    mileage: Number(values.mileage),
    receptionDate: values.receptionDate,
    notes: values.notes.trim(),
  };
  vehicles = [vehicle, ...vehicles];
  return vehicle;
}
