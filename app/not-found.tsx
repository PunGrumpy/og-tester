import { HomeIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/section'
import { Button } from '@/components/ui/button'
import { ViewAnimation } from '@/components/view-animation'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata(
  'Page Not Found | OG Tester',
  'The page you are looking for does not exist.'
)

const NotFound = () => (
  <Section className="flex h-dvh items-center justify-center">
    <div className="flex flex-col items-center justify-center gap-6">
      <ViewAnimation
        delay={0.8}
        initial={{ opacity: 0, translateY: -8 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <h1 className="text-balance text-center font-bold text-5xl md:text-7xl">
          Not Found
        </h1>
      </ViewAnimation>

      <ViewAnimation
        delay={1.2}
        initial={{ opacity: 0, translateY: -8 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <p className="max-w-2xl text-pretty text-center text-lg text-muted-foreground">
          The page you are looking for does not exist.
        </p>
      </ViewAnimation>

      <ViewAnimation
        delay={1.2}
        initial={{ opacity: 0, translateY: -8 }}
        whileInView={{ opacity: 1, translateY: 0 }}
      >
        <Button asChild size="lg" variant="outline">
          <Link href="/">
            <HomeIcon className="size-4" />
            Back to home
          </Link>
        </Button>
      </ViewAnimation>
    </div>
  </Section>
)

export default NotFound
