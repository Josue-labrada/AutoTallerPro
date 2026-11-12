/** Cliente HTTP compartido: la ruta /api se redirige al backend (ver vite.config.ts). */
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

/** Hace la petición y devuelve el JSON. Lanza un Error con un mensaje legible si algo falla. */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
}

export function jsonBody(method: 'POST' | 'PATCH', data: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}
