import { describe, expect, it } from 'vitest';
import {
  calculateFuel,
  validateFuelInputs,
} from '../fuelCalculator';

describe('CP-15: Validación de entradas de combustible', () => {
  const valid = {
    distanceKm: '100',
    efficiencyKmPerLiter: '10',
    pricePerLiter: '25',
  };

  it('acepta entradas válidas', () => {
    expect(validateFuelInputs(valid)).toEqual({});
  });

  it('rechaza campos vacíos', () => {
    expect(
      validateFuelInputs({ ...valid, distanceKm: '' }).distanceKm
    ).toBeDefined();

    expect(
      validateFuelInputs({ ...valid, efficiencyKmPerLiter: '' })
        .efficiencyKmPerLiter
    ).toBeDefined();

    expect(
      validateFuelInputs({ ...valid, pricePerLiter: '' }).pricePerLiter
    ).toBeDefined();
  });

  it('rechaza texto no numérico', () => {
    expect(
      validateFuelInputs({ ...valid, distanceKm: 'abc' }).distanceKm
    ).toBeDefined();

    expect(
      validateFuelInputs({ ...valid, efficiencyKmPerLiter: 'abc' })
        .efficiencyKmPerLiter
    ).toBeDefined();

    expect(
      validateFuelInputs({ ...valid, pricePerLiter: 'abc' }).pricePerLiter
    ).toBeDefined();
  });

  it('rechaza valores negativos', () => {
    expect(
      validateFuelInputs({ ...valid, distanceKm: '-1' }).distanceKm
    ).toBeDefined();

    expect(
      validateFuelInputs({ ...valid, efficiencyKmPerLiter: '-1' })
        .efficiencyKmPerLiter
    ).toBeDefined();

    expect(
      validateFuelInputs({ ...valid, pricePerLiter: '-1' }).pricePerLiter
    ).toBeDefined();
  });

  it('rechaza rendimiento igual a cero', () => {
    expect(
      validateFuelInputs({ ...valid, efficiencyKmPerLiter: '0' })
        .efficiencyKmPerLiter
    ).toBeDefined();
  });

  it('acepta distancia y precio iguales a cero', () => {
    expect(
      validateFuelInputs({
        distanceKm: '0',
        efficiencyKmPerLiter: '10',
        pricePerLiter: '0',
      })
    ).toEqual({});
  });
});

describe('CP-16: Cálculo de combustible', () => {
  it('calcula 100 km, 10 km/l y 25 MXN/l', () => {
    const result = calculateFuel({
      distanceKm: '100',
      efficiencyKmPerLiter: '10',
      pricePerLiter: '25',
    });

    expect(result.liters).toBe(10);
    expect(result.totalCost).toBe(250);
  });

  it('calcula correctamente valores decimales', () => {
    const result = calculateFuel({
      distanceKm: '52.5',
      efficiencyKmPerLiter: '12.5',
      pricePerLiter: '24',
    });

    expect(result.liters).toBeCloseTo(4.2);
    expect(result.totalCost).toBeCloseTo(100.8);
  });

  it('calcula correctamente con distancia cero', () => {
    const result = calculateFuel({
      distanceKm: '0',
      efficiencyKmPerLiter: '10',
      pricePerLiter: '25',
    });

    expect(result.liters).toBe(0);
    expect(result.totalCost).toBe(0);
  });

  it('lanza un error cuando las entradas son inválidas', () => {
    expect(() =>
      calculateFuel({
        distanceKm: '100',
        efficiencyKmPerLiter: '0',
        pricePerLiter: '25',
      })
    ).toThrow();
  });
});
