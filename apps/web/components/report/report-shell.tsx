"use client";

import { AnimatePresence, m } from "motion/react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useRef } from "react";

import { ogAction } from "@/actions/og-action";
import { Container } from "@/components/layout";
import { ScanProgress } from "@/components/scan/scan-progress";
import { useOgStore } from "@/hooks/use-og-store";
import { useScannerStore } from "@/hooks/use-scanner-store";
import type { StoredScanReport } from "@/hooks/use-scanner-store";
import { parseError } from "@/lib/error";
import { DURATION, transition, TRAVEL } from "@/lib/motion";
import type { OgData } from "@/lib/schemas/og";

import { Findings } from "./findings";
import { PagesList } from "./pages-list";
import { Previews } from "./previews";
import { ReportSummary } from "./report-summary";
import { TagSections } from "./tag-sections";

interface ReportShellProps {
  domain: string;
  siteUrl: string;
  /** `null` when nothing has been scanned for this domain yet. */
  stored: { report: StoredScanReport; og: OgData } | null;
}

const ACTION_BUTTON_CLASS =
  "inline-flex h-9 items-center rounded-lg border px-4 text-sm transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none";

// Each phase swaps out the whole panel, so they share one enter/exit.
const PHASE_MOTION = {
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -TRAVEL },
  initial: { opacity: 0, y: TRAVEL },
  transition: transition(DURATION.slow),
};

/**
 * Puts a report on screen, from storage when there is one and from a live scan
 * when there is not.
 *
 * The two paths converge on the same stores, so everything below renders a
 * stored report and a running one identically — the only difference is where
 * the numbers came from.
 */
export const ReportShell = ({ domain, siteUrl, stored }: ReportShellProps) => {
  // One selector per field. Subscribing to the whole store re-rendered this
  // subtree on every scan event — measured at 34 for a 31-page site — even
  // though the previews and tag sections below read from a different store.
  const phase = useScannerStore((state) => state.phase);
  const completedUrls = useScannerStore((state) => state.completedUrls);
  const totalUrls = useScannerStore((state) => state.totalUrls);
  const currentUrl = useScannerStore((state) => state.currentUrl);
  const currentScore = useScannerStore((state) => state.currentScore);
  const pages = useScannerStore((state) => state.pages);
  const errorMsg = useScannerStore((state) => state.errorMsg);
  const cancelScan = useScannerStore((state) => state.cancelScan);
  const loadReport = useScannerStore((state) => state.loadReport);
  const startScan = useScannerStore((state) => state.startScan);
  const setResult = useOgStore((state) => state.setResult);
  const setLoading = useOgStore((state) => state.setLoading);
  const setOgError = useOgStore((state) => state.setError);
  // The entry page's tags land in one request, well before the crawl finishes,
  // so the previews fill in while the scan is still running.
  const { execute: fetchOg } = useAction(ogAction, {
    onError: ({ error }) =>
      setOgError(
        error.serverError
          ? parseError(error.serverError)
          : "Unable to read this page's tags."
      ),
    onSuccess: ({ data }) => setResult(siteUrl, data ?? {}),
  });
  // Stores outlive the route, so without this a second visit would replay the
  // scan on top of state the first one left behind.
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

  const isRunning = phase === "discovery" || phase === "checking";

  return (
    <div className="py-12">
      <AnimatePresence mode="wait">
        {isRunning && (
          <m.div key="progress" {...PHASE_MOTION}>
            {/* The page names itself from the first paint, not only once the
                crawl finishes — a scan can run for a minute, and until the
                summary renders this was a page with no heading at all. */}
            <Container className="flex flex-col items-center gap-6 border-b py-16">
              <div className="w-full max-w-xl text-center">
                <p className="font-mono text-muted-foreground text-sm">
                  {domain}
                </p>
                <h1 className="mt-2 text-balance font-semibold text-2xl tracking-tight">
                  Scanning the site
                </h1>
              </div>
              <div className="w-full max-w-xl">
                <ScanProgress
                  completedUrls={completedUrls}
                  currentScore={currentScore}
                  currentUrl={currentUrl}
                  phase={phase}
                  totalUrls={totalUrls}
                />
              </div>
              <button
                className={ACTION_BUTTON_CLASS}
                onClick={cancelScan}
                type="button"
              >
                Cancel scan
              </button>
            </Container>
          </m.div>
        )}

        {phase === "error" && (
          <m.div key="error" {...PHASE_MOTION}>
            <Container className="flex flex-col items-center gap-4 border-b py-16 text-center">
              <div className="flex flex-col gap-2">
                <p className="font-mono text-muted-foreground text-sm">
                  {domain}
                </p>
                <h1 className="text-balance font-semibold text-2xl tracking-tight">
                  Scan stopped
                </h1>
                <p className="max-w-md text-pretty text-muted-foreground text-sm">
                  {errorMsg}
                </p>
              </div>
              <button
                className={ACTION_BUTTON_CLASS}
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
            <ReportSummary domain={domain} />
          </m.div>
        )}
      </AnimatePresence>

      {/* Straight after the score: for a link-preview tool this is the answer
          the reader came for, and it arrives on the first request rather than
          waiting for the crawl. */}
      {phase !== "error" && <Previews />}

      {phase === "complete" && (
        <>
          <Findings pages={pages} />
          <PagesList pages={pages} />
        </>
      )}

      {phase !== "error" && <TagSections />}
    </div>
  );
};
