import { useContext } from 'react';
import { AuthContext, type AuthState } from './authContext';

export function useAuth(): AuthState {
  const state = useContext(AuthContext);
  if (!state) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return state;
}
