import { redirect } from 'next/navigation';
import { getLocales } from '../../i18n';

export default function RootPage() {
  // 重定向到默认语言 (英语)
  const locales = getLocales();
  const defaultLocale = locales[0] || 'en';
  redirect(`/${defaultLocale}`);
}