// src/app/contact/page.tsx
'use client';

import { useLocale, useTranslations } from 'next-intl';

export default function Contact() {
  const locale = useLocale();
  const t = useTranslations('Contact');
  const tc = useTranslations('Common');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem 2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#111827' }}>{t('title')}</h1>
      </header>

      <main style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem' }}>
        <section style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>{t('support')}</h2>
          <p style={{ color: '#4b5563' }}>{t('emailUs')}</p>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>{t('responseTime')}</p>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <a href={`/${locale}/login`} style={{ color: '#2563eb', textDecoration: 'underline' }}>{tc('login')}</a>
            <a href={`/${locale}/register`} style={{ color: '#2563eb', textDecoration: 'underline' }}>{tc('register')}</a>
          </div>
        </section>

        <section style={{ marginTop: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>{t('refundPolicy')}</h2>
          <p style={{ color: '#4b5563' }}>{t('refundDetail')}</p>
        </section>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <a href={`/${locale}/pricing`} style={{ color: '#6b7280', textDecoration: 'none' }}>{tc('pricing')}</a>
          <a href={`/${locale}/faq`} style={{ color: '#6b7280', textDecoration: 'none' }}>{tc('faq')}</a>
          <a href={`/${locale}/contact`} style={{ color: '#6b7280', textDecoration: 'none' }}>{tc('contact')}</a>
        </div>
      </main>
    </div>
  );
}