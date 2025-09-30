// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
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
          router.push('/login'); // Redirect to login if token is invalid
          return;
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
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
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const dashboardCards = [
    {
      title: 'Credit Balance',
      value: user.creditBalance,
      description: 'Remaining credits in your account',
      action: 'Purchase Credits',
      actionHref: '/dashboard/purchase-credits',
      color: '#2563eb'
    },
    {
      title: 'Generate Images',
      value: 'Create',
      description: 'Generate new images from text prompts',
      action: 'Generate Image',
      actionHref: '/dashboard/generate-image',
      color: '#10b981'
    },
    {
      title: 'Edit Images',
      value: 'Modify',
      description: 'Edit existing images with text prompts',
      action: 'Edit Image',
      actionHref: '/dashboard/edit-image',
      color: '#f59e0b'
    },
    {
      title: 'View Gallery',
      value: 'Browse',
      description: 'View your generated and edited images',
      action: 'View Gallery',
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
            <span>Welcome, {user.email}</span>
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
              Logout
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
            Dashboard
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
                  fontSize: card.title === 'Credit Balance' ? '2rem' : '1.5rem', 
                  fontWeight: 'bold', 
                  color: card.color, 
                  marginBottom: '0.5rem'
                }}>
                  {card.value}
                </p>
                <p style={{ color: '#4b5563', marginBottom: '1rem' }}>
                  {card.description}
                </p>
                <a
                  href={card.actionHref}
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
                </a>
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
              Recent Activity
            </h3>
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1rem',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ color: '#4b5563', textAlign: 'center' }}>
                No recent activity yet. Try generating or editing an image!
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