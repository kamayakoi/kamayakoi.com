export const LANGUAGE_COOKIE_KEY = 'kamayakoi.language';
export const LANGUAGE_STORAGE_KEY = 'kamayakoi.language';

/** @deprecated Legacy key from earlier builds — read once for migration only */
export const LEGACY_LANGUAGE_COOKIE_KEY = 'jumbo.language';
export const LEGACY_LANGUAGE_STORAGE_KEY = 'jumbo.language';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

export function parseLanguageCookie(value: string | undefined): 'en' | 'fr' {
  if (value === 'fr') return 'fr';
  return 'en';
}

export function setLanguageCookie(lang: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${LANGUAGE_COOKIE_KEY}=${lang};path=/;max-age=31536000;SameSite=Lax`;
}

export function isSupportedLanguage(
  value: string | undefined
): value is (typeof SUPPORTED_LANGUAGES)[number] {
  return value === 'en' || value === 'fr';
}
