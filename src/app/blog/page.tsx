// src/app/blog/page.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';

export default function Blog() {
  const locale = useLocale();
  const t = useTranslations('Blog');

  const blogPosts = [
    {
      id: 'mastering-ai-image-generation',
      title: t('openPost'),
      readTime: t('readTime', { minutes: 5 }),
      image: '/images/blog-1.jpg'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>{t('title')}</h1>
        <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>{t('intro')}</p>
      </header>

      <main style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
          {blogPosts.map((post) => (
            <article key={post.id} style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ height: '160px', backgroundColor: '#e5e7eb' }} />
              <div style={{ padding: '1rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>{post.title}</h2>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{post.readTime}</p>
                <a
                  href={`/${locale}/blog/${post.id}`}
                  style={{ display: 'inline-block', marginTop: '0.5rem', color: '#2563eb', textDecoration: 'underline' }}
                >
                  {t('readMore')}
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}