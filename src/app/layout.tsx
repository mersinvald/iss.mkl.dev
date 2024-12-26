// src/app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Astrophotography Gallery",
  description: "Personal collection of deep sky objects",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-gray-900 text-gray-100`}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        {children}
      </body>
    </html>
  )
}