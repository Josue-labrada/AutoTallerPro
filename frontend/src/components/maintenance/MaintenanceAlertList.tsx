import { CircleCheck, OctagonAlert, Trash2, TriangleAlert } from 'lucide-react';
import type { AlertLevel, MaintenanceItem } from '../../types/maintenance';
import type { VehicleSummary } from '../../types/vehicle';
import {
  getAlertLevel,
  getDaysAlertLevel,
  nextDueDate,
  remainingDays,
  remainingKm,
  worstLevel,
} from '../../utils/maintenanceAlert';
import { formatNumber } from '../../utils/formatters';
import { Badge, type BadgeTone } from '../ui/Badge';
import styles from './MaintenanceAlertList.module.css';

interface MaintenanceAlertListProps {
  items: readonly MaintenanceItem[];
  vehicles: readonly VehicleSummary[];
  /** Sin esta función (portal del cliente) la lista es de solo lectura. */
  onRemove?: (id: string) => void;
}

const LEVEL_APPEARANCE: Readonly<Record<AlertLevel, { tone: BadgeTone; label: string; icon: typeof CircleCheck }>> = {
  GREEN: { tone: 'success', label: 'Al día', icon: CircleCheck },
  YELLOW: { tone: 'warning', label: 'Próximo', icon: TriangleAlert },
  RED: { tone: 'danger', label: 'Urgente', icon: OctagonAlert },
};

const LEVEL_ORDER: Readonly<Record<AlertLevel, number>> = { GREEN: 0, YELLOW: 1, RED: 2 };

export function MaintenanceAlertList({ items, vehicles, onRemove }: MaintenanceAlertListProps) {
  const rows = items
    .map((item) => {
      const vehicle = vehicles.find((candidate) => candidate.id === item.vehicleId);
      if (!vehicle) return null;
      const remaining = remainingKm(item, vehicle.mileage);
      const days = remainingDays(item);
      const level = worstLevel(getAlertLevel(remaining), getDaysAlertLevel(days));
      return { item, vehicle, remaining, days, level };
    })
    .filter((row) => row !== null)
    // Los más urgentes primero: por gravedad y, a igual gravedad, por días restantes.
    .sort((a, b) => LEVEL_ORDER[b.level] - LEVEL_ORDER[a.level] || a.days - b.days);

  if (rows.length === 0) {
    return <p className={styles.empty}>Aún no hay mantenimientos programados.</p>;
  }

  return (
    <ul className={styles.list}>
      {rows.map(({ item, vehicle, remaining, days, level }) => {
        const { tone, label, icon: Icon } = LEVEL_APPEARANCE[level];
        return (
          <li key={item.id} className={styles.item}>
            <Badge tone={tone} icon={<Icon size={14} />}>
              {label}
            </Badge>
            <div className={styles.info}>
              <p className={styles.name}>
                {item.name} · {vehicle.plate}
              </p>
              <p className={styles.detail}>
                {vehicle.brand} {vehicle.model} · {formatNumber(vehicle.mileage)} km actuales ·{' '}
                {remaining >= 0
                  ? `faltan ${formatNumber(remaining)} km`
                  : `vencido por ${formatNumber(-remaining)} km`}
              </p>
              <p className={styles.detail}>
                Próxima fecha: {nextDueDate(item)} ·{' '}
                {days >= 0 ? `faltan ${formatNumber(days)} días` : `vencido por ${formatNumber(-days)} días`}
              </p>
            </div>
            {onRemove && (
              <button
                type="button"
                className={styles.remove}
                onClick={() => onRemove(item.id)}
                aria-label={`Quitar ${item.name} de ${vehicle.plate}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
