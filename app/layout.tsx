import React from "react"
import type { Metadata } from 'next'
import { Libre_Baskerville } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: '--font-libre',
  weight: ['400', '700'],
  style: ['normal', 'italic']
});

export const metadata: Metadata = {
  title: 'Soulhome | Transform Your Life Through Ancient Wisdom',
  description: 'Join our sacred community and access exclusive teachings, meditations, and spiritual resources. Monthly membership with unlimited downloads.',
  keywords: ['kundalini yoga', 'spiritual awakening', 'meditation', 'energy healing', 'chakras', 'consciousness'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest',
}

import { Preloader } from "@/components/preloader"
import { Toaster } from "@/components/ui/sonner"
import { CookieConsent } from "@/components/cookie-consent"
import { ContentProtection } from "@/components/content-protection"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${libreBaskerville.variable} font-serif antialiased bg-background text-foreground overflow-x-hidden w-full`}>
        <ContentProtection />
        <Preloader />
        <Analytics />
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  )
}
