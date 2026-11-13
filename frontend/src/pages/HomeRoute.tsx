import { LoaderCircle } from 'lucide-react';
import { Navigate } from 'react-router';
import { useAuth } from '../app/useAuth';
import { StatusMessage } from '../components/ui/StatusMessage';
import { homePathFor } from '../types/auth';
import { DashboardPage } from './DashboardPage';

/** Pantalla de inicio (/): el panel para el personal; los demás van a la pantalla que les corresponde. */
export function HomeRoute() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <StatusMessage icon={<LoaderCircle size={22} />} title="Comprobando sesión…" />;
  }
  if (!user) return <Navigate to="/iniciar-sesion" replace />;
  if (user.role === 'CUSTOMER') return <Navigate to={homePathFor(user.role)} replace />;
  return <DashboardPage />;
}
