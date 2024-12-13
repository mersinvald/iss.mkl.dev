"use client";

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  onClick?: () => void;
  className?: string;
}

export const Badge = ({ 
  children, 
  variant = 'default',
  onClick,
  className = ''
}: BadgeProps) => {
  const baseStyles = 'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium';
  const variantStyles = {
    default: 'bg-blue-600 text-white',
    outline: 'border border-gray-600 text-gray-300',
    secondary: 'bg-gray-700 text-gray-300'
  };
  
  return (
    <span 
      className={`${baseStyles} ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};