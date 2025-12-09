'use client'

import { useMotionValueEvent, useScroll } from 'motion/react'
import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Icons } from '../icons'
import { Section } from '../section'
import { Button } from '../ui/button'
import { ViewAnimation } from '../view-animation'

export const Header = () => {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  useMotionValueEvent(scrollY, 'change', latestValue => {
    setScrolled(latestValue >= 8)
  })

  return (
    <header
      className={cn(
        'sticky top-0 z-50 max-w-screen overflow-x-hidden bg-background',
        'data-[scrolled=true]:shadow-2xs dark:data-[scrolled=true]:shadow-xs',
        'not-dark:data-[scrolled=true]:**:data-header-container:after:bg-border',
        'transition-shadow duration-300'
      )}
      data-scrolled={scrolled}
    >
      <Section
        className="flex items-center justify-between p-6"
        data-header-container
      >
        <ViewAnimation
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Link className="flex items-center space-x-2" href="/">
            <Icons.logo className="size-8" />
          </Link>
        </ViewAnimation>

        <ViewAnimation
          className="hidden w-32 justify-end md:flex"
          delay={0.4}
          initial={{ opacity: 0, translateY: -8 }}
          whileInView={{ opacity: 1, translateY: 0 }}
        >
          <Button asChild size="sm" variant="outline">
            <Link
              className="font-extralight"
              href="https://www.pungrumpy.com/contact"
              rel="noopener noreferrer"
              target="_blank"
            >
              Get in touch
            </Link>
          </Button>
        </ViewAnimation>
      </Section>
    </header>
  )
}
