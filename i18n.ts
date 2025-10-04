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

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});

export function getLocales() {
  return locales;
}