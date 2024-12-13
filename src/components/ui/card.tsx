"use client";

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = '' }: CardProps) => (
  <div className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden ${className}`}>
    {children}
  </div>
);
