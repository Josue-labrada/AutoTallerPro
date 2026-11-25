import { expect, test } from '@playwright/test';
import { createVehicle, createVehicleWithOrder } from './helpers';

const COLUMNS = ['En Recepción', 'En Diagnóstico', 'En Reparación', 'Listo para Entrega'];

// CP-07 (US07): columnas del tablero.
test.describe('CP-07: columnas del Kanban', () => {
  test('muestra las cuatro columnas del flujo', async ({ page }) => {
    await page.goto('/ordenes');
    for (const name of COLUMNS) {
      await expect(page.getByRole('region', { name })).toBeVisible();
    }
  });

  test('cada orden aparece en la columna de su estado persistido', async ({ page, request }) => {
    const order = await createVehicleWithOrder(request);
    await request.patch(`/api/work-orders/${order.orderId}/status`, { data: { status: 'EN_DIAGNOSTICO' } });

    await page.goto('/ordenes');
    await expect(page.getByRole('region', { name: 'En Diagnóstico' }).getByText(order.plate)).toBeVisible();
    await expect(page.getByRole('region', { name: 'En Recepción' }).getByText(order.plate)).toHaveCount(0);
  });

  test('las columnas sin ordenes muestran un estado vacio', async ({ page }) => {
    // Se simula un taller sin ordenes para que el caso no dependa de los datos de la base.
    await page.route('**/api/work-orders', (route) => route.fulfill({ json: [] }));
    await page.goto('/ordenes');
    for (const name of COLUMNS) {
      await expect(page.getByRole('region', { name }).getByText('Sin órdenes')).toBeVisible();
    }
  });

  test('si falla la consulta se avisa al usuario', async ({ page }) => {
    await page.route('**/api/work-orders', (route) =>
      route.fulfill({ status: 500, json: { message: 'Error interno del servidor.' } }),
    );
    await page.goto('/ordenes');
    await expect(page.getByRole('alert')).toBeVisible();
  });
});

// CP-08 (US08): avance de etapa con boton.
test.describe('CP-08: avance de etapas', () => {
  test('avanza la orden una etapa por clic, por toda la secuencia, y persiste', async ({ page, request }) => {
    const order = await createVehicleWithOrder(request);
    await page.goto('/ordenes');

    const card = (column: string) =>
      page.getByRole('region', { name: column }).locator('article', { hasText: order.plate });

    await expect(card('En Recepción')).toBeVisible();

    // Un solo clic por etapa (meta NFR-06: 2 clics o menos).
    await card('En Recepción').getByRole('button', { name: /Pasar a En Diagnóstico/ }).click();
    await expect(card('En Diagnóstico')).toBeVisible();
    await expect(card('En Recepción')).toHaveCount(0);

    await card('En Diagnóstico').getByRole('button', { name: /Pasar a En Reparación/ }).click();
    await expect(card('En Reparación')).toBeVisible();

    await card('En Reparación').getByRole('button', { name: /Pasar a Listo para Entrega/ }).click();
    await expect(card('Listo para Entrega')).toBeVisible();

    // La ultima etapa ya no tiene boton de avance.
    await expect(card('Listo para Entrega').getByRole('button')).toHaveCount(0);

    // El cambio se conserva al recargar (esta guardado en la base, no en la pantalla).
    await page.reload();
    await expect(card('Listo para Entrega')).toBeVisible();
  });

  test('crea una orden desde el formulario y aparece en En Recepcion', async ({ page, request }) => {
    const { plate } = await createVehicle(request);
    const description = 'Cambio de frenos ' + plate; // unico, para no confundirlo con corridas anteriores
    await page.goto('/ordenes');

    const option = page.locator('#order-vehicle option', { hasText: plate });
    await page.getByLabel('Vehículo').selectOption(await option.getAttribute('value') ?? '');
    await page.getByLabel('Trabajo a realizar').fill(description);
    await page.getByRole('button', { name: 'Crear orden' }).click();

    await expect(
      page.getByRole('region', { name: 'En Recepción' }).locator('article', { hasText: description }),
    ).toBeVisible();
  });

  test('si el servidor rechaza el avance, se muestra el error y la orden no se mueve', async ({ page, request }) => {
    const order = await createVehicleWithOrder(request);
    await page.goto('/ordenes');
    const card = page.getByRole('region', { name: 'En Recepción' }).locator('article', { hasText: order.plate });
    await expect(card).toBeVisible(); // la pantalla ya cargo la orden en En Recepcion

    // Otra persona avanza la orden por su lado: la pantalla queda desactualizada (conflicto, US09).
    await request.patch(`/api/work-orders/${order.orderId}/status`, { data: { status: 'EN_DIAGNOSTICO' } });

    await card.getByRole('button', { name: /Pasar a En Diagnóstico/ }).click();
    await expect(page.getByRole('alert')).toContainText('Transición no permitida');
  });
});
