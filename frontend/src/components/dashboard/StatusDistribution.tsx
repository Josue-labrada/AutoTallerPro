import type { CSSProperties } from 'react';
import {
  WORK_ORDER_STATUSES,
  WORK_ORDER_STATUS_LABELS,
  type WorkOrderStatusCounts,
} from '../../types/workOrder';
import { countActiveOrders, sharePercent } from '../../utils/workOrderMetrics';
import { formatNumber } from '../../utils/formatters';
import { WORK_ORDER_STATUS_APPEARANCE } from '../workOrders/statusAppearance';
import styles from './StatusDistribution.module.css';

interface StatusDistributionProps {
  counts: WorkOrderStatusCounts;
}

/** Barra segmentada con la proporción de órdenes activas en cada etapa del flujo. */
export function StatusDistribution({ counts }: StatusDistributionProps) {
  const total = countActiveOrders(counts);
  const rows = WORK_ORDER_STATUSES.map((status) => ({
    status,
    label: WORK_ORDER_STATUS_LABELS[status],
    count: counts[status],
    share: sharePercent(counts[status], total),
    color: WORK_ORDER_STATUS_APPEARANCE[status].color,
  }));

  const summary = rows.map((row) => `${row.label}: ${row.count} (${row.share} %)`).join(', ');

  return (
    <div className={styles.distribution}>
      <div className={styles.bar} role="img" aria-label={`Distribución de ${total} órdenes activas. ${summary}.`}>
        {rows
          .filter((row) => row.count > 0)
          .map((row) => (
            <span
              key={row.status}
              className={styles.segment}
              style={{ flexGrow: row.count, '--segment-color': row.color } as CSSProperties}
              title={`${row.label}: ${row.count} (${row.share} %)`}
            />
          ))}
      </div>

      <ul className={styles.legend}>
        {rows.map((row) => {
          const Icon = WORK_ORDER_STATUS_APPEARANCE[row.status].icon;
          return (
            <li
              key={row.status}
              className={styles.legendItem}
              style={{ '--segment-color': row.color } as CSSProperties}
            >
              <span className={styles.legendIcon} aria-hidden="true">
                <Icon size={16} />
              </span>
              <span className={styles.legendLabel}>{row.label}</span>
              <span className={styles.legendCount}>{formatNumber(row.count)}</span>
              <span className={styles.legendShare}>{row.share} %</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
