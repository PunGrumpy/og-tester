import type { Transition } from "motion/react";

/**
 * One motion scale for the whole app, tuned for perceptibility: a curve that
 * spends its time where the eye can follow it, over enough distance to be
 * worth following.
 */

/**
 * easeOutCubic. Reaches ~58% at a quarter of the duration and ~88% at the
 * halfway point, so the movement is legible the whole way instead of being
 * over before it starts.
 */
export const EASE: [number, number, number, number] = [0.33, 1, 0.68, 1];

export const DURATION = {
  /** Enter/exit, expand/collapse. The default for anything appearing. */
  base: 0.24,
  /** Value animations — ring sweep, bar fill, score count-up. */
  data: 0.9,
  /** Hover, press, chevron rotation. Feedback that must feel immediate. */
  fast: 0.14,
  /** Phase changes that swap out a whole panel. */
  slow: 0.38,
} as const;

/** Distance an entering element travels. Below ~10px nothing registers. */
export const TRAVEL = 14;

export const transition = (
  duration: number = DURATION.base,
  delay = 0
): Transition => ({ delay, duration, ease: EASE });
