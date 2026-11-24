import { expect, test } from '@playwright/test';
import { randomPlate, today } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/vehiculos');
});

test('CP-02: marca y modelo válidos se guardan y aparecen en el listado', async ({ page }) => {
  const plate = randomPlate();
  await page.getByLabel('Placa').fill(plate);
  await page.getByLabel('Marca').fill('Mazda');
  await page.getByLabel('Modelo').fill('CX-30');
  await page.getByLabel('Año').fill('2021');
  await page.getByLabel('Kilometraje').fill('45000');
  await page.getByLabel('Fecha de recepción').fill(today());
  await page.getByRole('button', { name: /Registrar|Guardar/ }).click();

  const row = page.getByRole('row', { name: new RegExp(plate) });
  await expect(row).toBeVisible();
  await expect(row).toContainText('Mazda');
  await expect(row).toContainText('CX-30');

  // Persistencia: tras recargar sigue en el listado.
  await page.reload();
  await expect(page.getByRole('row', { name: new RegExp(plate) })).toContainText('CX-30');
});

test('CP-02: marca y modelo vacíos se rechazan con mensaje', async ({ page }) => {
  await page.getByLabel('Placa').fill(randomPlate());
  await page.getByLabel('Año').fill('2021');
  await page.getByLabel('Kilometraje').fill('45000');
  await page.getByLabel('Fecha de recepción').fill(today());
  await page.getByRole('button', { name: /Registrar|Guardar/ }).click();

  await expect(page.getByText('La marca es obligatoria.')).toBeVisible();
  await expect(page.getByText('El modelo es obligatorio.')).toBeVisible();
});
