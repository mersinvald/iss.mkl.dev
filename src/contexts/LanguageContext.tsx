"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  messages: any;
  t: (key: string, fallback?: string) => string;
  plural: (count: number, forms: { one: string; few: string; many: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [messages, setMessages] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    // Get language from localStorage on mount
    const savedLanguage = localStorage.getItem('NEXT_LOCALE') as Language | null;
    const initialLanguage = savedLanguage || 'en';
    
    setLanguageState(initialLanguage);
    
    // Load messages for the initial language
    import(`../../messages/${initialLanguage}.json`).then((module) => {
      setMessages(module.default);
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('NEXT_LOCALE', lang);
    
    // Load new messages
    const newMessages = await import(`../../messages/${lang}.json`);
    setMessages(newMessages.default);
    
    // Force a re-render by refreshing the router
    router.refresh();
  };

  // Translation helper function
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  };

  // Pluralization helper for Russian
  const plural = (count: number, forms: { one: string; few: string; many: string }): string => {
    if (language === 'en') {
      return count === 1 ? forms.one : forms.many;
    }

    // Russian pluralization rules
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return forms.one; // 1, 21, 31, 41, 51, 61, 71, 81, 91, 101, 121, etc.
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return forms.few; // 2-4, 22-24, 32-34, 42-44, 52-54, 62, 102-104, 122-124, etc.
    } else {
      return forms.many; // 0, 5-20, 25-30, 35-40, etc.
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, messages, t, plural }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
