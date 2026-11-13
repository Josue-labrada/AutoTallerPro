import { Router } from 'express';
import { HttpError } from '../../middleware/errorHandler.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { authenticate, createUser, endSession, startSession } from './auth.service.js';
import { clearSessionCookie, readSessionToken, setSessionCookie } from './session.js';

export const authRoutes = Router();

// Públicas: máximo 10 intentos por minuto por IP, para frenar la adivinación de contraseñas.
const limitAttempts = rateLimit(10, 60_000);

/** Registro de clientes. El personal del taller lo da de alta un administrador. */
authRoutes.post('/register', limitAttempts, async (req, res) => {
  const user = await createUser(req.body, 'CUSTOMER');
  setSessionCookie(res, await startSession(user.id));
  res.status(201).json(user);
});

authRoutes.post('/login', limitAttempts, async (req, res) => {
  const user = await authenticate(req.body);
  setSessionCookie(res, await startSession(user.id));
  res.json(user);
});

authRoutes.post('/logout', async (req, res) => {
  const token = readSessionToken(req.headers.cookie);
  if (token) await endSession(token);
  clearSessionCookie(res);
  res.status(204).end();
});

authRoutes.get('/me', (req, res) => {
  if (!req.user) throw new HttpError(401, 'No has iniciado sesión.');
  res.json(req.user);
});
