import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { LoaderCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../app/useAuth';
import type { Role } from '../../types/auth';
import { Card } from '../ui/Card';
import { PageHeader } from '../ui/PageHeader';
import { StatusMessage } from '../ui/StatusMessage';

interface RequireRoleProps {
  roles: readonly Role[];
  children: ReactNode;
}

/**
 * Muestra la pantalla solo a los roles indicados. Es una comodidad de la interfaz:
 * la seguridad real la aplica el backend en cada petición.
 */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <StatusMessage icon={<LoaderCircle size={22} />} title="Comprobando sesión…" />;
  }
  if (!user) {
    return <Navigate to="/iniciar-sesion" replace state={{ from: location.pathname }} />;
  }
  if (!roles.includes(user.role)) {
    return (
      <>
        <PageHeader title="Acceso restringido" />
        <Card>
          <StatusMessage icon={<ShieldAlert size={22} />} title="No tienes permiso para ver esta pantalla" role="alert">
            Tu cuenta no tiene acceso a esta sección.
          </StatusMessage>
        </Card>
      </>
    );
  }
  return children;
}
