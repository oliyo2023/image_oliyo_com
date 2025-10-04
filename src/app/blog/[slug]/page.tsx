// src/app/blog/[slug]/page.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';

interface Params {
  params: { slug: string };
}

export default function BlogPost({ params }: Params) {
  const locale = useLocale();
  const t = useTranslations('BlogPost');
  const slug = params.slug;

  const titleKey = `${slug}.title`;
  const subtitleKey = `${slug}.subtitle`;

  const hasKnown = t.has(slug);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', padding: '1rem 2rem' }}>
        <a href={`/${locale}/blog`} style={{ color: '#2563eb', textDecoration: 'underline' }}>
          {t('backToBlog')}
        </a>
      </header>

      <main style={{ maxWidth: '900px', margin: '2rem auto', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', padding: '2rem' }}>
        {hasKnown ? (
          <>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              {t(titleKey)}
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{t(subtitleKey)}</p>
            <article style={{ color: '#374151', lineHeight: 1.8 }}>
              <p>
                {/* Placeholder content for demo */}
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. This article demonstrates localized dynamic routing: /{locale}/blog/{slug}.
              </p>
            </article>
          </>
        ) : (
          <p style={{ color: '#6b7280' }}>{t('unknown')}</p>
        )}
      </main>
    </div>
  );
}