import { Router, type Request } from 'express';
import { addCost, listCosts, removeCost } from './cost.service.js';

/** Se monta en /api/work-orders/:orderId/costs */
export const costRoutes = Router({ mergeParams: true });

type CostParams = { orderId: string; id: string };

costRoutes.get('/', async (req: Request<CostParams>, res) => {
  res.json(await listCosts(req.params.orderId));
});

costRoutes.post('/', async (req: Request<CostParams>, res) => {
  res.status(201).json(await addCost(req.params.orderId, req.body));
});

costRoutes.delete('/:id', async (req: Request<CostParams>, res) => {
  await removeCost(req.params.orderId, req.params.id);
  res.status(204).end();
});
