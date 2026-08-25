"use client";

import { m, useReducedMotion } from "motion/react";

import { DURATION, transition } from "@/lib/motion";

const SIZE = 104;
const RADIUS = SIZE / 4;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * A filled pie rather than a ring: at a glance the eye reads "how much of the
 * disc is dark", which is the same question the score asks. Drawn with a
 * stroke of half the diameter on a half-radius circle, so one element covers
 * the whole face and the sweep is a dash offset.
 *
 * Decorative — the figure beside it carries the value, and the wrapper in
 * `report-summary` names both for assistive technology.
 */
export const ScoreDial = ({ score }: { score: number }) => {
  const shouldReduceMotion = useReducedMotion();
  const filled = (Math.min(Math.max(score, 0), 100) / 100) * CIRCUMFERENCE;

  return (
    <svg
      aria-hidden="true"
      className="shrink-0 -rotate-90"
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={SIZE}
    >
      <circle className="fill-muted" cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2} />
      <m.circle
        animate={{ strokeDasharray: `${filled} ${CIRCUMFERENCE}` }}
        className="fill-none stroke-foreground"
        cx={SIZE / 2}
        cy={SIZE / 2}
        initial={
          shouldReduceMotion
            ? { strokeDasharray: `${filled} ${CIRCUMFERENCE}` }
            : { strokeDasharray: `0 ${CIRCUMFERENCE}` }
        }
        r={RADIUS}
        strokeWidth={SIZE / 2}
        transition={transition(DURATION.data)}
      />
    </svg>
  );
};
