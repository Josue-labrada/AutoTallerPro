import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { KanbanBoard } from '../components/workOrders/KanbanBoard';
import { NewOrderForm } from '../components/workOrders/NewOrderForm';
import { listVehicles } from '../services/vehicleService';
import { advanceWorkOrder, createWorkOrder, listWorkOrders } from '../services/workOrderService';
import type { Vehicle } from '../types/vehicle';
import type { WorkOrder } from '../types/workOrder';

export function OrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [boardError, setBoardError] = useState('');

  useEffect(() => {
    listWorkOrders()
      .then(setOrders)
      .catch((err: unknown) =>
        setBoardError(err instanceof Error ? err.message : 'No se pudieron cargar las órdenes.'),
      );
    listVehicles().then(setVehicles).catch(() => setVehicles([]));
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
        <KanbanBoard orders={orders} onAdvance={handleAdvance} />
      </div>
    </>
  );
}
