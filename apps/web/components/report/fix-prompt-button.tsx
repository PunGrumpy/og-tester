"use client";

import { Check, X } from "lucide-react";
import { useMemo } from "react";

import { useCopy } from "@/hooks/use-copy";
import type { PageScoreResult } from "@/hooks/use-scanner-store";

const MAX_ISSUES = 12;

interface Aggregated {
  tag: string;
  message: string;
  suggestion: string;
  points: number;
  count: number;
}

const aggregate = (pages: PageScoreResult[]): Aggregated[] => {
  const byKey = new Map<string, Aggregated>();
  for (const page of pages) {
    for (const diag of page.diagnostics) {
      const key = `${diag.tag}:${diag.message}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        byKey.set(key, {
          count: 1,
          message: diag.message,
          points: diag.points,
          suggestion: diag.suggestion,
          tag: diag.tag,
        });
      }
    }
  }
  return [...byKey.values()].toSorted(
    (a, b) => b.count - a.count || b.points - a.points
  );
};

const buildFixPrompt = (
  domain: string,
  score: number,
  pageCount: number,
  aggregated: Aggregated[]
): string => {
  const issues = aggregated.slice(0, MAX_ISSUES);
  const lines = [
    `Fix the Open Graph, Twitter Card and SEO metadata on ${domain}.`,
    "",
    `A scan of ${pageCount} ${pageCount === 1 ? "page" : "pages"} scored ${score}/100.`,
    "",
    issues.length > 0
      ? "Issues, ordered by how many pages they affect:"
      : "No issues were found.",
  ];

  for (const [index, issue] of issues.entries()) {
    lines.push(
      "",
      `${index + 1}. ${issue.tag} — ${issue.message}`,
      `   Affects ${issue.count} of ${pageCount} pages, costs ${issue.points} points each.`,
      `   Fix: ${issue.suggestion}`
    );
  }

  lines.push(
    "",
    "Apply these in the shared layout or template where possible, rather than page by page."
  );
  return lines.join("\n");
};

interface FixPromptButtonProps {
  domain: string;
  score: number;
  pages: PageScoreResult[];
}

export const FixPromptButton = ({
  domain,
  score,
  pages,
}: FixPromptButtonProps) => {
  const issues = useMemo(() => aggregate(pages), [pages]);
  const issueCount = issues.length;
  const { copy, state } = useCopy(2500);

  return (
    <>
      <button
        className="border-primary bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex min-h-16 w-full items-center justify-center gap-2.5 rounded-md border text-xl font-medium transition-opacity hover:opacity-85 focus-visible:ring-[3px] focus-visible:outline-none active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
        disabled={issueCount === 0}
        onClick={() =>
          copy(buildFixPrompt(domain, score, pages.length, issues))
        }
        type="button"
      >
        {state === "copied" && <Check aria-hidden="true" className="size-5" />}
        {state === "failed" && <X aria-hidden="true" className="size-5" />}
        {state === "copied" && "Prompt copied"}
        {state === "failed" && "Could not copy — select the issues below"}
        {state === "idle" && "Copy a prompt to fix this"}
      </button>
      <span aria-live="polite" className="sr-only">
        {state === "copied"
          ? `Copied a prompt covering ${Math.min(issueCount, MAX_ISSUES)} issues`
          : ""}
        {state === "failed" ? "Could not copy the prompt." : ""}
      </span>
      {issueCount === 0 ? (
        <p className="text-muted-foreground mt-2 text-center text-sm">
          Nothing to fix — every scanned page passed.
        </p>
      ) : null}
    </>
  );
};
