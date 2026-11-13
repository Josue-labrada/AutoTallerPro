import { HttpError } from '../../middleware/errorHandler.js';
import {
  isAllowedTransition,
  isWorkOrderStatus,
  type WorkOrder,
} from './work-order.model.js';
import { findAllOrders, insertOrder, updateOrderStatus } from './work-order.repository.js';
import { generateTrackingCode } from './trackingCode.js';
import { isUuid, validateNewOrder } from './work-order.validation.js';

export function listOrders(): Promise<WorkOrder[]> {
  return findAllOrders();
}

export async function createOrder(body: unknown): Promise<WorkOrder> {
  const result = validateNewOrder(body);
  if (!result.ok) throw new HttpError(400, result.message);

  // Si por casualidad el código ya existe, se reintenta con otro.
  for (let attempt = 0; attempt < 5; attempt++) {
    const created = await insertOrder(result.value.vehicleId, result.value.description, generateTrackingCode());
    if (created === null) throw new HttpError(404, 'El vehículo seleccionado no existe.');
    if (created !== 'duplicate-code') return created;
  }
  throw new HttpError(500, 'No se pudo generar el código de seguimiento.');
}

/** Regla de negocio principal del Kanban: solo se puede avanzar a la etapa siguiente. */
export async function changeStatus(id: string, body: unknown): Promise<WorkOrder> {
  if (!isUuid(id)) throw new HttpError(404, 'La orden no existe.');

  const requested = typeof body === 'object' && body !== null ? (body as Record<string, unknown>)['status'] : undefined;
  if (!isWorkOrderStatus(requested)) throw new HttpError(400, 'El estado indicado no es válido.');

  const updated = await updateOrderStatus(id, requested, (current) =>
    isAllowedTransition(current, requested)
      ? null
      : new HttpError(409, 'Transición no permitida: la orden solo puede pasar a la etapa siguiente.'),
  );
  if (!updated) throw new HttpError(404, 'La orden no existe.');
  return updated;
}
