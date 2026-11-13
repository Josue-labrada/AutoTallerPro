import type { DamageReport, DamageZone } from '../types/damage';
import { validateDescription, validatePhoto } from '../utils/damageValidation';
import { apiRequest } from './apiClient';

export function listDamages(orderId: string): Promise<DamageReport[]> {
  return apiRequest<DamageReport[]>(`/api/work-orders/${orderId}/damages`);
}

/**
 * Valida para dar mensajes claros y sube el daño (con foto opcional) al backend como formulario.
 * El backend vuelve a validar todo, incluido el tipo REAL de la imagen.
 */
export async function addDamage(
  orderId: string,
  zone: DamageZone,
  description: string,
  photo: File | null,
): Promise<DamageReport> {
  const descriptionError = validateDescription(description);
  if (descriptionError) throw new Error(descriptionError);

  if (photo) {
    const photoError = validatePhoto(photo);
    if (photoError) throw new Error(photoError);
  }

  const form = new FormData();
  form.append('zone', zone);
  form.append('description', description.trim());
  if (photo) form.append('photo', photo);

  // Sin cabecera Content-Type: el navegador la agrega con el separador correcto del formulario.
  return apiRequest<DamageReport>(`/api/work-orders/${orderId}/damages`, { method: 'POST', body: form });
}
