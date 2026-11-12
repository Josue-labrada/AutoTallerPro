import express from 'express';
import helmet from 'helmet';
import { errorHandler } from '../middleware/errorHandler.js';
import { vehicleRoutes } from '../modules/vehicles/vehicle.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/vehicles', vehicleRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});
app.use(errorHandler);
