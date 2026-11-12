/**
 * Estados de una orden de trabajo, en el orden del flujo del taller.
 * El backend será la fuente autorizada de estos estados; aquí solo se representan.
 */
export const WORK_ORDER_STATUSES = [
  'EN_RECEPCION',
  'EN_DIAGNOSTICO',
  'EN_REPARACION',
  'LISTO_PARA_ENTREGA',
] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export const WORK_ORDER_STATUS_LABELS: Readonly<Record<WorkOrderStatus, string>> = {
  EN_RECEPCION: 'En Recepción',
  EN_DIAGNOSTICO: 'En Diagnóstico',
  EN_REPARACION: 'En Reparación',
  LISTO_PARA_ENTREGA: 'Listo para Entrega',
};

export type WorkOrderStatusCounts = Readonly<Record<WorkOrderStatus, number>>;

/** Orden de trabajo de un vehículo. */
export interface WorkOrder {
  id: string;
  vehiclePlate: string;
  vehicleLabel: string;
  description: string;
  status: WorkOrderStatus;
  /** Código secreto que el taller entrega al cliente para consultar su orden. */
  trackingCode: string;
  /** Fecha de creación en formato ISO 8601. */
  createdAt: string;
}

/** Siguiente etapa permitida; `null` si la orden ya está en la última. */
export function getNextStatus(status: WorkOrderStatus): WorkOrderStatus | null {
  const index = WORK_ORDER_STATUSES.indexOf(status);
  return WORK_ORDER_STATUSES[index + 1] ?? null;
}
