import { pool } from './db.js';
import { createUser } from '../modules/auth/auth.service.js';
import { countUsers } from '../modules/auth/auth.repository.js';

/**
 * Crea el primer administrador con ADMIN_EMAIL / ADMIN_PASSWORD (de tu .env) si todavía no hay usuarios.
 * Uso: npm run create-admin
 */
async function createAdmin(): Promise<void> {
  if ((await countUsers()) > 0) {
    console.log('Ya existen usuarios; no se crea administrador.');
    return;
  }
  const email = process.env['ADMIN_EMAIL'];
  const password = process.env['ADMIN_PASSWORD'];
  if (!email || !password) throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD en tu archivo .env');

  await createUser({ email, name: process.env['ADMIN_NAME'] ?? 'Administrador', password }, 'ADMIN');
  console.log(`Administrador creado: ${email}`);
}

createAdmin()
  .catch((error: unknown) => {
    console.error('Error al crear el administrador:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
