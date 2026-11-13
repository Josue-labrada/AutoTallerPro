import { createContext } from 'react';
import type { AuthUser } from '../types/auth';

export interface AuthState {
  /** `loading` mientras se averigua si ya había una sesión abierta. */
  status: 'loading' | 'ready';
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
