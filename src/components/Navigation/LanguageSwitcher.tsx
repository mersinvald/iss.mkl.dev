"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-400" />
      <div className="flex gap-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
            language === 'en'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage('ru')}
          className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
            language === 'ru'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          RU
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
