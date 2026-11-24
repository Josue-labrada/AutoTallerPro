import { expect, type Page } from '@playwright/test';

/** Inicia sesión como administrador con las credenciales del .env. */
export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env['ADMIN_EMAIL'];
  const password = process.env['ADMIN_PASSWORD'];
  if (!email || !password) throw new Error('Faltan ADMIN_EMAIL y ADMIN_PASSWORD en el .env.');

  await page.goto('/iniciar-sesion');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).not.toHaveURL(/iniciar-sesion/);
}

/** Placa única por ejecución (4 a 10 caracteres) para no chocar con datos anteriores. */
export function randomPlate(): string {
  return 'E' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Fecha local de hoy en formato AAAA-MM-DD. */
export function today(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
