import { createHash, randomBytes } from 'node:crypto';
import type { Response } from 'express';

export const SESSION_COOKIE = 'atp_session';
export const SESSION_HOURS = 12;

const secureCookie = process.env['COOKIE_SECURE'] === 'true';

/** El token que viaja en la cookie es aleatorio; en la base de datos solo se guarda su hash. */
export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function readSessionToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === SESSION_COOKIE) return rest.join('=') || null;
  }
  return null;
}

function cookie(value: string, maxAgeSeconds: number): string {
  // HttpOnly: el JavaScript de la página no puede leerla. SameSite=Lax: no se envía desde otros sitios.
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureCookie ? '; Secure' : ''}`;
}

export function setSessionCookie(res: Response, token: string): void {
  res.setHeader('Set-Cookie', cookie(token, SESSION_HOURS * 3600));
}

export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', cookie('', 0));
}
