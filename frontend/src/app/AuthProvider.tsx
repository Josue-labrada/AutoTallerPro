import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AUTH_EXPIRED_EVENT } from '../services/apiClient';
import * as authService from '../services/authService';
import type { AuthUser } from '../types/auth';
import { AuthContext, type AuthState } from './authContext';

/** Guarda quién tiene la sesión abierta y lo comparte con toda la aplicación. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthState['status']>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Al abrir la página: ¿ya había una sesión?
  useEffect(() => {
    authService
      .fetchCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setStatus('ready'));
  }, []);

  // Si el servidor responde 401 en cualquier pantalla, la sesión venció: se vuelve a invitado.
  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedIn = await authService.login(email, password);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const created = await authService.register(name, email, password);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
