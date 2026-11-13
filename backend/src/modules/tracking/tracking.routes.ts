import { Router } from 'express';
import { rateLimit } from '../../middleware/rateLimit.js';
import { trackOrder } from './tracking.service.js';

export const trackingRoutes = Router();

// Endpoint público: máximo 10 consultas por minuto por IP.
trackingRoutes.get('/:code', rateLimit(10, 60_000), async (req, res) => {
  res.json(await trackOrder(String(req.params['code'] ?? '')));
});
