import { Router } from 'express';
import { HttpError } from '../../middleware/errorHandler.js';
import { rateLimit } from '../../middleware/rateLimit.js';
import { isValidTrackingCode } from '../work-orders/trackingCode.js';
import { claimVehicleByTrackingCode, findOwnMaintenance, findOwnVehicles } from './customer.repository.js';

/** Portal del cliente. Solo para cuentas CUSTOMER (se protege al montarla en app.ts). */
export const customerRoutes = Router();

customerRoutes.get('/vehicles', async (req, res) => {
  res.json(await findOwnVehicles(req.user?.id ?? ''));
});

customerRoutes.get('/maintenance', async (req, res) => {
  res.json(await findOwnMaintenance(req.user?.id ?? ''));
});

// Vincular un vehículo con el código de seguimiento: se limita para que nadie pruebe códigos al azar.
customerRoutes.post('/vehicles/claim', rateLimit(10, 60_000), async (req, res) => {
  const raw = (req.body as { trackingCode?: unknown } | undefined)?.trackingCode;
  const code = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  const notFound = new HttpError(404, 'No encontramos una orden con ese código. Revísalo e intenta de nuevo.');
  if (!isValidTrackingCode(code)) throw notFound;

  const result = await claimVehicleByTrackingCode(req.user?.id ?? '', code);
  if (result === 'not-found') throw notFound;
  if (result === 'owned-by-other') {
    throw new HttpError(409, 'Ese vehículo ya está vinculado a otra cuenta. Habla con el taller.');
  }
  res.json({ status: result });
});
