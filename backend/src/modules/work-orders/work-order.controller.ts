import * as orderClosureService from './order-closure.service.js';
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

/** US12: cierre de orden y consulta de su resumen de auditoría. */
export async function postOrderClosure(req: Request<{ id: string }>, res: Response): Promise<void> {
  res.status(201).json(await orderClosureService.closeOrder(req.params.id, req.user));
}

export async function getOrderClosure(req: Request<{ id: string }>, res: Response): Promise<void> {
  res.json(await orderClosureService.getOrderClosure(req.params.id));
}
