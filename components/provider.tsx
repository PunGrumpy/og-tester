'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { Toaster } from './ui/sonner'
import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon
} from 'lucide-react'

export function Provider({ children, ...props }: ThemeProviderProps) {
  return (
    <>
      <Toaster
        position="top-center"
        icons={{
          success: <CircleCheckIcon size={18} />,
          error: <CircleXIcon size={18} />,
          warning: <CircleAlertIcon size={18} />,
          info: <InfoIcon size={18} />
        }}
      />
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </>
  )
}
