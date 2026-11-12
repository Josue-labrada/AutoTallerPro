import { Car, CircleAlert, ClipboardList, LoaderCircle } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import type { DashboardDataSource } from '../services/dashboardService';
import { demoDashboardDataSource } from '../services/mock/dashboard.mock';
import { Card } from '../components/ui/Card';
import { DemoDataNotice } from '../components/ui/DemoDataNotice';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { StatusMessage } from '../components/ui/StatusMessage';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { StatusDistribution } from '../components/dashboard/StatusDistribution';
import { WORK_ORDER_STATUS_APPEARANCE } from '../components/workOrders/statusAppearance';
import { countActiveOrders } from '../utils/workOrderMetrics';
import styles from './DashboardPage.module.css';

interface DashboardPageProps {
  /** Por ahora se usan datos de demostración; se sustituirá por la API real. */
  dataSource?: DashboardDataSource;
}

export function DashboardPage({ dataSource = demoDashboardDataSource }: DashboardPageProps) {
  const state = useDashboardData(dataSource);

  return (
    <>
      <PageHeader title="Panel principal" description="Resumen del estado operativo del taller." />

      {state.status === 'loading' && (
        <StatusMessage
          icon={<LoaderCircle size={22} className={styles.spinner} />}
          title="Cargando información del panel…"
        />
      )}

      {state.status === 'error' && (
        <StatusMessage icon={<CircleAlert size={22} />} title="Algo salió mal" role="alert">
          {state.message} Intenta de nuevo más tarde.
        </StatusMessage>
      )}

      {state.status === 'success' && (
        <>
          {state.data.isDemo && <DemoDataNotice />}

          <section aria-labelledby="indicadores-titulo" className={styles.statsSection}>
            <h2 id="indicadores-titulo" className="visually-hidden">
              Indicadores principales
            </h2>
            <div className={styles.statsGrid}>
              <StatCard
                label="Vehículos registrados"
                value={state.data.summary.registeredVehicles}
                icon={Car}
                accentColor="var(--color-accent)"
                hint="Total en el sistema"
              />
              <StatCard
                label="Órdenes activas"
                value={countActiveOrders(state.data.summary.ordersByStatus)}
                icon={ClipboardList}
                accentColor="var(--color-accent-blue)"
                hint="Aún no entregadas"
              />
              <StatCard
                label="En diagnóstico"
                value={state.data.summary.ordersByStatus.EN_DIAGNOSTICO}
                icon={WORK_ORDER_STATUS_APPEARANCE.EN_DIAGNOSTICO.icon}
                accentColor={WORK_ORDER_STATUS_APPEARANCE.EN_DIAGNOSTICO.color}
                hint="Revisión técnica en curso"
              />
              <StatCard
                label="En reparación"
                value={state.data.summary.ordersByStatus.EN_REPARACION}
                icon={WORK_ORDER_STATUS_APPEARANCE.EN_REPARACION.icon}
                accentColor={WORK_ORDER_STATUS_APPEARANCE.EN_REPARACION.color}
                hint="Trabajo en el área de servicio"
              />
              <StatCard
                label="Listos para entrega"
                value={state.data.summary.ordersByStatus.LISTO_PARA_ENTREGA}
                icon={WORK_ORDER_STATUS_APPEARANCE.LISTO_PARA_ENTREGA.icon}
                accentColor={WORK_ORDER_STATUS_APPEARANCE.LISTO_PARA_ENTREGA.color}
                hint="Esperando al cliente"
              />
            </div>
          </section>

          <div className={styles.panels}>
            <Card
              title="Flujo de órdenes"
              description="Órdenes activas por etapa del proceso."
            >
              <StatusDistribution counts={state.data.summary.ordersByStatus} />
            </Card>
            <Card title="Actividad reciente" description="Últimos movimientos en el taller.">
              <RecentActivity events={state.data.recentActivity} />
            </Card>
          </div>
        </>
      )}
    </>
  );
}
