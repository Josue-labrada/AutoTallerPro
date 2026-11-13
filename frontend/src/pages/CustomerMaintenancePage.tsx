import { useEffect, useState, type FormEvent } from 'react';
import { Link2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { MaintenanceAlertList } from '../components/maintenance/MaintenanceAlertList';
import { claimVehicle, listMyMaintenance, listMyVehicles } from '../services/customerService';
import type { MaintenanceItem } from '../types/maintenance';
import type { VehicleSummary } from '../types/vehicle';
import {
  RED_THRESHOLD_DAYS,
  RED_THRESHOLD_KM,
  YELLOW_THRESHOLD_DAYS,
  YELLOW_THRESHOLD_KM,
} from '../utils/maintenanceAlert';
import { formatNumber } from '../utils/formatters';
import styles from './AuthForm.module.css';

/** Portal del cliente: vincula su vehículo con el código del taller y ve sus alertas (solo lectura). */
export function CustomerMaintenancePage() {
  const [vehicles, setVehicles] = useState<VehicleSummary[]>([]);
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [error, setError] = useState('');

  const [code, setCode] = useState('');
  const [claimError, setClaimError] = useState('');
  const [claimMessage, setClaimMessage] = useState('');

  function loadMine(): Promise<void> {
    return Promise.all([listMyVehicles(), listMyMaintenance()]).then(([myVehicles, myItems]) => {
      setVehicles(myVehicles);
      setItems(myItems);
    });
  }

  useEffect(() => {
    loadMine().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'No se pudo cargar tu información.'),
    );
  }, []);

  async function handleClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClaimMessage('');
    try {
      const result = await claimVehicle(code);
      setClaimError('');
      setClaimMessage(
        result.status === 'claimed' ? 'Listo: tu vehículo quedó vinculado a tu cuenta.' : 'Ese vehículo ya estaba en tu cuenta.',
      );
      setCode('');
      await loadMine();
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'No se pudo vincular el vehículo.');
    }
  }

  return (
    <>
      <PageHeader
        title="Mis alertas de mantenimiento"
        description={`Km: verde más de ${formatNumber(YELLOW_THRESHOLD_KM)}, amarillo ${formatNumber(RED_THRESHOLD_KM)}–${formatNumber(YELLOW_THRESHOLD_KM)}, rojo menos de ${formatNumber(RED_THRESHOLD_KM)} o vencido. Días: verde más de ${YELLOW_THRESHOLD_DAYS}, amarillo ${RED_THRESHOLD_DAYS}–${YELLOW_THRESHOLD_DAYS}, rojo menos de ${RED_THRESHOLD_DAYS} o vencido.`}
      />

      <Card
        title="Vincular mi vehículo"
        description="Escribe el código de seguimiento que te dio el taller (ATP-XXXX-XXXX)."
      >
        <form className={styles.form} onSubmit={handleClaim} noValidate>
          <div className={styles.field}>
            <label htmlFor="claim-code">Código de seguimiento</label>
            <input
              id="claim-code"
              value={code}
              maxLength={20}
              autoComplete="off"
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          {claimError && (
            <p className={styles.error} role="alert">
              {claimError}
            </p>
          )}
          {claimMessage && <p role="status">{claimMessage}</p>}
          <button type="submit" className={styles.submit}>
            <Link2 size={16} aria-hidden="true" />
            Vincular
          </button>
        </form>
      </Card>

      {error && (
        <p role="alert" className="stack-gap" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}

      <Card title={`Mis vehículos (${vehicles.length})`} className="stack-gap">
        {vehicles.length === 0 ? (
          <p className={styles.hint}>Aún no tienes vehículos vinculados.</p>
        ) : (
          <MaintenanceAlertList items={items} vehicles={vehicles} />
        )}
      </Card>
    </>
  );
}
