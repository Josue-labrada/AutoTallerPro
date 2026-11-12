import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { DemoDataNotice } from '../components/ui/DemoDataNotice';
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
    listWorkOrders().then(setOrders);
    listVehicles().then(setVehicles).catch(() => setVehicles([]));
  }, []);

  async function handleCreate(vehicle: Vehicle, description: string) {
    const order = await createWorkOrder(vehicle, description);
    setOrders((current) => [order, ...current]);
  }

  async function handleAdvance(orderId: string) {
    try {
      const updated = await advanceWorkOrder(orderId);
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
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
      <DemoDataNotice />
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
