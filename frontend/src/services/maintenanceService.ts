import type { MaintenanceItem } from '../types/maintenance';
import type { Vehicle } from '../types/vehicle';
import { todayIsoDate } from '../utils/vehicleValidation';
import { apiRequest, jsonBody } from './apiClient';

export function listMaintenanceItems(): Promise<MaintenanceItem[]> {
  return apiRequest<MaintenanceItem[]>('/api/maintenance');
}

/**
 * Valida para dar mensajes claros al usuario y envía los datos al backend,
 * que vuelve a validar todo (nunca confía en el frontend).
 */
export async function addMaintenanceItem(
  vehicle: Vehicle,
  name: string,
  lastServiceText: string,
  intervalText: string,
  lastServiceDate: string,
  intervalMonthsText: string,
): Promise<MaintenanceItem> {
  const text = name.trim();
  if (text === '') throw new Error('Escribe el nombre del mantenimiento.');
  if (text.length > 60) throw new Error('El nombre admite máximo 60 caracteres.');

  const lastServiceKm = Number(lastServiceText);
  if (lastServiceText.trim() === '' || !Number.isInteger(lastServiceKm) || lastServiceKm < 0) {
    throw new Error('El kilometraje del último servicio debe ser un entero igual o mayor a 0.');
  }
  if (lastServiceKm > vehicle.mileage) {
    throw new Error('El último servicio no puede ser posterior al kilometraje actual del vehículo.');
  }

  const intervalKm = Number(intervalText);
  if (intervalText.trim() === '' || !Number.isInteger(intervalKm) || intervalKm < 1 || intervalKm > 200_000) {
    throw new Error('El intervalo debe ser un entero entre 1 y 200,000 km.');
  }

  if (lastServiceDate === '') throw new Error('Indica la fecha del último servicio.');
  if (lastServiceDate > todayIsoDate()) throw new Error('La fecha del último servicio no puede ser futura.');

  const intervalMonths = Number(intervalMonthsText);
  if (
    intervalMonthsText.trim() === '' ||
    !Number.isInteger(intervalMonths) ||
    intervalMonths < 1 ||
    intervalMonths > 120
  ) {
    throw new Error('El intervalo en meses debe ser un entero entre 1 y 120.');
  }

  return apiRequest<MaintenanceItem>(
    '/api/maintenance',
    jsonBody('POST', {
      vehicleId: vehicle.id,
      name: text,
      lastServiceKm,
      intervalKm,
      lastServiceDate,
      intervalMonths,
    }),
  );
}

export async function removeMaintenanceItem(id: string): Promise<void> {
  await apiRequest<undefined>(`/api/maintenance/${id}`, { method: 'DELETE' });
}
