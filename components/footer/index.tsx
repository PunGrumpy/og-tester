import Link from 'next/link'
import { Status } from '@/components/footer/status'
import { cn } from '@/lib/utils'
import { ViewAnimation } from '@/providers/view-animation'
import { ThemeSwitcher } from './theme-switcher'

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
          delay={0.4}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Status />
        </ViewAnimation>
        <div className="flex items-center sm:justify-center">
          <ViewAnimation
            delay={0.8}
            initial={{ opacity: 0, translateY: -8 }}
            whileInView={{ opacity: 1, translateY: 0 }}
          >
            <p className="whitespace-nowrap text-muted-foreground text-sm">
              © {new Date().getFullYear()}{' '}
              <Link
                className="transition-colors hover:text-primary hover:underline"
                href="https://pungrumpy.com"
              >
                PunGrumpy
              </Link>
              . All rights reserved.
            </p>
          </ViewAnimation>
        </div>
        <div className="flex items-center sm:justify-end">
          <ViewAnimation
            delay={1.2}
            initial={{ opacity: 0, translateY: -8 }}
            whileInView={{ opacity: 1, translateY: 0 }}
          >
            <ThemeSwitcher />
          </ViewAnimation>
        </div>
      </div>
    </footer>
  )
}
