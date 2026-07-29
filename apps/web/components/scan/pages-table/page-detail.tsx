"use client";

import { Check } from "lucide-react";

import type { PageScoreResult } from "@/hooks/use-scanner-store";
import { cn } from "@/lib/utils";

import { getSeverityBg, getSeverityIcon } from "../severity";

interface PageDetailProps {
  result: PageScoreResult;
}

export const PageDetail = ({ result }: PageDetailProps) => (
  <div className="p-5 bg-muted/40 border-y flex flex-col gap-5">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {result.categories.map((cat) => {
        const percentage =
          cat.maxScore > 0 ? Math.round((cat.score / cat.maxScore) * 100) : 0;
        return (
          <div key={cat.id} className="rounded-lg border bg-background p-3">
            <span className="block font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              {cat.name}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-mono text-lg font-bold tabular-nums">
                {cat.score}
                <span className="text-xs text-muted-foreground font-normal ml-0.5">
                  /{cat.maxScore}
                </span>
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {percentage}%
              </span>
            </div>
          </div>
        );
      })}
    </div>

    <div className="flex flex-col gap-3">
      <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
        Recommendations
      </h4>

      {result.diagnostics.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 p-4 text-sm text-success">
          <Check className="size-4 shrink-0" />
          <span>No issues found on this page.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {result.diagnostics.map((diag, index) => (
            <div
              key={`${diag.tag}-${index}`}
              className={cn(
                "flex gap-3 rounded-lg border p-4",
                getSeverityBg(diag.severity)
              )}
            >
              {getSeverityIcon(diag.severity)}
              <div className="flex min-w-0 grow flex-col gap-2">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start sm:gap-4">
                  <div className="min-w-0">
                    <span className="block font-mono font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      {diag.tag}
                    </span>
                    <span className="mt-0.5 block text-pretty font-medium text-foreground text-sm leading-snug">
                      {diag.message}
                    </span>
                  </div>
                  <span className="shrink-0 self-start rounded border border-destructive/20 bg-destructive/5 px-2 py-0.5 font-mono font-semibold text-destructive text-xs tabular-nums">
                    −{diag.points} pts
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="block font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    Recommended tag
                  </span>
                  <code className="text-xs block bg-background p-2 rounded-md font-mono text-foreground overflow-x-auto select-all border border-border whitespace-pre-wrap">
                    {diag.suggestion}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
