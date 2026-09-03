"use client";

import { useId, useMemo, useState } from "react";

import type { PageScoreResult } from "@/hooks/use-scanner-store";
import type { Standing } from "@/lib/reports/verdict";
import { getStanding } from "@/lib/reports/verdict";

import { ReportSection, ROW_CLASS, StandingGlyph } from "./section";

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

const failingTags = (page: PageScoreResult): string[] => [
  ...new Set(page.diagnostics.map((d) => d.tag)),
];

const rowStanding = (page: PageScoreResult, issues: number): Standing => {
  if (issues === 0) {
    return "clean";
  }
  return getStanding(page.score) === "weak" ? "weak" : "partial";
};

export const PagesList = ({ pages }: { pages: PageScoreResult[] }) => {
  const [query, setQuery] = useState("");
  const filterId = useId();

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
        <div className="grid max-w-sm gap-2">
          <label className="text-sm font-medium" htmlFor={filterId}>
            Filter by path
          </label>
          <input
            autoCapitalize="none"
            autoCorrect="off"
            className="border-foreground/45 bg-background placeholder:text-muted-foreground hover:border-foreground/60 focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full rounded-md border px-3 text-base transition-colors outline-none focus-visible:ring-[3px] sm:text-sm"
            id={filterId}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="/blog"
            spellCheck={false}
            type="text"
            value={query}
          />
          {/* Rendered even while empty, so the count is announced on every change. */}
          <output
            className="text-muted-foreground min-h-5 text-sm tabular-nums"
            htmlFor={filterId}
          >
            {query.trim()
              ? `${rows.length} of ${pages.length} ${pages.length === 1 ? "page" : "pages"} match`
              : ""}
          </output>
        </div>
      ) : null}

      <ul className="m-0 list-none divide-y border-y p-0">
        {rows.length === 0 ? (
          <li className="text-muted-foreground py-5 text-sm">
            {`No page path matches “${query}”. `}
            <button
              className="text-foreground focus-visible:ring-ring/50 underline underline-offset-4 focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:outline-none"
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
                    className="text-foreground focus-visible:ring-ring/50 inline-flex min-h-6 min-w-6 items-center font-mono text-sm break-all underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-[3px] focus-visible:outline-none"
                    href={page.url}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {path}
                  </a>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {tags.length === 0
                      ? "Nothing to fix."
                      : `${tags.length} ${tags.length === 1 ? "tag" : "tags"} to fix · ${tags.join(", ")}`}
                  </p>
                </div>
                <span className="flex shrink-0 items-baseline gap-1">
                  <span className="text-foreground text-sm font-semibold tabular-nums">
                    {page.score}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs tabular-nums">
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
