// Pruebas de CP-14: Visualización del estado en solo lectura
// Pruebas de CP-17: Cálculo del próximo servicio
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app/app.js';
import { createVehicleWithOrder, loginAsAdmin, registerCustomer, vehicleBody, type Agent } from './helpers.js';

let admin: Agent;
let customerA: Agent;
let customerB: Agent;
let worker: Agent;
let orderA: Awaited<ReturnType<typeof createVehicleWithOrder>>;
let orderB: Awaited<ReturnType<typeof createVehicleWithOrder>>;

beforeAll(async () => {
  admin = await loginAsAdmin();
  customerA = await registerCustomer();
  customerB = await registerCustomer();

  // Un trabajador creado por el administrador.
  const email = `trabajador.${Math.random().toString(36).slice(2, 10)}@prueba.test`;
  const password = 'ClaveTrabajador#2026';
  const created = await admin.post('/api/users').send({ name: 'Trabajador de prueba', email, password, role: 'WORKER' });
  if (created.status !== 201) throw new Error('No se pudo crear al trabajador: ' + created.status);
  worker = request.agent(app);
  const login = await worker.post('/api/auth/login').send({ email, password });
  if (login.status !== 200) throw new Error('No se pudo iniciar sesion como trabajador');

  orderA = await createVehicleWithOrder(admin);
  orderB = await createVehicleWithOrder(admin);
});

const staffRoutes: ReadonlyArray<readonly [string, string]> = [
  ['get', '/api/vehicles'],
  ['post', '/api/vehicles'],
  ['get', '/api/work-orders'],
  ['post', '/api/work-orders'],
  ['get', '/api/maintenance'],
  ['post', '/api/maintenance'],
];

describe('permisos por rol: invitado', () => {
  it.each(staffRoutes)('invitado: %s %s responde 401', async (method, path) => {
    const res = await (request(app) as unknown as Record<string, (p: string) => request.Test>)[method]!(path);
    expect(res.status).toBe(401);
  });

  it('invitado no puede usar /api/users ni /api/customer (401)', async () => {
    expect((await request(app).get('/api/users')).status).toBe(401);
    expect((await request(app).get('/api/customer/vehicles')).status).toBe(401);
  });
});

describe('permisos por rol: cliente (CP-14)', () => {
  it.each(staffRoutes)('cliente: %s %s responde 403', async (method, path) => {
    const res = await (customerA as unknown as Record<string, (p: string) => request.Test>)[method]!(path);
    expect(res.status).toBe(403);
  });

  it('un cliente no puede cambiar el estado de una orden y el estado no cambia', async () => {
    const res = await customerA.patch(`/api/work-orders/${orderA.orderId}/status`).send({ status: 'EN_DIAGNOSTICO' });
    expect(res.status).toBe(403);
    const list = await admin.get('/api/work-orders');
    expect(list.body.find((o: { id: string }) => o.id === orderA.orderId).status).toBe('EN_RECEPCION');
  });

  it('un cliente no puede modificar costos ni daños de una orden', async () => {
    const base = `/api/work-orders/${orderA.orderId}`;
    expect((await customerA.post(`${base}/costs`).send({ type: 'SERVICE', description: 'x', quantity: 1, unitPriceCents: 100 })).status).toBe(403);
    expect((await customerA.get(`${base}/costs`)).status).toBe(403);
    expect((await customerA.get(`${base}/damages`)).status).toBe(403);
  });

  it('un cliente no puede usar /api/users (403)', async () => {
    expect((await customerA.get('/api/users')).status).toBe(403);
    expect((await customerA.post('/api/users').send({ role: 'ADMIN' })).status).toBe(403);
  });
});

describe('permisos por rol: trabajador', () => {
  it('un trabajador puede usar las rutas del personal', async () => {
    expect((await worker.get('/api/vehicles')).status).toBe(200);
    expect((await worker.get('/api/work-orders')).status).toBe(200);
    expect((await worker.post('/api/vehicles').send(vehicleBody())).status).toBe(201);
  });

  it('un trabajador no puede usar /api/users (403)', async () => {
    expect((await worker.get('/api/users')).status).toBe(403);
    expect((await worker.post('/api/users').send({ name: 'X', email: 'x@y.zz', password: '12345678', role: 'ADMIN' })).status).toBe(403);
  });

  it('un trabajador no puede usar el portal del cliente (403)', async () => {
    expect((await worker.get('/api/customer/maintenance')).status).toBe(403);
  });
});

describe('permisos por rol: administrador', () => {
  it('un administrador puede listar usuarios', async () => {
    expect((await admin.get('/api/users')).status).toBe(200);
  });
});

describe('seguridad de la sesion', () => {
  it('rechaza peticiones que modifican datos desde otro origen (403)', async () => {
    const res = await admin.post('/api/vehicles').set('Origin', 'http://sitio-malicioso.test').send(vehicleBody());
    expect(res.status).toBe(403);
  });

  it('despues de cerrar sesion, la cookie ya no sirve (401)', async () => {
    const temp = await registerCustomer();
    expect((await temp.get('/api/customer/vehicles')).status).toBe(200);
    expect((await temp.post('/api/auth/logout')).status).toBe(204);
    expect((await temp.get('/api/customer/vehicles')).status).toBe(401);
  });
});

describe('CP-17: un cliente solo ve sus vehiculos y mantenimientos', () => {
  it('cada cliente ve unicamente el mantenimiento de su propio vehiculo', async () => {
    expect((await customerA.post('/api/customer/vehicles/claim').send({ trackingCode: orderA.trackingCode })).status).toBe(200);
    expect((await customerB.post('/api/customer/vehicles/claim').send({ trackingCode: orderB.trackingCode })).status).toBe(200);

    const body = (vehicleId: string, name: string) => ({
      vehicleId, name, lastServiceKm: 40000, intervalKm: 10000, lastServiceDate: '2026-01-31', intervalMonths: 1,
    });
    expect((await admin.post('/api/maintenance').send(body(orderA.vehicleId, 'Aceite A'))).status).toBe(201);
    expect((await admin.post('/api/maintenance').send(body(orderB.vehicleId, 'Aceite B'))).status).toBe(201);

    const a = await customerA.get('/api/customer/maintenance');
    const b = await customerB.get('/api/customer/maintenance');
    expect(a.status).toBe(200);
    expect(a.body.map((m: { name: string }) => m.name)).toEqual(['Aceite A']);
    expect(b.body.map((m: { name: string }) => m.name)).toEqual(['Aceite B']);

    const vehiclesA = await customerA.get('/api/customer/vehicles');
    expect(vehiclesA.body.map((v: { id: string }) => v.id)).toEqual([orderA.vehicleId]);
  });

  it('un cliente sin vehiculos vinculados ve una lista vacia', async () => {
    const lonely = await registerCustomer();
    expect((await lonely.get('/api/customer/maintenance')).body).toEqual([]);
  });

  it('un vehiculo ya vinculado a un cliente no puede reclamarlo otro (409)', async () => {
    const res = await customerB.post('/api/customer/vehicles/claim').send({ trackingCode: orderA.trackingCode });
    expect(res.status).toBe(409);
  });

  it('un codigo inexistente o mal formado al vincular da el mismo 404', async () => {
    const a = await customerA.post('/api/customer/vehicles/claim').send({ trackingCode: 'ATP-AAAA-BBBB' });
    const b = await customerA.post('/api/customer/vehicles/claim').send({ trackingCode: 'hola' });
    expect(a.status).toBe(404);
    expect(b.status).toBe(404);
    expect(a.body.message).toBe(b.body.message);
  });
});