import { Router, type Request } from 'express';
import { uploadPhoto } from '../../middleware/uploadPhoto.js';
import { addDamage, getDamagePhoto, listDamages } from './damage.service.js';

/** Se monta en /api/work-orders/:orderId/damages */
export const damageRoutes = Router({ mergeParams: true });

type DamageParams = { orderId: string; id: string };

damageRoutes.get('/', async (req: Request<DamageParams>, res) => {
  res.json(await listDamages(req.params.orderId));
});

damageRoutes.post('/', uploadPhoto, async (req: Request<DamageParams>, res) => {
  res.status(201).json(await addDamage(req.params.orderId, req.body, req.file));
});

// Las fotos se sirven a través del backend: MinIO nunca se expone al navegador.
damageRoutes.get('/:id/photo', async (req: Request<DamageParams>, res) => {
  const { stream, contentType } = await getDamagePhoto(req.params.orderId, req.params.id);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'private, max-age=3600');
  stream.on('error', () => res.destroy());
  stream.pipe(res);
});
