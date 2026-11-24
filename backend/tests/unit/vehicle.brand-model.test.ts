import { describe, expect, it } from 'vitest';
import { validateNewVehicle } from '../../src/modules/vehicles/vehicle.validation.js';

const now = new Date(2026, 10, 23);

const valid = {
  plate: 'JAL-1234',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2021,
  mileage: 45000,
  receptionDate: '2026-11-20',
};

describe('CP-02: Captura de marca y modelo', () => {
  it('acepta una marca y modelo válidos', () => {
    const result = validateNewVehicle(valid, now);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.brand).toBe('Toyota');
      expect(result.value.model).toBe('Corolla');
    }
  });

  it('rechaza una marca vacía', () => {
    const result = validateNewVehicle({ ...valid, brand: '' }, now);
    expect(result.ok).toBe(false);
  });

  it('rechaza un modelo vacío', () => {
    const result = validateNewVehicle({ ...valid, model: '' }, now);
    expect(result.ok).toBe(false);
  });

  it('rechaza una marca de más de 50 caracteres', () => {
    const result = validateNewVehicle({
      ...valid,
      brand: 'A'.repeat(51),
    }, now);

    expect(result.ok).toBe(false);
  });

  it('rechaza un modelo de más de 50 caracteres', () => {
    const result = validateNewVehicle({
      ...valid,
      model: 'B'.repeat(51),
    }, now);

    expect(result.ok).toBe(false);
  });

  it('elimina espacios exteriores de marca y modelo', () => {
    const result = validateNewVehicle({
      ...valid,
      brand: '  Toyota  ',
      model: '  Corolla  ',
    }, now);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.brand).toBe('Toyota');
      expect(result.value.model).toBe('Corolla');
    }
  });

  it('rechaza una marca que no es texto', () => {
    const result = validateNewVehicle({
      ...valid,
      brand: 123,
    }, now);

    expect(result.ok).toBe(false);
  });

  it('rechaza un modelo que no es texto', () => {
    const result = validateNewVehicle({
      ...valid,
      model: 123,
    }, now);

    expect(result.ok).toBe(false);
  });

  it('acepta marca y modelo de exactamente 50 caracteres', () => {
    const result = validateNewVehicle({
      ...valid,
      brand: 'A'.repeat(50),
      model: 'B'.repeat(50),
    }, now);

    expect(result.ok).toBe(true);
  });
});
