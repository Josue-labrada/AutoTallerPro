import { WORK_ORDER_STATUSES, type WorkOrderStatusCounts } from '../types/workOrder';

/** Órdenes activas: todas las que aún no han sido entregadas al cliente. */
export function countActiveOrders(counts: WorkOrderStatusCounts): number {
  return WORK_ORDER_STATUSES.reduce((total, status) => total + counts[status], 0);
}

/** Porcentaje (0–100) de una parte respecto al total. Devuelve 0 si el total es 0. */
export function sharePercent(part: number, total: number): number {
  if (total <= 0 || part <= 0) return 0;
  return Math.round((part / total) * 100);
}
