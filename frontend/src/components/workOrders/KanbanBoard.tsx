import type { CSSProperties } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  getNextStatus,
  WORK_ORDER_STATUSES,
  WORK_ORDER_STATUS_LABELS,
  type WorkOrder,
} from '../../types/workOrder';
import { WORK_ORDER_STATUS_APPEARANCE } from './statusAppearance';
import styles from './KanbanBoard.module.css';

interface KanbanBoardProps {
  orders: readonly WorkOrder[];
  onAdvance: (orderId: string) => void;
}

/** Una columna por etapa; cada tarjeta se avanza con un botón (sin arrastrar). */
export function KanbanBoard({ orders, onAdvance }: KanbanBoardProps) {
  return (
    <div className={styles.board}>
      {WORK_ORDER_STATUSES.map((status) => {
        const columnOrders = orders.filter((order) => order.status === status);
        const nextStatus = getNextStatus(status);
        const style = { '--column-color': WORK_ORDER_STATUS_APPEARANCE[status].color } as CSSProperties;

        return (
          <section key={status} className={styles.column} style={style} aria-label={WORK_ORDER_STATUS_LABELS[status]}>
            <h3 className={styles.columnTitle}>
              {WORK_ORDER_STATUS_LABELS[status]}
              <span className={styles.count}>{columnOrders.length}</span>
            </h3>

            {columnOrders.length === 0 && <p className={styles.empty}>Sin órdenes</p>}

            {columnOrders.map((order) => (
              <article key={order.id} className={styles.card}>
                <p className={styles.plate}>{order.vehiclePlate}</p>
                <p className={styles.vehicle}>{order.vehicleLabel}</p>
                <p className={styles.description}>{order.description}</p>
                {nextStatus && (
                  <button type="button" className={styles.advance} onClick={() => onAdvance(order.id)}>
                    Pasar a {WORK_ORDER_STATUS_LABELS[nextStatus]}
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                )}
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}
