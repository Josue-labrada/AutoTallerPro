import { expect, test } from '@playwright/test';
import { randomPlate, today } from './helpers';

/** CP-18: el semáforo se muestra con el color/texto correcto en la pantalla. */
test('CP-18: la alerta Urgente aparece cuando el servicio está vencido', async ({ page }) => {
  const plate = randomPlate();

  const vehicle = await page.request.post('/api/vehicles', {
    data: { plate, brand: 'Honda', model: 'Civic', year: 2019, mileage: 60000, receptionDate: today() },
  });
  expect(vehicle.status()).toBe(201);
  const { id } = (await vehicle.json()) as { id: string };

  // Último servicio a 45,000 km con intervalo de 10,000: ya pasó por 5,000 km (vencido = rojo).
  const maint = await page.request.post('/api/maintenance', {
    data: { vehicleId: id, name: 'Cambio de aceite E2E', lastServiceKm: 45000, intervalKm: 10000, lastServiceDate: today(), intervalMonths: 12 },
  });
  expect(maint.status()).toBe(201);

  await page.goto('/mantenimiento');
  const item = page.getByRole('listitem').filter({ hasText: plate });
  await expect(item).toContainText('Urgente');
  await expect(item).toContainText('vencido por 5,000 km');
});

test('CP-18: la alerta Al día aparece cuando faltan más de 1,000 km y más de 30 días', async ({ page }) => {
  const plate = randomPlate();

  const vehicle = await page.request.post('/api/vehicles', {
    data: { plate, brand: 'Honda', model: 'Fit', year: 2019, mileage: 50000, receptionDate: today() },
  });
  const { id } = (await vehicle.json()) as { id: string };
  await page.request.post('/api/maintenance', {
    data: { vehicleId: id, name: 'Afinación E2E', lastServiceKm: 49000, intervalKm: 10000, lastServiceDate: today(), intervalMonths: 12 },
  });

  await page.goto('/mantenimiento');
  const item = page.getByRole('listitem').filter({ hasText: plate });
  await expect(item).toContainText('Al día');
});
