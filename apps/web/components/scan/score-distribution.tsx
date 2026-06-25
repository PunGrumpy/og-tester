"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
} from "recharts";

import type { ScoreSummary } from "@/hooks/use-scanner-store";

interface ScoreDistributionProps {
  summary: ScoreSummary;
}

export const ScoreDistribution = ({ summary }: ScoreDistributionProps) => {
  const data = [
    {
      fill: "var(--color-score-excellent)",
      name: "Excellent (90+)",
      value: summary.excellent,
    },
    {
      fill: "var(--color-score-good)",
      name: "Good (75-89)",
      value: summary.good,
    },
    {
      fill: "var(--color-score-fair)",
      name: "Fair (50-74)",
      value: summary.fair,
    },
    {
      fill: "var(--color-score-poor)",
      name: "Poor (<50)",
      value: summary.poor,
    },
  ];

  const total = summary.excellent + summary.good + summary.fair + summary.poor;

  return (
    <div className="p-6 rounded-lg border bg-background flex flex-col gap-4 justify-between min-h-[300px]">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Score Distribution
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Breakdown of scanned pages by quality tier
        </p>
      </div>

      <div className="h-44 w-full">
        {total === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No pages scanned.
          </div>
        ) : (
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={data}
              margin={{ bottom: 0, left: -20, right: 0, top: 10 }}
            >
              <XAxis
                axisLine={false}
                dataKey="name"
                fontSize={10}
                stroke="var(--color-muted-foreground)"
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                fontSize={10}
                stroke="var(--color-muted-foreground)"
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  borderColor: "rgba(128,128,128,0.15)",
                  borderRadius: "12px",
                  borderWidth: "1px",
                }}
                cursor={{ fill: "rgba(128,128,128,0.05)" }}
                labelStyle={{ fontSize: "11px", fontWeight: "bold" }}
                itemStyle={{ fontSize: "11px" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-muted-foreground/5 text-center">
        {data.map((tier) => {
          const percent =
            total > 0 ? Math.round((tier.value / total) * 100) : 0;
          return (
            <div key={tier.name} className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-foreground truncate block">
                {tier.name.split(" ")[0]}
              </span>
              <span
                className="font-mono font-bold text-xs block tabular-nums"
                style={{ color: tier.fill }}
              >
                {tier.value}
                <span className="text-[10px] text-muted-foreground font-normal ml-0.5">
                  ({percent}%)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
