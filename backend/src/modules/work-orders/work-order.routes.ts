import { Router } from 'express';
import { getOrders, patchOrderStatus, postOrder } from './work-order.controller.js';

export const workOrderRoutes = Router();

workOrderRoutes.get('/', getOrders);
workOrderRoutes.post('/', postOrder);
workOrderRoutes.patch('/:id/status', patchOrderStatus);
