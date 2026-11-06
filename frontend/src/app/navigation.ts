import {
  BellRing,
  Car,
  Fuel,
  LayoutDashboard,
  ReceiptText,
  Route,
  ScanSearch,
  SquareKanban,
  type LucideIcon,
} from 'lucide-react';

export type NavSectionId = 'operativo' | 'cliente';

export interface NavItem {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  section: NavSectionId;
  /** Etapa del plan de desarrollo en la que se implementa el módulo. */
  plannedStage: number;
  /** `true` cuando el módulo ya tiene una pantalla funcional. */
  isAvailable: boolean;
}

export const NAV_SECTIONS: ReadonlyArray<{ id: NavSectionId; label: string }> = [
  { id: 'operativo', label: 'Panel operativo' },
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
    plannedStage: 1,
    isAvailable: true,
  },
  {
    path: '/vehiculos',
    label: 'Registro de vehículos',
    description: 'Alta de vehículos con marca, modelo, año, placa, kilometraje y observaciones.',
    icon: Car,
    section: 'operativo',
    plannedStage: 2,
    isAvailable: false,
  },
  {
    path: '/ordenes',
    label: 'Tablero de órdenes',
    description: 'Tablero Kanban con las órdenes de trabajo por etapa.',
    icon: SquareKanban,
    section: 'operativo',
    plannedStage: 3,
    isAvailable: false,
  },
  {
    path: '/mapeo-danos',
    label: 'Mapeo de daños',
    description: 'Diagrama interactivo del vehículo para registrar zonas afectadas.',
    icon: ScanSearch,
    section: 'operativo',
    plannedStage: 4,
    isAvailable: false,
  },
  {
    path: '/servicios',
    label: 'Servicios y costos',
    description: 'Registro de servicios, insumos, cantidades, precios y subtotales.',
    icon: ReceiptText,
    section: 'operativo',
    plannedStage: 5,
    isAvailable: false,
  },
  {
    path: '/portal/seguimiento',
    label: 'Seguimiento',
    description: 'Consulta segura del estado de reparación del vehículo.',
    icon: Route,
    section: 'cliente',
    plannedStage: 6,
    isAvailable: false,
  },
  {
    path: '/portal/combustible',
    label: 'Calculadora de combustible',
    description: 'Estimación de litros y costo de un viaje.',
    icon: Fuel,
    section: 'cliente',
    plannedStage: 7,
    isAvailable: false,
  },
  {
    path: '/portal/mantenimiento',
    label: 'Alertas de mantenimiento',
    description: 'Indicadores de mantenimiento preventivo con umbrales configurables.',
    icon: BellRing,
    section: 'cliente',
    plannedStage: 7,
    isAvailable: false,
  },
];

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.path === pathname);
}

export function getSectionLabel(sectionId: NavSectionId): string {
  return NAV_SECTIONS.find((section) => section.id === sectionId)?.label ?? '';
}
