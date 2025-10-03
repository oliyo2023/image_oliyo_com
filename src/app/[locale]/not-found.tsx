'use client';

import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('Common');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
        {t('error')}
      </h2>
      <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>
        {t('pageNotFound')}
      </p>
      <a 
        href="/"
        style={{ 
          padding: '0.75rem 1.5rem',
          backgroundColor: '#2563eb',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '0.25rem',
          textDecoration: 'none'
        }}
      >
        {t('backToHome')}
      </a>
    </div>
  );
}