import type { MaintenanceItem } from '../types/maintenance';
import type { VehicleSummary } from '../types/vehicle';
import { apiRequest, jsonBody } from './apiClient';

export function listMyVehicles(): Promise<VehicleSummary[]> {
  return apiRequest<VehicleSummary[]>('/api/customer/vehicles');
}

export function listMyMaintenance(): Promise<MaintenanceItem[]> {
  return apiRequest<MaintenanceItem[]>('/api/customer/maintenance');
}

/** Vincula el vehículo de una orden con la cuenta usando el código de seguimiento que dio el taller. */
export function claimVehicle(trackingCode: string): Promise<{ status: 'claimed' | 'already-yours' }> {
  return apiRequest('/api/customer/vehicles/claim', jsonBody('POST', { trackingCode }));
}
