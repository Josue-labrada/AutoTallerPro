import { describe, expect, it } from 'vitest';
import { formatNumber, formatRelativeTime } from '../../src/utils/formatters';

describe('formatNumber', () => {
  it('usa separador de miles en español de México', () => {
    expect(formatNumber(1284)).toBe('1,284');
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-01-15T12:00:00Z');
  const ago = (ms: number) => new Date(now.getTime() - ms);

  it('expresa minutos en español', () => {
    expect(formatRelativeTime(ago(5 * 60_000), now)).toBe('hace 5 minutos');
  });

  it('expresa horas en español', () => {
    expect(formatRelativeTime(ago(3 * 3_600_000), now)).toBe('hace 3 horas');
  });

  it('usa "ayer" para un día de diferencia', () => {
    expect(formatRelativeTime(ago(24 * 3_600_000), now)).toBe('ayer');
  });

  it('cambia de unidad en los límites de 60 s y 60 min', () => {
    expect(formatRelativeTime(ago(59_000), now)).toBe('hace 59 segundos');
    expect(formatRelativeTime(ago(60_000), now)).toBe('hace 1 minuto');
    expect(formatRelativeTime(ago(60 * 60_000), now)).toBe('hace 1 hora');
  });
});
