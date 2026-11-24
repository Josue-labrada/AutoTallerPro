import { describe, expect, it } from 'vitest';
import {
  parseMoneyToCents,
  formatCents,
  lineSubtotalCents,
  sumCents,
} from '../money';

describe('CP-11: Cálculo automatizado de costos', () => {
  it('convierte pesos a centavos correctamente', () => {
    expect(parseMoneyToCents('125.50')).toBe(12550);
    expect(parseMoneyToCents('125.5')).toBe(12550);
    expect(parseMoneyToCents('80')).toBe(8000);
    expect(parseMoneyToCents('0')).toBe(0);
  });

  it('rechaza cantidades inválidas', () => {
    expect(parseMoneyToCents('abc')).toBeNull();
    expect(parseMoneyToCents('-5')).toBeNull();
    expect(parseMoneyToCents('1.999')).toBeNull();
    expect(parseMoneyToCents('')).toBeNull();
  });

  it('calcula correctamente los subtotales', () => {
    expect(lineSubtotalCents(3, 1010)).toBe(3030);
    expect(lineSubtotalCents(2, 12550)).toBe(25100);
    expect(lineSubtotalCents(1, 999)).toBe(999);
  });

  it('suma los costos sin errores decimales', () => {
    expect(sumCents([10, 20])).toBe(30);
    expect(sumCents([12550, 3030])).toBe(15580);
    expect(sumCents([])).toBe(0);
  });

  it('formatea correctamente los centavos como pesos mexicanos', () => {
    expect(formatCents(12550)).toContain('125.50');
    expect(formatCents(0)).toContain('0.00');
  });
});
