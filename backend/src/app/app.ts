import express from 'express';
import helmet from 'helmet';
import { costRoutes } from '../modules/costs/cost.routes.js';
import { damageRoutes } from '../modules/damages/damage.routes.js';
import { loadUser, requireRole, sameOriginOnly } from '../modules/auth/auth.middleware.js';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { customerRoutes } from '../modules/customer/customer.routes.js';
import { userRoutes } from '../modules/users/user.routes.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { maintenanceRoutes } from '../modules/maintenance/maintenance.routes.js';
import { trackingRoutes } from '../modules/tracking/tracking.routes.js';
import { vehicleRoutes } from '../modules/vehicles/vehicle.routes.js';
import { workOrderRoutes } from '../modules/work-orders/work-order.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

// Identifica al usuario (si trae sesión) y rechaza peticiones que modifican datos desde otros sitios.
app.use(loadUser);
app.use(sameOriginOnly);

// --- Públicas (invitados) ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.use('/api/auth', authRoutes);
app.use('/api/tracking', trackingRoutes);

// --- Personal del taller (administrador y trabajador) ---
const staffOnly = requireRole('ADMIN', 'WORKER');
app.use('/api/vehicles', staffOnly, vehicleRoutes);
app.use('/api/work-orders', staffOnly, workOrderRoutes);
app.use('/api/work-orders/:orderId/costs', staffOnly, costRoutes);
app.use('/api/work-orders/:orderId/damages', staffOnly, damageRoutes);
app.use('/api/maintenance', staffOnly, maintenanceRoutes);

// --- Solo administrador ---
app.use('/api/users', requireRole('ADMIN'), userRoutes);

// --- Solo clientes con cuenta ---
app.use('/api/customer', requireRole('CUSTOMER'), customerRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});
app.use(errorHandler);
