// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import UserAvatar from './UserAvatar';

interface NavigationProps {
  user: any;
  onLogout: () => void;
}

export default function Navigation({ user, onLogout }: NavigationProps) {
  const pathname = usePathname();
  const locale = useLocale();
  
  const navItems = [
    { name: 'Dashboard', href: `/${locale}/dashboard` },
    { name: 'Generate Image', href: `/${locale}/dashboard/generate-image` },
    { name: 'Edit Image', href: `/${locale}/dashboard/edit-image` },
    { name: 'Gallery', href: `/${locale}/dashboard/gallery` },
    { name: 'Purchase Credits', href: `/${locale}/dashboard/purchase-credits` }
  ];

  return (
    <nav style={{ 
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
        <Link href={`/${locale}/dashboard`} style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          textDecoration: 'none' 
        }}>
          Oliyo AI
        </Link>
        
        <div style={{ display: 'flex', gap: '2rem' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: pathname === item.href ? '#2563eb' : '#6b7280',
                fontWeight: pathname === item.href ? 'bold' : 'normal',
                textDecoration: 'none',
                paddingBottom: '0.25rem',
                borderBottom: pathname === item.href ? '2px solid #2563eb' : 'none'
              }}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserAvatar email={user.email} size="sm" />
            <span>{user.email}</span>
          </div>
          <span style={{ 
            backgroundColor: '#22c55e', 
            color: 'white', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '0.25rem', 
            fontWeight: 'bold',
            fontSize: '0.875rem'
          }}>
            {user.creditBalance} credits
          </span>
          <button 
            onClick={onLogout}
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
    </nav>
  );
}