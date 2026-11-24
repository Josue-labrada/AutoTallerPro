import { HttpError } from '../../middleware/errorHandler.js';
import type { AuthUser } from '../auth/auth.model.js';
import { isUuid } from './work-order.validation.js';
import {
  findOrderClosure,
  insertOrderClosure,
  type OrderClosure,
} from './order-closure.repository.js';

/**
 * Cierra una orden y registra al administrador responsable.
 */
export async function closeOrder(
  orderId: string,
  user: AuthUser | undefined,
): Promise<OrderClosure> {
  if (!user) {
    throw new HttpError(401, 'Inicia sesión para continuar.');
  }

  if (user.role !== 'ADMIN') {
    throw new HttpError(403, 'Solo un administrador puede cerrar órdenes.');
  }

  if (!isUuid(orderId)) {
    throw new HttpError(404, 'La orden no existe.');
  }

  const result = await insertOrderClosure(orderId, user.id);

  if (result === null) {
    throw new HttpError(404, 'La orden no existe.');
  }

  if (result === 'already-closed') {
    throw new HttpError(409, 'La orden ya está cerrada.');
  }

  if (result === 'not-ready') {
    throw new HttpError(409, 'La orden debe estar lista para entrega antes de cerrarse.');
  }

  return result;
}

/**
 * Consulta el resumen almacenado de una orden cerrada.
 */
export async function getOrderClosure(
  orderId: string,
): Promise<OrderClosure> {
  if (!isUuid(orderId)) {
    throw new HttpError(404, 'La orden no existe.');
  }

  const closure = await findOrderClosure(orderId);

  if (!closure) {
    throw new HttpError(404, 'No existe un cierre para esta orden.');
  }

  return closure;
}
