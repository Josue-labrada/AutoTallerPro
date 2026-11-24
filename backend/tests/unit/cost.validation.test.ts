import { describe, expect, it } from 'vitest';
import { validateNewCostItem } from '../../src/modules/costs/cost.validation.js';

const valid = {
  kind: 'SERVICIO',
  description: 'Cambio de aceite',
  quantity: 2,
  unitPriceCents: 12550,
};

describe('CP-10: Validación de servicios e insumos', () => {
  it('acepta un servicio válido', () => {
    const result = validateNewCostItem(valid);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value).toEqual(valid);
    }
  });

  it('acepta un material válido', () => {
    const result = validateNewCostItem({
      ...valid,
      kind: 'MATERIAL',
      description: 'Filtro de aceite',
    });

    expect(result.ok).toBe(true);
  });

  it.each([1, 9999])(
    'acepta la cantidad límite %i',
    (quantity) => {
      expect(
        validateNewCostItem({ ...valid, quantity }).ok
      ).toBe(true);
    }
  );

  it.each([0, -1, 10000, 1.5, '2', null])(
    'rechaza la cantidad inválida %s',
    (quantity) => {
      expect(
        validateNewCostItem({ ...valid, quantity }).ok
      ).toBe(false);
    }
  );

  it.each([1, 999999999])(
    'acepta el precio en centavos %i',
    (unitPriceCents) => {
      expect(
        validateNewCostItem({ ...valid, unitPriceCents }).ok
      ).toBe(true);
    }
  );

  it.each([0, -1, 1000000000, 12.5, '100', null])(
    'rechaza el precio inválido %s',
    (unitPriceCents) => {
      expect(
        validateNewCostItem({ ...valid, unitPriceCents }).ok
      ).toBe(false);
    }
  );

  it('rechaza una descripción vacía', () => {
    expect(
      validateNewCostItem({ ...valid, description: '' }).ok
    ).toBe(false);
  });

  it('rechaza una descripción de más de 100 caracteres', () => {
    expect(
      validateNewCostItem({
        ...valid,
        description: 'A'.repeat(101),
      }).ok
    ).toBe(false);
  });

  it('acepta una descripción de exactamente 100 caracteres', () => {
    expect(
      validateNewCostItem({
        ...valid,
        description: 'A'.repeat(100),
      }).ok
    ).toBe(true);
  });

  it('rechaza tipos de concepto inválidos', () => {
    expect(
      validateNewCostItem({ ...valid, kind: 'OTRO' }).ok
    ).toBe(false);
  });

  it('rechaza un cuerpo de petición inválido', () => {
    expect(validateNewCostItem(null).ok).toBe(false);
    expect(validateNewCostItem('texto').ok).toBe(false);
  });

  it('elimina espacios al inicio y final de la descripción', () => {
    const result = validateNewCostItem({
      ...valid,
      description: '  Cambio de aceite  ',
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.description).toBe('Cambio de aceite');
    }
  });

  it('rechaza una descripción que no es texto', () => {
    const result = validateNewCostItem({
      ...valid,
      description: 12345,
    });

    expect(result.ok).toBe(false);
  });
});
