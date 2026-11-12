const TRACKING_CODE_PATTERN = /^ATP-[A-HJKMNP-Z2-9]{4}-[A-HJKMNP-Z2-9]{4}$/;


export function normalizeTrackingCode(code: string): string {
  return code.trim().toUpperCase();
}

export function isValidTrackingCode(code: string): boolean {
  return TRACKING_CODE_PATTERN.test(normalizeTrackingCode(code));
}
