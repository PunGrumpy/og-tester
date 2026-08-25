"use client";

import { m, useReducedMotion } from "motion/react";

import type { ScanPhase } from "@/hooks/use-scanner-store";
import { DURATION, transition } from "@/lib/motion";

// Ambient loops sit outside the interaction scale — they signal "still working"
// rather than responding to input, so they run slower than anything in DURATION.
const PULSE_DURATION = 1.2;
const SHINE_DURATION = 1.4;

interface ScanProgressProps {
  phase: ScanPhase;
  completedUrls: number;
  totalUrls: number;
  currentUrl?: string;
  currentScore?: number;
}

export const ScanProgress = ({
  phase,
  completedUrls,
  totalUrls,
  currentUrl,
  currentScore,
}: ScanProgressProps) => {
  const shouldReduceMotion = useReducedMotion();
  const percentage =
    totalUrls > 0 ? Math.round((completedUrls / totalUrls) * 100) : 0;

  const phaseLabel =
    phase === "discovery" ? "Discovering pages…" : "Scanning pages…";
  const countLabel =
    phase === "discovery"
      ? ""
      : `${completedUrls} / ${totalUrls} (${percentage}%)`;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* <output> carries an implicit role="status", so the scan reports
          progress to screen readers without an explicit live region. */}
      <output
        aria-atomic="true"
        className="flex justify-between items-center text-sm"
      >
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="relative flex size-2.5">
            {shouldReduceMotion ? null : (
              <m.span
                animate={{ opacity: [0.75, 0], scale: [1, 2.2] }}
                transition={{
                  ...transition(PULSE_DURATION),
                  repeat: Number.POSITIVE_INFINITY,
                }}
                className="absolute inline-flex size-full rounded-full bg-primary"
              />
            )}
            <span className="relative inline-flex rounded-full size-2.5 bg-primary" />
          </span>
          <span className="font-medium text-foreground">{phaseLabel}</span>
        </div>
        <span className="font-mono text-muted-foreground tabular-nums">
          {countLabel}
        </span>
      </output>

      {/* Decorative. The <output> above is a live region already carrying the
          phase and the "17 / 50 (34%)" count, so a progressbar role here would
          announce the same value a second time. */}
      <div
        aria-hidden="true"
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        {/* Full width and slid in from the left rather than grown by width:
            animating width re-runs layout on every scan event, while a
            transform stays on the compositor. */}
        <m.div
          animate={{ x: `${percentage - 100}%` }}
          className="size-full bg-primary rounded-full relative overflow-hidden"
          initial={{ x: "-100%" }}
          transition={transition(DURATION.slow)}
        >
          {/* Animated scanning shine. Counter-translated by the same amount as
              the fill, so it keeps sweeping the part of the bar that is on
              screen instead of the clipped tail off to the left. */}
          {shouldReduceMotion ? null : (
            <m.div
              animate={{ x: `${100 - percentage}%` }}
              className="absolute inset-0"
              initial={{ x: "100%" }}
              transition={transition(DURATION.slow)}
            >
              <m.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: SHINE_DURATION,
                  ease: "linear",
                  repeat: Number.POSITIVE_INFINITY,
                }}
                style={{ width: "50%" }}
              />
            </m.div>
          )}
        </m.div>
      </div>

      {/* `transition-none` below because `duration-240` is there for the enter
          keyframes: on its own it sets transition-duration with no
          transition-property, which CSS defaults to `all`. */}
      {phase === "checking" && currentUrl && (
        <div className="flex justify-between items-center text-xs text-muted-foreground animate-in fade-in duration-240 transition-none">
          <code
            className="max-w-[75%] truncate font-mono text-muted-foreground text-xs"
            title={currentUrl}
          >
            {currentUrl}
          </code>
          {currentScore !== undefined && (
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              <span className="text-muted-foreground text-xs">Score</span>
              <span className="font-semibold text-foreground text-sm tabular-nums">
                {currentScore}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
