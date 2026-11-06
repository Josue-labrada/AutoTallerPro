import { describe, expect, it } from 'vitest';
import { buildDemoDashboardData } from '../../src/services/mock/dashboard.mock';
import { WORK_ORDER_STATUSES } from '../../src/types/workOrder';

describe('datos de demostración del dashboard', () => {
  const data = buildDemoDashboardData(new Date('2026-01-15T12:00:00Z'));

  it('se identifican explícitamente como datos de demostración', () => {
    expect(data.isDemo).toBe(true);
  });

  it('incluyen un conteo no negativo para cada etapa', () => {
    for (const status of WORK_ORDER_STATUSES) {
      expect(data.summary.ordersByStatus[status]).toBeGreaterThanOrEqual(0);
    }
  });

  it('usan placas ficticias con el prefijo DEMO', () => {
    for (const event of data.recentActivity) {
      expect(event.vehiclePlate).toMatch(/^DEMO-\d+$/);
    }
  });

  it('ordenan la actividad de la más reciente a la más antigua', () => {
    const times = data.recentActivity.map((event) => Date.parse(event.occurredAt));
    const sorted = [...times].sort((a, b) => b - a);
    expect(times).toEqual(sorted);
  });
});
