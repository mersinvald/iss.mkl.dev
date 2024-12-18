"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  const routes = [
    { href: '/', label: 'Objects' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/about', label: 'About' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    // Check if we're in an object view
    if (path === '/' && pathname?.startsWith('/objects/')) return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and site name with subheader */}
          <div className="flex flex-col justify-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold text-blue-400">I See Stars</h1>
            </Link>
            <p className="text-sm text-gray-500 hidden sm:block">
              My amateur astrophotography journey documented
            </p>
          </div>

          {/* Desktop navigation */}
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
          </div>

          {/* Mobile menu button */}
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

        {/* Mobile subheader */}
        <div className="sm:hidden pb-2 -mt-2">
          <p className="text-sm text-gray-500">
            My amateur astrophotography journey documented
          </p>
        </div>

        {/* Mobile menu */}
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;