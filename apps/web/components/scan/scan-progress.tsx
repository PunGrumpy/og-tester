"use client";

import { m, useReducedMotion } from "motion/react";

import type { ScanPhase } from "@/hooks/use-scanner-store";
import { DURATION, transition } from "@/lib/motion";

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
    <div className="flex w-full flex-col gap-4">
      <output
        aria-atomic="true"
        className="flex items-center justify-between text-sm"
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
                className="bg-primary absolute inline-flex size-full rounded-full"
              />
            )}
            <span className="bg-primary relative inline-flex size-2.5 rounded-full" />
          </span>
          <span className="text-foreground font-medium">{phaseLabel}</span>
        </div>
        <span className="text-muted-foreground font-mono tabular-nums">
          {countLabel}
        </span>
      </output>

      <div
        aria-hidden="true"
        className="bg-muted relative h-1.5 w-full overflow-hidden rounded-full"
      >
        <m.div
          animate={{ x: `${percentage - 100}%` }}
          className="bg-primary relative size-full overflow-hidden rounded-full"
          initial={{ x: "-100%" }}
          transition={transition(DURATION.slow)}
        >
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

      {phase === "checking" && currentUrl && (
        <div className="text-muted-foreground animate-in fade-in flex items-center justify-between text-xs transition-none duration-240">
          <code
            className="text-muted-foreground max-w-[75%] truncate font-mono text-xs"
            title={currentUrl}
          >
            {currentUrl}
          </code>
          {currentScore !== undefined && (
            <div className="ml-2 flex shrink-0 items-center gap-1.5">
              <span className="text-muted-foreground text-xs">Score</span>
              <span className="text-foreground text-sm font-semibold tabular-nums">
                {currentScore}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
