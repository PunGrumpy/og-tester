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
import { useScannerStore } from "@/hooks/use-scanner-store";
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
  const raw = useMotionValue(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      raw.set(value);
      return;
    }
    const controls = animate(raw, value, {
      duration: DURATION.data,
      ease: EASE,
    });
    return () => controls.stop();
  }, [raw, shouldReduceMotion, value]);

  return useTransform(raw, (v) => Math.round(v));
};

/**
 * The answer, above everything that explains it: what the site scored, what
 * that means in a sentence, and the one action worth taking next. The four
 * category rows beside it are the index into the findings below.
 */
export const ReportSummary = ({ domain }: { domain: string }) => {
  const averageScore = useScannerStore((state) => state.averageScore);
  const categoryAverages = useScannerStore((state) => state.categoryAverages);
  const pages = useScannerStore((state) => state.pages);
  const startScan = useScannerStore((state) => state.startScan);
  const displayed = useCountUp(averageScore);

  return (
    <Container className="grid gap-10 border-b pb-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
      <div className="min-w-0 lg:min-h-[22rem]">
        <div className="flex items-baseline justify-between gap-4">
          <p className="min-w-0 break-words font-mono text-muted-foreground text-sm">
            {domain}
          </p>
          <ShareButton />
        </div>

        <h1 className="mt-5 max-w-2xl text-balance font-semibold text-2xl tracking-tight sm:mt-4">
          {getVerdict(averageScore)}
        </h1>

        {/* The dial and the ticking figure are two halves of one reading, and
            a counter that announces every frame is unusable — so both are
            hidden and the resting value is stated once below. */}
        <div className="mt-6 flex min-h-28 items-center gap-5">
          <ScoreDial score={averageScore} />
          <div aria-hidden="true" className="flex items-baseline gap-1.5">
            <m.span className="font-bold text-7xl leading-none tracking-tighter tabular-nums sm:text-8xl">
              {displayed}
            </m.span>
            <span className="text-muted-foreground text-sm">/ 100</span>
          </div>
          <span className="sr-only">
            {`Score ${averageScore} out of 100 across ${pages.length} pages`}
          </span>
        </div>

        {/* One box for both, so Rescan centres under the button rather than
            under the whole column. */}
        <div className="mt-8 max-w-lg">
          <FixPromptButton domain={domain} pages={pages} score={averageScore} />

          <div className="mt-2 flex justify-center">
            <button
              className="inline-flex min-h-6 items-center justify-center px-2 py-1 text-muted-foreground text-sm underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              onClick={() => startScan(`https://${domain}`)}
              type="button"
            >
              Rescan
            </button>
          </div>
        </div>
      </div>

      {/* `lg:grid-rows-4` so the four rows divide the column evenly instead of
          bunching at the top beside a much taller neighbour. */}
      <ul className="m-0 min-w-0 list-none divide-y border-y p-0 lg:grid lg:min-h-[18rem] lg:grid-rows-4">
        {CATEGORY_META.map(({ id, label, max }) => {
          const percent = categoryAverages[id] || 0;
          const standing = getStanding(percent);
          return (
            <li key={id}>
              <a
                className="group grid h-full gap-1 py-4 transition-colors hover:text-muted-foreground focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                href={`#findings-${id}`}
              >
                <span>
                  <span className="block font-medium text-foreground group-hover:underline">
                    {label}
                  </span>
                  {/* The standing is a word, so the row never depends on the
                        hue beside it to be read. */}
                  <span className="mt-1 block text-muted-foreground text-sm">
                    <span
                      className={cn("font-medium", STANDING_TEXT[standing])}
                    >
                      {STANDING_LABEL[standing]}
                    </span>
                    {` · ${percent}% of pages clean`}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-foreground text-sm tabular-nums sm:justify-end">
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
