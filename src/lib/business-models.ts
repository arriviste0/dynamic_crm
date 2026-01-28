const DEFAULT_BUSINESS_MODELS = ['B2B', 'B2C', 'BCB'] as const;
const STORAGE_KEY = 'businessModels';
const DEFAULT_STORAGE_KEY = 'defaultBusinessModel';

export function getBusinessModels(): string[] {
  if (typeof window === 'undefined') {
    return [...DEFAULT_BUSINESS_MODELS];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_BUSINESS_MODELS];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed.length > 0 ? parsed : [...DEFAULT_BUSINESS_MODELS];
    }
  } catch {}
  return [...DEFAULT_BUSINESS_MODELS];
}

export function saveBusinessModels(models: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
}

export function getDefaultBusinessModel(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_BUSINESS_MODELS[0];
  }
  try {
    const stored = localStorage.getItem(DEFAULT_STORAGE_KEY);
    if (stored && stored.trim()) return stored;
  } catch {}
  return DEFAULT_BUSINESS_MODELS[0];
}

export function saveDefaultBusinessModel(value: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEFAULT_STORAGE_KEY, value);
}

export function formatBusinessModelLabel(value: string) {
  if (value === 'BCB') return 'BCB (B2B2C)';
  return value;
}
