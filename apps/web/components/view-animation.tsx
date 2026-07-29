"use client";

import { m, useReducedMotion } from "motion/react";
import { memo, useMemo } from "react";
import type { ReactNode } from "react";

import { DURATION, transition as makeTransition, TRAVEL } from "@/lib/motion";

interface ViewAnimationProps {
  initial?: Record<string, string | number>;
  whileInView?: Record<string, string | number>;
  animate?: Record<string, string | number>;
  delay?: number;
  className?: string;
  children: ReactNode;
}

const VIEWPORT_CONFIG = { amount: "some" as const, once: true };

// Entering content always rises the same short distance. Call sites used to
// hand-roll this and drifted into two directions and two magnitudes.
const DEFAULT_INITIAL = { opacity: 0, translateY: TRAVEL };
const DEFAULT_WHILE_IN_VIEW = { opacity: 1, translateY: 0 };

export const ViewAnimation = memo(
  ({
    initial = DEFAULT_INITIAL,
    whileInView = DEFAULT_WHILE_IN_VIEW,
    animate,
    delay = 0,
    className,
    children,
  }: ViewAnimationProps) => {
    const shouldReduceMotion = useReducedMotion();

    // Under reduced motion this collapses to a plain opacity crossfade with no
    // delay. The property keys stay identical either way, otherwise the inline
    // styles written before hydration are never animated back to rest.
    const transition = useMemo(
      () =>
        makeTransition(
          shouldReduceMotion ? DURATION.fast : DURATION.base,
          shouldReduceMotion ? 0 : delay
        ),
      [delay, shouldReduceMotion]
    );

    return (
      <m.div
        inherit={false}
        animate={animate}
        className={className}
        initial={initial}
        transition={transition}
        viewport={VIEWPORT_CONFIG}
        whileInView={whileInView}
      >
        {children}
      </m.div>
    );
  }
);
