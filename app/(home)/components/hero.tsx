import { Section } from '@/components/section'
import { ViewAnimation } from '@/components/view-animation'
import { cn } from '@/lib/utils'

export const Hero = () => (
  <Section
    className={cn(
      'aspect-2/1 select-none sm:aspect-3/1',
      'flex items-center justify-center',
      'pattern-background bg-foreground/2'
    )}
  >
    <ViewAnimation
      delay={0.8}
      initial={{ opacity: 0, translateY: -8 }}
      whileInView={{ opacity: 1, translateY: 0 }}
    >
      <h1 className="font-bold text-5xl md:text-7xl">OG Tester</h1>
    </ViewAnimation>
  </Section>
)
