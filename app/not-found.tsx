import Link from 'next/link'

import { Prose } from '@/components/prose'
import { ViewAnimation } from '@/components/providers/view-animation'
import { Section } from '@/components/section'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <Section className="border-t">
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 p-8">
        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          delay={0.2}
        >
          <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl md:text-5xl">
            Not Found
          </h1>
        </ViewAnimation>

        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          delay={0.4}
        >
          <Prose>The page you&apos;re looking for doesn&apos;t exist</Prose>
        </ViewAnimation>

        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
          delay={0.6}
        >
          <Button asChild variant="outline">
            <Link href="/">Go back home</Link>
          </Button>
        </ViewAnimation>
      </div>
    </Section>
  )
}
