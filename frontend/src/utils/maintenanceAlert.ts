import type { AlertLevel, MaintenanceItem } from '../types/maintenance';

/**
 * Umbrales aprobados (km que faltan para el próximo mantenimiento):
 *  - Verde:    más de 1,000 km
 *  - Amarillo: de 500 a 1,000 km (ambos incluidos)
 *  - Rojo:     menos de 500 km, o ya vencido
 */
export const YELLOW_THRESHOLD_KM = 1000;
export const RED_THRESHOLD_KM = 500;

/** Km restantes para el próximo mantenimiento (negativo = vencido). */
export function remainingKm(item: MaintenanceItem, currentKm: number): number {
  return item.lastServiceKm + item.intervalKm - currentKm;
}

export function getAlertLevel(remaining: number): AlertLevel {
  if (remaining > YELLOW_THRESHOLD_KM) return 'GREEN';
  if (remaining >= RED_THRESHOLD_KM) return 'YELLOW';
  return 'RED';
}
