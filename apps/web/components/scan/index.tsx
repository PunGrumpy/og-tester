"use client";

import { AlertCircle, RotateCcw, BarChart3 } from "lucide-react";
import { m, AnimatePresence } from "motion/react";

import { SectionSeparator } from "@/components/section";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ViewAnimation } from "@/components/view-animation";
import { useScannerStore } from "@/hooks/use-scanner-store";
import { DURATION, STAGGER, transition, TRAVEL } from "@/lib/motion";

import { IssueSummary } from "./issue-summary";
import { PagesTable } from "./pages-table";
import { ScanProgress } from "./scan-progress";
import { ScoreDistribution } from "./score-distribution";
import { ScoreOverview } from "./score-overview";

// Each phase swaps out the whole panel, so they share one enter/exit.
const PHASE_MOTION = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -TRAVEL },
  initial: { opacity: 0, y: TRAVEL },
  transition: transition(DURATION.slow),
};

export const ScannerSection = () => {
  const {
    phase,
    completedUrls,
    totalUrls,
    currentUrl,
    currentScore,
    pages,
    averageScore,
    categoryAverages,
    summary,
    errorMsg,
    cancelScan,
    resetScan,
  } = useScannerStore();

  return (
    <>
      <SectionSeparator />

      <m.div id="scanner" className="scroll-mt-24">
        <div className="relative mx-auto max-w-7xl">
          <div className="md:border-x">
            <AnimatePresence mode="wait">
              {phase === "idle" && (
                <m.div key="idle" {...PHASE_MOTION}>
                  <div className="flex flex-col items-center justify-center min-h-[300px] bg-muted/2">
                    <Empty>
                      <EmptyMedia>
                        <BarChart3 className="size-12 text-muted-foreground/30" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle className="text-sm">
                          Site-wide scanner is ready
                        </EmptyTitle>
                        <EmptyDescription>
                          Enter a URL in the form above to check single-page
                          tags and audit site-wide metadata in real time.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                </m.div>
              )}

              {(phase === "discovery" || phase === "checking") && (
                <m.div key="progress" {...PHASE_MOTION}>
                  <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="flex w-full max-w-xl flex-col gap-6">
                      <ScanProgress
                        completedUrls={completedUrls}
                        currentScore={currentScore}
                        currentUrl={currentUrl}
                        phase={phase}
                        totalUrls={totalUrls}
                      />
                      <div className="flex justify-center">
                        <Button
                          variant="destructive"
                          className="px-6"
                          onClick={cancelScan}
                        >
                          Cancel scan
                        </Button>
                      </div>
                    </div>
                  </div>
                </m.div>
              )}

              {phase === "error" && (
                <m.div key="error" {...PHASE_MOTION}>
                  <div className="p-8 flex items-center justify-center min-h-[300px]">
                    <div className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center shadow-sm">
                      <div className="flex justify-center text-destructive">
                        <AlertCircle className="size-10" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-balance font-semibold text-foreground">
                          Scan failed
                        </h3>
                        <p className="text-pretty text-muted-foreground text-sm">
                          {errorMsg}
                        </p>
                      </div>
                      <Button className="px-5" onClick={resetScan}>
                        Try another URL
                      </Button>
                    </div>
                  </div>
                </m.div>
              )}

              {phase === "complete" && (
                <m.div key="complete" {...PHASE_MOTION}>
                  <div className="grid grid-cols-1 divide-y lg:grid-cols-[1fr_400px] lg:divide-x lg:divide-y-0">
                    <div className="col-span-full flex flex-col items-start justify-between gap-4 border-b bg-foreground/2 px-6 py-5 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <h2 className="text-balance font-semibold text-foreground text-lg tracking-tight">
                          Scanner report
                        </h2>
                        <p className="mt-0.5 text-pretty text-muted-foreground text-xs">
                          Site-wide metadata audit across every page we could
                          reach
                        </p>
                      </div>
                      <Button variant="outline" onClick={resetScan} size="sm">
                        <RotateCcw data-icon="inline-start" />
                        New scan
                      </Button>
                    </div>

                    {/* Blocks are grouped by space and headings rather than by
                        nested card borders, so the report is one box deep. */}
                    <div className="flex min-w-0 flex-col gap-10 p-6">
                      <ViewAnimation delay={0}>
                        <ScoreOverview
                          averageScore={averageScore}
                          categoryAverages={categoryAverages}
                        />
                      </ViewAnimation>
                      <ViewAnimation delay={STAGGER * 2}>
                        <PagesTable pages={pages} />
                      </ViewAnimation>
                    </div>

                    {/* The pages table can run to dozens of rows, so the
                        summary column sticks instead of being stretched to
                        match it — matching heights would just push the issue
                        list back to thousands of pixels. The sticky wrapper is
                        inside the cell so `divide-x` still draws full height. */}
                    <div className="min-w-0 p-6">
                      <div className="flex flex-col gap-10 lg:sticky lg:top-24">
                        <ViewAnimation delay={STAGGER}>
                          <ScoreDistribution summary={summary} />
                        </ViewAnimation>
                        <ViewAnimation delay={STAGGER * 3}>
                          <IssueSummary pages={pages} />
                        </ViewAnimation>
                      </div>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </m.div>
      <SectionSeparator />
    </>
  );
};
