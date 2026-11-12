import { CircleCheck, OctagonAlert, Trash2, TriangleAlert } from 'lucide-react';
import type { AlertLevel, MaintenanceItem } from '../../types/maintenance';
import type { Vehicle } from '../../types/vehicle';
import { getAlertLevel, remainingKm } from '../../utils/maintenanceAlert';
import { formatNumber } from '../../utils/formatters';
import { Badge, type BadgeTone } from '../ui/Badge';
import styles from './MaintenanceAlertList.module.css';

interface MaintenanceAlertListProps {
  items: readonly MaintenanceItem[];
  vehicles: readonly Vehicle[];
  onRemove: (id: string) => void;
}

const LEVEL_APPEARANCE: Readonly<Record<AlertLevel, { tone: BadgeTone; label: string; icon: typeof CircleCheck }>> = {
  GREEN: { tone: 'success', label: 'Al día', icon: CircleCheck },
  YELLOW: { tone: 'warning', label: 'Próximo', icon: TriangleAlert },
  RED: { tone: 'danger', label: 'Urgente', icon: OctagonAlert },
};

export function MaintenanceAlertList({ items, vehicles, onRemove }: MaintenanceAlertListProps) {
  const rows = items
    .map((item) => {
      const vehicle = vehicles.find((candidate) => candidate.id === item.vehicleId);
      if (!vehicle) return null;
      const remaining = remainingKm(item, vehicle.mileage);
      return { item, vehicle, remaining, level: getAlertLevel(remaining) };
    })
    .filter((row) => row !== null)
    // Los más urgentes primero.
    .sort((a, b) => a.remaining - b.remaining);

  if (rows.length === 0) {
    return <p className={styles.empty}>Aún no hay mantenimientos programados.</p>;
  }

  return (
    <ul className={styles.list}>
      {rows.map(({ item, vehicle, remaining, level }) => {
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
            </div>
            <button
              type="button"
              className={styles.remove}
              onClick={() => onRemove(item.id)}
              aria-label={`Quitar ${item.name} de ${vehicle.plate}`}
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
