import { pool } from '../../config/db.js';

export interface ClosureItem {
  id: string;
  kind: 'SERVICIO' | 'MATERIAL';
  description: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface OrderClosure {
  orderId: string;
  closedBy: string;
  closedAt: string;
  items: ClosureItem[];
  totalCents: number;
}

interface ClosureRow {
  work_order_id: string;
  closed_by: string;
  closed_at: Date;
  items_snapshot: ClosureItem[];
  total_cents: string;
}

function toClosure(row: ClosureRow): OrderClosure {
  return {
    orderId: row.work_order_id,
    closedBy: row.closed_by,
    closedAt: row.closed_at.toISOString(),
    items: row.items_snapshot,
    totalCents: Number(row.total_cents),
  };
}

export async function findOrderClosure(
  orderId: string,
): Promise<OrderClosure | null> {
  const result = await pool.query<ClosureRow>(
    `SELECT work_order_id, closed_by, closed_at,
            items_snapshot, total_cents
     FROM work_order_closures
     WHERE work_order_id = $1`,
    [orderId],
  );

  const row = result.rows[0];
  return row ? toClosure(row) : null;
}

/**
 * Cierra una orden dentro de una transacción.
 * El bloqueo de fila impide que dos cierres simultáneos se ejecuten a la vez.
 *
 * Las operaciones de costos también deberán usar el mismo bloqueo
 * para impedir cambios concurrentes durante el cierre.
 */
export async function insertOrderClosure(
  orderId: string,
  adminId: string,
): Promise<OrderClosure | null | 'already-closed' | 'not-ready'> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const order = await client.query<{ id: string; status: string }>(
      'SELECT id, status FROM work_orders WHERE id = $1 FOR UPDATE',
      [orderId],
    );

    if (!order.rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }

    const existing = await client.query(
      'SELECT 1 FROM work_order_closures WHERE work_order_id = $1',
      [orderId],
    );

    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return 'already-closed';
    }

    // US12: solo se cierran órdenes listas para entrega.
    if (order.rows[0].status !== 'LISTO_PARA_ENTREGA') {
      await client.query('ROLLBACK');
      return 'not-ready';
    }

    const costs = await client.query<{
      id: string;
      kind: 'SERVICIO' | 'MATERIAL';
      description: string;
      quantity: number;
      unit_price_cents: number;
    }>(
      `SELECT id, kind, description, quantity, unit_price_cents
       FROM cost_items
       WHERE work_order_id = $1
       ORDER BY created_at, id`,
      [orderId],
    );

    const items: ClosureItem[] = costs.rows.map((item) => ({
      id: item.id,
      kind: item.kind,
      description: item.description,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
      subtotalCents: item.quantity * item.unit_price_cents,
    }));

    const totalCents = items.reduce(
      (total, item) => total + item.subtotalCents,
      0,
    );

    if (!Number.isSafeInteger(totalCents)) {
      throw new Error('El total de la orden excede el límite permitido.');
    }

    const inserted = await client.query<ClosureRow>(
      `INSERT INTO work_order_closures
         (work_order_id, closed_by, items_snapshot, total_cents)
       VALUES ($1, $2, $3::jsonb, $4)
       RETURNING work_order_id, closed_by, closed_at,
                 items_snapshot, total_cents`,
      [orderId, adminId, JSON.stringify(items), totalCents.toString()],
    );

    await client.query('COMMIT');

    const row = inserted.rows[0];
    if (!row) {
      throw new Error('No se pudo recuperar el cierre de la orden.');
    }

    return toClosure(row);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
