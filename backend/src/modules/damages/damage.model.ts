export const DAMAGE_ZONES = [
  'FRONTAL',
  'COFRE',
  'PARABRISAS',
  'TECHO',
  'VIDRIO_TRASERO',
  'CAJUELA',
  'TRASERA',
  'LATERAL_IZQ_DELANTERO',
  'LATERAL_IZQ_TRASERO',
  'LATERAL_DER_DELANTERO',
  'LATERAL_DER_TRASERO',
] as const;

export type DamageZone = (typeof DAMAGE_ZONES)[number];

/** Daño tal como lo devuelve la API. `photoUrl` apunta al backend, nunca directo a MinIO. */
export interface DamageReport {
  id: string;
  orderId: string;
  zone: DamageZone;
  description: string;
  photoUrl: string | null;
  /** ISO 8601 */
  createdAt: string;
}
