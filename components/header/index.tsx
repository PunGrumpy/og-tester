'use client'

import Link from 'next/link'

import { Icons } from '@/components/icons'
import { HeaderProvider } from '@/components/providers/header-provider'
import { ViewAnimation } from '@/components/providers/view-animation'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <HeaderProvider className="container fixed top-0 right-0 left-0 z-50 mx-auto flex items-center justify-between bg-backdrop/90 px-4 py-2 backdrop-blur-md transition-all sm:border-x sm:py-4">
      <div className="w-32">
        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="size-8" />
          </Link>
        </ViewAnimation>
      </div>
      <div className="hidden w-32 justify-end md:flex">
        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          delay={0.8}
        >
          <Button variant="outline" size="sm" asChild>
            <Link
              href="https://www.pungrumpy.com/contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get in touch
            </Link>
          </Button>
        </ViewAnimation>
      </div>
    </HeaderProvider>
  )
}
