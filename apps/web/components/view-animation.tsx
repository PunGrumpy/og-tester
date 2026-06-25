"use client";

import type { Transition } from "motion/react";
import { m } from "motion/react";
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

const VIEWPORT_CONFIG = { amount: "some" as const, once: true };

export const ViewAnimation = memo(
  ({
    initial,
    whileInView,
    animate,
    delay,
    className,
    children,
  }: ViewAnimationProps) => {
    const initialProps = useMemo(
      () => ({ filter: "blur(4px)", ...initial }),
      [initial]
    );

    const whileInViewProps = useMemo(
      () => ({ filter: "blur(0px)", ...whileInView }),
      [whileInView]
    );

    const transition = useMemo(
      () =>
        ({
          delay,
          duration: 0.35,
          ease: [0.23, 1, 0.32, 1],
        }) as Transition,
      [delay]
    );

    return (
      <m.div
        inherit={false}
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
