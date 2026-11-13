/** Se dispara cuando el servidor dice que la sesión venció o no existe (401) en una pantalla protegida. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

/** Error de la API con el código HTTP, para poder distinguir 401, 403, 409, etc. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

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

/** Hace la petición y devuelve el JSON. Lanza un ApiError con un mensaje legible si algo falla. */
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    // La cookie de sesión viaja sola (mismo origen); el JavaScript nunca la ve.
    response = await fetch(path, { credentials: 'same-origin', ...init });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está encendido el backend?');
  }
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    throw new ApiError(response.status, await readError(response));
  }
  // 204 No Content (p. ej. al borrar): no hay cuerpo que leer.
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function jsonBody(method: 'POST' | 'PATCH', data: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) };
}
