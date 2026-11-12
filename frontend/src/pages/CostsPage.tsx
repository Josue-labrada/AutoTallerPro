import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { CostForm } from '../components/costs/CostForm';
import { CostTable } from '../components/costs/CostTable';
import { addCostItem, listCostItems, removeCostItem } from '../services/costService';
import { listWorkOrders } from '../services/workOrderService';
import type { CostItem, CostKind } from '../types/cost';
import type { WorkOrder } from '../types/workOrder';
import styles from './CostsPage.module.css';

export function CostsPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [orderId, setOrderId] = useState('');
  const [items, setItems] = useState<CostItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listWorkOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    if (orderId === '') return;
    listCostItems(orderId)
      .then(setItems)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'No se pudieron cargar los costos.'),
      );
  }, [orderId]);

  async function handleAdd(kind: CostKind, description: string, quantity: string, price: string) {
    const item = await addCostItem(orderId, kind, description, quantity, price);
    setItems((current) => [...current, item]);
  }

  async function handleRemove(id: string) {
    try {
      await removeCostItem(orderId, id);
      setItems((current) => current.filter((item) => item.id !== id));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar el concepto.');
    }
  }

  return (
    <>
      <PageHeader
        title="Servicios y costos"
        description="Registra los servicios y materiales de cada orden y calcula el total."
      />

      <Card title="Orden de trabajo">
        <div className={styles.orderSelect}>
          <label htmlFor="cost-order">Orden</label>
          <select id="cost-order" value={orderId} onChange={(e) => setOrderId(e.target.value)}>
            <option value="">Selecciona una orden…</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.vehiclePlate} · {order.vehicleLabel}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {error && (
        <p role="alert" className="stack-gap" style={{ color: 'var(--color-danger)' }}>
          {error}
        </p>
      )}

      {orderId !== '' && (
        <>
          <Card title="Agregar concepto" className="stack-gap">
            <CostForm onSubmit={handleAdd} />
          </Card>
          <Card title="Detalle de costos" className="stack-gap">
            <CostTable items={items} onRemove={handleRemove} />
          </Card>
        </>
      )}
    </>
  );
}
