import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { MaintenanceAlertList } from '../components/maintenance/MaintenanceAlertList';
import { MaintenanceForm } from '../components/maintenance/MaintenanceForm';
import {
  addMaintenanceItem,
  listMaintenanceItems,
  removeMaintenanceItem,
} from '../services/maintenanceService';
import { listVehicles } from '../services/vehicleService';
import type { MaintenanceItem } from '../types/maintenance';
import type { Vehicle } from '../types/vehicle';
import {
  RED_THRESHOLD_DAYS,
  RED_THRESHOLD_KM,
  YELLOW_THRESHOLD_DAYS,
  YELLOW_THRESHOLD_KM,
} from '../utils/maintenanceAlert';
import { formatNumber } from '../utils/formatters';

export function MaintenancePage() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listMaintenanceItems()
      .then(setItems)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los mantenimientos.'),
      );
    listVehicles().then(setVehicles).catch(() => setVehicles([]));
  }, []);

  async function handleAdd(
    vehicle: Vehicle,
    name: string,
    lastServiceKm: string,
    intervalKm: string,
    lastServiceDate: string,
    intervalMonths: string,
  ) {
    const item = await addMaintenanceItem(
      vehicle,
      name,
      lastServiceKm,
      intervalKm,
      lastServiceDate,
      intervalMonths,
    );
    setItems((current) => [...current, item]);
  }

  async function handleRemove(id: string) {
    try {
      await removeMaintenanceItem(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar el mantenimiento.');
    }
  }

  return (
    <>
      <PageHeader
        title="Alertas de mantenimiento"
        description={`Se revisan kilómetros y fecha, y manda el más grave. Km: verde más de ${formatNumber(YELLOW_THRESHOLD_KM)}, amarillo ${formatNumber(RED_THRESHOLD_KM)}–${formatNumber(YELLOW_THRESHOLD_KM)}, rojo menos de ${formatNumber(RED_THRESHOLD_KM)} o vencido. Días: verde más de ${YELLOW_THRESHOLD_DAYS}, amarillo ${RED_THRESHOLD_DAYS}–${YELLOW_THRESHOLD_DAYS}, rojo menos de ${RED_THRESHOLD_DAYS} o vencido.`}
      />
      {error && (
        <p role="alert" style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>
          {error}
        </p>
      )}
      <Card title="Programar mantenimiento">
        <MaintenanceForm vehicles={vehicles} onSubmit={handleAdd} />
      </Card>
      <Card title="Estado de mantenimientos" className="stack-gap">
        <MaintenanceAlertList items={items} vehicles={vehicles} onRemove={handleRemove} />
      </Card>
    </>
  );
}
