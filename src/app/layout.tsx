import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { NextIntlClientProvider } from 'next-intl'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Astrophotography Gallery",
  description: "Personal collection of deep sky objects",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Default to English for static export
  const locale = 'en';
  const messages = await import(`../../messages/${locale}.json`).then(m => m.default);

  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-gray-900 text-gray-100`}>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-P1X776M63Y" />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
