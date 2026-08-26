"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const PERIOD_MS = 8000;

const STOPS = [0, 25, 50, 75, 100];

export const PixelCycle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const word = wordRef.current;
    if (!word) {
      return;
    }

    let frame = 0;
    let start: number | null = null;
    let written = -1;

    const step = (now: number) => {
      if (start === null) {
        start = now;
      }
      const phase = ((now - start) % PERIOD_MS) / PERIOD_MS;
      const shape = Math.round(50 - 50 * Math.cos(phase * 2 * Math.PI));

      if (shape !== written) {
        written = shape;
        word.style.fontVariationSettings = `"ELSH" ${shape}`;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [shouldReduceMotion]);

  return (
    <span
      className={cn("inline-grid [font-synthesis:none]", className)}
      style={{ fontFamily: "var(--font-geist-pixel)" }}
    >
      {STOPS.map((stop) => (
        <span
          aria-hidden="true"
          className="invisible [grid-area:1/1]"
          key={stop}
          style={{ fontVariationSettings: `"ELSH" ${stop}` }}
        >
          {children}
        </span>
      ))}
      <span
        className="[grid-area:1/1]"
        ref={wordRef}
        style={{ fontVariationSettings: '"ELSH" 0' }}
      >
        {children}
      </span>
    </span>
  );
};
