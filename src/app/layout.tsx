import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { cookies } from 'next/headers'

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
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
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
