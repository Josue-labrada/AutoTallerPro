import { randomInt } from 'node:crypto';

// Sin caracteres que se confunden al leerlos (0/O, 1/I/L).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomChars(length: number): string {
  return Array.from({ length }, () => ALPHABET.charAt(randomInt(ALPHABET.length))).join('');
}

/** Código impredecible tipo ATP-7K3M-9QX2, generado con aleatoriedad criptográfica. */
export function generateTrackingCode(): string {
  return `ATP-${randomChars(4)}-${randomChars(4)}`;
}

export function isValidTrackingCode(code: string): boolean {
  return /^ATP-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/.test(code);
}
