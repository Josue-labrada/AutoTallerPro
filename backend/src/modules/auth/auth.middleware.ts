import type { RequestHandler } from 'express';
import { HttpError } from '../../middleware/errorHandler.js';
import type { Role } from './auth.model.js';
import { findUserBySession } from './auth.repository.js';
import { hashToken, readSessionToken } from './session.js';

/** Si la petición trae una sesión válida, deja el usuario en `req.user`. Si no, sigue como invitado. */
export const loadUser: RequestHandler = async (req, _res, next) => {
  try {
    const token = readSessionToken(req.headers.cookie);
    if (token) {
      const user = await findUserBySession(hashToken(token));
      if (user) req.user = user;
    }
    next();
  } catch (error) {
    next(error);
  }
};

/** Solo deja pasar a usuarios con alguno de estos roles. Invitado → 401; rol equivocado → 403. */
export function requireRole(...roles: readonly Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new HttpError(401, 'Inicia sesión para continuar.'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new HttpError(403, 'No tienes permiso para esta acción.'));
      return;
    }
    next();
  };
}

// Direcciones desde las que se permite usar la API (la del frontend). En producción, la dirección pública.
const allowedOrigins = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin !== '');

/**
 * Defensa extra contra CSRF: en peticiones que modifican datos, si el navegador indica de qué
 * sitio viene (cabecera Origin), debe ser una de las direcciones permitidas de la aplicación.
 */
export const sameOriginOnly: RequestHandler = (req, _res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  const origin = req.headers.origin;
  if (safeMethods.includes(req.method) || !origin || allowedOrigins.includes(origin)) {
    next();
    return;
  }
  next(new HttpError(403, 'Origen de la petición no permitido.'));
};
