"use client";

import type { Diagnostic, PageScoreResult } from "@/hooks/use-scanner-store";
import type { Standing } from "@/lib/reports/verdict";
import { CATEGORY_META, STANDING_LABEL } from "@/lib/reports/verdict";

import { ReportSection, ROW_CLASS, StandingGlyph } from "./section";

interface Finding {
  tag: string;
  suggestion: string;
  severity: Diagnostic["severity"];
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

const collect = (pages: PageScoreResult[], categoryId: string): Finding[] => {
  const byTag = new Map<string, Finding>();

  for (const page of pages) {
    const category = page.categories.find((c) => c.id === categoryId);
    const counted = new Set<string>();

    for (const diag of category?.diagnostics ?? []) {
      const existing = byTag.get(diag.tag);
      if (existing) {
        if (!counted.has(diag.tag)) {
          existing.affected += 1;
        }
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
                      <p className="font-mono text-sm font-medium">
                        {finding.tag}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
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
