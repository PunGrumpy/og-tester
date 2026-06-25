"use client";

import { Check } from "lucide-react";

import type { PageScoreResult } from "@/hooks/use-scanner-store";
import { cn } from "@/lib/utils";

import { getSeverityBg, getSeverityIcon } from "./severity";

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
          <div
            key={cat.id}
            className="p-3 rounded-xl border bg-background shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
          >
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
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
      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider pl-1">
        Recommendations
      </h4>

      {result.diagnostics.length === 0 ? (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-success/10 bg-success/5 text-sm text-success">
          <Check className="size-4 shrink-0" />
          <span>Excellent! No issues found on this page.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {result.diagnostics.map((diag, index) => (
            <div
              key={`${diag.tag}-${index}`}
              className={cn(
                "p-4 rounded-xl border flex gap-3",
                getSeverityBg(diag.severity)
              )}
            >
              {getSeverityIcon(diag.severity)}
              <div className="min-w-0 grow flex flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {diag.tag}
                    </span>
                    <span className="font-medium text-foreground text-sm leading-tight block mt-0.5">
                      {diag.message}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-destructive shrink-0 font-semibold bg-destructive/5 px-2 py-0.5 rounded border border-destructive/10">
                    -{diag.points} pts
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Recommended Tag:
                  </span>
                  <code className="text-xs block bg-background p-2 rounded-md font-mono text-primary overflow-x-auto select-all border border-muted-foreground/5 whitespace-pre-wrap">
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
