"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { PageScoreResult } from "@/hooks/use-scanner-store";
import { DURATION, collapse, transition } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { ReportSection } from "./report-section";
import { getSeverityIcon, getSeverityRail } from "./severity";

interface IssueSummaryProps {
  pages: PageScoreResult[];
}

interface AggregatedIssue {
  key: string;
  tag: string;
  message: string;
  severity: "error" | "warning" | "info";
  suggestion: string;
  points: number;
  count: number;
  affectedUrls: string[];
}

const safeGetPathname = (url: string | undefined | null): string => {
  if (!url) {
    return "/";
  }
  try {
    if (url.startsWith("/")) {
      return url;
    }
    const absoluteUrl = url.includes("://") ? url : `https://${url}`;
    return new URL(absoluteUrl).pathname || "/";
  } catch {
    return url;
  }
};

export const IssueSummary = ({ pages }: IssueSummaryProps) => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Group diagnostics across all pages
  const issueMap = new Map<
    string,
    Omit<AggregatedIssue, "affectedUrls"> & { affectedUrls: Set<string> }
  >();

  for (const page of pages) {
    for (const diag of page.diagnostics) {
      const key = `${diag.tag}:${diag.message}`;
      const existing = issueMap.get(key);

      if (existing) {
        existing.count += 1;
        if (page.url) {
          existing.affectedUrls.add(page.url);
        }
      } else {
        issueMap.set(key, {
          affectedUrls: new Set(page.url ? [page.url] : []),
          count: 1,
          key,
          message: diag.message,
          points: diag.points,
          severity: diag.severity,
          suggestion: diag.suggestion,
          tag: diag.tag,
        });
      }
    }
  }

  const sortedIssues: AggregatedIssue[] = [...issueMap.values()]
    .map((issue) => ({
      ...issue,
      affectedUrls: [...issue.affectedUrls],
    }))
    .toSorted((a, b) => b.count - a.count);
  const totalPages = pages.length;
  const displayedIssues = showAll ? sortedIssues : sortedIssues.slice(0, 5);

  return (
    <ReportSection
      description="Most common tag opportunities, most frequent first"
      title="Top site-wide issues"
    >
      {sortedIssues.length === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-muted-foreground text-sm">
          Nothing to fix — no issues found across the scanned pages.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* Expanding to the full list would otherwise run the right column
              thousands of pixels past the table beside it, so the list scrolls
              within a fixed frame once it is longer than the collapsed five.
              Not a flex column: inside a capped height, flex children shrink
              and clip their own text. */}
          <div
            className={cn(
              "divide-y rounded-lg border",
              // Viewport-aware so the expanded list still fits inside the
              // sticky summary column alongside the distribution block.
              showAll && "max-h-[min(32rem,calc(100dvh-26rem))] overflow-y-auto"
            )}
          >
            {displayedIssues.map((issue) => {
              const isExpanded = expandedIssue === issue.key;
              const percent = Math.round((issue.count / totalPages) * 100);

              return (
                <div
                  key={issue.key}
                  className={cn(
                    "relative overflow-hidden transition-colors duration-240",
                    "before:absolute before:inset-y-0 before:left-0 before:w-0.5",
                    getSeverityRail(issue.severity)
                  )}
                >
                  <button
                    aria-expanded={isExpanded}
                    className="flex w-full cursor-pointer flex-col gap-1 py-3 pr-3 pl-4 text-left text-sm transition-colors duration-140 hover:bg-muted/40"
                    type="button"
                    onClick={() =>
                      setExpandedIssue(isExpanded ? null : issue.key)
                    }
                  >
                    {/* The tag is the identifier, so it gets the full line rather
                      than sharing it with the count and truncating. */}
                    <div className="flex w-full items-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      <span className="truncate font-medium font-mono text-foreground text-xs">
                        {issue.tag}
                      </span>
                      <span className="ml-auto shrink-0 whitespace-nowrap font-mono text-muted-foreground text-xs tabular-nums">
                        {issue.count}
                        <span className="text-muted-foreground/70">
                          /{totalPages}
                        </span>
                      </span>
                      <m.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="shrink-0"
                        initial={false}
                        transition={transition(DURATION.fast)}
                      >
                        <ChevronDown className="size-3.5 text-muted-foreground" />
                      </m.div>
                    </div>
                    {/* No `block` here: line-clamp needs display:-webkit-box. */}
                    <span
                      className="line-clamp-2 pl-6 text-pretty text-muted-foreground text-xs leading-relaxed"
                      title={issue.message}
                    >
                      {issue.message}
                    </span>
                    <span className="sr-only">
                      {issue.count === 1
                        ? `1 page affected (${percent}%)`
                        : `${issue.count} pages affected (${percent}%)`}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <m.div
                        {...collapse}
                        className="overflow-hidden border-border border-t"
                      >
                        <div className="flex flex-col gap-3 py-3 pr-3 pl-4">
                          <div className="flex flex-col gap-1">
                            <span className="block font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                              Recommended fix
                            </span>
                            <code className="text-xs block bg-muted p-2 rounded-md font-mono text-foreground overflow-x-auto whitespace-pre-wrap select-all border border-border">
                              {issue.suggestion}
                            </code>
                          </div>

                          {issue.affectedUrls.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="block font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                Affected pages
                              </span>
                              <ul className="text-xs font-mono flex flex-col gap-1 max-h-60 overflow-y-auto pr-2 divide-y divide-border">
                                {issue.affectedUrls.map((url) => {
                                  const path = safeGetPathname(url);
                                  return (
                                    <li key={url} className="py-1 break-all">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline hover:text-primary/80 transition-colors"
                                      >
                                        {path}
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {sortedIssues.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground text-xs transition-transform duration-140 ease-out-custom hover:text-foreground active:scale-[0.96]"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? "Show fewer"
                : `Show all ${sortedIssues.length} issues`}
            </Button>
          )}
        </div>
      )}
    </ReportSection>
  );
};
