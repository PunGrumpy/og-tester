'use client'

import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useIsScroll } from '@/hooks/use-scroll'
import { cn } from '@/lib/utils'
import { ViewAnimation } from '@/providers/view-animation'

export const Header = () => {
  const isScrolled = useIsScroll()

  return (
    <header
      className={cn(
        'container fixed top-0 right-0 left-0 z-50 mx-auto flex items-center justify-between bg-backdrop/90 px-4 py-2 backdrop-blur-md transition-all sm:border-x sm:py-4',
        isScrolled && 'border-b'
      )}
    >
      <div className="w-32">
        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Link className="flex items-center space-x-2" href="/">
            <Icons.logo className="size-8" />
          </Link>
        </ViewAnimation>
      </div>
      <div className="hidden w-32 justify-end md:flex">
        <ViewAnimation
          delay={0.8}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Button asChild size="sm" variant="outline">
            <Link
              href="https://www.pungrumpy.com/contact"
              rel="noopener noreferrer"
              target="_blank"
            >
              Get in touch
            </Link>
          </Button>
        </ViewAnimation>
      </div>
    </header>
  )
}
