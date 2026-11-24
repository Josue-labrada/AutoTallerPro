import { describe, expect, it } from 'vitest';
import {
  remainingKm,
  getAlertLevel,
  getDaysAlertLevel,
  worstLevel,
  nextDueDate,
  remainingDays,
} from '../maintenanceAlert';

import type { MaintenanceItem } from '../../types/maintenance';

const maintenance = {
  lastServiceKm: 40000,
  intervalKm: 10000,
  lastServiceDate: '2026-01-31',
  intervalMonths: 1,
} as MaintenanceItem;

describe('CP-18: Semáforo de mantenimiento por kilometraje', () => {
  it.each([
    [1001, 'GREEN'],
    [1000, 'YELLOW'],
    [500, 'YELLOW'],
    [499, 'RED'],
    [0, 'RED'],
    [-50, 'RED'],
  ] as const)('con %i km restantes devuelve %s', (km, expected) => {
    expect(getAlertLevel(km)).toBe(expected);
  });

  it('calcula correctamente los kilómetros restantes', () => {
    expect(remainingKm(maintenance, 45000)).toBe(5000);
    expect(remainingKm(maintenance, 50000)).toBe(0);
    expect(remainingKm(maintenance, 51000)).toBe(-1000);
  });
});

describe('CP-18: Semáforo de mantenimiento por fecha', () => {
  it.each([
    [31, 'GREEN'],
    [30, 'YELLOW'],
    [15, 'YELLOW'],
    [14, 'RED'],
    [0, 'RED'],
    [-1, 'RED'],
  ] as const)('con %i días restantes devuelve %s', (days, expected) => {
    expect(getDaysAlertLevel(days)).toBe(expected);
  });

  it('selecciona la alerta de mayor urgencia', () => {
    expect(worstLevel('GREEN', 'RED')).toBe('RED');
    expect(worstLevel('YELLOW', 'GREEN')).toBe('YELLOW');
    expect(worstLevel('RED', 'YELLOW')).toBe('RED');
    expect(worstLevel('GREEN', 'GREEN')).toBe('GREEN');
  });
});

describe('Pruebas adicionales: cálculo de fechas de mantenimiento', () => {
  it('calcula correctamente el fin de febrero', () => {
    expect(nextDueDate(maintenance)).toBe('2026-02-28');
  });

  it('calcula los días restantes desde una fecha fija', () => {
    const today = new Date(2026, 1, 20);
    expect(remainingDays(maintenance, today)).toBe(8);
  });

  it('identifica mantenimientos vencidos', () => {
    const today = new Date(2026, 2, 5);
    expect(remainingDays(maintenance, today)).toBe(-5);
  });
});
