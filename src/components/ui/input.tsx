"use client";

import React from 'react';

export const Input = ({
  type = 'text',
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    type={type}
    className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    placeholder:text-gray-500 ${className}`}
    {...props}
  />
);
