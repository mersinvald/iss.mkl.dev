import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import GoogleAnalytics from '@/components/GoogleAnalytics'
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
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-gray-900 text-gray-100`}>
        <GoogleAnalytics GA_MEASUREMENT_ID="G-P1X776M63Y" />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
