import { describe, expect, it } from 'vitest';
import { countActiveOrders, sharePercent } from '../../src/utils/workOrderMetrics';

describe('countActiveOrders', () => {
  it('suma las órdenes de las cuatro etapas', () => {
    expect(
      countActiveOrders({
        EN_RECEPCION: 4,
        EN_DIAGNOSTICO: 6,
        EN_REPARACION: 9,
        LISTO_PARA_ENTREGA: 3,
      }),
    ).toBe(22);
  });

  it('devuelve 0 cuando no hay órdenes', () => {
    expect(
      countActiveOrders({
        EN_RECEPCION: 0,
        EN_DIAGNOSTICO: 0,
        EN_REPARACION: 0,
        LISTO_PARA_ENTREGA: 0,
      }),
    ).toBe(0);
  });
});

describe('sharePercent', () => {
  it('calcula el porcentaje redondeado', () => {
    expect(sharePercent(1, 3)).toBe(33);
    expect(sharePercent(2, 3)).toBe(67);
    expect(sharePercent(5, 5)).toBe(100);
  });

  it('devuelve 0 si el total es 0 (evita dividir entre cero)', () => {
    expect(sharePercent(0, 0)).toBe(0);
    expect(sharePercent(3, 0)).toBe(0);
  });

  it('devuelve 0 para partes no positivas', () => {
    expect(sharePercent(0, 10)).toBe(0);
    expect(sharePercent(-2, 10)).toBe(0);
  });
});
