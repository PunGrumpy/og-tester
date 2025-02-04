'use client'

import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

import { Icons } from './Icons'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo />
        </Link>
        <nav>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle Theme"
            className="mr-6"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <SunIcon className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <MoonIcon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle Theme</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
