// src/app/dashboard/gallery/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';

interface UserProfile {
  id: string;
  email: string;
  creditBalance: number;
  registrationDate: string;
  lastLogin: string;
  socialLoginProvider?: string;
}

interface Image {
  id: string;
  originalFilename: string;
  storagePath: string;
  creationDate: string;
  prompt: string;
  modelName: string;
  status: string;
  userId: string;
}

export default function Gallery() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, hasMore: false });
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Gallery');
  const tc = useTranslations('Common');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }

    fetch('/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setUser(data);
        } else {
          localStorage.removeItem('token');
          router.push(`/${locale}/login`);
        }
      })
      .catch(error => {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
        router.push(`/${locale}/login`);
      });

    fetch('/api/images?limit=20&offset=0', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setImages(data.images);
          setPagination(data.pagination);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching images:', error);
        setLoading(false);
      });
  }, [router, locale]);

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => {
      localStorage.removeItem('token');
      router.push(`/${locale}/login`);
    });
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Navigation */}
      <Navigation user={user} onLogout={handleLogout} />

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
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
            {t('title')}
          </h2>

          {images.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {images.map((image) => (
                <div
                  key={image.id}
                  style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{
                    height: '200px',
                    backgroundColor: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ color: '#6b7280' }}>{t('imagePreview')}</span>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '0.5rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {image.prompt || t('untitled')}
                    </h3>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <span>{image.modelName}</span>
                      <span>{new Date(image.creationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                {t('noImagesTitle')}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                {t('noImagesDesc')}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  onClick={() => router.push(`/${locale}/dashboard/generate-image`)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  {t('generateImage')}
                </button>
                <button
                  onClick={() => router.push(`/${locale}/dashboard/edit-image`)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                >
                  {t('editImage')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}