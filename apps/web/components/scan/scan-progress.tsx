"use client";

import { m, useReducedMotion } from "motion/react";

import type { ScanPhase } from "@/hooks/use-scanner-store";
import { DURATION, transition } from "@/lib/motion";

const SHINE_DURATION = 1.4;

interface ScanProgressProps {
  phase: ScanPhase;
  completedUrls: number;
  totalUrls: number;
  currentUrl?: string;
  currentScore?: number;
  domain: string;
}

export const ScanProgress = ({
  phase,
  completedUrls,
  totalUrls,
  currentUrl,
  currentScore,
  domain,
}: ScanProgressProps) => {
  const shouldReduceMotion = useReducedMotion();
  const percentage =
    totalUrls > 0 ? Math.round((completedUrls / totalUrls) * 100) : 0;
  const counted =
    totalUrls > 0 ? `${completedUrls} / ${totalUrls} pages` : "… pages";
  const target =
    phase === "checking" && currentUrl ? currentUrl : `resolving ${domain}…`;

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-4 border-b pb-3.5">
        <h2 className="text-foreground m-0 text-base font-semibold tracking-tight">
          Scan progress
        </h2>
        <span className="text-muted-foreground shrink-0 font-mono text-sm tabular-nums">
          {counted}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="bg-muted relative mt-4 h-1 w-full overflow-hidden rounded-full"
      >
        <m.div
          animate={{ x: `${percentage - 100}%` }}
          className="bg-foreground relative size-full overflow-hidden rounded-full"
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
                animate={{ x: ["-100%", "200%"] }}
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent"
                style={{ width: "50%" }}
                transition={{
                  duration: SHINE_DURATION,
                  ease: "linear",
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
            </m.div>
          )}
        </m.div>
      </div>

      <output aria-atomic="true" className="mt-5 block">
        <span className="text-muted-foreground block text-sm">
          Now checking
        </span>
        <span className="mt-1 flex items-baseline justify-between gap-3">
          <code
            className="text-foreground min-w-0 truncate font-mono text-sm"
            title={target}
          >
            {target}
          </code>
          {phase === "checking" && currentScore !== undefined ? (
            <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
              {`${currentScore} / 100`}
            </span>
          ) : null}
        </span>
      </output>

      <p className="text-muted-foreground mt-6 border-t pt-6 text-sm text-pretty">
        The pages checked so far are grouped into Open Graph, Core SEO, Twitter
        Card and Image validation once the scan settles.
      </p>
    </div>
  );
};
