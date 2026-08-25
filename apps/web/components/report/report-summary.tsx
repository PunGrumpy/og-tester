"use client";

import {
  animate,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

import { Container } from "@/components/layout";
import type {
  CategoryAverages,
  PageScoreResult,
} from "@/hooks/use-scanner-store";
import { DURATION, EASE } from "@/lib/motion";
import {
  CATEGORY_META,
  getStanding,
  getVerdict,
  STANDING_LABEL,
  STANDING_TEXT,
  toPoints,
} from "@/lib/reports/verdict";
import { cn } from "@/lib/utils";

import { FixPromptButton } from "./fix-prompt-button";
import { ScoreDial } from "./score-dial";
import { ShareButton } from "./share-button";

const useCountUp = (value: number) => {
  const shouldReduceMotion = useReducedMotion();
  const raw = useMotionValue(value);

  useEffect(() => {
    if (shouldReduceMotion) {
      raw.set(value);
      return;
    }
    raw.jump(0);
    const controls = animate(raw, value, {
      duration: DURATION.data,
      ease: EASE,
    });
    return () => controls.stop();
  }, [raw, shouldReduceMotion, value]);

  return useTransform(raw, (v) => Math.round(v));
};

interface ReportSummaryProps {
  averageScore: number;
  categoryAverages: CategoryAverages;
  domain: string;
  onRescan: () => void;
  pages: PageScoreResult[];
  refreshing: boolean;
}

export const ReportSummary = ({
  averageScore,
  categoryAverages,
  domain,
  onRescan,
  pages,
  refreshing,
}: ReportSummaryProps) => {
  const displayed = useCountUp(averageScore);

  return (
    <Container className="grid gap-10 border-b pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
      <div className="min-w-0 lg:min-h-[22rem]">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-muted-foreground min-w-0 font-mono text-sm break-words">
            {domain}
          </p>
          <ShareButton />
        </div>

        <h1 className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:mt-4">
          {getVerdict(averageScore)}
        </h1>

        <div className="mt-6 flex min-h-28 items-center gap-5">
          <ScoreDial score={averageScore} />
          <div aria-hidden="true" className="flex items-baseline gap-1.5">
            <m.span className="text-7xl leading-none font-bold tracking-tighter tabular-nums sm:text-8xl">
              {displayed}
            </m.span>
            <span className="text-muted-foreground text-sm">/ 100</span>
          </div>
          <span className="sr-only">
            {`Score ${averageScore} out of 100 across ${pages.length} pages`}
          </span>
        </div>

        <div className="mt-8 max-w-lg">
          <FixPromptButton domain={domain} pages={pages} score={averageScore} />

          <div className="mt-2 flex justify-center">
            <button
              className="text-muted-foreground decoration-border hover:text-foreground hover:decoration-foreground focus-visible:ring-ring/50 disabled:text-muted-foreground/60 disabled:decoration-border/60 disabled:hover:text-muted-foreground/60 inline-flex min-h-6 items-center justify-center px-2 py-1 text-sm underline underline-offset-4 transition-colors focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:outline-none active:scale-[0.96] disabled:cursor-not-allowed"
              disabled={refreshing}
              onClick={onRescan}
              type="button"
            >
              {refreshing ? "Rescanning…" : "Rescan"}
            </button>
          </div>
        </div>
      </div>

      <ul className="m-0 min-w-0 list-none divide-y border-y p-0 lg:grid lg:min-h-[18rem] lg:grid-rows-4">
        {CATEGORY_META.map(({ id, label, max }) => {
          const percent = categoryAverages[id] || 0;
          const standing = getStanding(percent);
          return (
            <li key={id}>
              <a
                className="group hover:text-muted-foreground focus-visible:ring-ring/50 grid h-full gap-1 py-4 transition-colors focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                href={`#findings-${id}`}
              >
                <span>
                  <span className="text-foreground block font-medium group-hover:underline">
                    {label}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-sm">
                    <span
                      className={cn("font-medium", STANDING_TEXT[standing])}
                    >
                      {STANDING_LABEL[standing]}
                    </span>
                    {` · ${percent}% of pages clean`}
                  </span>
                </span>
                <span className="text-foreground flex items-center gap-2 text-sm tabular-nums sm:justify-end">
                  {`${toPoints(percent, max)} / ${max}`}
                  <span aria-hidden="true" className="text-muted-foreground">
                    →
                  </span>
                  <span className="sr-only">Jump to these findings</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </Container>
  );
};
