const STORAGE_KEY = 'ecarte_device_fingerprint';

function generateFingerprint(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `fp_${crypto.randomUUID()}`;
  }
  return `fp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const fingerprint = generateFingerprint();
  localStorage.setItem(STORAGE_KEY, fingerprint);
  return fingerprint;
}