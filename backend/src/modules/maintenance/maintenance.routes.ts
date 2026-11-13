import { Router } from 'express';
import { addMaintenance, listMaintenance, removeMaintenance } from './maintenance.service.js';

export const maintenanceRoutes = Router();

maintenanceRoutes.get('/', async (_req, res) => {
  res.json(await listMaintenance());
});

maintenanceRoutes.post('/', async (req, res) => {
  res.status(201).json(await addMaintenance(req.body));
});

maintenanceRoutes.delete('/:id', async (req, res) => {
  await removeMaintenance(req.params.id);
  res.status(204).end();
});
