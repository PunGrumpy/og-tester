"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useRef } from "react";

import { ogAction } from "@/actions/og-action";
import type { OgStatus } from "@/hooks/use-og-store";
import { useOgStore } from "@/hooks/use-og-store";
import type {
  CategoryAverages,
  PageScoreResult,
  ScanPhase,
  StoredScanReport,
} from "@/hooks/use-scanner-store";
import { useScannerStore } from "@/hooks/use-scanner-store";
import { parseError } from "@/lib/error";
import type { OgData } from "@/lib/schemas/og";

import { Findings } from "./findings";
import { PageTree } from "./page-tree";
import { PagesList } from "./pages-list";
import { Previews } from "./previews";
import { RefreshStatus } from "./refresh-status";
import { ScanSummary } from "./scan-summary";
import { TagSections } from "./tag-sections";

type Stored = { report: StoredScanReport; og: OgData } | null;

interface ReportShellProps {
  domain: string;
  siteUrl: string;
  stored: Stored;
}

const NO_CATEGORIES = { image: 0, og: 0, seo: 0, twitter: 0 };

interface ScanView {
  averageScore: number;
  categoryAverages: CategoryAverages;
  pages: PageScoreResult[];
  phase: ScanPhase;
}

/** Until the store has run anything, a stored report stands in for it. */
const resolveScan = (store: ScanView, stored: Stored): ScanView => {
  if (store.phase === "idle" && stored) {
    return {
      averageScore: stored.report.averageScore,
      categoryAverages: stored.report.categoryAverages,
      pages: stored.report.pages,
      phase: "complete",
    };
  }
  return {
    ...store,
    categoryAverages:
      store.phase === "idle" ? NO_CATEGORIES : store.categoryAverages,
  };
};

interface OgView {
  data: OgData;
  errorMessage: string;
  status: OgStatus;
  url: string;
}

/** Same rule for the page's own tags: stored until the store has a URL. */
const resolveOg = (store: OgView, stored: Stored, siteUrl: string): OgView => {
  if (store.url === "" && stored) {
    return { data: stored.og, errorMessage: "", status: "ready", url: siteUrl };
  }
  return { ...store, url: store.url || siteUrl };
};

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
          : "Unable to read this page’s tags."
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

  const scan = resolveScan(
    {
      averageScore: storeAverageScore,
      categoryAverages: storeCategoryAverages,
      pages: storePages,
      phase: storePhase,
    },
    stored
  );
  const og = resolveOg(
    {
      data: storeOgData,
      errorMessage: storeOgError,
      status: storeOgStatus,
      url: storeOgUrl,
    },
    stored,
    siteUrl
  );

  const { phase } = scan;
  const isComplete = phase === "complete";
  const hasPage = phase !== "error";
  const canRescan = isComplete || phase === "cancelled";
  const start = () => startScan(siteUrl);

  return (
    <div className="py-12">
      <ScanSummary
        averageScore={scan.averageScore}
        categoryAverages={scan.categoryAverages}
        completedUrls={completedUrls}
        currentScore={currentScore}
        currentUrl={currentUrl}
        domain={domain}
        errorMsg={errorMsg}
        onCancel={cancelScan}
        onStart={start}
        pages={scan.pages}
        phase={phase}
        refreshing={refreshing}
        totalUrls={totalUrls}
      />

      {isComplete && (
        <RefreshStatus
          active={refreshing}
          completed={completedUrls}
          total={totalUrls}
        />
      )}

      {hasPage && (
        <Previews
          canRescan={canRescan}
          data={og.data}
          errorMessage={og.errorMessage}
          status={og.status}
          url={og.url}
        />
      )}

      {isComplete && (
        <>
          <Findings pages={scan.pages} />
          <PageTree pages={scan.pages} />
          <PagesList pages={scan.pages} />
        </>
      )}

      {hasPage && (
        <TagSections
          canRescan={canRescan}
          data={og.data}
          errorMessage={og.errorMessage}
          status={og.status}
        />
      )}
    </div>
  );
};
