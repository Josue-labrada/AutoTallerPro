export interface DetectedImage {
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  extension: 'jpg' | 'png' | 'webp';
}

/**
 * Detecta el tipo REAL de la imagen leyendo sus primeros bytes ("firma" del archivo).
 * No se confía en el nombre ni en el tipo que declara el navegador, porque se pueden falsificar.
 */
export function detectImage(data: Buffer): DetectedImage | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return { contentType: 'image/jpeg', extension: 'jpg' };
  }
  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (data.length >= 8 && pngSignature.every((byte, index) => data[index] === byte)) {
    return { contentType: 'image/png', extension: 'png' };
  }
  if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { contentType: 'image/webp', extension: 'webp' };
  }
  return null;
}
