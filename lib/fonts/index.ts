import localFont from 'next/font/local'
import { cn } from '../utils'

const MartianGroteskSans = localFont({
  src: './MartianGrotesk-VFVF.woff2',
  variable: '--font-martian-grotesk'
})

const MartianMono = localFont({
  src: './MartianMono-Regular.woff2',
  variable: '--font-martian-mono'
})

export const fonts = cn(
  MartianGroteskSans.variable,
  MartianMono.variable,
  'touch-manipulation font-sans antialiased'
)
