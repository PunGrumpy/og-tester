import Link from 'next/link'

import { Prose } from '@/components/prose'
import { Section } from '@/components/section'
import { Button } from '@/components/ui/button'
import { ViewAnimation } from '@/providers/view-animation'

export default function NotFoundPage() {
  return (
    <Section className="border-t">
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-8">
        <ViewAnimation
          delay={0.2}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <h1 className="font-bold text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Not Found
          </h1>
        </ViewAnimation>

        <ViewAnimation
          delay={0.4}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Prose>The page you&apos;re looking for doesn&apos;t exist</Prose>
        </ViewAnimation>

        <ViewAnimation
          delay={0.6}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Button asChild variant="outline">
            <Link href="/">Go back home</Link>
          </Button>
        </ViewAnimation>
      </div>
    </Section>
  )
}
