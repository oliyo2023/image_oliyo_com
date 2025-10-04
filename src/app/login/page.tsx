// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

export default function Login() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const tc = useTranslations('Common');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage(t('errors.emailAndPasswordRequired'));
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = `/${locale}/dashboard`;
      } else {
        setMessage(data.message || t('errors.loginFailed'));
      }
    } catch {
      setMessage(t('errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '420px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>{tc('login')}</h1>

        <label style={{ display: 'block', marginBottom: '0.25rem' }}>{t('email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('placeholders.email')} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />

        <label style={{ display: 'block', marginTop: '0.75rem', marginBottom: '0.25rem' }}>{t('password')}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('placeholders.password')} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}>
          {loading ? t('loggingIn') : tc('login')}
        </button>

        {message && <p style={{ color: '#991b1b', marginTop: '0.75rem' }}>{message}</p>}

        <div style={{ marginTop: '0.75rem' }}>
          <a href={`/${locale}/register`} style={{ color: '#2563eb', textDecoration: 'underline' }}>{t('noAccount')} {tc('register')}</a>
        </div>
      </form>
    </div>
  );
}