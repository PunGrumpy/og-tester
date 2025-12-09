import { Geist } from 'next/font/google'
import localFont from 'next/font/local'
import { cn } from '../utils'

const GeistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans'
})
const MartianMono = localFont({
  src: './MartianMono-Regular.woff2',
  variable: '--font-martian-mono'
})

export const fonts = cn(
  GeistSans.variable,
  MartianMono.variable,
  'touch-manipulation font-sans antialiased'
)
