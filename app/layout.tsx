import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { createMetadata } from '@/lib/metadata'
import { cn } from '@/lib/utils'
import { Provider } from '@/providers'

const title = 'OG Tester'
const description = 'Test Open Graph and Twitter Card metadata'

export const metadata: Metadata = createMetadata(title, description)

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

type RootLayoutProps = {
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
        <Provider>
          <Header />
          <div className="container mx-auto h-[52px] sm:h-16 sm:border-x" />
          <main className="divide-y sm:border-b">{children}</main>
          <Footer />
        </Provider>
      </body>
    </html>
  )
}
