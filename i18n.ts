import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'zh', 'es', 'fr', 'de', 'ja'];

export default getRequestConfig(async ({ locale }) => {
  // Ensure we have a valid locale, fallback to 'en' if undefined or invalid
  let validLocale = locale || 'en';

  // Handle non-locale values like favicon.ico
  if (!validLocale || typeof validLocale !== 'string' || !locales.includes(validLocale as any)) {
    validLocale = 'en';
  }

  // Load English as base, then merge current locale on top for missing keys fallback
  const baseEn = (await import(`./messages/en.json`)).default as Record<string, any>;
  const current = validLocale === 'en'
    ? baseEn
    : (await import(`./messages/${validLocale}.json`)).default as Record<string, any>;

  return {
    locale: validLocale,
    messages: deepMerge(baseEn, current),
    timeZone: 'Asia/Shanghai'
  };
});

export function getLocales() {
  return locales;
}

// Tiny deep merge for plain objects to support i18n fallback
function deepMerge<T extends Record<string, any>>(base: T, override: T): T {
  const out: Record<string, any> = Array.isArray(base) ? [...base] : { ...base };
  for (const key of Object.keys(override)) {
    const bv = (base as any)[key];
    const ov = (override as any)[key];
    if (bv && ov && typeof bv === 'object' && typeof ov === 'object' && !Array.isArray(bv) && !Array.isArray(ov)) {
      out[key] = deepMerge(bv, ov);
    } else {
      out[key] = ov ?? bv;
    }
  }
  // ensure base-only keys remain
  for (const key of Object.keys(base)) {
    if (!(key in out)) out[key] = (base as any)[key];
  }
  return out as T;
}