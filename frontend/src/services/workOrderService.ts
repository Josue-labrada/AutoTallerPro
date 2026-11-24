import type { OrderClosure } from '../types/orderClosure';
import type { TrackingInfo } from '../types/tracking';
import type { Vehicle } from '../types/vehicle';
import { getNextStatus, type WorkOrder } from '../types/workOrder';
import { isValidTrackingCode, normalizeTrackingCode } from '../utils/trackingCode';
import { apiRequest, jsonBody } from './apiClient';

export function listWorkOrders(): Promise<WorkOrder[]> {
  return apiRequest<WorkOrder[]>('/api/work-orders');
}

export function createWorkOrder(vehicle: Vehicle, description: string): Promise<WorkOrder> {
  return apiRequest<WorkOrder>('/api/work-orders', jsonBody('POST', { vehicleId: vehicle.id, description }));
}

/**
 * Pide al backend mover la orden a la etapa siguiente. El backend es quien decide si la
 * transición es válida; aquí solo se indica cuál es la etapa que sigue.
 */
export function advanceWorkOrder(order: WorkOrder): Promise<WorkOrder> {
  const next = getNextStatus(order.status);
  if (!next) return Promise.reject(new Error('La orden ya está lista para entrega.'));
  return apiRequest<WorkOrder>(`/api/work-orders/${order.id}/status`, jsonBody('PATCH', { status: next }));
}

/** Consulta pública del cliente por código de seguimiento (la placa no sirve). */
export function trackOrder(code: string): Promise<TrackingInfo> {
  if (!isValidTrackingCode(code)) {
    return Promise.reject(new Error('No encontramos una orden con ese código. Revísalo e intenta de nuevo.'));
  }
  return apiRequest<TrackingInfo>(`/api/tracking/${encodeURIComponent(normalizeTrackingCode(code))}`);
}

/** US12: cierra una orden lista para entrega. Solo ADMIN. */
export function closeWorkOrder(orderId: string): Promise<OrderClosure> {
  return apiRequest<OrderClosure>(
    `/api/work-orders/${orderId}/close`,
    jsonBody('POST', {}),
  );
}

/** US12: consulta el resumen persistido de una orden cerrada. */
export function getWorkOrderClosure(orderId: string): Promise<OrderClosure> {
  return apiRequest<OrderClosure>(`/api/work-orders/${orderId}/closure`);
}
