import type { Vehicle } from '../types/vehicle';
import type { TrackingInfo } from '../types/tracking';
import { getNextStatus, type WorkOrder } from '../types/workOrder';
import {
  generateTrackingCode,
  isValidTrackingCode,
  normalizeTrackingCode,
} from '../utils/trackingCode';

/*
 * Servicio temporal en memoria. La regla de transiciones vive aquí (y no en la pantalla)
 * porque será el backend quien la aplique: una orden solo avanza a la etapa siguiente.
 */
let orders: WorkOrder[] = [
  {
    id: 'ord-1',
    vehiclePlate: 'ABC-123',
    vehicleLabel: 'Toyota Corolla 2019',
    description: 'Ruido en la suspensión delantera.',
    status: 'EN_DIAGNOSTICO',
    trackingCode: 'ATP-7K3M-9QX2',
    createdAt: '2026-11-03T09:30:00',
  },
  {
    id: 'ord-2',
    vehiclePlate: 'XYZ-789',
    vehicleLabel: 'Nissan Versa 2021',
    description: 'Cambio de aceite y revisión de frenos.',
    status: 'EN_RECEPCION',
    trackingCode: 'ATP-4HTR-2WNB',
    createdAt: '2026-11-10T14:00:00',
  },
];

export async function listWorkOrders(): Promise<WorkOrder[]> {
  return [...orders];
}

export async function createWorkOrder(vehicle: Vehicle, description: string): Promise<WorkOrder> {
  const text = description.trim();
  if (text === '') throw new Error('Describe el trabajo a realizar.');
  if (text.length > 300) throw new Error('La descripción admite máximo 300 caracteres.');

  const order: WorkOrder = {
    id: crypto.randomUUID(),
    vehiclePlate: vehicle.plate,
    vehicleLabel: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
    description: text,
    status: 'EN_RECEPCION',
    trackingCode: generateTrackingCode(),
    createdAt: new Date().toISOString(),
  };
  orders = [order, ...orders];
  return order;
}

/** Mueve la orden a la etapa siguiente. Rechaza si ya está en la última. */
export async function advanceWorkOrder(id: string): Promise<WorkOrder> {
  const order = orders.find((item) => item.id === id);
  if (!order) throw new Error('La orden no existe.');

  const next = getNextStatus(order.status);
  if (!next) throw new Error('La orden ya está lista para entrega.');

  const updated: WorkOrder = { ...order, status: next };
  orders = orders.map((item) => (item.id === id ? updated : item));
  return updated;
}

/**
 * Consulta pública del cliente. Solo funciona con el código de seguimiento y devuelve
 * únicamente los campos autorizados. El mensaje de error es el mismo si el código tiene
 * mal formato o no existe, para no dar pistas a quien intente adivinar códigos.
 * (El backend real debe, además, limitar la cantidad de intentos por IP.)
 */
export async function trackOrder(code: string): Promise<TrackingInfo> {
  const notFound = new Error('No encontramos una orden con ese código. Revísalo e intenta de nuevo.');
  if (!isValidTrackingCode(code)) throw notFound;

  const normalized = normalizeTrackingCode(code);
  const order = orders.find((item) => item.trackingCode === normalized);
  if (!order) throw notFound;

  return {
    vehicleLabel: order.vehicleLabel,
    maskedPlate: `•••${order.vehiclePlate.slice(-3)}`,
    status: order.status,
  };
}
