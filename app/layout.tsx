import './globals.css'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { fonts } from '@/lib/fonts'
import { createMetadata } from '@/lib/metadata'
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

type RootLayoutProps = {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={fonts} lang="en" suppressHydrationWarning>
      <body className="overflow-x-hidden overscroll-contain bg-backdrop font-sans antialiased">
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
