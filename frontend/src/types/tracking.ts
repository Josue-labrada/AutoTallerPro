import type { WorkOrderStatus } from './workOrder';

/**
 * Lo ÚNICO que puede ver el cliente al consultar con su código.
 * No incluye descripción interna, costos, daños, fotos ni la placa completa.
 */
export interface TrackingInfo {
  vehicleLabel: string;
  /** Placa parcialmente oculta, p. ej. "•••123". */
  maskedPlate: string;
  status: WorkOrderStatus;
}
