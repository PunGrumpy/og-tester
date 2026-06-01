"use client";

import { m, useReducedMotion } from "motion/react";
import { memo, useMemo } from "react";
import type { ReactNode } from "react";

interface ViewAnimationProps {
  initial?: Record<string, string | number>;
  whileInView?: Record<string, string | number>;
  animate?: Record<string, string | number>;
  delay?: number;
  // className?: ComponentProps<typeof motion.div>['className'];
  className?: string;
  children: ReactNode;
}

const VIEWPORT_CONFIG = { amount: 0.5, once: true };

export const ViewAnimation = memo(
  ({
    initial,
    whileInView,
    animate,
    delay,
    className,
    children,
  }: ViewAnimationProps) => {
    const shouldReduceMotion = useReducedMotion();

    const initialProps = useMemo(
      () => ({ filter: "blur(4px)", ...initial }),
      [initial]
    );

    const whileInViewProps = useMemo(
      () => ({ filter: "blur(0px)", ...whileInView }),
      [whileInView]
    );

    const transition = useMemo(
      () => ({
        delay,
        duration: 0.6,
        ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
      }),
      [delay]
    );

    if (shouldReduceMotion) {
      return children;
    }

    return (
      <m.div
        animate={animate}
        className={className}
        initial={initialProps}
        transition={transition}
        viewport={VIEWPORT_CONFIG}
        whileInView={whileInViewProps}
      >
        {children}
      </m.div>
    );
  }
);
