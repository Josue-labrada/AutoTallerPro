import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router';
import { RequireRole } from '../components/auth/RequireRole';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { CostsPage } from '../pages/CostsPage';
import { CustomerMaintenancePage } from '../pages/CustomerMaintenancePage';
import { DamageMapPage } from '../pages/DamageMapPage';
import { FuelCalculatorPage } from '../pages/FuelCalculatorPage';
import { HomeRoute } from '../pages/HomeRoute';
import { LoginPage } from '../pages/LoginPage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { OrdersPage } from '../pages/OrdersPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TrackingPage } from '../pages/TrackingPage';
import { UsersPage } from '../pages/UsersPage';
import { VehiclesPage } from '../pages/VehiclesPage';
import { STAFF_ROLES } from '../types/auth';

const staffOnly = (page: ReactNode) => <RequireRole roles={STAFF_ROLES}>{page}</RequireRole>;

export const routes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      { path: '/iniciar-sesion', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomeRoute /> },

      // Personal del taller (administrador y trabajador)
      { path: '/vehiculos', element: staffOnly(<VehiclesPage />) },
      { path: '/ordenes', element: staffOnly(<OrdersPage />) },
      { path: '/mapeo-danos', element: staffOnly(<DamageMapPage />) },
      { path: '/servicios', element: staffOnly(<CostsPage />) },
      { path: '/mantenimiento', element: staffOnly(<MaintenancePage />) },

      // Solo administrador
      { path: '/admin/usuarios', element: <RequireRole roles={['ADMIN']}><UsersPage /></RequireRole> },

      // Portal del cliente: invitados (seguimiento y combustible) y clientes con cuenta (alertas)
      { path: '/portal/seguimiento', element: <TrackingPage /> },
      { path: '/portal/combustible', element: <FuelCalculatorPage /> },
      {
        path: '/portal/mantenimiento',
        element: <RequireRole roles={['CUSTOMER']}><CustomerMaintenancePage /></RequireRole>,
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
