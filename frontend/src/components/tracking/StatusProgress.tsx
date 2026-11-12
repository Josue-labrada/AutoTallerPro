import type { CSSProperties } from 'react';
import { Check } from 'lucide-react';
import {
  WORK_ORDER_STATUSES,
  WORK_ORDER_STATUS_LABELS,
  type WorkOrderStatus,
} from '../../types/workOrder';
import { WORK_ORDER_STATUS_APPEARANCE } from '../workOrders/statusAppearance';
import styles from './StatusProgress.module.css';

interface StatusProgressProps {
  current: WorkOrderStatus;
}

/** Las 4 etapas en orden; el estado de cada una también se dice con texto, no solo con color. */
export function StatusProgress({ current }: StatusProgressProps) {
  const currentIndex = WORK_ORDER_STATUSES.indexOf(current);

  return (
    <ol className={styles.steps}>
      {WORK_ORDER_STATUSES.map((status, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending';
        const stateText = state === 'done' ? 'completada' : state === 'current' ? 'etapa actual' : 'pendiente';
        const Icon = WORK_ORDER_STATUS_APPEARANCE[status].icon;
        const style = { '--step-color': WORK_ORDER_STATUS_APPEARANCE[status].color } as CSSProperties;

        return (
          <li key={status} className={`${styles.step} ${styles[state]}`} style={style}>
            <span className={styles.marker} aria-hidden="true">
              {state === 'done' ? <Check size={16} /> : <Icon size={16} />}
            </span>
            <span className={styles.label}>{WORK_ORDER_STATUS_LABELS[status]}</span>
            <span className={styles.state}>{stateText}</span>
          </li>
        );
      })}
    </ol>
  );
}
