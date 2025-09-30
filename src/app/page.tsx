// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationCard from './NavigationCard';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const navigationItems = [
    { name: 'Home', href: '/', description: 'Return to this page' },
    { name: 'Login', href: '/login', description: 'Sign in to your account' },
    { name: 'Register', href: '/register', description: 'Create a new account' },
    { name: 'Dashboard', href: '/dashboard', description: 'Your personal dashboard' },
    { name: 'About', href: '/about', description: 'Learn about our platform' },
    { name: 'Pricing', href: '/pricing', description: 'View our pricing plans' },
    { name: 'FAQ', href: '/faq', description: 'Frequently asked questions' },
    { name: 'Contact', href: '/contact', description: 'Get in touch with us' },
    { name: 'Blog', href: '/blog', description: 'Latest articles and updates' },
    { name: 'Docs', href: '/docs', description: 'API documentation' },
    { name: 'Admin', href: '/admin', description: 'Administrative dashboard' }
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
            {loading ? (
              <span>Loading...</span>
            ) : isLoggedIn ? (
              <>
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
                  Dashboard
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
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  style={{ 
                    padding: '0.5rem 1rem', 
                    backgroundColor: '#e5e7eb', 
                    color: '#1f2937', 
                    fontWeight: 'bold', 
                    borderRadius: '0.25rem',
                    textDecoration: 'none'
                  }}
                >
                  Sign In
                </a>
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
                  Register
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
            Welcome to Oliyo AI Image Platform
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
            Generate and edit images using advanced AI models
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
            Available Pages
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem'
          }}>
            {navigationItems.map((item) => (
              <NavigationCard 
                key={item.name}
                href={item.href}
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
              AI-Powered Creation
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              Transform your ideas into stunning visuals with our cutting-edge AI models.
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
                Create Images
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
                Get Started
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
              Easy Editing
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              Modify existing images with simple text prompts and intuitive controls.
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
                Edit Images
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
                Try It Now
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
              Credit-Based System
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
              Start with 100 free credits and purchase more as needed to fuel your creativity.
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
              View Pricing
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
            <a href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</a>
            <a href="/about" style={{ color: '#6b7280', textDecoration: 'none' }}>About</a>
            <a href="/pricing" style={{ color: '#6b7280', textDecoration: 'none' }}>Pricing</a>
            <a href="/faq" style={{ color: '#6b7280', textDecoration: 'none' }}>FAQ</a>
            <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
          </div>
          <p style={{ color: '#4b5563' }}>
            © {new Date().getFullYear()} Oliyo AI Image Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}