// src/app/admin/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { User } from '../../../../lib/types';

export default function UserManager() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        // Check if user is admin
        if (data.role !== 'admin') {
          // Redirect non-admin users
          router.push('/dashboard');
        } else {
          // Fetch all users for admin
          fetch('/api/admin/users', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(res => res.json())
          .then(usersData => {
            if (usersData.users) {
              setUsers(usersData.users);
            } else {
              setError('Failed to fetch users');
            }
            setLoading(false);
          })
          .catch(err => {
            console.error('Error fetching users:', err);
            setError('Failed to fetch users');
            setLoading(false);
          });
        }
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
      setLoading(false);
    });
  }, [router]);

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

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(() => {
      localStorage.removeItem('token');
      router.push('/login');
    });
  };

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
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
              User Management
            </h2>
            <button 
              onClick={() => router.push('/admin')}
              style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Back to Admin Dashboard
            </button>
          </div>
          
          {error && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '1rem', 
              backgroundColor: '#fee2e2', 
              color: '#991b1b', 
              borderRadius: '0.25rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ 
            overflowX: 'auto'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              backgroundColor: 'white'
            }}>
              <thead>
                <tr style={{ 
                  backgroundColor: '#f9fafb',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    Registration Date
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    Credit Balance
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    Role
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    Last Login
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((userData) => (
                  <tr 
                    key={userData.id} 
                    style={{ 
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      {userData.email}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {new Date(userData.registrationDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        fontWeight: 'bold',
                        color: userData.creditBalance > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {userData.creditBalance} credits
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem',
                        backgroundColor: userData.role === 'admin' ? '#2563eb' : '#d1d5db',
                        color: 'white',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem'
                      }}>
                        {userData.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {userData.lastLogin 
                        ? new Date(userData.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          style={{ 
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                          }}
                        >
                          Disable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              backgroundColor: '#f9fafb', 
              borderRadius: '0.5rem',
              marginTop: '1rem'
            }}>
              <p style={{ color: '#6b7280' }}>
                No users found.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}