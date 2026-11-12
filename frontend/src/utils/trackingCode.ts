// Sin caracteres que se confunden al leerlos (0/O, 1/I/L).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const TRACKING_CODE_PATTERN = /^ATP-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/;

function randomChars(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET.charAt(byte % ALPHABET.length)).join('');
}

/** Código impredecible tipo ATP-7K3M-9QX2 (la placa NO sirve para consultar). */
export function generateTrackingCode(): string {
  return `ATP-${randomChars(4)}-${randomChars(4)}`;
}

export function normalizeTrackingCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidTrackingCode(code: string): boolean {
  return TRACKING_CODE_PATTERN.test(normalizeTrackingCode(code));
}
