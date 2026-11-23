import { describe, expect, it } from 'vitest';
import { nextDueDate, remainingDays, remainingKm } from '../maintenanceAlert';
import type { MaintenanceItem } from '../../types/maintenance';

// CP-17 (US17): cálculo del próximo servicio por kilometraje y por fecha.
function item(overrides: Partial<MaintenanceItem> = {}): MaintenanceItem {
  return {
    id: 'm1',
    vehicleId: 'v1',
    name: 'Cambio de aceite',
    lastServiceKm: 40000,
    intervalKm: 10000,
    lastServiceDate: '2026-01-15',
    intervalMonths: 6,
    ...overrides,
  } as MaintenanceItem;
}

describe('remainingKm: kilometros restantes', () => {
  it('con intervalo de 10,000 km suma el intervalo al ultimo servicio y resta el km actual', () => {
    // proximo servicio = 40,000 + 10,000 = 50,000; actual = 45,000 -> faltan 5,000
    expect(remainingKm(item(), 45000)).toBe(5000);
  });

  it('respeta otros intervalos (5,000 y 15,000 km)', () => {
    expect(remainingKm(item({ intervalKm: 5000 }), 42000)).toBe(3000);
    expect(remainingKm(item({ intervalKm: 15000 }), 42000)).toBe(13000);
  });

  it('da 0 cuando se llega exactamente al kilometraje del servicio', () => {
    expect(remainingKm(item(), 50000)).toBe(0);
  });

  it('da un valor negativo cuando el servicio esta vencido', () => {
    expect(remainingKm(item(), 50300)).toBe(-300);
  });

  it('funciona con un ultimo servicio en 0 km', () => {
    expect(remainingKm(item({ lastServiceKm: 0 }), 4000)).toBe(6000);
  });
});

describe('nextDueDate: fecha del proximo servicio', () => {
  it('suma los meses del intervalo a la fecha del ultimo servicio', () => {
    expect(nextDueDate(item({ lastServiceDate: '2026-01-15', intervalMonths: 6 }))).toBe('2026-07-15');
    expect(nextDueDate(item({ lastServiceDate: '2026-03-10', intervalMonths: 1 }))).toBe('2026-04-10');
  });

  it('pasa al año siguiente cuando corresponde', () => {
    expect(nextDueDate(item({ lastServiceDate: '2026-11-20', intervalMonths: 3 }))).toBe('2027-02-20');
    expect(nextDueDate(item({ lastServiceDate: '2026-06-01', intervalMonths: 12 }))).toBe('2027-06-01');
  });

  it('fin de mes: 31 de enero + 1 mes cae en el ultimo dia de febrero (2026, no bisiesto)', () => {
    expect(nextDueDate(item({ lastServiceDate: '2026-01-31', intervalMonths: 1 }))).toBe('2026-02-28');
  });

  it('fin de mes: 31 de enero + 1 mes cae en el 29 de febrero en año bisiesto', () => {
    expect(nextDueDate(item({ lastServiceDate: '2028-01-31', intervalMonths: 1 }))).toBe('2028-02-29');
  });

  it('fin de mes: 30 de enero + 1 mes tambien se ajusta a febrero', () => {
    expect(nextDueDate(item({ lastServiceDate: '2026-01-30', intervalMonths: 1 }))).toBe('2026-02-28');
  });

  it('fin de mes: 31 de marzo + 1 mes cae en el 30 de abril', () => {
    expect(nextDueDate(item({ lastServiceDate: '2026-03-31', intervalMonths: 1 }))).toBe('2026-04-30');
  });

  it('fin de mes: 31 de agosto + 6 meses cae en el 28 de febrero', () => {
    expect(nextDueDate(item({ lastServiceDate: '2026-08-31', intervalMonths: 6 }))).toBe('2027-02-28');
  });

  it('un dia que existe en ambos meses no se modifica', () => {
    expect(nextDueDate(item({ lastServiceDate: '2026-01-28', intervalMonths: 1 }))).toBe('2026-02-28');
  });
});

describe('remainingDays: dias restantes', () => {
  const today = new Date(2026, 10, 16); // 16 de noviembre de 2026 (fecha fija)

  it('cuenta los dias hasta la fecha del proximo servicio', () => {
    // 2026-10-16 + 2 meses = 2026-12-16 -> 30 dias desde el 16 de noviembre
    expect(remainingDays(item({ lastServiceDate: '2026-10-16', intervalMonths: 2 }), today)).toBe(30);
  });

  it('da 0 el mismo dia del servicio', () => {
    expect(remainingDays(item({ lastServiceDate: '2026-10-16', intervalMonths: 1 }), today)).toBe(0);
  });

  it('da un valor negativo cuando ya esta vencido', () => {
    expect(remainingDays(item({ lastServiceDate: '2026-09-10', intervalMonths: 1 }), today)).toBe(-37);
  });

  it('no se ve afectado por la hora del dia', () => {
    const lateAtNight = new Date(2026, 10, 16, 23, 59, 59);
    expect(remainingDays(item({ lastServiceDate: '2026-10-16', intervalMonths: 2 }), lateAtNight)).toBe(30);
  });

  it('maneja correctamente el cambio de mes con fin de mes', () => {
    // 2026-01-31 + 1 mes = 2026-02-28; desde 2026-02-01 faltan 27 dias
    expect(remainingDays(item({ lastServiceDate: '2026-01-31', intervalMonths: 1 }), new Date(2026, 1, 1))).toBe(27);
  });
});