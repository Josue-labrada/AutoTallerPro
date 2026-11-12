import type pg from 'pg';
import { pool } from '../../config/db.js';
import type { WorkOrder, WorkOrderStatus } from './work-order.model.js';

interface OrderRow {
  id: string;
  vehicle_id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  description: string;
  status: WorkOrderStatus;
  tracking_code: string;
  created_at: Date;
}

const SELECT_ORDER = `
  SELECT wo.id, wo.vehicle_id, v.plate, v.brand, v.model, v.year,
         wo.description, wo.status, wo.tracking_code, wo.created_at
  FROM work_orders wo
  JOIN vehicles v ON v.id = wo.vehicle_id`;

function toOrder(row: OrderRow): WorkOrder {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehiclePlate: row.plate,
    vehicleLabel: `${row.brand} ${row.model} ${row.year}`,
    description: row.description,
    status: row.status,
    trackingCode: row.tracking_code,
    createdAt: row.created_at.toISOString(),
  };
}

/** Único lugar que habla con PostgreSQL para órdenes. Siempre con consultas parametrizadas. */
export async function findAllOrders(): Promise<WorkOrder[]> {
  const result = await pool.query<OrderRow>(`${SELECT_ORDER} ORDER BY wo.created_at DESC`);
  return result.rows.map(toOrder);
}

export async function findOrderById(id: string): Promise<WorkOrder | null> {
  const result = await pool.query<OrderRow>(`${SELECT_ORDER} WHERE wo.id = $1`, [id]);
  const row = result.rows[0];
  return row ? toOrder(row) : null;
}

/** `null` si el vehículo no existe; `'duplicate-code'` si el código de seguimiento ya estaba en uso. */
export async function insertOrder(
  vehicleId: string,
  description: string,
  trackingCode: string,
): Promise<WorkOrder | null | 'duplicate-code'> {
  const vehicle = await pool.query('SELECT 1 FROM vehicles WHERE id = $1', [vehicleId]);
  if (vehicle.rowCount === 0) return null;

  const inserted = await pool.query<{ id: string }>(
    `INSERT INTO work_orders (vehicle_id, description, tracking_code)
     VALUES ($1, $2, $3)
     ON CONFLICT (tracking_code) DO NOTHING
     RETURNING id`,
    [vehicleId, description, trackingCode],
  );
  const id = inserted.rows[0]?.id;
  if (!id) return 'duplicate-code';
  return findOrderById(id);
}

/**
 * Cambia el estado dentro de una transacción. `decide` recibe el estado actual (bloqueado con
 * FOR UPDATE para que dos cambios simultáneos no se pisen) y devuelve el error a lanzar, o null si procede.
 */
export async function updateOrderStatus(
  id: string,
  newStatus: WorkOrderStatus,
  decide: (current: WorkOrderStatus) => Error | null,
): Promise<WorkOrder | null> {
  const client: pg.PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query<{ status: WorkOrderStatus }>(
      'SELECT status FROM work_orders WHERE id = $1 FOR UPDATE',
      [id],
    );
    const currentStatus = current.rows[0]?.status;
    if (!currentStatus) {
      await client.query('ROLLBACK');
      return null;
    }
    const problem = decide(currentStatus);
    if (problem) {
      await client.query('ROLLBACK');
      throw problem;
    }
    await client.query('UPDATE work_orders SET status = $2, updated_at = now() WHERE id = $1', [id, newStatus]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
  return findOrderById(id);
}
