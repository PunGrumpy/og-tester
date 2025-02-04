'use client'

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps
} from 'next-themes'

export function Provider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
