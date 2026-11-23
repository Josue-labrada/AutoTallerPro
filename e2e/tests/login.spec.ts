import { expect, test } from '@playwright/test';

// Estas pruebas inician sesion desde la pantalla, asi que no usan la sesion guardada.
test.use({ storageState: { cookies: [], origins: [] } });

test('el personal inicia sesion y ve el panel', async ({ page }) => {
  await page.goto('/iniciar-sesion');
  await page.getByLabel('Correo electrónico').fill(process.env['ADMIN_EMAIL'] ?? '');
  await page.getByLabel('Contraseña').fill(process.env['ADMIN_PASSWORD'] ?? '');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).not.toHaveURL(/iniciar-sesion/);

  await page.goto('/ordenes');
  await expect(page.getByRole('heading', { name: 'Tablero de órdenes' })).toBeVisible();
});

test('una contraseña incorrecta muestra un error y no entra', async ({ page }) => {
  await page.goto('/iniciar-sesion');
  await page.getByLabel('Correo electrónico').fill(process.env['ADMIN_EMAIL'] ?? '');
  await page.getByLabel('Contraseña').fill('contraseña-equivocada');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
  await expect(page).toHaveURL(/iniciar-sesion/);
});

test('un invitado que abre una pantalla del personal es enviado a iniciar sesion', async ({ page }) => {
  await page.goto('/ordenes');
  await expect(page).toHaveURL(/iniciar-sesion/);
});
