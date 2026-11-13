export const ROLES = ['ADMIN', 'WORKER', 'CUSTOMER'] as const;
export type Role = (typeof ROLES)[number];

/** Roles del personal del taller. */
export const STAFF_ROLES: readonly Role[] = ['ADMIN', 'WORKER'];

/** Usuario tal como lo ve el sistema. Nunca incluye la contraseña ni su hash. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Usuario con sesión válida; `undefined` si es un invitado. */
      user?: AuthUser;
    }
  }
}
