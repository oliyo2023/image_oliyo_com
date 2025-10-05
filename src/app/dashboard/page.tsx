// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface UserProfile {
  id: string;
  email: string;
  creditBalance: number;
  registrationDate: string;
  lastLogin: string;
  socialLoginProvider?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  const td = useTranslations('Dashboard');

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }

    // Fetch real user profile from API
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error fetching user profile:', errorData.message);
          router.push(`/${locale}/login`); // Redirect to login if token is invalid
          return;
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        router.push(`/${locale}/login`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router, locale]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push(`/${locale}/login`);
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f3f4f6', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const buildHref = (path: string) => {
    // 如果 path 已经包含当前 locale 前缀，则直接返回，避免出现 /zh/zh/...
    const withLocalePrefix = `/${locale}/`;
    if (path.startsWith(withLocalePrefix)) return path;
    // 统一把无 locale 的 path 规范化为以斜杠开头
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `/${locale}${normalized}`;
  };

  const dashboardCards = [
    {
      title: td('creditBalance'),
      value: user.creditBalance,
      description: 'Remaining credits in your account',
      action: td('purchaseCredits'),
      actionHref: '/dashboard/purchase-credits',
      color: '#2563eb'
    },
    {
      title: td('generateImage'),
      value: 'Create',
      description: 'Generate new images from text prompts',
      action: td('generateImage'),
      actionHref: '/dashboard/generate-image',
      color: '#10b981'
    },
    {
      title: td('editImage'),
      value: 'Modify',
      description: 'Edit existing images with text prompts',
      action: td('editImage'),
      actionHref: '/dashboard/edit-image',
      color: '#f59e0b'
    },
    {
      title: td('viewGallery'),
      value: 'Browse',
      description: 'View your generated and edited images',
      action: td('viewGallery'),
      actionHref: '/dashboard/gallery',
      color: '#8b5cf6'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        padding: '1rem 2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            Oliyo AI Image Platform
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>{td('welcome', { email: user.email })}</span>
            <button 
              onClick={handleLogout}
              style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '2rem auto',
        padding: '0 1rem'
      }}>
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            {t('dashboard')}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {dashboardCards.map((card, index) => (
              <div 
                key={index}
                style={{ 
                  backgroundColor: '#f9fafb',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                  {card.title}
                </h3>
                <p style={{ 
                  fontSize: typeof card.value === 'number' ? '2rem' : '1.5rem', 
                  fontWeight: 'bold', 
                  color: card.color, 
                  marginBottom: '0.5rem'
                }}>
                  {card.value}
                </p>
                <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                  {card.description}
                </p>
                <Link
                  href={buildHref(card.actionHref)}
                  style={{ 
                    padding: '0.5rem 1rem',
                    backgroundColor: card.color,
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '0.25rem',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  {card.action}
                </Link>
              </div>
            ))}
          </div>
          
          <div style={{ 
            marginTop: '3rem',
            padding: '2rem', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '0.5rem',
            border: '1px solid #bae6fd'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              {td('recentActivity')}
            </h3>
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ color: '#4b5563', textAlign: 'center' }}>
                {td('noRecentActivity')}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer style={{ 
        width: '100%', 
        padding: '2rem',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        marginTop: 'auto'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href={`/${locale}/`} style={{ color: '#6b7280', textDecoration: 'none' }}>{t('home')}</Link>
            <Link href={`/${locale}/about`} style={{ color: '#6b7280', textDecoration: 'none' }}>{t('about')}</Link>
            <Link href={`/${locale}/pricing`} style={{ color: '#6b7280', textDecoration: 'none' }}>{t('pricing')}</Link>
            <Link href={`/${locale}/faq`} style={{ color: '#6b7280', textDecoration: 'none' }}>{t('faq')}</Link>
            <Link href={`/${locale}/contact`} style={{ color: '#6b7280', textDecoration: 'none' }}>{t('contact')}</Link>
          </div>
          <p style={{ color: '#4b5563' }}>
            © {new Date().getFullYear()} Oliyo AI Image Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}