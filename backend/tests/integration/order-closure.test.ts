import { setSessionCookie } from '../../src/modules/auth/session.js';
import { createUser, startSession } from '../../src/modules/auth/auth.service.js';
import { app } from '../../src/app/app.js';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { pool } from '../../src/config/db.js';
import { loginAsAdmin } from './helpers.js';

const vehicleIds: string[] = [];
const orderIds: string[] = [];

async function createTestOrder(): Promise<string> {
  const plate = `T${randomUUID().replace(/-/g, '').slice(0, 8)}`.toUpperCase();
  const trackingCode = `T${randomUUID().replace(/-/g, '').slice(0, 12)}`.toUpperCase();

  const vehicle = await pool.query<{ id: string }>(
    `INSERT INTO vehicles
      (plate, brand, model, year, mileage, reception_date, notes)
     VALUES ($1, 'Toyota', 'Corolla', 2021, 25000, CURRENT_DATE, 'Prueba CP-12')
     RETURNING id`,
    [plate],
  );

  const vehicleId = vehicle.rows[0]!.id;
  vehicleIds.push(vehicleId);

  const order = await pool.query<{ id: string }>(
    `INSERT INTO work_orders
      (vehicle_id, description, status, tracking_code)
     VALUES ($1, 'Prueba de cierre CP-12', 'LISTO_PARA_ENTREGA', $2)
     RETURNING id`,
    [vehicleId, trackingCode],
  );

  const orderId = order.rows[0]!.id;
  orderIds.push(orderId);

  await pool.query(
    `INSERT INTO cost_items
      (work_order_id, kind, description, quantity, unit_price_cents)
     VALUES
      ($1, 'SERVICIO', 'Diagnóstico', 1, 50000),
      ($1, 'MATERIAL', 'Aceite', 2, 15000)`,
    [orderId],
  );

  return orderId;
}

afterAll(async () => {
  try {
    for (const orderId of orderIds) {
      await pool.query(
        'DELETE FROM work_order_closures WHERE work_order_id = $1',
        [orderId],
      );
      await pool.query('DELETE FROM work_orders WHERE id = $1', [orderId]);
    }

    for (const vehicleId of vehicleIds) {
      await pool.query('DELETE FROM vehicles WHERE id = $1', [vehicleId]);
    }
  } finally {
    await pool.end();
  }
});

describe('CP-12: cierre de orden y auditoría', () => {
  it('permite al administrador cerrar una orden y consultar su resumen', async () => {
    const agent = await loginAsAdmin();
    const orderId = await createTestOrder();

    const closeResponse = await agent.post(
      `/api/work-orders/${orderId}/close`,
    );

    expect(closeResponse.status).toBe(201);

    const summaryResponse = await agent.get(
      `/api/work-orders/${orderId}/closure`,
    );

    expect(summaryResponse.status).toBe(200);
    expect(summaryResponse.body.orderId).toBe(orderId);
    expect(summaryResponse.body.totalCents).toBe(80000);
    expect(summaryResponse.body.items).toHaveLength(2);
    expect(summaryResponse.body.closedBy).toBeDefined();
    expect(summaryResponse.body.closedAt).toBeDefined();
  });

  it('rechaza un segundo cierre con HTTP 409', async () => {
    const agent = await loginAsAdmin();
    const orderId = await createTestOrder();

    const firstClose = await agent.post(
      `/api/work-orders/${orderId}/close`,
    );
    expect(firstClose.status).toBe(201);

    const secondClose = await agent.post(
      `/api/work-orders/${orderId}/close`,
    );
    expect(secondClose.status).toBe(409);

    const summary = await agent.get(
      `/api/work-orders/${orderId}/closure`,
    );
    expect(summary.status).toBe(200);
    expect(summary.body.totalCents).toBe(80000);
  });

  it('impide agregar costos después del cierre', async () => {
    const agent = await loginAsAdmin();
    const orderId = await createTestOrder();

    const closeResponse = await agent.post(
      `/api/work-orders/${orderId}/close`,
    );
    expect(closeResponse.status).toBe(201);

    const addResponse = await agent
      .post(`/api/work-orders/${orderId}/costs`)
      .send({
        kind: 'SERVICIO',
        description: 'Servicio posterior al cierre',
        quantity: 1,
        unitPriceCents: 20000,
      });

    expect(addResponse.status).toBe(409);

    const costs = await pool.query(
      'SELECT COUNT(*)::int AS total FROM cost_items WHERE work_order_id = $1',
      [orderId],
    );

    expect(costs.rows[0].total).toBe(2);

    const summary = await agent.get(
      `/api/work-orders/${orderId}/closure`,
    );
    expect(summary.status).toBe(200);
    expect(summary.body.totalCents).toBe(80000);
  });


  it('impide eliminar costos después del cierre', async () => {
    const agent = await loginAsAdmin();
    const orderId = await createTestOrder();

    const originalCosts = await pool.query<{ id: string }>(
      'SELECT id FROM cost_items WHERE work_order_id = $1 ORDER BY id',
      [orderId],
    );

    expect(originalCosts.rows).toHaveLength(2);
    const costId = originalCosts.rows[0]!.id;

    const closeResponse = await agent.post(
      `/api/work-orders/${orderId}/close`,
    );
    expect(closeResponse.status).toBe(201);

    const deleteResponse = await agent.delete(
      `/api/work-orders/${orderId}/costs/${costId}`,
    );
    expect(deleteResponse.status).toBe(409);

    const remainingCosts = await pool.query(
      'SELECT COUNT(*)::int AS total FROM cost_items WHERE work_order_id = $1',
      [orderId],
    );
    expect(remainingCosts.rows[0].total).toBe(2);

    const summary = await agent.get(
      `/api/work-orders/${orderId}/closure`,
    );
    expect(summary.status).toBe(200);
    expect(summary.body.totalCents).toBe(80000);
    expect(summary.body.items).toHaveLength(2);
  });


  it('rechaza el cierre sin sesión con HTTP 401', async () => {
    const orderId = await createTestOrder();

    const response = await request(app).post(
      `/api/work-orders/${orderId}/close`,
    );

    expect(response.status).toBe(401);

    const closure = await pool.query(
      'SELECT 1 FROM work_order_closures WHERE work_order_id = $1',
      [orderId],
    );

    expect(closure.rows).toHaveLength(0);
  });


  it('rechaza el cierre por un trabajador con HTTP 403', async () => {
    const orderId = await createTestOrder();
    const email = `worker-${randomUUID()}@example.test`;

    const worker = await createUser(
      {
        email,
        name: 'Trabajador CP12',
        password: 'PruebaCP12!2026',
      },
      'WORKER',
    );

    try {
      const token = await startSession(worker.id);

      const response = await request(app)
        .post(`/api/work-orders/${orderId}/close`)
        .set('Cookie', `atp_session=${token}`);

      expect(response.status).toBe(403);

      const closure = await pool.query(
        'SELECT 1 FROM work_order_closures WHERE work_order_id = $1',
        [orderId],
      );

      expect(closure.rows).toHaveLength(0);
    } finally {
      await pool.query('DELETE FROM sessions WHERE user_id = $1', [
        worker.id,
      ]);
      await pool.query('DELETE FROM users WHERE id = $1', [worker.id]);
    }
  });


  it('impide modificar el estado después del cierre', async () => {
    const agent = await loginAsAdmin();
    const orderId = await createTestOrder();

    const closeResponse = await agent.post(
      `/api/work-orders/${orderId}/close`,
    );
    expect(closeResponse.status).toBe(201);

    const statusResponse = await agent
      .patch(`/api/work-orders/${orderId}/status`)
      .send({ status: 'EN_REPARACION' });

    expect(statusResponse.status).toBe(409);

    const order = await pool.query<{ status: string }>(
      'SELECT status FROM work_orders WHERE id = $1',
      [orderId],
    );

    expect(order.rows[0]?.status).toBe('LISTO_PARA_ENTREGA');

    const closure = await agent.get(
      `/api/work-orders/${orderId}/closure`,
    );

    expect(closure.status).toBe(200);
    expect(closure.body.totalCents).toBe(80000);
  });


  it('rechaza cerrar una orden que sigue en reparación', async () => {
    const agent = await loginAsAdmin();
    const orderId = await createTestOrder();

    // La orden de prueba se crea inicialmente lista para entrega.
    // La cambiamos directamente para comprobar la regla de cierre.
    await pool.query(
      `UPDATE work_orders
       SET status = 'EN_REPARACION'
       WHERE id = $1`,
      [orderId],
    );

    const response = await agent.post(
      `/api/work-orders/${orderId}/close`,
    );

    expect(response.status).toBe(409);

    const closure = await pool.query(
      'SELECT 1 FROM work_order_closures WHERE work_order_id = $1',
      [orderId],
    );

    expect(closure.rows).toHaveLength(0);

    const order = await pool.query<{ status: string }>(
      'SELECT status FROM work_orders WHERE id = $1',
      [orderId],
    );

    expect(order.rows[0]?.status).toBe('EN_REPARACION');
  });

});
