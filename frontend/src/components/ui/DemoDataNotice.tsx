import { Info } from 'lucide-react';
import styles from './DemoDataNotice.module.css';

interface DemoDataNoticeProps {
  message?: string;
}

/** Aviso visible de que la información mostrada es ficticia. */
export function DemoDataNotice({
  message = 'La información de esta pantalla es ficticia y solo sirve para mostrar el diseño. Aún no hay conexión con el sistema del taller.',
}: DemoDataNoticeProps) {
  return (
    <div className={styles.notice} role="note" aria-label="Datos de demostración">
      <Info size={18} aria-hidden="true" className={styles.icon} />
      <p>
        <strong>Datos de demostración.</strong> {message}
      </p>
    </div>
  );
}
