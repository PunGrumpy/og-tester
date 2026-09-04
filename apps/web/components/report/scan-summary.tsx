"use client";

import { AnimatePresence, m } from "motion/react";

import { Container } from "@/components/layout";
import { ScanProgress } from "@/components/scan/scan-progress";
import { SECONDARY_BUTTON } from "@/components/secondary-button";
import type {
  CategoryAverages,
  PageScoreResult,
  ScanPhase,
} from "@/hooks/use-scanner-store";
import { DURATION, transition, TRAVEL } from "@/lib/motion";

import { PendingScore, SUMMARY_GRID, SUMMARY_MAIN } from "./pending-score";
import { ReportSummary } from "./report-summary";

const PHASE_MOTION = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -TRAVEL },
  initial: { opacity: 0, y: TRAVEL },
  transition: transition(DURATION.slow),
};

/** The summary slot when a scan ended without a score: an error or a cancel. */
const StoppedNotice = ({
  action,
  domain,
  message,
  onAction,
}: {
  action: string;
  domain: string;
  message: string;
  onAction: () => void;
}) => (
  <Container className="flex flex-col items-center gap-4 border-b py-16 text-center">
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground font-mono text-sm">{domain}</p>
      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        Scan stopped
      </h1>
      <p className="text-muted-foreground max-w-md text-sm text-pretty">
        {message}
      </p>
    </div>
    <button className={SECONDARY_BUTTON} onClick={onAction} type="button">
      {action}
    </button>
  </Container>
);

interface ScanSummaryProps {
  domain: string;
  phase: ScanPhase;
  averageScore: number;
  categoryAverages: CategoryAverages;
  pages: PageScoreResult[];
  completedUrls: number;
  totalUrls: number;
  currentUrl: string;
  currentScore: number | undefined;
  errorMsg: string;
  refreshing: boolean;
  onCancel: () => void;
  onStart: () => void;
}

/**
 * The slot above the report sections: progress while the scan runs, a
 * notice when it stopped short, and the score once it is complete.
 */
export const ScanSummary = ({
  domain,
  phase,
  averageScore,
  categoryAverages,
  pages,
  completedUrls,
  totalUrls,
  currentUrl,
  currentScore,
  errorMsg,
  refreshing,
  onCancel,
  onStart,
}: ScanSummaryProps) => {
  const isRunning = phase === "discovery" || phase === "checking";

  return (
    <AnimatePresence mode="wait">
      {isRunning && (
        <m.div key="progress" {...PHASE_MOTION}>
          <Container className={SUMMARY_GRID}>
            <div className={SUMMARY_MAIN}>
              <p className="text-muted-foreground min-w-0 font-mono text-sm break-words">
                {domain}
              </p>

              <h1 className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:mt-4">
                Reading the tags across the site
              </h1>

              <PendingScore caption="Final score appears when every page has been checked." />

              <div className="mt-8 max-w-lg">
                <button
                  className={SECONDARY_BUTTON}
                  onClick={onCancel}
                  type="button"
                >
                  Cancel scan
                </button>
              </div>
            </div>

            <ScanProgress
              completedUrls={completedUrls}
              currentScore={currentScore}
              currentUrl={currentUrl}
              domain={domain}
              phase={phase}
              totalUrls={totalUrls}
            />
          </Container>
        </m.div>
      )}

      {phase === "error" && (
        <m.div key="error" {...PHASE_MOTION}>
          <StoppedNotice
            action="Try again"
            domain={domain}
            message={errorMsg}
            onAction={onStart}
          />
        </m.div>
      )}

      {phase === "cancelled" && (
        <m.div key="cancelled" {...PHASE_MOTION}>
          <StoppedNotice
            action="Scan again"
            domain={domain}
            message="You cancelled the scan before it finished, so there is no score yet."
            onAction={onStart}
          />
        </m.div>
      )}

      {phase === "complete" && (
        <m.div key="complete" {...PHASE_MOTION}>
          <ReportSummary
            averageScore={averageScore}
            categoryAverages={categoryAverages}
            domain={domain}
            onRescan={onStart}
            pages={pages}
            refreshing={refreshing}
          />
        </m.div>
      )}
    </AnimatePresence>
  );
};
