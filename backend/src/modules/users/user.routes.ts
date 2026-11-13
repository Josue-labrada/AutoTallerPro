import { Router, type Request } from 'express';
import { HttpError } from '../../middleware/errorHandler.js';
import { createUser } from '../auth/auth.service.js';
import { isUuid } from '../work-orders/work-order.validation.js';
import { deleteUserById, findAllUsers } from './user.repository.js';

/** Gestión de cuentas del personal. Solo para administradores (se protege al montarla en app.ts). */
export const userRoutes = Router();

userRoutes.get('/', async (_req, res) => {
  res.json(await findAllUsers());
});

userRoutes.post('/', async (req, res) => {
  const role = (req.body as { role?: unknown } | undefined)?.role;
  if (role !== 'WORKER' && role !== 'ADMIN') {
    throw new HttpError(400, 'El rol debe ser WORKER (trabajador) o ADMIN (administrador).');
  }
  res.status(201).json(await createUser(req.body, role));
});

userRoutes.delete('/:id', async (req: Request<{ id: string }>, res) => {
  if (req.params.id === req.user?.id) throw new HttpError(400, 'No puedes eliminar tu propia cuenta.');
  if (!isUuid(req.params.id) || !(await deleteUserById(req.params.id))) {
    throw new HttpError(404, 'El usuario no existe.');
  }
  res.status(204).end();
});
