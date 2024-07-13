'use client'

import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon
} from 'lucide-react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import * as React from 'react'

import { Toaster } from './ui/sonner'

export function Provider({ children, ...props }: ThemeProviderProps) {
  return (
    <>
      <NextThemesProvider {...props}>
        {children}
        <Toaster
          position="top-center"
          icons={{
            success: <CircleCheckIcon size={18} />,
            error: <CircleXIcon size={18} />,
            warning: <CircleAlertIcon size={18} />,
            info: <InfoIcon size={18} />
          }}
        />
      </NextThemesProvider>
    </>
  )
}
