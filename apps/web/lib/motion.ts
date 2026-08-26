import type { Transition } from "motion/react";

export const EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];

export const DURATION = {
  base: 0.24,
  data: 0.9,
  fast: 0.14,
  slow: 0.38,
} as const;

export const TRAVEL = 14;

export const transition = (
  duration: number = DURATION.base,
  delay = 0
): Transition => ({ delay, duration, ease: EASE });
