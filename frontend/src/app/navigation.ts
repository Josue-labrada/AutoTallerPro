import {
  BellRing,
  Car,
  Fuel,
  LayoutDashboard,
  ReceiptText,
  Route,
  ScanSearch,
  SquareKanban,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { STAFF_ROLES, type AuthUser, type Role } from '../types/auth';

export type NavSectionId = 'operativo' | 'administracion' | 'cliente';

export interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  section: NavSectionId;
  /** Roles que pueden ver la pantalla. Sin `roles`, la ve cualquiera (incluidos los invitados). */
  roles?: readonly Role[];
}

export const NAV_SECTIONS: ReadonlyArray<{ id: NavSectionId; label: string }> = [
  { id: 'operativo', label: 'Panel operativo' },
  { id: 'administracion', label: 'Administración' },
  { id: 'cliente', label: 'Portal del cliente' },
];

/** Fuente única de la navegación: la usan el Sidebar, el Header y el enrutador. */
export const NAV_ITEMS: readonly NavItem[] = [
  {
    path: '/',
    label: 'Panel principal',
    description: 'Resumen operativo del taller.',
    icon: LayoutDashboard,
    section: 'operativo',
    roles: STAFF_ROLES,
  },
  {
    path: '/vehiculos',
    label: 'Registro de vehículos',
    description: 'Alta de vehículos con marca, modelo, año, placa, kilometraje y observaciones.',
    icon: Car,
    section: 'operativo',
    roles: STAFF_ROLES,
  },
  {
    path: '/ordenes',
    label: 'Tablero de órdenes',
    description: 'Tablero Kanban con las órdenes de trabajo por etapa.',
    icon: SquareKanban,
    section: 'operativo',
    roles: STAFF_ROLES,
  },
  {
    path: '/mapeo-danos',
    label: 'Mapeo de daños',
    description: 'Diagrama interactivo del vehículo para registrar zonas afectadas.',
    icon: ScanSearch,
    section: 'operativo',
    roles: STAFF_ROLES,
  },
  {
    path: '/servicios',
    label: 'Servicios y costos',
    description: 'Registro de servicios, insumos, cantidades, precios y subtotales.',
    icon: ReceiptText,
    section: 'operativo',
    roles: STAFF_ROLES,
  },
  {
    path: '/mantenimiento',
    label: 'Mantenimientos',
    description: 'Programa los mantenimientos preventivos de cada vehículo.',
    icon: Wrench,
    section: 'operativo',
    roles: STAFF_ROLES,
  },
  {
    path: '/admin/usuarios',
    label: 'Usuarios',
    description: 'Alta y baja de cuentas del personal del taller.',
    icon: Users,
    section: 'administracion',
    roles: ['ADMIN'],
  },
  {
    path: '/portal/seguimiento',
    label: 'Seguimiento',
    description: 'Consulta segura del estado de reparación del vehículo.',
    icon: Route,
    section: 'cliente',
  },
  {
    path: '/portal/combustible',
    label: 'Calculadora de combustible',
    description: 'Estimación de litros y costo de un viaje.',
    icon: Fuel,
    section: 'cliente',
  },
  {
    path: '/portal/mantenimiento',
    label: 'Mis alertas de mantenimiento',
    description: 'Alertas de mantenimiento preventivo de tus vehículos.',
    icon: BellRing,
    section: 'cliente',
    roles: ['CUSTOMER'],
  },
];

/** ¿Este usuario (o invitado, si es `null`) puede ver esta pantalla? */
export function canAccess(user: AuthUser | null, item: NavItem): boolean {
  if (!item.roles) return true;
  return user !== null && item.roles.includes(user.role);
}

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.path === pathname);
}

export function getSectionLabel(sectionId: NavSectionId): string {
  return NAV_SECTIONS.find((section) => section.id === sectionId)?.label ?? '';
}
