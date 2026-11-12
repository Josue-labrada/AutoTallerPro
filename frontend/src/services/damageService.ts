import type { DamageReport, DamageZone } from '../types/damage';
import { validateDescription, validatePhoto } from '../utils/damageValidation';

/*
 * Servicio temporal en memoria. Cuando exista el backend (y MinIO), la foto se subirá
 * al servidor; por ahora solo se guarda una URL temporal del navegador.
 */
let reports: DamageReport[] = [];

export async function listDamages(orderId: string): Promise<DamageReport[]> {
  return reports.filter((report) => report.orderId === orderId);
}

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

  const report: DamageReport = {
    id: crypto.randomUUID(),
    orderId,
    zone,
    description: description.trim(),
    photoUrl: photo ? URL.createObjectURL(photo) : null,
    photoName: photo ? photo.name : null,
    createdAt: new Date().toISOString(),
  };
  reports = [report, ...reports];
  return report;
}
