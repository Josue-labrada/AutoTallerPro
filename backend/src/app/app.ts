import express from 'express';
import helmet from 'helmet';
import { errorHandler } from '../middleware/errorHandler.js';
import { trackingRoutes } from '../modules/tracking/tracking.routes.js';
import { vehicleRoutes } from '../modules/vehicles/vehicle.routes.js';
import { workOrderRoutes } from '../modules/work-orders/work-order.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/tracking', trackingRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});
app.use(errorHandler);
