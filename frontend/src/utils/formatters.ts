const LOCALE = 'es-MX';

const numberFormatter = new Intl.NumberFormat(LOCALE);
const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
const longDateFormatter = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatLongDate(date: Date): string {
  const text = longDateFormatter.format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

/** Texto relativo en español, p. ej. "hace 5 minutos" o "ayer". */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffSeconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(diffSeconds);

  if (abs < 60) return relativeFormatter.format(diffSeconds, 'second');
  if (abs < 3600) return relativeFormatter.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86_400) return relativeFormatter.format(Math.round(diffSeconds / 3600), 'hour');
  return relativeFormatter.format(Math.round(diffSeconds / 86_400), 'day');
}
