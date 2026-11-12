import type { CSSProperties } from 'react';
import { WORK_ORDER_STATUS_LABELS, type WorkOrderStatus } from '../../types/workOrder';
import { WORK_ORDER_STATUS_APPEARANCE } from './statusAppearance';
import styles from './WorkOrderStatusTag.module.css';

interface WorkOrderStatusTagProps {
  status: WorkOrderStatus;
}

/** Etiqueta de etapa con punto de color + texto (el color nunca va solo). */
export function WorkOrderStatusTag({ status }: WorkOrderStatusTagProps) {
  const style = { '--tag-color': WORK_ORDER_STATUS_APPEARANCE[status].color } as CSSProperties;

  return (
    <span className={styles.tag} style={style}>
      <span className={styles.dot} aria-hidden="true" />
      {WORK_ORDER_STATUS_LABELS[status]}
    </span>
  );
}
