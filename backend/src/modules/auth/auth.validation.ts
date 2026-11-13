const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Checked<T> = { ok: true; value: T } | { ok: false; message: string };

export function checkEmail(value: unknown): Checked<string> {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, message: 'Escribe un correo electrónico válido.' };
  }
  return { ok: true, value: email };
}

export function checkName(value: unknown): Checked<string> {
  const name = typeof value === 'string' ? value.trim() : '';
  if (name === '' || name.length > 100) {
    return { ok: false, message: 'El nombre es obligatorio (máximo 100 caracteres).' };
  }
  return { ok: true, value: name };
}

export function checkNewPassword(value: unknown): Checked<string> {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
    return { ok: false, message: 'La contraseña debe tener entre 8 y 128 caracteres.' };
  }
  return { ok: true, value };
}
