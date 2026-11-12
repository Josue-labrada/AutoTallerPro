/** Mantenimiento preventivo programado para un vehículo. El intervalo lo captura el taller. */
export interface MaintenanceItem {
  id: string;
  vehicleId: string;
  name: string;
  /** Kilometraje en que se hizo el último servicio. */
  lastServiceKm: number;
  /** Cada cuántos km se repite este mantenimiento. */
  intervalKm: number;
}

export type AlertLevel = 'GREEN' | 'YELLOW' | 'RED';
