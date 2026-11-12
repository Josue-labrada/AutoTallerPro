import type { Vehicle, VehicleFormValues } from '../types/vehicle';
import { apiRequest, jsonBody } from './apiClient';

export function listVehicles(): Promise<Vehicle[]> {
  return apiRequest<Vehicle[]>('/api/vehicles');
}

/** Envía el vehículo al backend, que valida de nuevo y rechaza placas duplicadas. */
export function createVehicle(values: VehicleFormValues): Promise<Vehicle> {
  return apiRequest<Vehicle>(
    '/api/vehicles',
    jsonBody('POST', {
      plate: values.plate,
      brand: values.brand,
      model: values.model,
      year: Number(values.year),
      mileage: Number(values.mileage),
      receptionDate: values.receptionDate,
      notes: values.notes,
    }),
  );
}
