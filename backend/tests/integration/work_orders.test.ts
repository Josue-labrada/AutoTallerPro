// Pruebas de CP-01: Registro inicial del vehículo
// Pruebas de CP-07: Visualización de columnas Kanban
// Pruebas de CP-08: Transición de estados
// Pruebas de CP-09: Concurrencia de actualizaciones

import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app/app.js';
import { updateOrderStatus } from '../../src/modules/work-orders/work-order.repository.js';
import { isAllowedTransition } from '../../src/modules/work-orders/work-order.model.js';
import { createVehicleWithOrder, loginAsAdmin, vehicleBody, type Agent } from './helpers.js';

let admin: Agent;
let orderId: string;

beforeAll(async () => {
  admin = await loginAsAdmin();
});

describe('acceso sin sesion', () => {
  it('un invitado no puede ver vehiculos ni ordenes (401)', async () => {
    expect((await request(app).get('/api/vehicles')).status).toBe(401);
    expect((await request(app).get('/api/work-orders')).status).toBe(401);
  });

  it('un invitado no puede registrar vehiculos (401)', async () => {
    expect((await request(app).post('/api/vehicles').send(vehicleBody())).status).toBe(401);
  });
});

describe('CP-01: registro de vehiculos', () => {
  it('registra un vehiculo valido, lo normaliza y aparece en el listado', async () => {
    const body = vehicleBody({ plate: 'jal-' + Math.floor(1000 + Math.random() * 8999) });
    const res = await admin.post('/api/vehicles').send(body);
    expect(res.status).toBe(201);
    expect(res.body.plate).toBe(String(body['plate']).toUpperCase());

    const list = await admin.get('/api/vehicles');
    expect(list.status).toBe(200);
    expect(list.body.some((v: { id: string }) => v.id === res.body.id)).toBe(true);
  });

  it('rechaza kilometraje negativo (400)', async () => {
    const res = await admin.post('/api/vehicles').send(vehicleBody({ mileage: -1 }));
    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  it('rechaza placa invalida y datos obligatorios vacios (400)', async () => {
    expect((await admin.post('/api/vehicles').send(vehicleBody({ plate: '??' }))).status).toBe(400);
    expect((await admin.post('/api/vehicles').send(vehicleBody({ brand: '' }))).status).toBe(400);
    expect((await admin.post('/api/vehicles').send(vehicleBody({ model: '' }))).status).toBe(400);
  });

  it('rechaza una placa repetida (409)', async () => {
    const body = vehicleBody();
    expect((await admin.post('/api/vehicles').send(body)).status).toBe(201);
    expect((await admin.post('/api/vehicles').send(body)).status).toBe(409);
  });
});

describe('CP-07 y CP-08: ordenes y transiciones', () => {
  it('crea una orden en En Recepcion con codigo de seguimiento', async () => {
    const created = await createVehicleWithOrder(admin);
    orderId = created.orderId;

    const list = await admin.get('/api/work-orders');
    const order = list.body.find((o: { id: string }) => o.id === orderId);
    expect(order.status).toBe('EN_RECEPCION');
    expect(order.trackingCode).toMatch(/^ATP-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
  });

  it('rechaza una orden sin descripcion o con vehiculo inexistente', async () => {
    const created = await createVehicleWithOrder(admin);
    const noDescription = await admin
      .post('/api/work-orders')
      .send({ vehicleId: created.vehicleId, description: '   ' });
    expect(noDescription.status).toBe(400);

    const ghost = await admin
      .post('/api/work-orders')
      .send({ vehicleId: '00000000-0000-4000-8000-000000000000', description: 'Prueba' });
    expect(ghost.status).toBe(404);
  });

  it('CP-08: no permite saltar etapas (409) y el estado no cambia', async () => {
    const res = await admin.patch(`/api/work-orders/${orderId}/status`).send({ status: 'EN_REPARACION' });
    expect(res.status).toBe(409);

    const list = await admin.get('/api/work-orders');
    const order = list.body.find((o: { id: string }) => o.id === orderId);
    expect(order.status).toBe('EN_RECEPCION');
  });

  it('CP-08: avanza una etapa a la vez por toda la secuencia y persiste', async () => {
    for (const next of ['EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO_PARA_ENTREGA']) {
      const res = await admin.patch(`/api/work-orders/${orderId}/status`).send({ status: next });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe(next);
    }
    const list = await admin.get('/api/work-orders');
    const order = list.body.find((o: { id: string }) => o.id === orderId);
    expect(order.status).toBe('LISTO_PARA_ENTREGA');
  });

  it('CP-08: no permite regresar ni avanzar despues de Listo para Entrega (409)', async () => {
    expect(
      (await admin.patch(`/api/work-orders/${orderId}/status`).send({ status: 'EN_REPARACION' })).status,
    ).toBe(409);
  });

  it('rechaza estados invalidos (400) y ordenes inexistentes (404)', async () => {
    expect(
      (await admin.patch(`/api/work-orders/${orderId}/status`).send({ status: 'CERRADA' })).status,
    ).toBe(400);
    expect(
      (await admin.patch('/api/work-orders/no-es-uuid/status').send({ status: 'EN_DIAGNOSTICO' })).status,
    ).toBe(404);
    expect(
      (
        await admin
          .patch('/api/work-orders/00000000-0000-4000-8000-000000000000/status')
          .send({ status: 'EN_DIAGNOSTICO' })
      ).status,
    ).toBe(404);
  });
});

describe('CP-09: concurrencia', () => {
  it('dos cambios simultaneos a la misma orden: uno pasa y el otro se rechaza', async () => {
    const { orderId: id } = await createVehicleWithOrder(admin);
    const [a, b] = await Promise.all([
      admin.patch(`/api/work-orders/${id}/status`).send({ status: 'EN_DIAGNOSTICO' }),
      admin.patch(`/api/work-orders/${id}/status`).send({ status: 'EN_DIAGNOSTICO' }),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);

    const list = await admin.get('/api/work-orders');
    expect(list.body.find((o: { id: string }) => o.id === id).status).toBe('EN_DIAGNOSTICO');
  });

  it('muchas solicitudes simultaneas sobre la misma orden no saltan etapas', async () => {
    const { orderId: id } = await createVehicleWithOrder(admin);
    const requests = ['EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO_PARA_ENTREGA', 'EN_DIAGNOSTICO', 'EN_REPARACION'].map(
      (status) => admin.patch(`/api/work-orders/${id}/status`).send({ status }),
    );
    const results = await Promise.all(requests);
    for (const r of results) expect([200, 409]).toContain(r.status);

    // Sin importar el orden de llegada, el resultado final es consistente con las reglas:
    const list = await admin.get('/api/work-orders');
    const final = list.body.find((o: { id: string }) => o.id === id).status;
    expect(['EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO_PARA_ENTREGA']).toContain(final);
    // Cada exito avanzo exactamente una etapa; el numero de 200 coincide con la etapa final alcanzada.
    const order = ['EN_RECEPCION', 'EN_DIAGNOSTICO', 'EN_REPARACION', 'LISTO_PARA_ENTREGA'];
    expect(results.filter((r) => r.status === 200).length).toBe(order.indexOf(final));
  });

  it('20 solicitudes identicas al mismo tiempo: exactamente una gana, las demas reciben 409', async () => {
    const { orderId: id } = await createVehicleWithOrder(admin);
    const results = await Promise.all(
      Array.from({ length: 20 }, () =>
        admin.patch(`/api/work-orders/${id}/status`).send({ status: 'EN_DIAGNOSTICO' }),
      ),
    );
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.filter((r) => r.status === 409)).toHaveLength(19);
  });

  it('el bloqueo de fila es determinista: con la decision lenta, solo una transaccion avanza', async () => {
    // Se fuerza el traslape: cada transaccion tarda 150 ms entre leer el estado y escribirlo.
    // Sin SELECT ... FOR UPDATE ambas leerian EN_RECEPCION y las dos terminarian con exito.
    const { orderId: id } = await createVehicleWithOrder(admin);
    const attempt = () =>
      updateOrderStatus(id, 'EN_DIAGNOSTICO', (current) => {
        const end = Date.now() + 150; // espera activa: la decision es sincrona por contrato
        while (Date.now() < end) { /* simula una decision lenta */ }
        return isAllowedTransition(current, 'EN_DIAGNOSTICO') ? null : new Error('conflicto');
      });
    const outcomes = await Promise.allSettled([attempt(), attempt()]);
    expect(outcomes.filter((o) => o.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.filter((o) => o.status === 'rejected')).toHaveLength(1);
  });

  it('actualizaciones simultaneas de ordenes distintas conservan ambos cambios', async () => {
    const one = await createVehicleWithOrder(admin);
    const two = await createVehicleWithOrder(admin);
    const [a, b] = await Promise.all([
      admin.patch(`/api/work-orders/${one.orderId}/status`).send({ status: 'EN_DIAGNOSTICO' }),
      admin.patch(`/api/work-orders/${two.orderId}/status`).send({ status: 'EN_DIAGNOSTICO' }),
    ]);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);

    const list = await admin.get('/api/work-orders');
    for (const id of [one.orderId, two.orderId]) {
      expect(list.body.find((o: { id: string }) => o.id === id).status).toBe('EN_DIAGNOSTICO');
    }
  });
});