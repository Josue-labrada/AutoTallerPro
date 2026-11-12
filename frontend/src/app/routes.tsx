import type { RouteObject } from 'react-router';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ComingSoonPage } from '../pages/ComingSoonPage';
import { VehiclesPage } from '../pages/VehiclesPage';
import { OrdersPage } from '../pages/OrdersPage';
import { DamageMapPage } from '../pages/DamageMapPage';
import { CostsPage } from '../pages/CostsPage';
import { FuelCalculatorPage } from '../pages/FuelCalculatorPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { NAV_ITEMS } from './navigation';

const comingSoonRoutes: RouteObject[] = NAV_ITEMS.filter((item) => !item.isAvailable).map(
  (item) => ({
    path: item.path,
    element: <ComingSoonPage item={item} />,
  }),
);

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: '/vehiculos', element: <VehiclesPage /> },
      { path: '/ordenes', element: <OrdersPage /> },
      { path: '/mapeo-danos', element: <DamageMapPage /> },
      { path: '/servicios', element: <CostsPage /> },
      { path: '/portal/combustible', element: <FuelCalculatorPage /> },
      ...comingSoonRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
