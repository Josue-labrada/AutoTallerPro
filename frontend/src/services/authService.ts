import type { AuthUser } from '../types/auth';
import { ApiError, apiRequest, jsonBody } from './apiClient';

/** Usuario de la sesión actual, o `null` si es un invitado. */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiRequest<AuthUser>('/api/auth/me');
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export function login(email: string, password: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/login', jsonBody('POST', { email, password }));
}

export function register(name: string, email: string, password: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/auth/register', jsonBody('POST', { name, email, password }));
}

export async function logout(): Promise<void> {
  await apiRequest<undefined>('/api/auth/logout', { method: 'POST' });
}
