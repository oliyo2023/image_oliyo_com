'use client';

import Link from 'next/link';

export default function NotFound() {
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
        Page Not Found
      </h2>
      <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>
        The page you are looking for might have been removed or is temporarily unavailable.
      </p>
      <Link href="/en" style={{ 
        padding: '0.75rem 1.5rem', 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        borderRadius: '0.5rem', 
        textDecoration: 'none', 
        fontWeight: 'bold',
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}>
        Go Back Home
      </Link>
    </div>
  );
}