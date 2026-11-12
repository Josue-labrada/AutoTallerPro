/*
 * Todo el dinero se maneja en centavos (números enteros) para evitar errores de
 * punto flotante (por ejemplo 0.1 + 0.2). Solo se convierte a texto al mostrarlo.
 */

const MAX_PRICE_PATTERN = /^(\d{1,7})(?:\.(\d{1,2}))?$/;

const currencyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

/** Convierte texto como "125.50" a centavos (12550). Devuelve `null` si no es válido. */
export function parseMoneyToCents(text: string): number | null {
  const match = MAX_PRICE_PATTERN.exec(text.trim());
  if (!match) return null;
  const pesos = Number(match[1]);
  const cents = Number((match[2] ?? '').padEnd(2, '0'));
  return pesos * 100 + cents;
}

export function formatCents(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function lineSubtotalCents(quantity: number, unitPriceCents: number): number {
  return quantity * unitPriceCents;
}

export function sumCents(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
