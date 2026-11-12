import type { ReactNode } from 'react';
import styles from './StatusMessage.module.css';

interface StatusMessageProps {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  /** `alert` para errores, `status` para mensajes informativos o de carga. */
  role?: 'status' | 'alert';
}

/** Mensaje centrado para estados de carga, vacío o error. */
export function StatusMessage({ icon, title, children, role = 'status' }: StatusMessageProps) {
  return (
    <div className={styles.statusMessage} role={role}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <p className={styles.title}>{title}</p>
      {children && <div className={styles.body}>{children}</div>}
    </div>
  );
}
