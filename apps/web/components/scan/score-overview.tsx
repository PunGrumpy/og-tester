"use client";

import { m } from "motion/react";

import type { CategoryAverages } from "@/hooks/use-scanner-store";
import { cn } from "@/lib/utils";

interface ScoreOverviewProps {
  averageScore: number;
  categoryAverages: CategoryAverages;
}

const getColorClass = (s: number) => {
  if (s >= 90) {
    return "stroke-score-excellent text-score-excellent";
  }
  if (s >= 75) {
    return "stroke-score-good text-score-good";
  }
  if (s >= 50) {
    return "stroke-score-fair text-score-fair";
  }
  return "stroke-score-poor text-score-poor";
};

const CircularGauge = ({
  score,
  size = 120,
  strokeWidth = 8,
  label,
  className,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  className?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClass = getColorClass(score);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative" style={{ height: size, width: size }}>
        <svg className="size-full transform -rotate-90">
          <circle
            className="stroke-muted-foreground/10 fill-none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <m.circle
            animate={{ strokeDashoffset }}
            className={cn(
              "fill-none stroke-score-good",
              colorClass.split(" ")[0]
            )}
            cx={size / 2}
            cy={size / 2}
            initial={{ strokeDashoffset: circumference }}
            r={radius}
            strokeDasharray={circumference}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-mono font-bold leading-none tabular-nums",
              colorClass.split(" ").slice(1).join(" "),
              size > 130 ? "text-4xl" : "text-2xl"
            )}
          >
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
            / 100
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-foreground text-center max-w-[140px] text-balance">
        {label}
      </span>
    </div>
  );
};

// Stagger wrapper for motion
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
    y: 0,
  },
};

export const ScoreOverview = ({
  averageScore,
  categoryAverages,
}: ScoreOverviewProps) => (
  <m.div
    className="grid gap-6 md:grid-cols-[200px_1fr] items-center p-6 rounded-lg border bg-background"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    <m.div
      className="flex justify-center border-b pb-6 md:border-b-0 md:pb-0 md:border-r md:pr-6"
      variants={itemVariants}
    >
      <CircularGauge
        label="Overall Score"
        score={averageScore}
        size={150}
        strokeWidth={10}
      />
    </m.div>

    <m.div
      className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center"
      variants={itemVariants}
    >
      <CircularGauge
        label="Open Graph"
        score={categoryAverages.og || 0}
        size={100}
        strokeWidth={6}
      />
      <CircularGauge
        label="Twitter Card"
        score={categoryAverages.twitter || 0}
        size={100}
        strokeWidth={6}
      />
      <CircularGauge
        label="Core SEO"
        score={categoryAverages.seo || 0}
        size={100}
        strokeWidth={6}
      />
      <CircularGauge
        label="Image Validation"
        score={categoryAverages.image || 0}
        size={100}
        strokeWidth={6}
      />
    </m.div>
  </m.div>
);
