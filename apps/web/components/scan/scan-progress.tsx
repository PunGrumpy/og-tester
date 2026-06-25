"use client";

import { m } from "motion/react";

import type { ScanPhase } from "@/hooks/use-scanner-store";

import { ScoreBadge } from "./score-badge";

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
  const percentage =
    totalUrls > 0 ? Math.round((completedUrls / totalUrls) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <m.span
              animate={{ opacity: [0.75, 0], scale: [1, 2.2] }}
              transition={{
                duration: 1.2,
                ease: [0.23, 1, 0.32, 1],
                repeat: Infinity,
              }}
              className="absolute inline-flex h-full w-full rounded-full bg-primary"
            />
            <span className="relative inline-flex rounded-full size-2.5 bg-primary" />
          </span>
          <span className="font-medium text-foreground capitalize">
            {phase === "discovery"
              ? "Discovering pages..."
              : `Scanning pages...`}
          </span>
        </div>
        <span className="font-mono text-muted-foreground tabular-nums">
          {phase === "discovery"
            ? ""
            : `${completedUrls} / ${totalUrls} (${percentage}%)`}
        </span>
      </div>

      <div className="h-3 w-full bg-muted/40 dash-background border rounded-full overflow-hidden relative">
        <m.div
          animate={{ width: `${percentage}%` }}
          className="h-full bg-primary rounded-full relative overflow-hidden"
          initial={{ width: "0%" }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Animated scanning shine */}
          <m.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
            style={{ width: "50%" }}
          />
        </m.div>
      </div>

      {phase === "checking" && currentUrl && (
        <div className="flex justify-between items-center text-xs text-muted-foreground animate-in fade-in duration-200">
          <code className="truncate max-w-[75%] bg-muted/60 border px-1.5 py-0.5 rounded font-mono text-[10px] text-foreground/80">
            {currentUrl}
          </code>
          {currentScore !== undefined && (
            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              <span className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-wider">
                Score:
              </span>
              <ScoreBadge score={currentScore} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
