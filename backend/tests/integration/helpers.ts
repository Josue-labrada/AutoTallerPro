import request from 'supertest';
import { app } from '../../src/app/app.js';

export type Agent = ReturnType<typeof request.agent>;

/** Devuelve un agente con la sesion del administrador ya iniciada. */
export async function loginAsAdmin(): Promise<Agent> {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({
    email: process.env['ADMIN_EMAIL'],
    password: process.env['ADMIN_PASSWORD'],
  });
  if (res.status !== 200) {
    throw new Error('No se pudo iniciar sesion. Revisa el .env y ejecuta npm run create-admin');
  }
  return agent;
}

/** Placa distinta en cada ejecucion, para no chocar con datos anteriores. */
export function randomPlate(): string {
  return 'T' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Cuerpo valido para registrar un vehiculo. */
export function vehicleBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    plate: randomPlate(),
    brand: 'Mazda',
    model: 'CX-30',
    year: 2021,
    mileage: 45000,
    receptionDate: '2025-01-10',
    ...overrides,
  };
}

/** Crea un vehiculo y una orden con el agente indicado. Devuelve ids, placa y codigo de seguimiento. */
export async function createVehicleWithOrder(agent: Agent) {
  const plate = randomPlate();
  const vehicle = await agent.post('/api/vehicles').send(vehicleBody({ plate }));
  if (vehicle.status !== 201) throw new Error('No se pudo crear el vehiculo: ' + vehicle.status);
  const order = await agent
    .post('/api/work-orders')
    .send({ vehicleId: vehicle.body.id, description: 'Revision general' });
  if (order.status !== 201) throw new Error('No se pudo crear la orden: ' + order.status);
  return {
    vehicleId: vehicle.body.id as string,
    orderId: order.body.id as string,
    plate,
    trackingCode: order.body.trackingCode as string,
  };
}

/** Registra un cliente nuevo y devuelve su agente (la sesion queda iniciada). */
export async function registerCustomer(): Promise<Agent> {
  const agent = request.agent(app);
  const suffix = Math.random().toString(36).slice(2, 10);
  const res = await agent.post('/api/auth/register').send({
    name: 'Cliente de prueba',
    email: `cliente.${suffix}@prueba.test`,
    password: 'ClavePrueba#2026',
  });
  if (res.status !== 201) throw new Error('No se pudo registrar al cliente: ' + res.status);
  return agent;
}