'use client'

import { motion } from 'framer-motion'
import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
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
    <div className="relative flex h-8 rounded-full bg-backdrop p-1 ring-1 ring-border">
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key

        return (
          <button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => setTheme(key)}
            type="button"
          >
            {isActive ? (
              <motion.div
                className="absolute inset-0 rounded-full bg-background"
                layoutId="activeTheme"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            ) : null}
            <Icon
              className={cn(
                'relative m-auto h-4 w-4',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
