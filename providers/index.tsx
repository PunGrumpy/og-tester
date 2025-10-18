import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { AnalyticsProvider } from './analytics-provider'
import { ThemeProvider } from './theme-provider'

type ProviderProps = {
  readonly children: ReactNode
}

export const Provider = ({ children }: ProviderProps) => (
  <>
    <AnalyticsProvider />
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
    >
      {children}
      <Toaster />
    </ThemeProvider>
  </>
)
