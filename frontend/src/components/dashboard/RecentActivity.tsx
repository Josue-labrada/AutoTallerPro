import { Car, ClipboardPlus, RefreshCw, type LucideIcon } from 'lucide-react';
import type { ActivityEvent, ActivityType } from '../../types/dashboard';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import { WorkOrderStatusTag } from '../workOrders/WorkOrderStatusTag';
import styles from './RecentActivity.module.css';

const ACTIVITY_ICONS: Readonly<Record<ActivityType, LucideIcon>> = {
  VEHICULO_REGISTRADO: Car,
  CAMBIO_DE_ESTADO: RefreshCw,
  ORDEN_CREADA: ClipboardPlus,
};

interface RecentActivityProps {
  events: readonly ActivityEvent[];
  now?: Date;
}

export function RecentActivity({ events, now = new Date() }: RecentActivityProps) {
  if (events.length === 0) {
    return <p className={styles.empty}>No hay actividad reciente.</p>;
  }

  return (
    <ol className={styles.list}>
      {events.map((event) => {
        const Icon = ACTIVITY_ICONS[event.type];
        const date = new Date(event.occurredAt);
        return (
          <li key={event.id} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              <Icon size={16} />
            </span>
            <div className={styles.body}>
              <p className={styles.description}>{event.description}</p>
              <p className={styles.meta}>
                <span className={styles.plate}>{event.vehiclePlate}</span>
                <span>{event.vehicleLabel}</span>
              </p>
            </div>
            <div className={styles.aside}>
              {event.status && <WorkOrderStatusTag status={event.status} />}
              <time dateTime={event.occurredAt} title={formatDateTime(date)} className={styles.time}>
                {formatRelativeTime(date, now)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
