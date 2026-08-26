"use client";

import { AnimatePresence, m } from "motion/react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useRef } from "react";

import { ogAction } from "@/actions/og-action";
import { Container } from "@/components/layout";
import { ScanProgress } from "@/components/scan/scan-progress";
import { SECONDARY_BUTTON } from "@/components/secondary-button";
import { useOgStore } from "@/hooks/use-og-store";
import { useScannerStore } from "@/hooks/use-scanner-store";
import type { StoredScanReport } from "@/hooks/use-scanner-store";
import { parseError } from "@/lib/error";
import { DURATION, transition, TRAVEL } from "@/lib/motion";
import type { OgData } from "@/lib/schemas/og";

import { Findings } from "./findings";
import { PageTree } from "./page-tree";
import { PagesList } from "./pages-list";
import { PendingScore, SUMMARY_GRID, SUMMARY_MAIN } from "./pending-score";
import { Previews } from "./previews";
import { RefreshStatus } from "./refresh-status";
import { ReportSummary } from "./report-summary";
import { TagSections } from "./tag-sections";

interface ReportShellProps {
  domain: string;
  siteUrl: string;
  stored: { report: StoredScanReport; og: OgData } | null;
}

const PHASE_MOTION = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -TRAVEL },
  initial: { opacity: 0, y: TRAVEL },
  transition: transition(DURATION.slow),
};

const NO_CATEGORIES = { image: 0, og: 0, seo: 0, twitter: 0 };

export const ReportShell = ({ domain, siteUrl, stored }: ReportShellProps) => {
  const storePhase = useScannerStore((state) => state.phase);
  const storeAverageScore = useScannerStore((state) => state.averageScore);
  const storeCategoryAverages = useScannerStore(
    (state) => state.categoryAverages
  );
  const storePages = useScannerStore((state) => state.pages);
  const completedUrls = useScannerStore((state) => state.completedUrls);
  const totalUrls = useScannerStore((state) => state.totalUrls);
  const currentUrl = useScannerStore((state) => state.currentUrl);
  const currentScore = useScannerStore((state) => state.currentScore);
  const errorMsg = useScannerStore((state) => state.errorMsg);
  const refreshing = useScannerStore((state) => state.refreshing);
  const cancelScan = useScannerStore((state) => state.cancelScan);
  const loadReport = useScannerStore((state) => state.loadReport);
  const startScan = useScannerStore((state) => state.startScan);
  const storeOgUrl = useOgStore((state) => state.url);
  const storeOgData = useOgStore((state) => state.data);
  const storeOgStatus = useOgStore((state) => state.status);
  const storeOgError = useOgStore((state) => state.errorMessage);
  const setResult = useOgStore((state) => state.setResult);
  const setLoading = useOgStore((state) => state.setLoading);
  const setOgError = useOgStore((state) => state.setError);
  const { execute: fetchOg } = useAction(ogAction, {
    onError: ({ error }) =>
      setOgError(
        error.serverError
          ? parseError(error.serverError)
          : "Unable to read this page's tags."
      ),
    onSuccess: ({ data }) => setResult(siteUrl, data ?? {}),
  });
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      return;
    }
    hasRun.current = true;

    if (stored) {
      setResult(siteUrl, stored.og);
      loadReport(stored.report);
      return;
    }
    setLoading(siteUrl);
    fetchOg({ url: siteUrl });
    startScan(siteUrl);
  }, [fetchOg, loadReport, setLoading, setResult, siteUrl, startScan, stored]);

  const scan =
    storePhase === "idle" && stored
      ? {
          averageScore: stored.report.averageScore,
          categoryAverages: stored.report.categoryAverages,
          pages: stored.report.pages,
          phase: "complete" as const,
        }
      : {
          averageScore: storeAverageScore,
          categoryAverages:
            storePhase === "idle" ? NO_CATEGORIES : storeCategoryAverages,
          pages: storePages,
          phase: storePhase,
        };

  const og =
    storeOgUrl === "" && stored
      ? {
          data: stored.og,
          errorMessage: "",
          status: "ready" as const,
          url: siteUrl,
        }
      : {
          data: storeOgData,
          errorMessage: storeOgError,
          status: storeOgStatus,
          url: storeOgUrl || siteUrl,
        };

  const { phase } = scan;
  const isRunning = phase === "discovery" || phase === "checking";

  return (
    <div className="py-12">
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
                    onClick={cancelScan}
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
            <Container className="flex flex-col items-center gap-4 border-b py-16 text-center">
              <div className="flex flex-col gap-2">
                <p className="text-muted-foreground font-mono text-sm">
                  {domain}
                </p>
                <h1 className="text-2xl font-semibold tracking-tight text-balance">
                  Scan stopped
                </h1>
                <p className="text-muted-foreground max-w-md text-sm text-pretty">
                  {errorMsg}
                </p>
              </div>
              <button
                className={SECONDARY_BUTTON}
                onClick={() => startScan(siteUrl)}
                type="button"
              >
                Try again
              </button>
            </Container>
          </m.div>
        )}

        {phase === "complete" && (
          <m.div key="complete" {...PHASE_MOTION}>
            <ReportSummary
              averageScore={scan.averageScore}
              categoryAverages={scan.categoryAverages}
              domain={domain}
              onRescan={() => startScan(siteUrl)}
              pages={scan.pages}
              refreshing={refreshing}
            />
          </m.div>
        )}
      </AnimatePresence>

      {phase === "complete" && (
        <RefreshStatus
          active={refreshing}
          completed={completedUrls}
          total={totalUrls}
        />
      )}

      {phase !== "error" && (
        <Previews
          canRescan={phase === "complete"}
          data={og.data}
          errorMessage={og.errorMessage}
          status={og.status}
          url={og.url}
        />
      )}

      {phase === "complete" && (
        <>
          <Findings pages={scan.pages} />
          <PageTree pages={scan.pages} />
          <PagesList pages={scan.pages} />
        </>
      )}

      {phase !== "error" && (
        <TagSections
          canRescan={phase === "complete"}
          data={og.data}
          errorMessage={og.errorMessage}
          status={og.status}
        />
      )}
    </div>
  );
};
