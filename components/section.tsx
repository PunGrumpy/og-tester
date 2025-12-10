import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type SectionProps = HTMLAttributes<HTMLDivElement>

export const Section = ({ children, className, ...props }: SectionProps) => (
  <section {...props}>
    <div className="relative mx-auto max-w-6xl">
      <div className={cn('md:border-x', className)}>{children}</div>
    </div>
  </section>
)
