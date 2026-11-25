// Pruebas de CP-01: Registro inicial del vehiculo
// Pruebas de CP-02: Captura de marca y modelo

import { describe, expect, it } from 'vitest';
import { validateNewVehicle } from '../../src/modules/vehicles/vehicle.validation.js';

// CP-01 (US01) y CP-02 (US02): validación del registro de vehículos.
const valid = {
  plate: 'jal-1234',
  brand: 'Mazda',
  model: 'CX-30',
  year: 2021,
  mileage: 45000,
  receptionDate: '2026-11-10',
};
// Fecha fija para que la prueba no cambie con el tiempo.
const now = new Date(2026, 10, 16);

describe('validacion de vehiculo: casos validos', () => {
  it('acepta un vehiculo valido y normaliza la placa a mayusculas', () => {
    const result = validateNewVehicle(valid, now);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.plate).toBe('JAL-1234');
  });

  it('recorta espacios en marca y modelo (CP-02)', () => {
    const result = validateNewVehicle({ ...valid, brand: '  Mazda ', model: ' CX-30  ' }, now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.brand).toBe('Mazda');
      expect(result.value.model).toBe('CX-30');
    }
  });

  it('acepta kilometraje 0 y el limite de 2,000,000', () => {
    expect(validateNewVehicle({ ...valid, mileage: 0 }, now).ok).toBe(true);
    expect(validateNewVehicle({ ...valid, mileage: 2_000_000 }, now).ok).toBe(true);
  });

  it('acepta la fecha de hoy y deja las observaciones vacias por omision', () => {
    const result = validateNewVehicle({ ...valid, receptionDate: '2026-11-16' }, now);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.notes).toBe('');
  });

  it('acepta el año del siguiente modelo pero no dos años adelante', () => {
    expect(validateNewVehicle({ ...valid, year: 2027 }, now).ok).toBe(true);
    expect(validateNewVehicle({ ...valid, year: 2028 }, now).ok).toBe(false);
  });
});

describe('validacion de vehiculo: casos invalidos', () => {
  it.each([
    ['cuerpo nulo', null],
    ['cuerpo que no es objeto', 'hola'],
    ['placa invalida', { ...valid, plate: '??' }],
    ['placa muy corta', { ...valid, plate: 'AB1' }],
    ['placa sin texto', { ...valid, plate: undefined }],
    ['marca vacia', { ...valid, brand: '' }],
    ['marca solo espacios', { ...valid, brand: '   ' }],
    ['marca demasiado larga', { ...valid, brand: 'M'.repeat(51) }],
    ['modelo vacio', { ...valid, model: '' }],
    ['modelo demasiado largo', { ...valid, model: 'X'.repeat(51) }],
    ['año anterior a 1950', { ...valid, year: 1949 }],
    ['año con decimales', { ...valid, year: 2020.5 }],
    ['año como texto', { ...valid, year: '2020' }],
    ['kilometraje negativo', { ...valid, mileage: -1 }],
    ['kilometraje con decimales', { ...valid, mileage: 10.5 }],
    ['kilometraje como texto', { ...valid, mileage: '100' }],
    ['kilometraje mayor al maximo', { ...valid, mileage: 2_000_001 }],
    ['fecha futura', { ...valid, receptionDate: '2027-01-01' }],
    ['fecha inexistente', { ...valid, receptionDate: '2026-02-30' }],
    ['fecha con formato incorrecto', { ...valid, receptionDate: '10/11/2026' }],
    ['observaciones que no son texto', { ...valid, notes: 123 }],
    ['observaciones de mas de 500 caracteres', { ...valid, notes: 'a'.repeat(501) }],
  ])('rechaza %s', (_caso, body) => {
    expect(validateNewVehicle(body, now).ok).toBe(false);
  });

  it('el rechazo incluye un mensaje para el usuario', () => {
    const result = validateNewVehicle({ ...valid, mileage: -1 }, now);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/kilometraje/i);
  });
});