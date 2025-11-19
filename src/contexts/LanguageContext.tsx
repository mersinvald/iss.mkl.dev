"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  messages: any;
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, messages }}>
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
