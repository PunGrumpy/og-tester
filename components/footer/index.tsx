import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Section } from '../section'
import { ViewAnimation } from '../view-animation'
import { Status } from './status'
import { ThemeSwitcher } from './theme-switcher'

export const Footer = () => (
  <footer>
    <Section
      className={cn(
        'px-4 py-8 md:px-8',
        'grid items-center gap-4 sm:grid-cols-3'
      )}
    >
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
    </Section>
  </footer>
)
