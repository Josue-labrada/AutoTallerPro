import { useEffect, useState } from 'react';
import { useAuth } from '../app/useAuth';
import { ApiError } from '../services/apiClient';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { KanbanBoard } from '../components/workOrders/KanbanBoard';
import { NewOrderForm } from '../components/workOrders/NewOrderForm';
import { listVehicles } from '../services/vehicleService';
import {
  advanceWorkOrder,
  closeWorkOrder,
  createWorkOrder,
  getWorkOrderClosure,
  listWorkOrders,
} from '../services/workOrderService';
import type { Vehicle } from '../types/vehicle';
import type { WorkOrder } from '../types/workOrder';

export function OrdersPage() {
  const { user } = useAuth();
  const [closedOrderIds, setClosedOrderIds] = useState<ReadonlySet<string>>(new Set());
  const [checkingClosures, setCheckingClosures] = useState(true);
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [boardError, setBoardError] = useState('');

  useEffect(() => {
    let cancelled = false;

    listWorkOrders()
      .then(async (loadedOrders) => {
        if (cancelled) return;
        setOrders(loadedOrders);

        const results = await Promise.allSettled(
          loadedOrders.map((order) => getWorkOrderClosure(order.id)),
        );

        if (cancelled) return;

        const closedIds = new Set<string>();
        let verificationFailed = false;

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            closedIds.add(loadedOrders[index]!.id);
          } else if (!(result.reason instanceof ApiError && result.reason.status === 404)) {
            verificationFailed = true;
          }
        });

        setClosedOrderIds(closedIds);
        if (verificationFailed) {
          setBoardError('No se pudo verificar el cierre de algunas órdenes.');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setBoardError(err instanceof Error ? err.message : 'No se pudieron cargar las órdenes.');
        }
      })
      .finally(() => {
        if (!cancelled) setCheckingClosures(false);
      });
    listVehicles().then(setVehicles).catch(() => setVehicles([]));
    return () => { cancelled = true; };
  }, []);

  async function handleCreate(vehicle: Vehicle, description: string) {
    const order = await createWorkOrder(vehicle, description);
    setOrders((current) => [order, ...current]);
  }

  async function handleAdvance(order: WorkOrder) {
    try {
      const updated = await advanceWorkOrder(order);
      setOrders((current) => current.map((item) => (item.id === order.id ? updated : item)));
      setBoardError('');
    } catch (err) {
      setBoardError(err instanceof Error ? err.message : 'No se pudo mover la orden.');
    }
  }

  async function handleClose(order: WorkOrder) {
    if (user?.role !== 'ADMIN' || checkingClosures || closingOrderId) return;
    if (order.status !== 'LISTO_PARA_ENTREGA' || closedOrderIds.has(order.id)) return;

    if (!window.confirm(`¿Cerrar definitivamente la orden ${order.vehiclePlate}?`)) return;

    setClosingOrderId(order.id);
    try {
      await closeWorkOrder(order.id);
      setClosedOrderIds((current) => new Set([...current, order.id]));
      setBoardError('');
    } catch (err) {
      setBoardError(err instanceof Error ? err.message : 'No se pudo cerrar la orden.');
    } finally {
      setClosingOrderId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Tablero de órdenes"
        description="Órdenes de trabajo por etapa. Cada orden avanza una etapa a la vez."
      />
      <Card title="Nueva orden">
        <NewOrderForm vehicles={vehicles} onSubmit={handleCreate} />
      </Card>
      {boardError && (
        <p role="alert" className="stack-gap" style={{ color: 'var(--color-danger)' }}>
          {boardError}
        </p>
      )}
      <div className="stack-gap">
        <KanbanBoard
          orders={orders}
          onAdvance={handleAdvance}
          onClose={handleClose}
          canClose={user?.role === 'ADMIN' && !checkingClosures && closingOrderId === null && !boardError}
          closedOrderIds={closedOrderIds}
        />
      </div>
    </>
  );
}
