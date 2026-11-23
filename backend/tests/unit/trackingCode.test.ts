// Pruebas de CP-13: Consulta mediante código de seguimiento

import { describe, expect, it } from 'vitest';
import {
  generateTrackingCode,
  isValidTrackingCode,
} from '../../src/modules/work-orders/trackingCode.js';

// CP-13 (US13): formato del código de seguimiento.
describe('generateTrackingCode', () => {
  it('genera codigos con el formato ATP-XXXX-XXXX', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateTrackingCode()).toMatch(/^ATP-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    }
  });

  it('nunca usa caracteres que se confunden (0, O, 1, I, L)', () => {
    for (let i = 0; i < 500; i++) {
      const body = generateTrackingCode().slice(4).replace('-', '');
      expect(body).not.toMatch(/[01OIL]/);
    }
  });

  it('todo codigo generado es valido', () => {
    for (let i = 0; i < 200; i++) expect(isValidTrackingCode(generateTrackingCode())).toBe(true);
  });

  it('es impredecible: 500 codigos no se repiten', () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateTrackingCode()));
    expect(codes.size).toBe(500);
  });
});

describe('isValidTrackingCode', () => {
  it('acepta un codigo bien formado', () => {
    expect(isValidTrackingCode('ATP-7K3M-9QX2')).toBe(true);
  });

  it.each([
    ['vacio', ''],
    ['texto cualquiera', 'hola'],
    ['sin prefijo', '7K3M-9QX2'],
    ['prefijo incorrecto', 'XYZ-7K3M-9QX2'],
    ['minusculas', 'atp-7k3m-9qx2'],
    ['muy corto', 'ATP-7K3-9QX2'],
    ['muy largo', 'ATP-7K3MM-9QX2'],
    ['con O (excluida)', 'ATP-7K3O-9QX2'],
    ['con 0 (excluido)', 'ATP-7K30-9QX2'],
    ['con 1 (excluido)', 'ATP-7K31-9QX2'],
    ['con I (excluida)', 'ATP-7K3I-9QX2'],
    ['con L (excluida)', 'ATP-7K3L-9QX2'],
    ['con espacios', ' ATP-7K3M-9QX2 '],
    ['inyeccion SQL', "ATP-AAAA-BBBB' OR '1'='1"],
    ['salto de linea al final', 'ATP-7K3M-9QX2\n'],
  ])('rechaza %s', (_caso, code) => {
    expect(isValidTrackingCode(code)).toBe(false);
  });
});