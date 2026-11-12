import { COST_KINDS, type CostKind, type NewCostItem } from './cost.model.js';

const MAX_PRICE_CENTS = 999_999_999;

function isCostKind(value: unknown): value is CostKind {
  return COST_KINDS.some((kind) => kind === value);
}

export type CostValidationResult = { ok: true; value: NewCostItem } | { ok: false; message: string };

export function validateNewCostItem(body: unknown): CostValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'El cuerpo de la petición no es válido.' };
  }
  const data = body as Record<string, unknown>;

  const kind = data['kind'];
  if (!isCostKind(kind)) return { ok: false, message: 'El tipo debe ser SERVICIO o MATERIAL.' };

  const description = typeof data['description'] === 'string' ? data['description'].trim() : '';
  if (description === '' || description.length > 100) {
    return { ok: false, message: 'La descripción es obligatoria (máximo 100 caracteres).' };
  }

  const quantity = data['quantity'];
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
    return { ok: false, message: 'La cantidad debe ser un entero entre 1 y 9999.' };
  }

  const unitPriceCents = data['unitPriceCents'];
  if (
    typeof unitPriceCents !== 'number' ||
    !Number.isInteger(unitPriceCents) ||
    unitPriceCents < 1 ||
    unitPriceCents > MAX_PRICE_CENTS
  ) {
    return { ok: false, message: 'El precio debe ser un entero de centavos mayor a 0.' };
  }

  return { ok: true, value: { kind, description, quantity, unitPriceCents } };
}
