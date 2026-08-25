"use client";

import type { Diagnostic, PageScoreResult } from "@/hooks/use-scanner-store";
import type { Standing } from "@/lib/reports/verdict";
import { CATEGORY_META, STANDING_LABEL } from "@/lib/reports/verdict";

import { ReportSection, ROW_CLASS, StandingGlyph } from "./section";

interface Finding {
  tag: string;
  suggestion: string;
  severity: Diagnostic["severity"];
  /** Pages carrying at least one diagnostic for this tag. */
  affected: number;
}

const CATEGORY_BLURB: Record<string, string> = {
  image:
    "Whether the image a preview is built from can be fetched, and is large enough to use.",
  og: "The tags every platform reads first when it builds a link preview.",
  seo: "The tags a search engine and a crawler need before anything else.",
  twitter: "The tags X and a few others prefer over the Open Graph ones.",
};

const SEVERITY_ORDER: Record<Diagnostic["severity"], number> = {
  error: 0,
  info: 2,
  warning: 1,
};

const SEVERITY_STANDING: Record<Diagnostic["severity"], Standing> = {
  error: "weak",
  info: "partial",
  warning: "partial",
};

/**
 * One row per tag, counted across the scan. Grouped by tag and not by message,
 * because a message embeds the page's own values — "og:title length (25)" and
 * "og:title length (21)" are the same problem on two pages, and keying on the
 * text split one row into one per page. The suggestion carries the fix, which
 * is the same wherever the tag failed; the per-page wording stays in the pages
 * list, where the page it belongs to is on screen beside it.
 */
const collect = (pages: PageScoreResult[], categoryId: string): Finding[] => {
  const byTag = new Map<string, Finding>();

  for (const page of pages) {
    const category = page.categories.find((c) => c.id === categoryId);
    // A page counts once per tag however many diagnostics it raised for it.
    const counted = new Set<string>();

    for (const diag of category?.diagnostics ?? []) {
      const existing = byTag.get(diag.tag);
      if (existing) {
        if (!counted.has(diag.tag)) {
          existing.affected += 1;
        }
        // Keep the most severe reading of the tag across the whole scan.
        if (SEVERITY_ORDER[diag.severity] < SEVERITY_ORDER[existing.severity]) {
          existing.severity = diag.severity;
          existing.suggestion = diag.suggestion;
        }
      } else {
        byTag.set(diag.tag, {
          affected: 1,
          severity: diag.severity,
          suggestion: diag.suggestion,
          tag: diag.tag,
        });
      }
      counted.add(diag.tag);
    }
  }

  return [...byTag.values()].toSorted(
    (a, b) =>
      b.affected - a.affected ||
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
};

const PAGE_SPECIFIC_TAIL = /\s*Current(?: is| length)?:[\s\S]*$/u;

/** The part of a suggestion that is true for every page it applies to. */
const generalise = (suggestion: string): string =>
  suggestion.replace(PAGE_SPECIFIC_TAIL, "").trim();

export const Findings = ({ pages }: { pages: PageScoreResult[] }) => (
  <>
    {CATEGORY_META.map(({ id, label }) => {
      const findings = collect(pages, id);

      return (
        <ReportSection
          description={CATEGORY_BLURB[id]}
          id={`findings-${id}`}
          key={id}
          title={label}
        >
          <ul className="m-0 list-none divide-y border-y p-0">
            {findings.length === 0 ? (
              <li className={ROW_CLASS}>
                <StandingGlyph standing="clean" />
                <p className="font-medium">Nothing to fix</p>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {`${pages.length} / ${pages.length} pages clean`}
                </span>
              </li>
            ) : (
              findings.map((finding) => {
                const standing = SEVERITY_STANDING[finding.severity];
                const clean = pages.length - finding.affected;
                return (
                  <li className={ROW_CLASS} key={finding.tag}>
                    <StandingGlyph standing={standing} />
                    <div className="min-w-0">
                      <p className="font-medium font-mono text-sm">
                        {finding.tag}
                      </p>
                      <p className="mt-1 text-muted-foreground text-sm">
                        <span className="text-foreground">
                          {STANDING_LABEL[standing]}
                        </span>
                        {` · ${generalise(finding.suggestion)}`}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {`${clean} / ${pages.length} pages clean`}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </ReportSection>
      );
    })}
  </>
);
