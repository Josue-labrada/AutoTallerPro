import { HttpError } from '../../middleware/errorHandler.js';
import { isUuid } from '../work-orders/work-order.validation.js';
import type { CostItem } from './cost.model.js';
import { deleteCostItem, findCostItems, insertCostItem, orderExists } from './cost.repository.js';
import { validateNewCostItem } from './cost.validation.js';

async function requireOrder(orderId: string): Promise<void> {
  if (!isUuid(orderId) || !(await orderExists(orderId))) throw new HttpError(404, 'La orden no existe.');
}

export async function listCosts(orderId: string): Promise<CostItem[]> {
  await requireOrder(orderId);
  return findCostItems(orderId);
}

export async function addCost(orderId: string, body: unknown): Promise<CostItem> {
  await requireOrder(orderId);
  const result = validateNewCostItem(body);
  if (!result.ok) throw new HttpError(400, result.message);
  return insertCostItem(orderId, result.value);
}

export async function removeCost(orderId: string, id: string): Promise<void> {
  await requireOrder(orderId);
  if (!isUuid(id) || !(await deleteCostItem(orderId, id))) throw new HttpError(404, 'El concepto no existe.');
}
