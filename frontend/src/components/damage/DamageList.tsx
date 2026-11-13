import { DAMAGE_ZONE_LABELS, type DamageReport } from '../../types/damage';
import { formatDateTime } from '../../utils/formatters';
import styles from './DamageList.module.css';

interface DamageListProps {
  reports: readonly DamageReport[];
}

export function DamageList({ reports }: DamageListProps) {
  if (reports.length === 0) {
    return <p className={styles.empty}>Esta orden aún no tiene daños registrados.</p>;
  }

  return (
    <ul className={styles.list}>
      {reports.map((report) => (
        <li key={report.id} className={styles.item}>
          <div>
            <p className={styles.zone}>{DAMAGE_ZONE_LABELS[report.zone]}</p>
            <p className={styles.description}>{report.description}</p>
            <p className={styles.date}>{formatDateTime(new Date(report.createdAt))}</p>
          </div>
          {report.photoUrl && (
            <img
              src={report.photoUrl}
              alt={`Foto del daño en ${DAMAGE_ZONE_LABELS[report.zone]}`}
              className={styles.photo}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
