const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

export type NewOrderResult =
  | { ok: true; value: { vehicleId: string; description: string } }
  | { ok: false; message: string };

export function validateNewOrder(body: unknown): NewOrderResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'El cuerpo de la petición no es válido.' };
  }
  const data = body as Record<string, unknown>;

  if (!isUuid(data['vehicleId'])) return { ok: false, message: 'Selecciona un vehículo válido.' };

  const description = typeof data['description'] === 'string' ? data['description'].trim() : '';
  if (description === '') return { ok: false, message: 'Describe el trabajo a realizar.' };
  if (description.length > 300) {
    return { ok: false, message: 'La descripción admite máximo 300 caracteres.' };
  }

  return { ok: true, value: { vehicleId: data['vehicleId'], description } };
}
