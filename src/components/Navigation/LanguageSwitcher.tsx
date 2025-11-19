"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-2 py-1 text-sm font-medium rounded transition-colors flex items-center gap-1 ${
            language === 'en'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
          title="English"
        >
          <span className="text-base">🇬🇧</span>
        </button>
        <button
          onClick={() => setLanguage('ru')}
          className={`px-2 py-1 text-sm font-medium rounded transition-colors flex items-center gap-1 ${
            language === 'ru'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
          title="Русский"
        >
          <span className="text-base">🇷🇺</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
