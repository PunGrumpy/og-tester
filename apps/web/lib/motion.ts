import type { Transition } from "motion/react";

/**
 * One motion scale for the whole app.
 *
 * The numbers here are chosen for *perceptibility*, which is the thing the
 * previous pass got wrong. It paired a 6px travel with cubic-bezier(0.32,
 * 0.72, 0, 1) — a drawer curve that reaches 74% progress in the first 15% of
 * its duration. Traced in the browser, that meant opacity went 0 → 0.74 in
 * 25ms across 3 visible pixels: the content simply popped in. Motion that fast
 * over that little distance reads as no motion at all.
 *
 * So: a curve that spends its time where the eye can follow it, and enough
 * distance to be worth following.
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

/**
 * Gap between sibling blocks entering. Large enough to read as a sequence,
 * small enough that a five-block page still resolves inside ~600ms.
 */
export const STAGGER = 0.07;

/** Distance an entering element travels. Below ~10px nothing registers. */
export const TRAVEL = 14;

export const transition = (
  duration: number = DURATION.base,
  delay = 0
): Transition => ({ delay, duration, ease: EASE });

/**
 * Expand/collapse for disclosure rows — spread onto the <m.div> inside an
 * <AnimatePresence>. Animating height between 0 and "auto" is the one case
 * where a layout property is the right answer: motion measures the target and
 * runs a FLIP, whereas scaling an auto-sized reveal squashes its children.
 */
export const collapse = {
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  initial: { height: 0, opacity: 0 },
  transition: transition(DURATION.base),
} as const;
