import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { DemoDataNotice } from '../components/ui/DemoDataNotice';
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
  RED_THRESHOLD_KM,
  YELLOW_THRESHOLD_KM,
} from '../utils/maintenanceAlert';
import { formatNumber } from '../utils/formatters';

export function MaintenancePage() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    listMaintenanceItems().then(setItems);
    listVehicles().then(setVehicles);
  }, []);

  async function handleAdd(vehicle: Vehicle, name: string, lastServiceKm: string, intervalKm: string) {
    const item = await addMaintenanceItem(vehicle, name, lastServiceKm, intervalKm);
    setItems((current) => [...current, item]);
  }

  async function handleRemove(id: string) {
    await removeMaintenanceItem(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <>
      <PageHeader
        title="Alertas de mantenimiento"
        description={`Verde: más de ${formatNumber(YELLOW_THRESHOLD_KM)} km restantes · Amarillo: de ${formatNumber(RED_THRESHOLD_KM)} a ${formatNumber(YELLOW_THRESHOLD_KM)} km · Rojo: menos de ${formatNumber(RED_THRESHOLD_KM)} km o vencido.`}
      />
      <DemoDataNotice />
      <Card title="Programar mantenimiento">
        <MaintenanceForm vehicles={vehicles} onSubmit={handleAdd} />
      </Card>
      <Card title="Estado de mantenimientos" className="stack-gap">
        <MaintenanceAlertList items={items} vehicles={vehicles} onRemove={handleRemove} />
      </Card>
    </>
  );
}
