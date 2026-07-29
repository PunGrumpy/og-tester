"use client";

import type { ScoreSummary } from "@/hooks/use-scanner-store";

import { ReportSection } from "./report-section";

interface ScoreDistributionProps {
  summary: ScoreSummary;
}

const TIERS = [
  {
    color: "var(--color-score-excellent-fill)",
    key: "excellent",
    label: "Excellent",
    range: "90+",
  },
  {
    color: "var(--color-score-good-fill)",
    key: "good",
    label: "Good",
    range: "75–89",
  },
  {
    color: "var(--color-score-fair-fill)",
    key: "fair",
    label: "Fair",
    range: "50–74",
  },
  {
    color: "var(--color-score-poor-fill)",
    key: "poor",
    label: "Poor",
    range: "<50",
  },
] as const;

export const ScoreDistribution = ({ summary }: ScoreDistributionProps) => {
  const total = TIERS.reduce((sum, tier) => sum + summary[tier.key], 0);

  return (
    <ReportSection
      description="How the scanned pages split across quality tiers"
      title="Score distribution"
    >
      {total === 0 ? (
        <p className="rounded-lg border border-dashed px-4 py-6 text-center text-muted-foreground text-sm">
          No pages scanned yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Part-to-whole bar. The counts below carry the same data as text,
              so the bar itself is decorative. */}
          <div
            aria-hidden="true"
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
          >
            {TIERS.map((tier) =>
              summary[tier.key] > 0 ? (
                <div
                  key={tier.key}
                  style={{
                    backgroundColor: tier.color,
                    width: `${(summary[tier.key] / total) * 100}%`,
                  }}
                />
              ) : null
            )}
          </div>

          {/* One column: at 375px a two-column legend leaves ~170px per cell,
              which truncates "Excellent 90+". */}
          <dl className="flex flex-col gap-2">
            {TIERS.map((tier) => {
              const count = summary[tier.key];
              const percent = Math.round((count / total) * 100);
              return (
                <div className="flex items-baseline gap-2" key={tier.key}>
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 translate-y-px rounded-full"
                    style={{ backgroundColor: tier.color }}
                  />
                  <dt className="truncate text-foreground text-xs">
                    {tier.label}{" "}
                    <span className="text-muted-foreground tabular-nums">
                      {tier.range}
                    </span>
                  </dt>
                  <dd className="ml-auto shrink-0 font-medium font-mono text-foreground text-xs tabular-nums">
                    {count}
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({percent}%)
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </ReportSection>
  );
};
