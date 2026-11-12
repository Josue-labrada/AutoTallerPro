import type { MaintenanceItem } from '../types/maintenance';
import type { Vehicle } from '../types/vehicle';

/* Servicio temporal en memoria; luego se reemplazará por llamadas a la API. */
let items: MaintenanceItem[] = [
  {
    id: 'mnt-1',
    vehicleId: 'demo-1',
    name: 'Cambio de aceite',
    lastServiceKm: 60_000,
    intervalKm: 10_000,
  },
];

export async function listMaintenanceItems(): Promise<MaintenanceItem[]> {
  return [...items];
}

export async function addMaintenanceItem(
  vehicle: Vehicle,
  name: string,
  lastServiceText: string,
  intervalText: string,
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

  const item: MaintenanceItem = {
    id: crypto.randomUUID(),
    vehicleId: vehicle.id,
    name: text,
    lastServiceKm,
    intervalKm,
  };
  items = [...items, item];
  return item;
}

export async function removeMaintenanceItem(id: string): Promise<void> {
  items = items.filter((item) => item.id !== id);
}
