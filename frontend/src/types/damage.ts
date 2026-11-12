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

export const DAMAGE_ZONE_LABELS: Readonly<Record<DamageZone, string>> = {
  FRONTAL: 'Parte frontal (defensa)',
  COFRE: 'Cofre',
  PARABRISAS: 'Parabrisas',
  TECHO: 'Techo',
  VIDRIO_TRASERO: 'Vidrio trasero',
  CAJUELA: 'Cajuela',
  TRASERA: 'Parte trasera (defensa)',
  LATERAL_IZQ_DELANTERO: 'Lateral izquierdo delantero',
  LATERAL_IZQ_TRASERO: 'Lateral izquierdo trasero',
  LATERAL_DER_DELANTERO: 'Lateral derecho delantero',
  LATERAL_DER_TRASERO: 'Lateral derecho trasero',
};

/** Daño registrado en una zona del vehículo de una orden de trabajo. */
export interface DamageReport {
  id: string;
  orderId: string;
  zone: DamageZone;
  description: string;
  /** URL temporal de la foto (solo válida mientras la página siga abierta). */
  photoUrl: string | null;
  photoName: string | null;
  createdAt: string;
}
