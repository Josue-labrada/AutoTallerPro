import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app/app.js';
import { pool } from '../../src/config/db.js';
import { loginAsAdmin } from './helpers.js';

let admin: Awaited<ReturnType<typeof loginAsAdmin>>;
let vehicleId = '';
let orderId = '';

beforeAll(async () => {
  admin = await loginAsAdmin();

  const plate = `T${randomUUID().replace(/-/g, '').slice(0, 8)}`.toUpperCase();
  const trackingCode = `T${randomUUID().replace(/-/g, '').slice(0, 12)}`.toUpperCase();

  const vehicle = await pool.query<{ id: string }>(
    `INSERT INTO vehicles (plate, brand, model, year, mileage, reception_date, notes)
     VALUES ($1, 'Nissan', 'Versa', 2020, 30000, CURRENT_DATE, 'Prueba CP-10/CP-11')
     RETURNING id`,
    [plate],
  );
  vehicleId = vehicle.rows[0]!.id;

  const order = await pool.query<{ id: string }>(
    `INSERT INTO work_orders (vehicle_id, description, status, tracking_code)
     VALUES ($1, 'Prueba de costos CP-10/CP-11', 'EN_REPARACION', $2)
     RETURNING id`,
    [vehicleId, trackingCode],
  );
  orderId = order.rows[0]!.id;
});

afterAll(async () => {
  try {
    if (orderId) await pool.query('DELETE FROM work_orders WHERE id = $1', [orderId]);
    if (vehicleId) await pool.query('DELETE FROM vehicles WHERE id = $1', [vehicleId]);
  } finally {
    await pool.end();
  }
});

/** Suma de los subtotales (cantidad x precio) devueltos por la API, en centavos. */
async function totalCents(): Promise<number> {
  const res = await admin.get(`/api/work-orders/${orderId}/costs`);
  expect(res.status).toBe(200);
  return (res.body as { quantity: number; unitPriceCents: number }[]).reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0,
  );
}

describe('CP-10: registro de servicios e insumos', () => {
  it('rechaza a un invitado sin sesión (401)', async () => {
    const res = await request(app).get(`/api/work-orders/${orderId}/costs`);
    expect(res.status).toBe(401);
  });

  it('agrega un servicio válido y responde 201', async () => {
    const res = await admin.post(`/api/work-orders/${orderId}/costs`).send({
      kind: 'SERVICIO',
      description: 'Cambio de balatas',
      quantity: 2,
      unitPriceCents: 45050,
    });
    expect(res.status).toBe(201);
    expect(res.body.description).toBe('Cambio de balatas');
    expect(res.body.quantity).toBe(2);
    expect(res.body.unitPriceCents).toBe(45050);
  });

  it('agrega un material válido y responde 201', async () => {
    const res = await admin.post(`/api/work-orders/${orderId}/costs`).send({
      kind: 'MATERIAL',
      description: 'Aceite 5W-30',
      quantity: 3,
      unitPriceCents: 1010,
    });
    expect(res.status).toBe(201);
  });

  it.each([
    ['cantidad cero', { quantity: 0, unitPriceCents: 1000 }],
    ['cantidad negativa', { quantity: -1, unitPriceCents: 1000 }],
    ['cantidad decimal', { quantity: 1.5, unitPriceCents: 1000 }],
    ['precio cero', { quantity: 1, unitPriceCents: 0 }],
    ['precio negativo', { quantity: 1, unitPriceCents: -100 }],
    ['precio decimal', { quantity: 1, unitPriceCents: 10.5 }],
  ])('rechaza %s con 400', async (_caso, parcial) => {
    const res = await admin
      .post(`/api/work-orders/${orderId}/costs`)
      .send({ kind: 'SERVICIO', description: 'Concepto inválido', ...parcial });
    expect(res.status).toBe(400);
  });

  it('rechaza una descripción vacía con 400', async () => {
    const res = await admin.post(`/api/work-orders/${orderId}/costs`).send({
      kind: 'SERVICIO',
      description: '   ',
      quantity: 1,
      unitPriceCents: 1000,
    });
    expect(res.status).toBe(400);
  });

  it('los conceptos inválidos no se guardaron', async () => {
    const res = await admin.get(`/api/work-orders/${orderId}/costs`);
    expect(res.body).toHaveLength(2);
  });
});

describe('CP-11: cálculo de costos al agregar y quitar conceptos', () => {
  it('el total coincide al centavo con el cálculo manual', async () => {
    // 2 x 450.50 + 3 x 10.10 = 901.00 + 30.30 = 931.30
    expect(await totalCents()).toBe(93130);
  });

  it('al eliminar un concepto responde 204 y el total se actualiza', async () => {
    const list = await admin.get(`/api/work-orders/${orderId}/costs`);
    const aceite = (list.body as { id: string; description: string }[]).find(
      (item) => item.description === 'Aceite 5W-30',
    );
    expect(aceite).toBeDefined();

    const del = await admin.delete(`/api/work-orders/${orderId}/costs/${aceite!.id}`);
    expect(del.status).toBe(204);

    // Queda solo 2 x 450.50 = 901.00
    expect(await totalCents()).toBe(90100);
  });

  it('eliminar un concepto que ya no existe responde 404', async () => {
    const res = await admin.delete(`/api/work-orders/${orderId}/costs/${randomUUID()}`);
    expect(res.status).toBe(404);
  });
});
