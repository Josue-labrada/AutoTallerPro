import { randomUUID } from 'node:crypto';
import type { Readable } from 'node:stream';
import { deleteObject, readObject, saveObject } from '../../config/storage.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { isUuid } from '../work-orders/work-order.validation.js';
import { DAMAGE_ZONES, type DamageReport, type DamageZone } from './damage.model.js';
import { findDamages, findPhoto, insertDamage, orderExists } from './damage.repository.js';
import { detectImage } from './image-type.js';

function isDamageZone(value: unknown): value is DamageZone {
  return DAMAGE_ZONES.some((zone) => zone === value);
}

async function requireOrder(orderId: string): Promise<void> {
  if (!isUuid(orderId) || !(await orderExists(orderId))) throw new HttpError(404, 'La orden no existe.');
}

export async function listDamages(orderId: string): Promise<DamageReport[]> {
  await requireOrder(orderId);
  return findDamages(orderId);
}

/** `body` son los campos de texto del formulario; `file` es la foto opcional (ya limitada a 5 MB). */
export async function addDamage(
  orderId: string,
  body: unknown,
  file: Express.Multer.File | undefined,
): Promise<DamageReport> {
  await requireOrder(orderId);

  const fields = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;
  const zone = fields['zone'];
  if (!isDamageZone(zone)) throw new HttpError(400, 'Selecciona una zona válida del vehículo.');

  const description = typeof fields['description'] === 'string' ? fields['description'].trim() : '';
  if (description === '') throw new HttpError(400, 'Describe el daño.');
  if (description.length > 300) throw new HttpError(400, 'La descripción admite máximo 300 caracteres.');

  if (!file) return insertDamage(orderId, zone, description, null);

  const image = detectImage(file.buffer);
  if (!image) throw new HttpError(400, 'La foto debe ser una imagen JPG, PNG o WebP válida.');

  // El nombre del archivo en MinIO lo genera el servidor: el nombre original nunca se usa.
  const key = `damages/${randomUUID()}.${image.extension}`;
  await saveObject(key, file.buffer, image.contentType);
  try {
    return await insertDamage(orderId, zone, description, { key, contentType: image.contentType });
  } catch (error) {
    // Si falla el guardado en la base de datos, no se deja la foto huérfana en MinIO.
    await deleteObject(key).catch(() => undefined);
    throw error;
  }
}

export async function getDamagePhoto(
  orderId: string,
  damageId: string,
): Promise<{ stream: Readable; contentType: string }> {
  if (!isUuid(orderId) || !isUuid(damageId)) throw new HttpError(404, 'La foto no existe.');
  const photo = await findPhoto(orderId, damageId);
  if (!photo) throw new HttpError(404, 'La foto no existe.');
  return { stream: await readObject(photo.key), contentType: photo.contentType };
}
