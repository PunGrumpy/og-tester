"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import type { PageScoreResult } from "@/hooks/use-scanner-store";
import { cn } from "@/lib/utils";

import { getSeverityBg, getSeverityIcon } from "./severity";

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

export const IssueSummary = ({ pages }: IssueSummaryProps) => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  // Group diagnostics across all pages
  const issueMap = new Map<string, AggregatedIssue>();

  for (const page of pages) {
    for (const diag of page.diagnostics) {
      const key = `${diag.tag}:${diag.message}`;
      const existing = issueMap.get(key);

      if (existing) {
        existing.count += 1;
        if (page.url && !existing.affectedUrls.includes(page.url)) {
          existing.affectedUrls.push(page.url);
        }
      } else {
        issueMap.set(key, {
          affectedUrls: page.url ? [page.url] : [],
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

  const sortedIssues = [...issueMap.values()].toSorted(
    (a, b) => b.count - a.count
  );
  const totalPages = pages.length;

  return (
    <div className="p-6 rounded-2xl border border-border bg-background flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Top Site-wide Issues
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Most common tag optimization opportunities sorted by frequency
        </p>
      </div>

      {sortedIssues.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          🎉 No issues detected! Your site-wide metadata looks perfect.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedIssues.slice(0, 5).map((issue) => {
            const isExpanded = expandedIssue === issue.key;
            const percent = Math.round((issue.count / totalPages) * 100);

            return (
              <div
                key={issue.key}
                className={cn(
                  "rounded-lg border transition-colors duration-200 overflow-hidden",
                  getSeverityBg(issue.severity)
                )}
              >
                <button
                  className="w-full flex items-center justify-between p-4 cursor-pointer text-left text-sm"
                  type="button"
                  onClick={() =>
                    setExpandedIssue(isExpanded ? null : issue.key)
                  }
                >
                  <div className="flex items-start gap-3 min-w-0 pr-4">
                    {getSeverityIcon(issue.severity)}
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-semibold uppercase text-muted-foreground tracking-wider block">
                        {issue.tag}
                      </span>
                      <span className="font-semibold text-foreground truncate block">
                        {issue.message}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium font-mono bg-background/50 px-2 py-0.5 rounded border border-muted-foreground/5 tabular-nums">
                      {issue.count} pages ({percent}%)
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-muted-foreground/5 flex flex-col gap-3 mt-1 animate-in slide-in-from-top-1 duration-200">
                    <div className="flex flex-col gap-1 mt-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Recommended Fix:
                      </span>
                      <code className="text-xs block bg-muted p-2 rounded-md font-mono text-primary overflow-x-auto whitespace-pre-wrap select-all border border-muted-foreground/5">
                        {issue.suggestion}
                      </code>
                    </div>

                    {issue.affectedUrls.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Affected Pages:
                        </span>
                        <ul className="text-xs font-mono flex flex-col gap-1 max-h-24 overflow-y-auto pr-2 divide-y divide-muted-foreground/5">
                          {issue.affectedUrls.map((url) => {
                            const path = url ? new URL(url).pathname : "/";
                            return (
                              <li key={url} className="py-1 truncate">
                                {path || "/"}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
