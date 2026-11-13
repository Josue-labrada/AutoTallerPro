export type Role = 'ADMIN' | 'WORKER' | 'CUSTOMER';

/** Usuario con sesión iniciada. El backend nunca envía contraseñas. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** Cuenta tal como la lista el administrador. */
export interface UserSummary extends AuthUser {
  createdAt: string;
}

export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  ADMIN: 'Administrador',
  WORKER: 'Trabajador',
  CUSTOMER: 'Cliente',
};

export const STAFF_ROLES: readonly Role[] = ['ADMIN', 'WORKER'];

/** Pantalla de inicio de cada rol después de iniciar sesión. */
export function homePathFor(role: Role): string {
  return role === 'CUSTOMER' ? '/portal/mantenimiento' : '/';
}
