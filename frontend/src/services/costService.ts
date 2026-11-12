import type { CostItem, CostKind } from '../types/cost';
import { parseMoneyToCents } from '../utils/money';

/* Servicio temporal en memoria; luego se reemplazará por llamadas a la API. */
let items: CostItem[] = [];

export async function listCostItems(orderId: string): Promise<CostItem[]> {
  return items.filter((item) => item.orderId === orderId);
}

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

  const item: CostItem = {
    id: crypto.randomUUID(),
    orderId,
    kind,
    description: text,
    quantity,
    unitPriceCents,
  };
  items = [...items, item];
  return item;
}

export async function removeCostItem(id: string): Promise<void> {
  items = items.filter((item) => item.id !== id);
}
