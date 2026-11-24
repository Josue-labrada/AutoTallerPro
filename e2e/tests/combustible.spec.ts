import { expect, test } from '@playwright/test';

async function fill(page: import('@playwright/test').Page, km: string, eff: string, price: string) {
  await page.goto('/portal/combustible');
  await page.getByLabel('Distancia del viaje (km)').fill(km);
  await page.getByLabel('Rendimiento (km por litro)').fill(eff);
  await page.getByLabel('Precio del litro (MXN)').fill(price);
  await page.getByRole('button', { name: 'Calcular' }).click();
}

test('CP-16: 100 km, 10 km/l y 25 pesos dan 10 L y 250 pesos', async ({ page }) => {
  await fill(page, '100', '10', '25');
  await expect(page.getByText('10 L', { exact: true })).toBeVisible();
  await expect(page.getByText(/\$\s?250\.00/)).toBeVisible();
});

test('CP-15: rendimiento en cero muestra el mensaje y no calcula', async ({ page }) => {
  await fill(page, '100', '0', '25');
  await expect(page.getByText('El rendimiento debe ser un número mayor a 0.')).toBeVisible();
  await expect(page.getByText('Completa los datos y presiona Calcular.')).toBeVisible();
});

test('CP-15: campos vacíos muestran qué corregir', async ({ page }) => {
  await fill(page, '', '', '');
  await expect(page.getByText('La distancia debe ser un número igual o mayor a 0.')).toBeVisible();
  await expect(page.getByText('El rendimiento debe ser un número mayor a 0.')).toBeVisible();
  await expect(page.getByText('El precio debe ser un número igual o mayor a 0.')).toBeVisible();
});

test('CP-15: texto y negativos se rechazan', async ({ page }) => {
  await fill(page, 'abc', '10', '-5');
  await expect(page.getByText('La distancia debe ser un número igual o mayor a 0.')).toBeVisible();
  await expect(page.getByText('El precio debe ser un número igual o mayor a 0.')).toBeVisible();
});
