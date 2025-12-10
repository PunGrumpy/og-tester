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
    <div className="flex flex-col items-center justify-center gap-4">
      <ViewAnimation
        delay={0.8}
        initial={{ opacity: 0, translateY: -8 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <h1 className="font-bold text-5xl md:text-7xl">Open Graph Tester</h1>
      </ViewAnimation>
      <ViewAnimation
        delay={1.2}
        initial={{ opacity: 0, translateY: -8 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <p className="text-muted-foreground text-sm">
          Test your Open Graph metadata with this tool
        </p>
      </ViewAnimation>
    </div>
  </Section>
)
