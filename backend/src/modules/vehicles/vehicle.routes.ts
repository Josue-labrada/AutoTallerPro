import { Router } from 'express';
import { getVehicles, postVehicle } from './vehicle.controller.js';

export const vehicleRoutes = Router();

vehicleRoutes.get('/', getVehicles);
vehicleRoutes.post('/', postVehicle);
