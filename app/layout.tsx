import '@/app/globals.css'

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Provider } from '@/components/Provider'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_METADATA_BASE || 'http://localhost:3000'
  ),
  title: {
    default: 'OG Tester',
    template: `%s | OG Tester`
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
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'overscroll-contain font-sans antialiased',
          geistSans.variable,
          geistMono.variable
        )}
      >
        <Provider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="grow">{children}</main>
            <Footer />
          </div>
        </Provider>
      </body>
    </html>
  )
}
