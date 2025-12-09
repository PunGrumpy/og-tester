import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/header'
import { fonts } from '@/lib/fonts'
import { createMetadata } from '@/lib/metadata'
import { HooksProvider } from '@/providers/hooks'
import { ThemeProvider } from '@/providers/theme'

export const metadata: Metadata = createMetadata(
  'OG Tester',
  'Test your Open Graph metadata with this tool'
)

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={fonts} lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <main className="divide-y">
            <Header />
            {children}
          </main>
        </ThemeProvider>

        <HooksProvider />
      </body>
    </html>
  )
}
