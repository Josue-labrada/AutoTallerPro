import { HttpError } from '../../middleware/errorHandler.js';
import type { AuthUser, Role } from './auth.model.js';
import {
  deleteSession,
  findCredentialsByEmail,
  insertSession,
  insertUser,
} from './auth.repository.js';
import { checkEmail, checkName, checkNewPassword } from './auth.validation.js';
import { burnTime, hashPassword, verifyPassword } from './password.js';
import { SESSION_HOURS, hashToken, newSessionToken } from './session.js';

function asRecord(body: unknown): Record<string, unknown> {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
}

/** Crea una cuenta con el rol indicado. Lo usan el registro de clientes y el alta de personal. */
export async function createUser(body: unknown, role: Role): Promise<AuthUser> {
  const data = asRecord(body);
  const email = checkEmail(data['email']);
  if (!email.ok) throw new HttpError(400, email.message);
  const name = checkName(data['name']);
  if (!name.ok) throw new HttpError(400, name.message);
  const password = checkNewPassword(data['password']);
  if (!password.ok) throw new HttpError(400, password.message);

  const user = await insertUser(email.value, name.value, await hashPassword(password.value), role);
  if (!user) throw new HttpError(409, 'Ya existe una cuenta con ese correo.');
  return user;
}

/** Crea la sesión y devuelve el token que irá en la cookie. */
export async function startSession(userId: string): Promise<string> {
  const token = newSessionToken();
  await insertSession(hashToken(token), userId, SESSION_HOURS);
  return token;
}

export async function endSession(token: string): Promise<void> {
  await deleteSession(hashToken(token));
}

export async function authenticate(body: unknown): Promise<AuthUser> {
  const data = asRecord(body);
  const email = typeof data['email'] === 'string' ? data['email'].trim().toLowerCase() : '';
  const password = typeof data['password'] === 'string' ? data['password'] : '';
  const invalid = new HttpError(401, 'Correo o contraseña incorrectos.');

  const credentials = email.length <= 254 && password.length <= 128 ? await findCredentialsByEmail(email) : null;
  if (!credentials) {
    await burnTime(password.slice(0, 128));
    throw invalid;
  }
  if (!(await verifyPassword(password, credentials.passwordHash))) throw invalid;
  return credentials.user;
}
