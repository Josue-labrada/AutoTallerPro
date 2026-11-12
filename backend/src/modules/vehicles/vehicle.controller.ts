import type { Request, Response } from 'express';
import * as vehicleService from './vehicle.service.js';

/** Los controladores solo traducen entre HTTP y el servicio. */
export async function getVehicles(_req: Request, res: Response): Promise<void> {
  res.json(await vehicleService.listVehicles());
}

export async function postVehicle(req: Request, res: Response): Promise<void> {
  const vehicle = await vehicleService.registerVehicle(req.body);
  res.status(201).json(vehicle);
}
