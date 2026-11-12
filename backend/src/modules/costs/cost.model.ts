export const COST_KINDS = ['SERVICIO', 'MATERIAL'] as const;
export type CostKind = (typeof COST_KINDS)[number];

/** Línea de costo. El precio va en centavos (entero): nunca se usan decimales para dinero. */
export interface CostItem {
  id: string;
  orderId: string;
  kind: CostKind;
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export type NewCostItem = Omit<CostItem, 'id' | 'orderId'>;
