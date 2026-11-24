import { test as setup } from '@playwright/test';
import { loginAsAdmin } from './helpers';

/** Inicia sesión una sola vez: el login admite 10 intentos por minuto por IP. */
setup('iniciar sesión como administrador', async ({ page }) => {
  await loginAsAdmin(page);
  await page.context().storageState({ path: '.auth/admin.json' });
});
