import type { RequestHandler } from 'express';
import { HttpError } from './errorHandler.js';

/**
 * Limita los intentos por IP en una ventana de tiempo (en memoria).
 * Sirve para que nadie pueda probar miles de códigos de seguimiento.
 */
export function rateLimit(maxRequests: number, windowMs: number): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req, _res, next) => {
    const now = Date.now();
    const key = req.ip ?? 'desconocida';
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      // Limpieza ocasional para que el mapa no crezca sin límite.
      if (hits.size > 10_000) for (const [ip, e] of hits) if (e.resetAt <= now) hits.delete(ip);
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      next(new HttpError(429, 'Demasiados intentos. Espera un momento e intenta de nuevo.'));
      return;
    }
    next();
  };
}
