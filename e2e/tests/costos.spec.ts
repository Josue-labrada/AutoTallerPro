import { expect, test } from '@playwright/test';
import { randomPlate, today } from './helpers';

let plate = '';

test.beforeEach(async ({ page }) => {
  // Prepara un vehículo y una orden por API para probar solo la pantalla de costos.
  plate = randomPlate();
  const vehicle = await page.request.post('/api/vehicles', {
    data: { plate, brand: 'Nissan', model: 'Versa', year: 2020, mileage: 30000, receptionDate: today() },
  });
  expect(vehicle.status()).toBe(201);
  const { id } = (await vehicle.json()) as { id: string };
  const order = await page.request.post('/api/work-orders', {
    data: { vehicleId: id, description: 'Prueba E2E costos' },
  });
  expect(order.status()).toBe(201);

  await page.goto('/servicios');
  const value = await page.locator('#cost-order option', { hasText: plate }).getAttribute('value');
  await page.locator('#cost-order').selectOption(value ?? '');
});

async function addCost(page: import('@playwright/test').Page, kind: string, desc: string, qty: string, price: string) {
  await page.getByLabel('Tipo').selectOption({ label: kind });
  await page.getByLabel('Descripción').fill(desc);
  await page.getByLabel('Cantidad').fill(qty);
  await page.getByLabel('Precio unitario (MXN)').fill(price);
  await page.getByRole('button', { name: 'Agregar' }).click();
}

test('CP-10 y CP-11: agrega conceptos, el total es exacto y al quitar uno se actualiza', async ({ page }) => {
  await addCost(page, 'Servicio', 'Cambio de balatas', '2', '450.50');
  await expect(page.getByRole('row', { name: /Cambio de balatas/ })).toBeVisible();
  await addCost(page, 'Material / insumo', 'Aceite 5W-30', '3', '10.10');
  await expect(page.getByRole('row', { name: /Aceite 5W-30/ })).toBeVisible();

  // 2 x 450.50 + 3 x 10.10 = 931.30
  await expect(page.getByRole('row', { name: /^Total/ })).toContainText('931.30');

  await page.getByRole('button', { name: 'Quitar Aceite 5W-30' }).click();
  await expect(page.getByRole('row', { name: /Aceite 5W-30/ })).toHaveCount(0);
  await expect(page.getByRole('row', { name: /^Total/ })).toContainText('901.00');
});

test('CP-10: cantidad cero y precio cero se rechazan', async ({ page }) => {
  await addCost(page, 'Servicio', 'Concepto inválido', '0', '100');
  await expect(page.getByRole('alert')).toBeVisible();
  await addCost(page, 'Servicio', 'Concepto inválido', '1', '0');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('row', { name: /Concepto inválido/ })).toHaveCount(0);
});
