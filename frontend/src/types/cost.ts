export type CostKind = 'SERVICIO' | 'MATERIAL';

export const COST_KIND_LABELS: Readonly<Record<CostKind, string>> = {
  SERVICIO: 'Servicio',
  MATERIAL: 'Material / insumo',
};

/** Línea de costo de una orden. El precio se guarda en centavos (entero) para evitar errores de decimales. */
export interface CostItem {
  id: string;
  orderId: string;
  kind: CostKind;
  description: string;
  quantity: number;
  unitPriceCents: number;
}
