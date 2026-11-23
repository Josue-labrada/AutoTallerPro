import { request, type FullConfig } from '@playwright/test';

/** Inicia sesion como administrador una sola vez y guarda la cookie para todas las pruebas. */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use.baseURL ?? 'http://localhost:5173';
  const email = process.env['ADMIN_EMAIL'];
  const password = process.env['ADMIN_PASSWORD'];
  if (!email || !password) {
    throw new Error('Faltan ADMIN_EMAIL y ADMIN_PASSWORD. Revisa el .env de la raiz.');
  }

  const context = await request.newContext({ baseURL });
  const response = await context.post('/api/auth/login', { data: { email, password } });
  if (!response.ok()) {
    throw new Error(`No se pudo iniciar sesion (${response.status()}). Ejecuta npm run create-admin en backend.`);
  }
  await context.storageState({ path: '.auth/admin.json' });
  await context.dispose();
}
