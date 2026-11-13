/** Mantenimiento programado. Los intervalos los define el taller; el backend no inventa valores. */
export interface MaintenanceItem {
  id: string;
  vehicleId: string;
  name: string;
  lastServiceKm: number;
  intervalKm: number;
  /** AAAA-MM-DD */
  lastServiceDate: string;
  intervalMonths: number;
}

export type NewMaintenanceItem = Omit<MaintenanceItem, 'id'>;
