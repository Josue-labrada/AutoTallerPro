import { useEffect, useState } from 'react';
import { ApiError } from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { CostForm } from '../components/costs/CostForm';
import { CostTable } from '../components/costs/CostTable';
import { addCostItem, listCostItems, removeCostItem } from '../services/costService';
import { getWorkOrderClosure, listWorkOrders } from '../services/workOrderService';
import type { CostItem, CostKind } from '../types/cost';
import type { WorkOrder } from '../types/workOrder';
import styles from './CostsPage.module.css';

export function CostsPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [orderId, setOrderId] = useState('');
  const [items, setItems] = useState<CostItem[]>([]);
  const [error, setError] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const [checkingClosure, setCheckingClosure] = useState(false);

  useEffect(() => {
    listWorkOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    setItems([]);
    setIsClosed(false);
    setError('');

    if (orderId === '') {
      setCheckingClosure(false);
      return;
    }

    setCheckingClosure(true);

    Promise.allSettled([
      listCostItems(orderId),
      getWorkOrderClosure(orderId),
    ]).then(([costsResult, closureResult]) => {
      if (cancelled) return;

      if (costsResult.status === 'fulfilled') {
        setItems(costsResult.value);
      } else {
        setError('No se pudieron cargar los costos.');
      }

      if (closureResult.status === 'fulfilled') {
        setIsClosed(true);
      } else if (closureResult.reason instanceof ApiError && closureResult.reason.status === 404) {
        setIsClosed(false);
      } else {
        setError('No se pudo comprobar si la orden está cerrada.');
      }

      setCheckingClosure(false);
    });

    return () => {
      cancelled = true;
    };
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
          {checkingClosure ? (
            <p role="status">Comprobando estado de la orden…</p>
          ) : (
            <>
              {isClosed && (
                <p role="status">Orden cerrada: los costos son de solo lectura.</p>
              )}
              {!isClosed && (
                <Card title="Agregar concepto" className="stack-gap">
                  <CostForm onSubmit={handleAdd} />
                </Card>
              )}
              <Card title="Detalle de costos" className="stack-gap">
                <CostTable items={items} onRemove={handleRemove} readOnly={isClosed} />
              </Card>
            </>
          )}
        </>
      )}
    </>
  );
}
