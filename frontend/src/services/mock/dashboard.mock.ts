import type { DashboardDataSource } from '../dashboardService';
import type { ActivityEvent, DashboardData } from '../../types/dashboard';

/*
 * DATOS DE DEMOSTRACIÓN.
 * Todo el contenido es ficticio: placas, vehículos y cifras no corresponden
 * a clientes ni registros reales. No se conecta a ninguna API ni base de datos.
 */

const MINUTE_MS = 60_000;

function minutesAgo(minutes: number, now: Date): string {
  return new Date(now.getTime() - minutes * MINUTE_MS).toISOString();
}

export function buildDemoDashboardData(now: Date = new Date()): DashboardData {
  const recentActivity: ActivityEvent[] = [
    {
      id: 'demo-act-1',
      type: 'CAMBIO_DE_ESTADO',
      description: 'Pasó a Listo para Entrega',
      vehiclePlate: 'DEMO-101',
      vehicleLabel: 'Sedán compacto 2019',
      occurredAt: minutesAgo(12, now),
      status: 'LISTO_PARA_ENTREGA',
    },
    {
      id: 'demo-act-2',
      type: 'VEHICULO_REGISTRADO',
      description: 'Vehículo recibido en el taller',
      vehiclePlate: 'DEMO-214',
      vehicleLabel: 'Camioneta SUV 2021',
      occurredAt: minutesAgo(38, now),
      status: 'EN_RECEPCION',
    },
    {
      id: 'demo-act-3',
      type: 'CAMBIO_DE_ESTADO',
      description: 'Pasó a En Reparación',
      vehiclePlate: 'DEMO-087',
      vehicleLabel: 'Pickup 2017',
      occurredAt: minutesAgo(95, now),
      status: 'EN_REPARACION',
    },
    {
      id: 'demo-act-4',
      type: 'ORDEN_CREADA',
      description: 'Orden de trabajo creada',
      vehiclePlate: 'DEMO-330',
      vehicleLabel: 'Hatchback 2020',
      occurredAt: minutesAgo(180, now),
      status: 'EN_DIAGNOSTICO',
    },
    {
      id: 'demo-act-5',
      type: 'CAMBIO_DE_ESTADO',
      description: 'Pasó a En Diagnóstico',
      vehiclePlate: 'DEMO-452',
      vehicleLabel: 'Sedán mediano 2018',
      occurredAt: minutesAgo(60 * 26, now),
      status: 'EN_DIAGNOSTICO',
    },
  ];

  return {
    isDemo: true,
    summary: {
      registeredVehicles: 128,
      ordersByStatus: {
        EN_RECEPCION: 4,
        EN_DIAGNOSTICO: 6,
        EN_REPARACION: 9,
        LISTO_PARA_ENTREGA: 3,
      },
    },
    recentActivity,
  };
}

/** Fuente de datos simulada; responde con una pequeña latencia para mostrar el estado de carga. */
export const demoDashboardDataSource: DashboardDataSource = {
  getDashboardData(signal) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => resolve(buildDemoDashboardData()), 300);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Solicitud cancelada', 'AbortError'));
      });
    });
  },
};
