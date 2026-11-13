import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusProgress } from '../components/tracking/StatusProgress';
import { trackOrder } from '../services/workOrderService';
import type { TrackingInfo } from '../types/tracking';
import { WORK_ORDER_STATUS_LABELS } from '../types/workOrder';
import styles from './TrackingPage.module.css';

export function TrackingPage() {
  const [code, setCode] = useState('');
  const [info, setInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setInfo(await trackOrder(code));
      setError('');
    } catch (err) {
      setInfo(null);
      setError(err instanceof Error ? err.message : 'No se pudo consultar la orden.');
    }
  }

  return (
    <>
      <PageHeader
        title="Seguimiento de tu vehículo"
        description="Consulta el estado de la reparación con el código que te entregó el taller."
      />

      <Card title="Código de seguimiento">
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="tracking-code">Código (ej. ATP-XXXX-XXXX)</label>
            <input
              id="tracking-code"
              value={code}
              maxLength={20}
              autoComplete="off"
              onChange={(e) => setCode(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'tracking-error' : undefined}
            />
          </div>
          <button type="submit" className={styles.submit}>
            <Search size={16} aria-hidden="true" />
            Consultar
          </button>
          {error && (
            <p id="tracking-error" className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      </Card>

      {info && (
        <Card
          title={`${info.vehicleLabel} · ${info.maskedPlate}`}
          description={`Estado actual: ${WORK_ORDER_STATUS_LABELS[info.status]}`}
          className="stack-gap"
        >
          <div aria-live="polite">
            <StatusProgress current={info.status} />
          </div>
        </Card>
      )}
    </>
  );
}
