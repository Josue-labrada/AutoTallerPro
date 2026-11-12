import type { KeyboardEvent } from 'react';
import { DAMAGE_ZONE_LABELS, type DamageZone } from '../../types/damage';
import styles from './CarDamageMap.module.css';

interface ZoneShape {
  zone: DamageZone;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

/** Vista superior del auto (frente arriba) dividida en zonas seleccionables. */
const ZONE_SHAPES: readonly ZoneShape[] = [
  { zone: 'FRONTAL', x: 50, y: 28, width: 100, height: 30, radius: 14 },
  { zone: 'COFRE', x: 50, y: 60, width: 100, height: 80, radius: 8 },
  { zone: 'PARABRISAS', x: 55, y: 142, width: 90, height: 40, radius: 6 },
  { zone: 'TECHO', x: 55, y: 184, width: 90, height: 70, radius: 6 },
  { zone: 'VIDRIO_TRASERO', x: 55, y: 256, width: 90, height: 35, radius: 6 },
  { zone: 'CAJUELA', x: 50, y: 293, width: 100, height: 55, radius: 8 },
  { zone: 'TRASERA', x: 50, y: 350, width: 100, height: 30, radius: 14 },
  { zone: 'LATERAL_IZQ_DELANTERO', x: 16, y: 78, width: 32, height: 104, radius: 10 },
  { zone: 'LATERAL_IZQ_TRASERO', x: 16, y: 186, width: 32, height: 120, radius: 10 },
  { zone: 'LATERAL_DER_DELANTERO', x: 152, y: 78, width: 32, height: 104, radius: 10 },
  { zone: 'LATERAL_DER_TRASERO', x: 152, y: 186, width: 32, height: 120, radius: 10 },
];

interface CarDamageMapProps {
  selectedZone: DamageZone | null;
  damagedZones: ReadonlySet<DamageZone>;
  onSelect: (zone: DamageZone) => void;
}

export function CarDamageMap({ selectedZone, damagedZones, onSelect }: CarDamageMapProps) {
  function handleKeyDown(event: KeyboardEvent<SVGRectElement>, zone: DamageZone) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(zone);
    }
  }

  return (
    <svg
      viewBox="0 0 200 410"
      className={styles.map}
      role="group"
      aria-label="Diagrama del vehículo visto desde arriba. Selecciona una zona para registrar un daño."
    >
      <text x="100" y="16" className={styles.axisLabel} textAnchor="middle">
        FRENTE
      </text>
      <text x="100" y="402" className={styles.axisLabel} textAnchor="middle">
        ATRÁS
      </text>

      {ZONE_SHAPES.map(({ zone, x, y, width, height, radius }) => {
        const isSelected = zone === selectedZone;
        const isDamaged = damagedZones.has(zone);
        const classes = [styles.zone, isDamaged && styles.damaged, isSelected && styles.selected]
          .filter(Boolean)
          .join(' ');

        return (
          <rect
            key={zone}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={radius}
            className={classes}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${DAMAGE_ZONE_LABELS[zone]}${isDamaged ? ' (con daño registrado)' : ''}`}
            onClick={() => onSelect(zone)}
            onKeyDown={(event) => handleKeyDown(event, zone)}
          >
            <title>{DAMAGE_ZONE_LABELS[zone]}</title>
          </rect>
        );
      })}
    </svg>
  );
}
