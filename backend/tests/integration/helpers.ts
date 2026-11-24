import request from 'supertest';
import { app } from '../../src/app/app.js';

/**
 * Inicia sesión como administrador y conserva
 * automáticamente la cookie para las siguientes peticiones.
 */
export async function loginAsAdmin() {
  const email = process.env['ADMIN_EMAIL'];
  const password = process.env['ADMIN_PASSWORD'];

  if (!email || !password) {
    throw new Error('Faltan las credenciales del administrador.');
  }

  const agent = request.agent(app);

  const response = await agent
    .post('/api/auth/login')
    .send({ email, password });

  if (response.status !== 200) {
    throw new Error(
      `No se pudo iniciar sesión como administrador. HTTP ${response.status}`
    );
  }

  if (response.body.role !== 'ADMIN') {
    throw new Error('El usuario autenticado no tiene el rol ADMIN.');
  }

  return agent;
}
