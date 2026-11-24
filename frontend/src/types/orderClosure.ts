/** Concepto conservado en el resumen de cierre. */
export interface OrderClosureItem {
  id: string;
  kind: 'SERVICIO' | 'MATERIAL';
  description: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

/** Resumen persistido de una orden cerrada. */
export interface OrderClosure {
  orderId: string;
  closedBy: string;
  closedAt: string;
  items: OrderClosureItem[];
  totalCents: number;
}
