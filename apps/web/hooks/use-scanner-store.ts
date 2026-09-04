import { create } from "zustand";

export interface Diagnostic {
  tag: string;
  message: string;
  severity: "error" | "warning" | "info";
  suggestion: string;
  points: number;
}

export interface PageScoreResult {
  url?: string;
  /** The page whose HTML linked here; absent when a sitemap listed it. */
  foundOn?: string;
  score: number;
  maxScore: number;
  passed: boolean;
  diagnostics: Diagnostic[];
  categories: {
    id: string;
    name: string;
    score: number;
    maxScore: number;
    diagnostics: Diagnostic[];
  }[];
}

export interface CategoryAverages {
  image: number;
  og: number;
  seo: number;
  twitter: number;
}

export interface ScoreSummary {
  excellent: number;
  fair: number;
  good: number;
  poor: number;
}

export type ScanPhase =
  | "idle"
  | "discovery"
  | "checking"
  | "complete"
  | "cancelled"
  | "error";

interface ScannerState {
  isLoading: boolean;
  phase: ScanPhase;
  completedUrls: number;
  totalUrls: number;
  currentUrl: string;
  currentScore: number | undefined;
  pages: PageScoreResult[];
  averageScore: number;
  categoryAverages: CategoryAverages;
  summary: ScoreSummary;
  errorMsg: string;
  refreshing: boolean;

  startScan: (targetUrl: string) => Promise<void>;
  cancelScan: () => void;
  resetScan: () => void;
  loadReport: (report: StoredScanReport) => void;
}

export interface StoredScanReport {
  averageScore: number;
  categoryAverages: CategoryAverages;
  summary: ScoreSummary;
  pages: PageScoreResult[];
  totalPages: number;
}

let abortController: AbortController | null = null;

const initialStates = {
  averageScore: 0,
  categoryAverages: {
    image: 0,
    og: 0,
    seo: 0,
    twitter: 0,
  },
  completedUrls: 0,
  currentScore: undefined,
  currentUrl: "",
  errorMsg: "",
  isLoading: false,
  pages: [],
  phase: "idle" as ScanPhase,
  refreshing: false,
  summary: {
    excellent: 0,
    fair: 0,
    good: 0,
    poor: 0,
  },
  totalUrls: 0,
};

interface ScanEvent {
  type: string;
  completedUrls?: number;
  totalUrls?: number;
  url?: string;
  result?: PageScoreResult;
  report?: {
    averageScore: number;
    categoryAverages: CategoryAverages;
    summary: ScoreSummary;
    pages: PageScoreResult[];
  };
  error?: string;
}

const stoppedState = (
  refreshing: boolean,
  errorMsg: string,
  landing: ScanPhase
): Partial<ScannerState> => ({
  errorMsg,
  isLoading: false,
  phase: refreshing ? "complete" : landing,
  refreshing: false,
});

const handleSseEvent = (
  event: ScanEvent,
  set: (
    state:
      | Partial<ScannerState>
      | ((state: ScannerState) => Partial<ScannerState>)
  ) => void,
  get: () => ScannerState
) => {
  const { refreshing } = get();

  if (event.type === "discovery") {
    if (!refreshing) {
      set({ phase: "discovery" });
    }
  } else if (event.type === "checking") {
    const nextState: Partial<ScannerState> = refreshing
      ? {}
      : { phase: "checking" };

    if (event.completedUrls !== undefined) {
      nextState.completedUrls = event.completedUrls;
    }
    if (event.totalUrls !== undefined) {
      nextState.totalUrls = event.totalUrls;
    }
    if (event.url !== undefined) {
      nextState.currentUrl = event.url;
    }
    if (event.result) {
      nextState.currentScore = event.result.score;
      if (!refreshing) {
        const resultVal = event.result;
        const currentPages = get().pages;
        const exists = currentPages.some((p) => p.url === resultVal.url);
        nextState.pages = exists
          ? currentPages.map((p) => (p.url === resultVal.url ? resultVal : p))
          : [...currentPages, resultVal];
      }
    }
    set(nextState);
  } else if (event.type === "complete") {
    const update: Partial<ScannerState> = {
      isLoading: false,
      phase: "complete",
      refreshing: false,
    };
    if (event.report) {
      update.averageScore = event.report.averageScore;
      update.categoryAverages = event.report.categoryAverages;
      update.summary = event.report.summary;
      update.pages = event.report.pages;
    }
    set(update);
  } else if (event.type === "error") {
    set(
      stoppedState(
        refreshing,
        event.error || "The scan stopped before it finished. Try again.",
        "error"
      )
    );
  }
};

export const useScannerStore = create<ScannerState>((set, get) => ({
  ...initialStates,

  cancelScan: () => {
    if (abortController) {
      abortController.abort();
    }
  },

  loadReport: (report) =>
    set({
      ...initialStates,
      averageScore: report.averageScore,
      categoryAverages: report.categoryAverages,
      completedUrls: report.totalPages,
      pages: report.pages,
      phase: "complete",
      summary: report.summary,
      totalUrls: report.totalPages,
    }),

  resetScan: () => {
    set(initialStates);

    const element = document.querySelector("#checker");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  startScan: async (targetUrl: string) => {
    const isRefresh = get().phase === "complete";
    set(
      isRefresh
        ? {
            completedUrls: 0,
            currentScore: undefined,
            currentUrl: "",
            errorMsg: "",
            isLoading: true,
            refreshing: true,
            totalUrls: 0,
          }
        : { ...initialStates, isLoading: true, phase: "discovery" }
    );

    const controller = new AbortController();
    abortController = controller;

    try {
      const response = await fetch("/api/scan", {
        body: JSON.stringify({ url: targetUrl }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "The scan could not start. Try again.");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error(
          "This browser cannot stream scan results. Try a current version of Chrome, Firefox, or Safari."
        );
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        // oxlint-disable-next-line eslint/no-await-in-loop -- stream reads are sequential
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const rawData = line.slice(6);
            try {
              const event = JSON.parse(rawData) as ScanEvent;
              handleSseEvent(event, set, get);
            } catch (error) {
              console.error("Failed to parse SSE packet", error);
            }
          }
        }
      }
    } catch (error) {
      const wasRefreshing = get().refreshing;
      const cancelled = error instanceof Error && error.name === "AbortError";
      set(
        cancelled
          ? stoppedState(wasRefreshing, "", "cancelled")
          : stoppedState(
              wasRefreshing,
              error instanceof Error ? error.message : String(error),
              "error"
            )
      );
    } finally {
      abortController = null;
    }
  },
}));
