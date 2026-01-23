'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const isMounted = useSyncExternalStore(
    () => () => true,
    () => true,
    () => false
  )

  if (!isMounted) {
    return null
  }

  const themes = [
    {
      key: 'system',
      icon: Monitor,
      label: 'System theme'
    },
    {
      key: 'light',
      icon: Sun,
      label: 'Light theme'
    },
    {
      key: 'dark',
      icon: Moon,
      label: 'Dark theme'
    }
  ]

  return (
    <fieldset
      aria-label="Theme selection"
      className="relative flex h-8 items-center rounded-full border-none bg-background/30 p-1 ring-1 ring-border"
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key

        return (
          <button
            aria-label={label}
            aria-pressed={isActive}
            className="relative flex size-6 items-center justify-center"
            key={key}
            onClick={() => setTheme(key)}
            type="button"
          >
            {isActive ? (
              <motion.div
                className="absolute inset-0 rounded-full bg-muted/50 ring-1 ring-border"
                id="theme-switcher-indicator"
                layoutId="active-theme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            ) : null}
            <Icon
              aria-hidden="true"
              className={cn(
                'relative size-4',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            />
          </button>
        )
      })}
    </fieldset>
  )
}
