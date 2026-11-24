import { requireRole } from '../auth/auth.middleware.js';
import { Router } from 'express';
import { getOrderClosure, getOrders, patchOrderStatus, postOrder, postOrderClosure } from './work-order.controller.js';

export const workOrderRoutes = Router();

workOrderRoutes.get('/', getOrders);
workOrderRoutes.post('/', postOrder);
workOrderRoutes.patch('/:id/status', patchOrderStatus);

// US12: cierre exclusivo para administradores.
workOrderRoutes.post('/:id/close', requireRole('ADMIN'), postOrderClosure);

// Consulta del resumen por personal autorizado.
workOrderRoutes.get('/:id/closure', getOrderClosure);
