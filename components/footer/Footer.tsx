import Link from 'next/link'

import { Status } from '@/components/footer/Status'
import { ViewAnimation } from '@/components/providers/ViewAnimation'
import { cn } from '@/lib/utils'

import { ThemeSwitcher } from './ThemeSwitcher'

export function Footer() {
  return (
    <footer
      className={cn(
        'container mx-auto flex flex-col gap-4 px-4 py-8',
        'sm:gap-16 sm:px-8 sm:py-16'
      )}
    >
      <div className="grid items-center gap-4 sm:grid-cols-3">
        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          delay={0.4}
        >
          <Status />
        </ViewAnimation>
        <div className="flex items-center sm:justify-center">
          <ViewAnimation
            initial={{ opacity: 0, translateY: -8 }}
            whileInView={{ opacity: 1, translateY: 0 }}
            delay={0.8}
          >
            <p className="text-muted-foreground text-sm whitespace-nowrap">
              © {new Date().getFullYear()}{' '}
              <Link
                href="https://pungrumpy.com"
                className="hover:text-primary transition-colors hover:underline"
              >
                PunGrumpy
              </Link>
              . All rights reserved.
            </p>
          </ViewAnimation>
        </div>
        <div className="flex items-center sm:justify-end">
          <ViewAnimation
            initial={{ opacity: 0, translateY: -8 }}
            whileInView={{ opacity: 1, translateY: 0 }}
            delay={1.2}
          >
            <ThemeSwitcher />
          </ViewAnimation>
        </div>
      </div>
    </footer>
  )
}
