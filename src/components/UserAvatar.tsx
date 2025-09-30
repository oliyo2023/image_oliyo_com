// src/components/UserAvatar.tsx
import React from 'react';

interface UserAvatarProps {
  email: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ email, size = 'md' }: UserAvatarProps) {
  // Get initials from email
  const initials = email.charAt(0).toUpperCase();
  
  // Set size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };
  
  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${sizeClasses[size]} overflow-hidden bg-blue-100 rounded-full`}
    >
      <span className={`${textSize[size]} font-medium text-blue-800`}>
        {initials}
      </span>
    </div>
  );
}