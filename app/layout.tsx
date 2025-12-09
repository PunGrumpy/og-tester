import type { Metadata } from 'next'
import './globals.css'
import { fonts } from '@/lib/fonts'
import { createMetadata } from '@/lib/metadata'

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
      <body>{children}</body>
    </html>
  )
}
