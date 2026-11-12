import type { Request, Response } from 'express';
import * as orderService from './work-order.service.js';

export async function getOrders(_req: Request, res: Response): Promise<void> {
  res.json(await orderService.listOrders());
}

export async function postOrder(req: Request, res: Response): Promise<void> {
  res.status(201).json(await orderService.createOrder(req.body));
}

export async function patchOrderStatus(req: Request<{ id: string }>, res: Response): Promise<void> {
  res.json(await orderService.changeStatus(req.params.id, req.body));
}
