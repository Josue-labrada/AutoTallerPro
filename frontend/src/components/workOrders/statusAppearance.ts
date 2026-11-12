import { ClipboardList, Hammer, PackageCheck, Stethoscope, type LucideIcon } from 'lucide-react';
import type { WorkOrderStatus } from '../../types/workOrder';

interface StatusAppearance {
  /** Variable CSS definida en tokens.css. */
  color: string;
  icon: LucideIcon;
}

/** Color e icono de cada etapa; el texto siempre acompaña al color. */
export const WORK_ORDER_STATUS_APPEARANCE: Readonly<Record<WorkOrderStatus, StatusAppearance>> = {
  EN_RECEPCION: { color: 'var(--color-stage-reception)', icon: ClipboardList },
  EN_DIAGNOSTICO: { color: 'var(--color-stage-diagnosis)', icon: Stethoscope },
  EN_REPARACION: { color: 'var(--color-stage-repair)', icon: Hammer },
  LISTO_PARA_ENTREGA: { color: 'var(--color-stage-ready)', icon: PackageCheck },
};
