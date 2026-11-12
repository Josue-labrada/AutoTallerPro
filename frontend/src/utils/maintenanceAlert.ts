import type { AlertLevel, MaintenanceItem } from '../types/maintenance';

/**
 * Umbrales aprobados (km que faltan para el próximo mantenimiento):
 *  - Verde:    más de 1,000 km
 *  - Amarillo: de 500 a 1,000 km (ambos incluidos)
 *  - Rojo:     menos de 500 km, o ya vencido
 */
export const YELLOW_THRESHOLD_KM = 1000;
export const RED_THRESHOLD_KM = 500;

/**
 * Umbrales por fecha (días que faltan para el próximo mantenimiento).
 * PROPUESTA pendiente de aprobación del equipo:
 *  - Verde:    más de 30 días
 *  - Amarillo: de 15 a 30 días (ambos incluidos)
 *  - Rojo:     menos de 15 días, o ya vencido
 */
export const YELLOW_THRESHOLD_DAYS = 30;
export const RED_THRESHOLD_DAYS = 15;

/** Km restantes para el próximo mantenimiento (negativo = vencido). */
export function remainingKm(item: MaintenanceItem, currentKm: number): number {
  return item.lastServiceKm + item.intervalKm - currentKm;
}

function levelFor(remaining: number, yellowThreshold: number, redThreshold: number): AlertLevel {
  if (remaining > yellowThreshold) return 'GREEN';
  if (remaining >= redThreshold) return 'YELLOW';
  return 'RED';
}

export function getAlertLevel(remaining: number): AlertLevel {
  return levelFor(remaining, YELLOW_THRESHOLD_KM, RED_THRESHOLD_KM);
}

export function getDaysAlertLevel(remainingDays: number): AlertLevel {
  return levelFor(remainingDays, YELLOW_THRESHOLD_DAYS, RED_THRESHOLD_DAYS);
}

const LEVEL_SEVERITY: Readonly<Record<AlertLevel, number>> = { GREEN: 0, YELLOW: 1, RED: 2 };

/** La alerta final es la más grave entre la de kilómetros y la de fecha. */
export function worstLevel(a: AlertLevel, b: AlertLevel): AlertLevel {
  return LEVEL_SEVERITY[a] >= LEVEL_SEVERITY[b] ? a : b;
}

function parseIsoDate(isoDate: string): Date {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Fecha (AAAA-MM-DD) del próximo mantenimiento: último servicio + N meses. */
export function nextDueDate(item: MaintenanceItem): string {
  const last = parseIsoDate(item.lastServiceDate);
  const target = new Date(last.getFullYear(), last.getMonth() + item.intervalMonths, 1);
  // Si el día no existe en el mes destino (p. ej. 31 de febrero), se usa el último día de ese mes.
  const lastDayOfMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(last.getDate(), lastDayOfMonth));
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${target.getFullYear()}-${month}-${day}`;
}

/** Días que faltan para el próximo mantenimiento (negativo = vencido). */
export function remainingDays(item: MaintenanceItem, today: Date = new Date()): number {
  const due = parseIsoDate(nextDueDate(item));
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((due.getTime() - todayStart.getTime()) / 86_400_000);
}
