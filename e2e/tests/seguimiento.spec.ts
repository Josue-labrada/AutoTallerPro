import { expect, test } from '@playwright/test';
import { createVehicleWithOrder } from './helpers';

// La ruta de seguimiento admite 10 consultas por minuto por IP.
// Este archivo hace menos de 10.
test.describe('seguimiento de la orden (cliente invitado)', () => {
  async function guestPage(browser: import('@playwright/test').Browser) {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    return { context, page: await context.newPage() };
  }

  test('CP-13: un codigo inexistente muestra un mensaje y no revela datos', async ({ browser }) => {
    const { context, page } = await guestPage(browser);
    await page.goto('/portal/seguimiento');
    await page.getByRole('textbox', { name: /Código/ }).fill('ATP-AAAA-BBBB');
    await page.getByRole('button', { name: 'Consultar' }).click();
    await expect(page.getByText(/No encontramos una orden/)).toBeVisible();
    await context.close();
  });

  test('CP-13: un codigo mal formado da el mismo mensaje que uno inexistente', async ({ browser }) => {
    const { context, page } = await guestPage(browser);
    await page.goto('/portal/seguimiento');
    await page.getByRole('textbox', { name: /Código/ }).fill('hola');
    await page.getByRole('button', { name: 'Consultar' }).click();
    await expect(page.getByText(/No encontramos una orden con ese código/)).toBeVisible();
    await context.close();
  });

  test('CP-13: un codigo valido muestra el vehiculo, la placa oculta y el estado', async ({ browser, request }) => {
    const order = await createVehicleWithOrder(request);
    const { context, page } = await guestPage(browser);
    await page.goto('/portal/seguimiento');
    await page.getByRole('textbox', { name: /Código/ }).fill(order.trackingCode);
    await page.getByRole('button', { name: 'Consultar' }).click();

    await expect(page.getByText('Mazda CX-30 2021')).toBeVisible();
    await expect(page.getByText(`•••${order.plate.slice(-3)}`)).toBeVisible();
    await expect(page.getByText('Estado actual: En Recepción')).toBeVisible();

    // La placa completa y la descripcion interna no aparecen en ninguna parte de la pagina.
    await expect(page.getByText(order.plate, { exact: false })).toHaveCount(0);
    await expect(page.getByText('Revision general')).toHaveCount(0);
    await context.close();
  });

  test('CP-14: el estado mostrado cambia cuando un trabajador actualiza la orden y la pantalla es de solo lectura', async ({
    browser,
    request,
  }) => {
    const order = await createVehicleWithOrder(request);
    const { context, page } = await guestPage(browser);
    await page.goto('/portal/seguimiento');
    await page.getByRole('textbox', { name: /Código/ }).fill(order.trackingCode);
    await page.getByRole('button', { name: 'Consultar' }).click();
    await expect(page.getByText('Estado actual: En Recepción')).toBeVisible();

    // La pantalla de seguimiento no ofrece ninguna accion de modificacion: solo el boton Consultar.
    await expect(page.getByRole('button', { name: 'Consultar' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: /Pasar a|Eliminar|Guardar|Agregar/ })).toHaveCount(0);

    // El trabajador avanza la orden y el cliente la vuelve a consultar.
    const moved = await request.patch(`/api/work-orders/${order.orderId}/status`, {
      data: { status: 'EN_DIAGNOSTICO' },
    });
    expect(moved.status()).toBe(200);
    await page.getByRole('button', { name: 'Consultar' }).click();
    await expect(page.getByText('Estado actual: En Diagnóstico')).toBeVisible();
    await context.close();
  });

  test('CP-14: un invitado no puede modificar una orden llamando a la API', async ({ browser, request }) => {
    const order = await createVehicleWithOrder(request);
    const { context, page } = await guestPage(browser);
    await page.goto('/portal/seguimiento');
    const response = await page.request.patch(`/api/work-orders/${order.orderId}/status`, {
      data: { status: 'EN_DIAGNOSTICO' },
    });
    expect(response.status()).toBe(401);
    await context.close();
  });
});
