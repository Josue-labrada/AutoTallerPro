export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_DESCRIPTION_LENGTH = 300;

/** Devuelve un mensaje de error, o `null` si la foto es válida. */
export function validatePhoto(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return 'La foto debe ser JPG, PNG o WebP.';
  if (file.size > MAX_PHOTO_BYTES) return 'La foto no puede pesar más de 5 MB.';
  return null;
}

/** Devuelve un mensaje de error, o `null` si la descripción es válida. */
export function validateDescription(description: string): string | null {
  const text = description.trim();
  if (text === '') return 'Describe el daño.';
  if (text.length > MAX_DESCRIPTION_LENGTH) {
    return `La descripción admite máximo ${MAX_DESCRIPTION_LENGTH} caracteres.`;
  }
  return null;
}
