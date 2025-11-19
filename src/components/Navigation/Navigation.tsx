"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { messages } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !messages.navigation) {
    return null;
  }

  const routes = [
    { href: '/', label: messages.navigation.objects },
    { href: '/timeline', label: messages.navigation.timeline },
    { href: '/about', label: messages.navigation.about }
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path === '/' && pathname?.startsWith('/objects/')) return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex flex-col justify-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-blue-400">I See Stars</h1>
            </Link>
            <p className="text-sm text-gray-500 hidden sm:block">
              {messages.navigation.subtitle}
            </p>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {routes.map(route => (
              <Link
                key={route.href}
                href={route.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(route.href)
                    ? 'text-blue-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {route.label}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <div className="sm:hidden pb-2 -mt-2">
          <p className="text-sm text-gray-500">
            {messages.navigation.subtitle}
          </p>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {routes.map(route => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(route.href)
                      ? 'bg-gray-800 text-blue-400'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
