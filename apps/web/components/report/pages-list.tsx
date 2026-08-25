"use client";

import { useMemo, useState } from "react";

import type { PageScoreResult } from "@/hooks/use-scanner-store";
import type { Standing } from "@/lib/reports/verdict";
import { getStanding } from "@/lib/reports/verdict";

import { ReportSection, ROW_CLASS, StandingGlyph } from "./section";

/** Above this many rows the list is long enough to be worth filtering. */
const FILTER_THRESHOLD = 8;

const safeGetPathname = (url: string | undefined | null): string => {
  if (!url) {
    return "/";
  }
  try {
    if (url.startsWith("/")) {
      return url;
    }
    const absolute = url.includes("://") ? url : `https://${url}`;
    return new URL(absolute).pathname || "/";
  } catch {
    return url;
  }
};

/** The distinct tags this page tripped, in the order the scorer found them. */
const failingTags = (page: PageScoreResult): string[] => [
  ...new Set(page.diagnostics.map((d) => d.tag)),
];

/**
 * The tick is reserved for pages with nothing left to fix. Reading it straight
 * off the score band put a ✓ next to "4 tags to fix" on anything scoring 90 or
 * more, which contradicts the sentence beside it.
 */
const rowStanding = (page: PageScoreResult, issues: number): Standing => {
  if (issues === 0) {
    return "clean";
  }
  return getStanding(page.score) === "weak" ? "weak" : "partial";
};

/**
 * Every scanned page as one ruled row, worst score first — the order you would
 * work in. What each page tripped is named inline rather than hidden behind a
 * disclosure, because the fix for any of them is already spelled out by tag in
 * the findings above; this list answers "where", not "what".
 */
export const PagesList = ({ pages }: { pages: PageScoreResult[] }) => {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return pages
      .filter((page) =>
        needle ? safeGetPathname(page.url).toLowerCase().includes(needle) : true
      )
      .toSorted((a, b) => a.score - b.score);
  }, [pages, query]);

  return (
    <ReportSection
      description={
        pages.length === 1
          ? "The one page that was scanned."
          : `All ${pages.length} pages that were scanned, lowest score first.`
      }
      id="pages"
      title="Pages"
    >
      {pages.length > FILTER_THRESHOLD ? (
        <input
          aria-label="Filter by page path"
          autoCapitalize="none"
          autoCorrect="off"
          className="h-10 w-full max-w-sm rounded-md border bg-background px-3 text-base outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter by path, for example /blog"
          spellCheck={false}
          type="text"
          value={query}
        />
      ) : null}

      <ul className="m-0 list-none divide-y border-y p-0">
        {rows.length === 0 ? (
          <li className="py-5 text-muted-foreground text-sm">
            {`No page path matches “${query}”. `}
            <button
              className="text-foreground underline underline-offset-4"
              onClick={() => setQuery("")}
              type="button"
            >
              Clear the filter
            </button>
          </li>
        ) : (
          rows.map((page) => {
            const path = safeGetPathname(page.url);
            const tags = failingTags(page);
            const standing = rowStanding(page, tags.length);
            return (
              <li className={ROW_CLASS} key={page.url || path}>
                <StandingGlyph standing={standing} />
                <div className="min-w-0">
                  <a
                    className="inline-flex min-h-6 min-w-6 items-center break-all font-mono text-foreground text-sm underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    href={page.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {path}
                  </a>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {tags.length === 0
                      ? "Nothing to fix."
                      : `${tags.length} ${tags.length === 1 ? "tag" : "tags"} to fix · ${tags.join(", ")}`}
                  </p>
                </div>
                <span className="flex shrink-0 items-baseline gap-1">
                  {/* The figure is sans, because Martian Mono ships one
                        weight and cannot carry the emphasis; the scale beside
                        it is mono, which is what makes the figure read as the
                        value rather than half of a fraction. */}
                  <span className="font-semibold text-foreground text-sm tabular-nums">
                    {page.score}
                  </span>
                  <span className="font-mono text-muted-foreground text-xs tabular-nums">
                    /100
                  </span>
                </span>
              </li>
            );
          })
        )}
      </ul>
    </ReportSection>
  );
};
