 // src/app/about/page.tsx
'use client';
import { useLocale, useTranslations } from 'next-intl';
export default function About() {
  const locale = useLocale();
  const tCommon = useTranslations('Common');
  const tAbout = useTranslations('About');
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
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href={`/${locale}/`}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#e5e7eb', 
                color: '#1f2937', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                textDecoration: 'none'
              }}
            >
              {tCommon('home')}
            </a>
            <a
              href={`/${locale}/login`}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                fontWeight: 'bold', 
                borderRadius: '0.25rem',
                textDecoration: 'none'
              }}
            >
              {tCommon('signIn')}
            </a>
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
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            {tAbout('title')}
          </h1>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                {tAbout('visionTitle')}
              </h2>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                {tAbout('visionP1')}
              </p>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginTop: '1rem' }}>
                {tAbout('visionP2')}
              </p>
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                {tAbout('techTitle')}
              </h2>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                {tAbout('techP1')}
              </p>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginTop: '1rem' }}>
                {tAbout('techP2')}
              </p>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '3rem', 
            padding: '2rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem' 
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              {tAbout('howTitle')}
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>1</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {tAbout('step1Title')}
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    {tAbout('step1P')}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>2</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {tAbout('step2Title')}
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    {tAbout('step2P')}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>3</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {tAbout('step3Title')}
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    {tAbout('step3P')}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '40px', 
                  height: '40px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#2563eb', fontWeight: 'bold' }}>4</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {tAbout('step4Title')}
                  </h3>
                  <p style={{ color: '#4b5563' }}>
                    {tAbout('step4P')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: '3rem',
            textAlign: 'center',
            backgroundColor: '#2563eb',
            padding: '3rem',
            borderRadius: '0.5rem',
            color: 'white'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {tAbout('ctaTitle')}
            </h2>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {tAbout('ctaP')}
            </p>
            <div>
              <a
                href={`/${locale}/register`}
                style={{ 
                  padding: '1rem 2rem', 
                  backgroundColor: 'white', 
                  color: '#2563eb', 
                  fontWeight: 'bold', 
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  display: 'inline-block',
                  fontSize: '1.125rem'
                }}
              >
                {tAbout('ctaButton')}
              </a>
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
            <a href={`/${locale}/`} style={{ color: '#6b7280', textDecoration: 'none' }}>{tCommon('home')}</a>
            <a href={`/${locale}/about`} style={{ color: '#6b7280', textDecoration: 'none' }}>{tCommon('about')}</a>
            <a href={`/${locale}/contact`} style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ color: '#4b5563' }}>
            © {new Date().getFullYear()} Oliyo AI Image Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}