import type { Role, UserSummary } from '../types/auth';
import { apiRequest, jsonBody } from './apiClient';

export function listUsers(): Promise<UserSummary[]> {
  return apiRequest<UserSummary[]>('/api/users');
}

/** Solo para administradores: da de alta a un trabajador o a otro administrador. */
export function createStaffUser(
  name: string,
  email: string,
  password: string,
  role: Extract<Role, 'WORKER' | 'ADMIN'>,
): Promise<UserSummary> {
  return apiRequest<UserSummary>('/api/users', jsonBody('POST', { name, email, password, role }));
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest<undefined>(`/api/users/${id}`, { method: 'DELETE' });
}
