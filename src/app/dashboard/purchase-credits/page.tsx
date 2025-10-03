// src/app/dashboard/purchase-credits/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  creditBalance: number;
  registrationDate: string;
  lastLogin: string;
  socialLoginProvider?: string;
}

export default function PurchaseCredits() {
  const [selectedPackage, setSelectedPackage] = useState('100');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user profile
    fetch('/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.id) {
        setUser(data);
      } else {
        // Invalid token, redirect to login
        localStorage.removeItem('token');
        router.push('/login');
      }
    })
    .catch(error => {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      router.push('/login');
    });
  }, [router]);

  const creditPackages = [
    { credits: 100, price: 9.99, description: 'Starter Pack' },
    { credits: 500, price: 44.99, description: 'Value Pack' },
    { credits: 1000, price: 89.99, description: 'Best Value' }
  ];

  const handlePurchase = async (credits, price) => {
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      // Create payment intent
      const response = await fetch('/api/credits/purchase-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          credits,
          paymentMethodId: 'pm_card_visa' // This would be replaced with actual payment method
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Payment intent created successfully. Redirecting to payment...`);
        // In a real implementation, you would redirect to a payment page
        // For now, we'll simulate a successful payment
        setTimeout(() => {
          setMessage('Payment successful! Credits will be added to your account shortly.');
          // Refresh user data to show updated credit balance
          fetch('/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(res => res.json())
          .then(userData => {
            if (userData.id) {
              setUser(userData);
            }
          });
        }, 2000);
      } else {
        setMessage(data.message || 'Failed to create payment intent');
      }
    } catch (error) {
      setMessage('An error occurred while processing your payment');
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (!user) {
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
            Purchase Credits
          </h1>
          <button 
            onClick={handleBack}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
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
            Buy More Credits
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem',
            marginTop: '2rem'
          }}>
            {creditPackages.map((pkg) => (
              <div 
                key={pkg.credits}
                style={{ 
                  backgroundColor: pkg.credits === 500 ? '#eff6ff' : '#f9fafb',
                  border: pkg.credits === 500 ? '2px solid #2563eb' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  position: 'relative',
                  transform: pkg.credits === 500 ? 'scale(1.05)' : 'none',
                  zIndex: pkg.credits === 500 ? 1 : 'auto'
                }}
              >
                {pkg.credits === 500 && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-0.5rem', 
                    right: '-0.5rem', 
                    backgroundColor: '#2563eb', 
                    color: 'white', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.25rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold'
                  }}>
                    Best Value
                  </div>
                )}
                
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', textAlign: 'center' }}>
                  {pkg.credits} Credits
                </h3>
                <p style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: '#2563eb', 
                  textAlign: 'center', 
                  margin: '0.5rem 0' 
                }}>
                  ${pkg.price.toFixed(2)}
                </p>
                <p style={{ 
                  color: '#6b7280', 
                  textAlign: 'center', 
                  marginBottom: '1rem' 
                }}>
                  {pkg.description}
                </p>
                <p style={{ 
                  color: '#10b981', 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  marginBottom: '1rem' 
                }}>
                  ${(pkg.price / pkg.credits * 100).toFixed(2)} per credit
                </p>
                <button
                  onClick={() => handlePurchase(pkg.credits, pkg.price)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: pkg.credits === 500 ? '#2563eb' : '#10b981',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '0.25rem',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            ))}
          </div>

          {message && (
            <div 
              style={{ 
                marginTop: '2rem', 
                padding: '1rem', 
                backgroundColor: message.includes('successful') ? '#d1fae5' : '#fee2e2', 
                color: message.includes('successful') ? '#065f46' : '#991b1b', 
                borderRadius: '0.25rem',
                textAlign: 'center'
              }}
            >
              {message}
            </div>
          )}

          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Current Balance
            </h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
              {user.creditBalance} credits
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}