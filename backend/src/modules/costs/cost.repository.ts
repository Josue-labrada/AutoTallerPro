import type pg from 'pg';
import { pool } from '../../config/db.js';
import { HttpError } from '../../middleware/errorHandler.js';
import type { CostItem, CostKind, NewCostItem } from './cost.model.js';

interface CostRow {
  id: string;
  work_order_id: string;
  kind: CostKind;
  description: string;
  quantity: number;
  unit_price_cents: number;
}

const COLUMNS = 'id, work_order_id, kind, description, quantity, unit_price_cents';

function toCostItem(row: CostRow): CostItem {
  return {
    id: row.id,
    orderId: row.work_order_id,
    kind: row.kind,
    description: row.description,
    quantity: row.quantity,
    unitPriceCents: row.unit_price_cents,
  };
}

export async function orderExists(orderId: string): Promise<boolean> {
  const result = await pool.query('SELECT 1 FROM work_orders WHERE id = $1', [orderId]);
  return (result.rowCount ?? 0) > 0;
}

export async function findCostItems(orderId: string): Promise<CostItem[]> {
  const result = await pool.query<CostRow>(
    `SELECT ${COLUMNS} FROM cost_items WHERE work_order_id = $1 ORDER BY created_at, id`,
    [orderId],
  );
  return result.rows.map(toCostItem);
}


/**
 * Ejecuta una modificación de costos con la orden bloqueada.
 * Impide modificaciones después del cierre y condiciones de carrera.
 */
async function withOpenOrder<T>(
  orderId: string,
  operation: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const order = await client.query(
      'SELECT id FROM work_orders WHERE id = $1 FOR UPDATE',
      [orderId],
    );

    if (!order.rows[0]) {
      throw new HttpError(404, 'La orden no existe.');
    }

    const closure = await client.query(
      'SELECT 1 FROM work_order_closures WHERE work_order_id = $1',
      [orderId],
    );

    if (closure.rows[0]) {
      throw new HttpError(409, 'La orden está cerrada y no permite modificar costos.');
    }

    const result = await operation(client);

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export async function insertCostItem(
  orderId: string,
  item: NewCostItem,
): Promise<CostItem> {
  return withOpenOrder(orderId, async (client) => {
    const result = await client.query<CostRow>(
      `INSERT INTO cost_items
         (work_order_id, kind, description, quantity, unit_price_cents)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [orderId, item.kind, item.description, item.quantity, item.unitPriceCents],
    );

    const row = result.rows[0];
    if (!row) throw new Error('No se pudo guardar el concepto.');

    return toCostItem(row);
  });
}

/**
 * Elimina un concepto únicamente si la orden está abierta.
 */
export async function deleteCostItem(
  orderId: string,
  id: string,
): Promise<boolean> {
  return withOpenOrder(orderId, async (client) => {
    const result = await client.query(
      'DELETE FROM cost_items WHERE id = $1 AND work_order_id = $2',
      [id, orderId],
    );

    return (result.rowCount ?? 0) > 0;
  });
}
