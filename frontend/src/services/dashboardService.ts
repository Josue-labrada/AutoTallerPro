import type { DashboardData } from '../types/dashboard';

/**
 * Contrato de la fuente de datos del dashboard.
 * Cuando exista la API REST, se agregará una implementación HTTP
 * sin cambiar los componentes que consumen esta interfaz.
 */
export interface DashboardDataSource {
  getDashboardData(signal?: AbortSignal): Promise<DashboardData>;
}
