"use client";

import { AlertCircle, RotateCcw, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { IssueSummary } from "@/components/scan/issue-summary";
import { PagesTable } from "@/components/scan/pages-table";
import { ScanProgress } from "@/components/scan/scan-progress";
import { ScoreDistribution } from "@/components/scan/score-distribution";
import { ScoreOverview } from "@/components/scan/score-overview";
import { Section, SectionSeparator } from "@/components/section";
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

      <motion.div id="scanner" className="scroll-mt-24">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ filter: "blur(4px)", opacity: 0, y: 12 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              exit={{ filter: "blur(4px)", opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Section className="flex flex-col items-center justify-center min-h-[300px] bg-muted/2">
                <Empty>
                  <EmptyMedia>
                    <BarChart3 className="size-12 text-muted-foreground/30" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle className="text-sm">
                      Site-Wide Scanner is Ready
                    </EmptyTitle>
                    <EmptyDescription>
                      Enter a URL in the form above to check single-page tags
                      and audit site-wide metadata in real-time.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </Section>
            </motion.div>
          )}

          {(phase === "discovery" || phase === "checking") && (
            <motion.div
              key="progress"
              initial={{ filter: "blur(4px)", opacity: 0, y: 12 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              exit={{ filter: "blur(4px)", opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Section className="p-8 flex flex-col items-center justify-center min-h-[300px]">
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
                      className="px-6 active:scale-[0.96] transition-transform duration-150 ease-out"
                      onClick={cancelScan}
                    >
                      Cancel Scan
                    </Button>
                  </div>
                </div>
              </Section>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              key="error"
              initial={{ filter: "blur(4px)", opacity: 0, y: 12 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              exit={{ filter: "blur(4px)", opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Section className="p-8 flex items-center justify-center min-h-[300px]">
                <div className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-destructive/10 bg-destructive/5 p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <div className="flex justify-center text-destructive">
                    <AlertCircle className="size-10" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-foreground text-balance">
                      Scan Failed
                    </h3>
                    <p className="text-sm text-muted-foreground text-pretty">
                      {errorMsg}
                    </p>
                  </div>
                  <Button
                    className="px-5 active:scale-[0.96] transition-transform duration-150 ease-out"
                    onClick={resetScan}
                  >
                    Try Another URL
                  </Button>
                </div>
              </Section>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ filter: "blur(4px)", opacity: 0, y: 12 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              exit={{ filter: "blur(4px)", opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Section className="grid grid-cols-1 lg:grid-cols-[1fr_420px] lg:divide-x divide-y lg:divide-y-0">
                <div className="col-span-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b px-6 py-4 bg-foreground/2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground text-balance">
                      Scanner Report
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5 text-pretty">
                      Complete overview for your site optimization audit
                    </p>
                  </div>
                  <Button
                    className="active:scale-[0.96] transition-transform duration-150 ease-out"
                    variant="outline"
                    onClick={resetScan}
                    size="sm"
                  >
                    <RotateCcw data-icon="inline-start" />
                    New Scan
                  </Button>
                </div>

                <div className="flex flex-col gap-6 p-6 min-w-0">
                  <ViewAnimation
                    delay={0.15}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <ScoreOverview
                      averageScore={averageScore}
                      categoryAverages={categoryAverages}
                    />
                  </ViewAnimation>
                  <ViewAnimation
                    delay={0.25}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <PagesTable pages={pages} />
                  </ViewAnimation>
                </div>

                <div className="flex flex-col gap-6 p-6 min-w-0">
                  <ViewAnimation
                    delay={0.2}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <ScoreDistribution summary={summary} />
                  </ViewAnimation>
                  <ViewAnimation
                    delay={0.3}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <IssueSummary pages={pages} />
                  </ViewAnimation>
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <SectionSeparator />
    </>
  );
};
