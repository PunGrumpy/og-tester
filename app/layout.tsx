import '@/app/globals.css'

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { env } from '@/lib/env'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

const protocol = env.VERCEL_PROJECT_PRODUCTION_URL.includes('localhost')
  ? 'http'
  : 'https'
const siteUrl = new URL(`${protocol}://${env.VERCEL_PROJECT_PRODUCTION_URL}`)

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: 'OG Tester',
    template: '%s | OG Tester'
  },
  description: 'Test Open Graph and Twitter Card metadata',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  creator: 'PunGrumpy',
  authors: {
    name: 'Noppakorn Kaewsalabnil',
    url: 'https://pungrumpy.com'
  },
  keywords: [
    'Open Graph',
    'Twitter Card',
    'Metadata',
    'SEO',
    'Web Development'
  ],
  twitter: {
    card: 'summary_large_image',
    title: 'OG Tester',
    description: 'Test Open Graph and Twitter Card metadata',
    site: '@pungrumpy',
    images: [
      {
        url: '/twitter-card.png',
        width: 1920,
        height: 500,
        alt: 'Twitter Card Image'
      }
    ]
  },
  openGraph: {
    url: 'https://og.pungrumpy.com',
    type: 'website',
    title: 'OG Tester',
    siteName: 'OG Tester',
    description: 'Test Open Graph and Twitter Card metadata',
    locale: 'en-US',
    images: [
      {
        url: '/og-image.png',
        width: 1920,
        height: 1080,
        alt: 'Open Graph Image',
        type: 'image/png'
      }
    ]
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ]
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' }
  ]
}

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['ui-sans-serif', 'system-ui'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  fallback: ['ui-monospace', 'monospace'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true
})

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'overflow-x-hidden overscroll-contain bg-backdrop font-sans antialiased',
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <div className="container mx-auto h-[52px] sm:h-16 sm:border-x" />
          <main className="divide-y sm:border-b">{children}</main>
          <Footer />
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}
