'use client'

import { motion, useReducedMotion } from 'motion/react'
import { memo, type ReactNode, useMemo } from 'react'

interface ViewAnimationProps {
  initial?: Record<string, string | number>
  whileInView?: Record<string, string | number>
  animate?: Record<string, string | number>
  delay?: number
  // className?: ComponentProps<typeof motion.div>['className'];
  className?: string
  children: ReactNode
}

const VIEWPORT_CONFIG = { once: true, amount: 0.5 }

export const ViewAnimation = memo(function ViewAnimation({
  initial,
  whileInView,
  animate,
  delay,
  className,
  children
}: ViewAnimationProps) {
  const shouldReduceMotion = useReducedMotion()

  const initialProps = useMemo(
    () => ({ filter: 'blur(4px)', ...initial }),
    [initial]
  )

  const whileInViewProps = useMemo(
    () => ({ filter: 'blur(0px)', ...whileInView }),
    [whileInView]
  )

  const transition = useMemo(() => ({ delay, duration: 0.8 }), [delay])

  if (shouldReduceMotion) {
    return children
  }

  return (
    <motion.div
      animate={animate}
      className={className}
      initial={initialProps}
      transition={transition}
      viewport={VIEWPORT_CONFIG}
      whileInView={whileInViewProps}
    >
      {children}
    </motion.div>
  )
})
