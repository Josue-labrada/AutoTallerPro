/** Etapas del flujo, en orden. El backend es la fuente autorizada de estas reglas. */
export const WORK_ORDER_STATUSES = [
  'EN_RECEPCION',
  'EN_DIAGNOSTICO',
  'EN_REPARACION',
  'LISTO_PARA_ENTREGA',
] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export function isWorkOrderStatus(value: unknown): value is WorkOrderStatus {
  return WORK_ORDER_STATUSES.some((status) => status === value);
}

/** Transiciones permitidas: cada orden solo puede pasar a la etapa siguiente. */
export function isAllowedTransition(from: WorkOrderStatus, to: WorkOrderStatus): boolean {
  return WORK_ORDER_STATUSES.indexOf(to) === WORK_ORDER_STATUSES.indexOf(from) + 1;
}

/** Orden tal como la devuelve la API (incluye datos básicos del vehículo). */
export interface WorkOrder {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleLabel: string;
  description: string;
  status: WorkOrderStatus;
  trackingCode: string;
  /** ISO 8601 */
  createdAt: string;
}
