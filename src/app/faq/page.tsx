// src/app/faq/page.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';

export default function FAQ() {
  const locale = useLocale();
  const t = useTranslations('FAQ');
  const tc = useTranslations('Common');

  const items = t.raw('items') as { q: string; a: string }[];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>{t('title')}</h1>
      </header>

      <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          {items.map((faq, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem' }}>{faq.q}</h2>
              <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}

          <p style={{ color: '#6b7280', marginTop: '1rem' }}>{t('moreHelp')}</p>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <a href={`/${locale}/login`} style={{ color: '#2563eb', textDecoration: 'underline' }}>{tc('login')}</a>
            <a href={`/${locale}/register`} style={{ color: '#2563eb', textDecoration: 'underline' }}>{tc('register')}</a>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <a href={`/${locale}/about`} style={{ color: '#6b7280', textDecoration: 'none' }}>{tc('about')}</a>
          <a href={`/${locale}/faq`} style={{ color: '#6b7280', textDecoration: 'none' }}>{tc('faq')}</a>
          <a href={`/${locale}/contact`} style={{ color: '#6b7280', textDecoration: 'none' }}>{tc('contact')}</a>
        </div>
      </main>
    </div>
  );
}