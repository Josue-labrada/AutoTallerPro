// Pruebas de CP-13: Consulta mediante código de seguimiento
// Pruebas de CP-14: Visualización del estado en solo lectura
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app/app.js';
import { createVehicleWithOrder, loginAsAdmin, type Agent } from './helpers.js';

// Este archivo va solo: la ruta de seguimiento admite 10 consultas por minuto por IP
// y el limite se reinicia en cada archivo de pruebas (cada uno carga su propia app).
let admin: Agent;
let order: Awaited<ReturnType<typeof createVehicleWithOrder>>;

beforeAll(async () => {
  admin = await loginAsAdmin();
  order = await createVehicleWithOrder(admin);
});

describe('CP-13: consulta con codigo de seguimiento (sin sesion)', () => {
  it('un codigo valido devuelve solo la informacion autorizada', async () => {
    const res = await request(app).get(`/api/tracking/${order.trackingCode}`);
    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(['maskedPlate', 'status', 'vehicleLabel']);
    expect(res.body.status).toBe('EN_RECEPCION');
    expect(res.body.vehicleLabel).toContain('Mazda');
  });

  it('la placa sale parcialmente oculta y no se filtran datos internos', async () => {
    const res = await request(app).get(`/api/tracking/${order.trackingCode}`);
    expect(res.body.maskedPlate).toContain('•••');
    expect(res.body.maskedPlate).not.toBe(order.plate);
    const raw = JSON.stringify(res.body);
    expect(raw).not.toContain(order.plate);
    expect(raw).not.toContain(order.orderId);
    expect(raw).not.toContain(order.vehicleId);
    expect(raw).not.toContain('Revision general'); // descripcion interna
  });

  it('acepta el codigo en minusculas y con espacios', async () => {
    const res = await request(app).get(`/api/tracking/${encodeURIComponent(' ' + order.trackingCode.toLowerCase() + ' ')}`);
    expect(res.status).toBe(200);
  });

  it('un codigo inexistente y uno mal formado dan exactamente el mismo error', async () => {
    const missing = await request(app).get('/api/tracking/ATP-AAAA-BBBB');
    const malformed = await request(app).get('/api/tracking/hola');
    expect(missing.status).toBe(404);
    expect(malformed.status).toBe(404);
    expect(missing.body.message).toBe(malformed.body.message);
  });

  it('una inyeccion SQL en el codigo no revela nada', async () => {
    const res = await request(app).get('/api/tracking/' + encodeURIComponent("ATP-AAAA-BBBB' OR '1'='1"));
    expect(res.status).toBe(404);
  });
});

describe('CP-14: el estado mostrado coincide con el guardado', () => {
  it('refleja el cambio cuando un trabajador actualiza la orden', async () => {
    const before = await request(app).get(`/api/tracking/${order.trackingCode}`);
    const moved = await admin.patch(`/api/work-orders/${order.orderId}/status`).send({ status: 'EN_DIAGNOSTICO' });
    expect(moved.status).toBe(200);
    const after = await request(app).get(`/api/tracking/${order.trackingCode}`);
    expect(before.body.status).toBe('EN_RECEPCION');
    expect(after.body.status).toBe('EN_DIAGNOSTICO');
  });

  it('la ruta de seguimiento es de solo lectura: no acepta modificaciones', async () => {
    const path = `/api/tracking/${order.trackingCode}`;
    for (const method of ['post', 'put', 'patch', 'delete'] as const) {
      const res = await request(app)[method](path).send({ status: 'LISTO_PARA_ENTREGA' });
      expect(res.status).toBe(404);
    }
    const check = await request(app).get(path);
    expect(check.body.status).toBe('EN_DIAGNOSTICO');
  });
});

describe('CP-13: limite de intentos (va al final, gasta los intentos de la ventana)', () => {
  it('despues de 10 consultas en un minuto, la siguiente responde 429', async () => {
    // En este archivo ya se hicieron varias consultas; se completan hasta pasar el limite
    // y se verifica que a partir de ahi todas se rechazan.
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      statuses.push((await request(app).get('/api/tracking/ATP-AAAA-BBBB')).status);
    }
    expect(statuses[statuses.length - 1]).toBe(429);
    expect(statuses).toContain(429);
    const firstBlocked = statuses.indexOf(429);
    expect(statuses.slice(firstBlocked).every((s) => s === 429)).toBe(true);
  });
});