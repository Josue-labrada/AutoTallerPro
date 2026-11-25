import { expect, test } from '@playwright/test';
import { randomPlate } from './helpers';

// CP-01 (US01): registro de vehiculos desde la pantalla.
test.describe('CP-01: registro de vehiculos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vehiculos');
    await expect(page.getByRole('heading', { name: 'Registro de vehículos' })).toBeVisible();
  });

  async function fillVehicle(page: import('@playwright/test').Page, values: Record<string, string>) {
    for (const [label, value] of Object.entries(values)) {
      await page.getByLabel(label, { exact: true }).fill(value);
    }
  }

  test('registra un vehiculo valido, aparece en el listado y persiste al recargar', async ({ page }) => {
    const plate = randomPlate();
    await fillVehicle(page, {
      Placa: plate.toLowerCase(), // se normaliza a mayusculas
      Marca: 'Nissan',
      Modelo: 'Versa',
      Año: '2022',
      Kilometraje: '30500',
      'Fecha de recepción': '2025-06-15',
    });
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();

    const row = page.getByRole('row', { name: new RegExp(plate) });
    await expect(row).toBeVisible();
    await expect(row).toContainText('Nissan Versa');

    await page.reload();
    await expect(page.getByRole('row', { name: new RegExp(plate) })).toBeVisible();
  });

  test('rechaza kilometraje negativo y no guarda el vehiculo', async ({ page }) => {
    const plate = randomPlate();
    await fillVehicle(page, {
      Placa: plate,
      Marca: 'Nissan',
      Modelo: 'Versa',
      Año: '2022',
      Kilometraje: '-1',
      'Fecha de recepción': '2025-06-15',
    });
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();

    await expect(page.getByText('El kilometraje debe ser un número entero entre 0 y 2,000,000.')).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(plate) })).toHaveCount(0);
  });

  test('rechaza placa invalida', async ({ page }) => {
    await fillVehicle(page, {
      Placa: '??',
      Marca: 'Nissan',
      Modelo: 'Versa',
      Año: '2022',
      Kilometraje: '1000',
      'Fecha de recepción': '2025-06-15',
    });
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText(/Ingresa una placa válida/)).toBeVisible();
  });

  test('con el formulario vacio indica que corregir en cada campo obligatorio', async ({ page }) => {
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByText(/Ingresa una placa válida/)).toBeVisible();
    await expect(page.getByText('La marca es obligatoria.')).toBeVisible();
    await expect(page.getByText('El modelo es obligatorio.')).toBeVisible();
  });

  test('rechaza una placa repetida con un mensaje del servidor', async ({ page }) => {
    const plate = randomPlate();
    const values = {
      Placa: plate,
      Marca: 'Kia',
      Modelo: 'Rio',
      Año: '2020',
      Kilometraje: '1000',
      'Fecha de recepción': '2025-06-15',
    };
    await fillVehicle(page, values);
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByRole('row', { name: new RegExp(plate) })).toBeVisible();

    await fillVehicle(page, values);
    await page.getByRole('button', { name: 'Registrar vehículo' }).click();
    await expect(page.getByRole('alert')).toContainText('Ya existe un vehículo registrado con esa placa');
  });
});
