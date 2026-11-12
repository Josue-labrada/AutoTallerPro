import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { DemoDataNotice } from '../components/ui/DemoDataNotice';
import { PageHeader } from '../components/ui/PageHeader';
import { CarDamageMap } from '../components/damage/CarDamageMap';
import { DamageForm } from '../components/damage/DamageForm';
import { DamageList } from '../components/damage/DamageList';
import { addDamage, listDamages } from '../services/damageService';
import { listWorkOrders } from '../services/workOrderService';
import type { DamageReport, DamageZone } from '../types/damage';
import type { WorkOrder } from '../types/workOrder';
import styles from './DamageMapPage.module.css';

export function DamageMapPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [orderId, setOrderId] = useState('');
  const [zone, setZone] = useState<DamageZone | null>(null);
  const [reports, setReports] = useState<DamageReport[]>([]);

  useEffect(() => {
    listWorkOrders().then(setOrders);
  }, []);

  useEffect(() => {
    if (orderId === '') return;
    listDamages(orderId).then(setReports);
  }, [orderId]);

  const damagedZones = useMemo(() => new Set(reports.map((report) => report.zone)), [reports]);

  async function handleSave(description: string, photo: File | null) {
    if (!zone) return;
    const report = await addDamage(orderId, zone, description, photo);
    setReports((current) => [report, ...current]);
  }

  return (
    <>
      <PageHeader
        title="Mapeo de daños"
        description="Selecciona la orden y marca en el diagrama dónde está el daño."
      />
      <DemoDataNotice />

      <Card title="Orden de trabajo">
        <div className={styles.orderSelect}>
          <label htmlFor="damage-order">Orden</label>
          <select
            id="damage-order"
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value);
              setZone(null);
            }}
          >
            <option value="">Selecciona una orden…</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.vehiclePlate} · {order.vehicleLabel}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {orderId !== '' && (
        <>
          <div className={`${styles.columns} stack-gap`}>
            <Card title="Diagrama del vehículo" description="Haz clic en la zona afectada. En rojo: ya tiene daños.">
              <CarDamageMap selectedZone={zone} damagedZones={damagedZones} onSelect={setZone} />
            </Card>
            <Card title="Registrar daño">
              <DamageForm zone={zone} onSubmit={handleSave} />
            </Card>
          </div>
          <Card title={`Daños registrados (${reports.length})`} className="stack-gap">
            <DamageList reports={reports} />
          </Card>
        </>
      )}
    </>
  );
}
