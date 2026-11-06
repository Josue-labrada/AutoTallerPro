import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Color del icono; cualquier valor CSS, normalmente una variable de tokens.css. */
  accentColor?: string;
  hint?: string;
}

/** Indicador numérico con etiqueta, icono y texto de apoyo. */
export function StatCard({ label, value, icon: Icon, accentColor, hint }: StatCardProps) {
  // Las variables CSS personalizadas no forman parte del tipo CSSProperties.
  const style = accentColor ? ({ '--stat-accent': accentColor } as CSSProperties) : undefined;

  return (
    <article className={styles.statCard} style={style}>
      <div className={styles.top}>
        <h3 className={styles.label}>{label}</h3>
        <span className={styles.iconWrap} aria-hidden="true">
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>
      <p className={styles.value}>{formatNumber(value)}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </article>
  );
}
