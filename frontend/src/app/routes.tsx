import type { RouteObject } from 'react-router';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ComingSoonPage } from '../pages/ComingSoonPage';
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
      ...comingSoonRoutes,
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
