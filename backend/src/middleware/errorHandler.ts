import type { ErrorRequestHandler } from 'express';

/** Error con código HTTP y mensaje seguro para mostrar al usuario. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  // JSON mal formado o demasiado grande: es culpa del cliente, no del servidor.
  const status = (error as { status?: unknown }).status;
  if (status === 400 || status === 413) {
    res.status(status).json({ message: 'La petición no es válida.' });
    return;
  }
  // Los detalles internos se quedan en el servidor; el cliente solo recibe un mensaje genérico.
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor.' });
};
