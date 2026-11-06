import { useEffect, useState } from 'react';
import type { DashboardDataSource } from '../services/dashboardService';
import type { DashboardData } from '../types/dashboard';

export type DashboardDataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: DashboardData };

/**
 * Obtiene los datos del dashboard desde la fuente indicada.
 * La fuente se inyecta para poder sustituir los datos de demostración
 * por la API real (o por dobles de prueba) sin modificar la UI.
 */
export function useDashboardData(source: DashboardDataSource): DashboardDataState {
  const [state, setState] = useState<DashboardDataState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();

    source
      .getDashboardData(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof Error) console.error('Error al cargar el dashboard:', error.name);
        // No se muestran detalles internos del error al usuario.
        setState({ status: 'error', message: 'No fue posible cargar la información del panel.' });
      });

    return () => controller.abort();
  }, [source]);

  return state;
}
