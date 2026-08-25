"use client";

import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/** One full sweep out to the sparsest shape and back. */
const PERIOD_MS = 8000;

/**
 * Axis stops rendered invisibly behind the word to hold its box open.
 *
 * `ELSH` is not advance-width neutral — measured on this family, "links" at
 * 54px runs 124px at one end of the axis and 129px in the middle. Left alone
 * the headline reflows around the word for the whole eight seconds. Stacking
 * every stop in one grid cell sizes that cell to the widest of them, so the
 * visible copy animates inside a box that never changes.
 */
const STOPS = [0, 25, 50, 75, 100];

/**
 * The hero word, drawn on Geist Pixel's element-shape axis.
 *
 * `ELSH` runs from 0, where every pixel is a filled square, to 100, where each
 * is a bare line. It is a real variable axis, so the word moves through the
 * shapes rather than cutting between the five static faces this used to load.
 *
 * Swept with a cosine rather than a sawtooth: the value eases at both ends and
 * returns the way it came, so the loop has no seam to notice.
 */
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
    // Ambient and endless, so it is opt-out rather than opt-in: under reduced
    // motion the word simply rests on the filled shape.
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
      start ??= now;
      const phase = ((now - start) % PERIOD_MS) / PERIOD_MS;
      const shape = Math.round(50 - 50 * Math.cos(phase * 2 * Math.PI));

      // Only when the shape actually changes. A full sweep covers 100 steps
      // in eight seconds, so at 60fps five frames in a row ask for the same
      // value — and each write re-shapes the glyphs, which forces a layout.
      if (shape !== written) {
        written = shape;
        // Straight to the node rather than through state: this runs for as
        // long as the page is open and React has no say in the outcome.
        word.style.fontVariationSettings = `"ELSH" ${shape}`;
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [shouldReduceMotion]);

  return (
    // `font-synthesis: none` because the family ships one weight and the
    // heading around it asks for more — without this the browser fakes it and
    // thickens every pixel.
    <span
      className={cn("inline-grid [font-synthesis:none]", className)}
      style={{ fontFamily: "var(--font-geist-pixel)" }}
    >
      {STOPS.map((stop) => (
        // `visibility: hidden` keeps these out of the accessibility tree as
        // well as off the screen, so the word is still announced once.
        <span
          aria-hidden="true"
          className="invisible [grid-area:1/1]"
          key={stop}
          style={{ fontVariationSettings: `"ELSH" ${stop}` }}
        >
          {children}
        </span>
      ))}
      {/* Starts at the filled shape, which is also where it stays under
          reduced motion and before the first frame lands. */}
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
