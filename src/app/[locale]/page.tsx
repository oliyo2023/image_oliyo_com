'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import NavigationCard from '../NavigationCard';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const t = useTranslations('Home');
  const tNav = useTranslations('Navigation');
  const tCommon = useTranslations('Common');
  
  const navigationItems = [
    { name: tCommon('home'), href: '/', description: tNav('home') },
    { name: tCommon('signIn'), href: '/login', description: tNav('login') },
    { name: tCommon('register'), href: '/register', description: tNav('register') },
    { name: tCommon('dashboard'), href: '/dashboard', description: tNav('dashboard') },
    { name: tCommon('about'), href: '/about', description: tNav('about') },
    { name: tCommon('pricing'), href: '/pricing', description: tNav('pricing') },
    { name: tCommon('faq'), href: '/faq', description: tNav('faq') },
    { name: tCommon('contact'), href: '/contact', description: tNav('contact') },
    { name: tCommon('blog'), href: '/blog', description: tNav('blog') },
    { name: tCommon('docs'), href: '/docs', description: tNav('docs') },
    { name: tCommon('admin'), href: '/admin', description: tNav('admin') }
  ];

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      // Optionally verify token is still valid by making a request
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  // Get current locale from URL
  const getLocaleFromPath = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const segments = path.split('/');
      return segments[1]; // The locale should be the first segment
    }
    return 'en'; // Default locale
  };

  const currentLocale = getLocaleFromPath();

  // Function to create localized links
  const createLocalizedLink = (path: string) => {
    if (path === '/') return `/${currentLocale}`;
    return `/${currentLocale}${path}`;
  };

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
            {t('title')}
          </h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <LanguageSwitcher />
            {loading ? (
              <span>{tCommon('loading')}</span>
            ) : isLoggedIn ? (
              <>
                <a
                  href={createLocalizedLink("/dashboard")}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    fontWeight: 'bold', 
                    borderRadius: '0.25rem',
                    textDecoration: 'none'
                  }}
                >
                  {tCommon('dashboard')}
                </a>
                <button
                  onClick={handleLogout}
                  style={{ 
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {tCommon('signOut')}
                </button>
              </>
            ) : (
              <>
                <a
                  href={createLocalizedLink("/login")}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#e5e7eb', 
                    color: '#1f2937', 
                    fontWeight: 'bold', 
                    borderRadius: '0.25rem',
                    textDecoration: 'none'
                  }}
                >
                  {tCommon('signIn')}
                </a>
                <a
                  href={createLocalizedLink("/register")}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    fontWeight: 'bold', 
                    borderRadius: '0.25rem',
                    textDecoration: 'none'
                  }}
                >
                  {tCommon('register')}
                </a>
              </>
            )}
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
          textAlign: 'center', 
          marginBottom: '3rem'
        }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            {t('welcome')}
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
            {t('description')}
          </p>
        </div>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem', textAlign: 'center' }}>
            {t('availablePages')}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem'
          }}>
            {navigationItems.map((item) => (
              <NavigationCard 
                key={item.name}
                href={createLocalizedLink(item.href)}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem' }}>
                  {item.name}
                </h3>
                <p style={{ color: '#4b5563' }}>
                  {item.description}
                </p>
              </NavigationCard>
            ))}
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '2rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            backgroundColor: '#eff6ff',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              {t('aiPoweredCreation')}
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              {t('aiPoweredCreationDesc')}
            </p>
            {isLoggedIn ? (
              <a 
                href="/dashboard"
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.25rem',
                  textDecoration: 'none'
                }}
              >
                {t('createImages')}
              </a>
            ) : (
              <a 
                href="/register"
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.25rem',
                  textDecoration: 'none'
                }}
              >
                {t('getStarted')}
              </a>
            )}
          </div>
          
          <div style={{ 
            backgroundColor: '#f0fdf4',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              {t('easyEditing')}
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              {t('easyEditingDesc')}
            </p>
            {isLoggedIn ? (
              <a 
                href="/dashboard"
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.25rem',
                  textDecoration: 'none'
                }}
              >
                {t('editImages')}
              </a>
            ) : (
              <a 
                href="/register"
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '0.25rem',
                  textDecoration: 'none'
                }}
              >
                {t('tryItNow')}
              </a>
            )}
          </div>
          
          <div style={{ 
            backgroundColor: '#fffbeb',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              {t('creditBasedSystem')}
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              {t('creditBasedSystemDesc')}
            </p>
            <a 
              href="/pricing"
              style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '0.25rem',
                textDecoration: 'none'
              }}
            >
              {t('viewPricing')}
            </a>
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
            <a href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>{tCommon('home')}</a>
            <a href="/about" style={{ color: '#6b7280', textDecoration: 'none' }}>{tCommon('about')}</a>
            <a href="/pricing" style={{ color: '#6b7280', textDecoration: 'none' }}>{tCommon('pricing')}</a>
            <a href="/faq" style={{ color: '#6b7280', textDecoration: 'none' }}>{tCommon('faq')}</a>
            <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>{tCommon('contact')}</a>
          </div>
          <p style={{ color: '#4b5563' }}>
            © {new Date().getFullYear()} {t('title')}. {t('allRightsReserved')}
          </p>
        </div>
      </footer>
    </div>
  );
}