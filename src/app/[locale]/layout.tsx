import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';

// 为不同语言提供不同的元数据
export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string };
}) {
  // 在实际应用中，你可能想要根据不同语言提供不同的标题和描述
  const titles: Record<string, string> = {
    en: 'Oliyo AI Image Platform',
    zh: 'Oliyo AI 图像平台',
    es: 'Plataforma de Imágenes AI Oliyo',
    fr: 'Plateforme d\'Images IA Oliyo',
    de: 'Oliyo KI Bildplattform',
    ja: 'Oliyo AI 画像プラットフォーム'
  };

  const descriptions: Record<string, string> = {
    en: 'Generate and edit images using advanced AI models',
    zh: '使用先进的 AI 模型生成和编辑图像',
    es: 'Genera y edita imágenes utilizando modelos avanzados de IA',
    fr: 'Générez et modifiez des images à l\'aide de modèles d\'IA avancés',
    de: 'Erstellen und bearbeiten Sie Bilder mit fortschrittlichen KI-Modellen',
    ja: '高度なAIモデルを使用して画像を生成・編集'
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // 根据 locale 获取对应的语言消息
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}