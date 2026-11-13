import type { CostItem, CostKind } from '../types/cost';
import { parseMoneyToCents } from '../utils/money';
import { apiRequest, jsonBody } from './apiClient';

export function listCostItems(orderId: string): Promise<CostItem[]> {
  return apiRequest<CostItem[]>(`/api/work-orders/${orderId}/costs`);
}

/**
 * Valida para dar mensajes claros al usuario y envía el precio en centavos (entero).
 * El backend vuelve a validar todo: nunca confía en el frontend.
 */
export async function addCostItem(
  orderId: string,
  kind: CostKind,
  description: string,
  quantityText: string,
  priceText: string,
): Promise<CostItem> {
  const text = description.trim();
  if (text === '') throw new Error('Escribe una descripción.');
  if (text.length > 100) throw new Error('La descripción admite máximo 100 caracteres.');

  const quantity = Number(quantityText);
  if (quantityText.trim() === '' || !Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
    throw new Error('La cantidad debe ser un número entero entre 1 y 9999.');
  }

  const unitPriceCents = parseMoneyToCents(priceText);
  if (unitPriceCents === null || unitPriceCents === 0) {
    throw new Error('El precio debe ser mayor a 0, con máximo 2 decimales (ej. 125.50).');
  }

  return apiRequest<CostItem>(
    `/api/work-orders/${orderId}/costs`,
    jsonBody('POST', { kind, description: text, quantity, unitPriceCents }),
  );
}

export async function removeCostItem(orderId: string, id: string): Promise<void> {
  await apiRequest<undefined>(`/api/work-orders/${orderId}/costs/${id}`, { method: 'DELETE' });
}
