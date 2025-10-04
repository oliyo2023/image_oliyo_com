import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';
import { locales } from '../../../i18n';

// 为不同语言提供不同的元数据
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const titles: Record<string, string> = {
    en: 'Oliyo AI Image Platform',
    zh: 'Oliyo AI 图像平台',
    es: 'Plataforma de Imágenes AI Oliyo',
    fr: "Plateforme d'Images IA Oliyo",
    de: 'Oliyo KI Bildplattform',
    ja: 'Oliyo AI 画像プラットフォーム',
  };

  const descriptions: Record<string, string> = {
    en: 'Generate and edit images using advanced AI models',
    zh: '使用先进的 AI 模型生成和编辑图像',
    es: 'Genera y edita imágenes utilizando modelos avanzados de IA',
    fr: "Générez et modifiez des images à l'aide de modèles d'IA avancés",
    de: 'Erstellen und bearbeiten Sie Bilder mit fortschrittlichen KI-Modellen',
    ja: '高度なAIモデルを使用して画像を生成・编辑',
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

// 显式声明可用的 locale 动态参数，确保 /en 路由被编译
export async function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 命中 [locale] 布局的服务端日志
  console.log('hit [locale] layout:', locale);
  // 使用传入的 locale 获取消息（next-intl v4 稳定用法）
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
