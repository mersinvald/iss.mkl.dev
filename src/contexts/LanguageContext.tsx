"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any                                        
  messages: any;
  t: (key: string, fallback?: string) => string;
  plural: (count: number, forms: { one: string; few: string; many: string }) => string;
  decline: (key: string, grammaticalCase: 'nominative' | 'genitive' | 'dative' | 'accusative' | 'instrumental' | 'prepositional', fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any                                        
  const [messages, setMessages] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    // Function to detect browser language
    const detectLanguage = (): Language => {
      // Check if user has already set a preference
      const savedLanguage = localStorage.getItem('NEXT_LOCALE') as Language | null;
      if (savedLanguage) {
        return savedLanguage;
      }

      // Detect browser language
      // eslint-disable-next-line @typescript-eslint/no-explicit-any                                        
      const browserLanguage = navigator.language || (navigator as any).userLanguage;
      
      // Check if browser language starts with 'ru' (covers ru, ru-RU, etc.)
      if (browserLanguage.toLowerCase().startsWith('ru')) {
        return 'ru';
      }

      // Default to English
      return 'en';
    };

    const initialLanguage = detectLanguage();
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

  // Declension helper for Russian grammatical cases
  const decline = (key: string, grammaticalCase: 'nominative' | 'genitive' | 'dative' | 'accusative' | 'instrumental' | 'prepositional', fallback?: string): string => {
    if (language === 'en') {
      // English doesn't have declensions, just return the base form
      return t(key, fallback);
    }

    // For Russian, look up the declined form
    const declinedKey = `${key}.${grammaticalCase}`;
    const keys = declinedKey.split('.');
    let value = messages;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // If declined form not found, fall back to nominative
        return t(key, fallback);
      }
    }
    
    return typeof value === 'string' ? value : t(key, fallback);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, messages, t, plural, decline }}>
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
