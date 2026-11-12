import type { WorkOrderStatus, WorkOrderStatusCounts } from './workOrder';

export interface DashboardSummary {
  registeredVehicles: number;
  ordersByStatus: WorkOrderStatusCounts;
}

export type ActivityType = 'VEHICULO_REGISTRADO' | 'CAMBIO_DE_ESTADO' | 'ORDEN_CREADA';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  description: string;
  /** Placa ficticia del vehículo relacionado. */
  vehiclePlate: string;
  vehicleLabel: string;
  /** Fecha en formato ISO 8601. */
  occurredAt: string;
  status?: WorkOrderStatus;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentActivity: readonly ActivityEvent[];
  /** Indica que los datos son de demostración y no provienen de la API. */
  isDemo: boolean;
}
