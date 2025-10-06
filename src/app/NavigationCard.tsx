'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface NavigationCardProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function NavigationCard({ href, children, className = "" }: NavigationCardProps) {
  return (
    <Link href={href} legacyBehavior>
      <a
        style={{
          display: 'block',
          height: '100%',
          width: '100%',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          backgroundColor: 'white',
          textDecoration: 'none',
          padding: '1.5rem',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          color: '#1f2937',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-0.25rem)';
          e.currentTarget.style.borderColor = '#10b981';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = 'none';
          e.currentTarget.style.boxShadow = '0 0 0 2px #10b981';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }}
      >
        {children}
      </a>
    </Link>
  );
}