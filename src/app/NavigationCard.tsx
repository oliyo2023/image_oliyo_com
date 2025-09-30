'use client';

import { ReactNode } from 'react';

interface NavigationCardProps {
  href: string;
  children: ReactNode;
}

export default function NavigationCard({ href, children }: NavigationCardProps) {
  const handleMouseOver = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
  };

  return (
    <a
      href={href}
      style={{
        textDecoration: 'none',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        border: '1px solid #e5e7eb',
        transition: 'all 0.2s ease',
        display: 'block'
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      {children}
    </a>
  );
}