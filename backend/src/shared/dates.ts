export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Fecha local de hoy en formato AAAA-MM-DD. */
export function todayIsoDate(now: Date = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** `true` si el texto es una fecha AAAA-MM-DD que existe en el calendario (rechaza 2026-02-31). */
export function isRealIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
