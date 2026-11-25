import type { APIRequestContext } from '@playwright/test';

export function randomPlate(): string {
  return 'E' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export interface CreatedOrder {
  plate: string;
  vehicleId: string;
  orderId: string;
  trackingCode: string;
}

/** Crea por API (con la sesion del administrador) un vehiculo. Prepara datos para la prueba. */
export async function createVehicle(request: APIRequestContext): Promise<{ plate: string; vehicleId: string }> {
  const plate = randomPlate();
  const vehicle = await request.post('/api/vehicles', {
    data: { plate, brand: 'Mazda', model: 'CX-30', year: 2021, mileage: 45000, receptionDate: '2025-06-15' },
  });
  if (vehicle.status() !== 201) throw new Error('No se pudo crear el vehiculo: ' + vehicle.status());
  const body = (await vehicle.json()) as { id: string };
  return { plate, vehicleId: body.id };
}

/** Crea por API un vehiculo y su orden. */
export async function createVehicleWithOrder(request: APIRequestContext): Promise<CreatedOrder> {
  const { plate, vehicleId } = await createVehicle(request);
  const vehicleBody = { id: vehicleId };

  const order = await request.post('/api/work-orders', {
    data: { vehicleId: vehicleBody.id, description: 'Revision general' },
  });
  if (order.status() !== 201) throw new Error('No se pudo crear la orden: ' + order.status());
  const orderBody = (await order.json()) as { id: string; trackingCode: string };

  return { plate, vehicleId: vehicleBody.id, orderId: orderBody.id, trackingCode: orderBody.trackingCode };
}
