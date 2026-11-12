import type { Vehicle, VehicleFormValues } from '../types/vehicle';

/** Habla con el backend (la ruta /api se redirige al servidor en vite.config.ts). */
async function readError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (typeof body === 'object' && body !== null && 'message' in body) {
      return String((body as { message: unknown }).message);
    }
  } catch {
    // La respuesta no era JSON; se usa el mensaje genérico.
  }
  return 'No se pudo completar la operación.';
}

async function request(input: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }
  if (!response.ok) throw new Error(await readError(response));
  return response;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const response = await request('/api/vehicles');
  return (await response.json()) as Vehicle[];
}

/** Envía el vehículo al backend, que valida de nuevo y rechaza placas duplicadas. */
export async function createVehicle(values: VehicleFormValues): Promise<Vehicle> {
  const response = await request('/api/vehicles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plate: values.plate,
      brand: values.brand,
      model: values.model,
      year: Number(values.year),
      mileage: Number(values.mileage),
      receptionDate: values.receptionDate,
      notes: values.notes,
    }),
  });
  return (await response.json()) as Vehicle;
}
