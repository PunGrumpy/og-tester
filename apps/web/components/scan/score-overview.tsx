"use client";

import {
  animate,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect } from "react";

import type { CategoryAverages } from "@/hooks/use-scanner-store";
import { DURATION, EASE, STAGGER, transition } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { ReportSection } from "./report-section";

interface ScoreOverviewProps {
  averageScore: number;
  categoryAverages: CategoryAverages;
}

const TIERS = [
  {
    fill: "var(--color-score-excellent-fill)",
    label: "Excellent",
    text: "text-score-excellent",
  },
  {
    fill: "var(--color-score-good-fill)",
    label: "Good",
    text: "text-score-good",
  },
  {
    fill: "var(--color-score-fair-fill)",
    label: "Fair",
    text: "text-score-fair",
  },
  {
    fill: "var(--color-score-poor-fill)",
    label: "Poor",
    text: "text-score-poor",
  },
] as const;

const getTier = (score: number) => {
  if (score >= 90) {
    return TIERS[0];
  }
  if (score >= 75) {
    return TIERS[1];
  }
  if (score >= 50) {
    return TIERS[2];
  }
  return TIERS[3];
};

/**
 * Counts from zero to `value` so the number and the graphic beside it move
 * together. A score that snaps to its final value while the ring sweeps
 * underneath it is the most noticeable dead spot in the report.
 */
const useCountUp = (value: number, delay = 0) => {
  const shouldReduceMotion = useReducedMotion();
  const raw = useMotionValue(0);

  useEffect(() => {
    if (shouldReduceMotion) {
      raw.set(value);
      return;
    }
    const controls = animate(raw, value, {
      delay,
      duration: DURATION.data,
      ease: EASE,
    });
    return () => controls.stop();
  }, [delay, raw, shouldReduceMotion, value]);

  return useTransform(raw, (v) => Math.round(v));
};

const RING_SIZE = 132;
const RING_STROKE = 10;

const OverallRing = ({ score }: { score: number }) => {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const tier = getTier(score);
  const displayed = useCountUp(score);

  return (
    <div
      className="relative shrink-0"
      style={{ height: RING_SIZE, width: RING_SIZE }}
    >
      <svg aria-hidden="true" className="size-full -rotate-90 transform">
        <circle
          className="fill-none stroke-muted"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          strokeWidth={RING_STROKE}
        />
        <m.circle
          animate={{
            strokeDashoffset: circumference - (score / 100) * circumference,
          }}
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          r={radius}
          stroke={tier.fill}
          strokeDasharray={circumference}
          strokeLinecap="round"
          strokeWidth={RING_STROKE}
          transition={transition(DURATION.data)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* The ticking number is decorative; the resting value is announced
            once by the visually hidden label instead. */}
        <m.span
          aria-hidden="true"
          className="font-bold font-mono text-4xl text-foreground leading-none tabular-nums"
        >
          {displayed}
        </m.span>
        <span className={cn("mt-1.5 font-medium text-xs", tier.text)}>
          {tier.label}
        </span>
        <span className="sr-only">
          {`Overall score ${score} out of 100, ${tier.label}`}
        </span>
      </div>
    </div>
  );
};

const CATEGORIES = [
  { key: "og", label: "Open Graph" },
  { key: "twitter", label: "Twitter Card" },
  { key: "seo", label: "Core SEO" },
  { key: "image", label: "Image Validation" },
] as const;

/**
 * Categories are bars rather than rings: the four values usually land within a
 * few points of each other, and bar length is comparable at a glance where four
 * near-identical arcs are not.
 */
const CategoryBar = ({
  index,
  label,
  score,
}: {
  index: number;
  label: string;
  score: number;
}) => {
  const delay = STAGGER * index;
  const displayed = useCountUp(score, delay);

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-muted-foreground text-xs">
        {label}
      </span>
      <div
        aria-hidden="true"
        className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
      >
        {/* Bars fill in sequence so the eye is led down the list rather than
            four tracks moving as one block.

            The fill is full width and slides in from the left rather than
            growing its own width: animating `width` re-runs layout every
            frame, while a transform stays on the compositor. Translating
            also keeps the rounded right cap undistorted, which scaleX would
            squash. Same approach as Radix Progress. */}
        <m.div
          animate={{ x: `${score - 100}%` }}
          className="size-full rounded-full"
          initial={{ x: "-100%" }}
          style={{ backgroundColor: getTier(score).fill }}
          transition={transition(DURATION.data, delay)}
        />
      </div>
      <m.span
        aria-hidden="true"
        className="w-9 shrink-0 text-right font-medium font-mono text-foreground text-xs tabular-nums"
      >
        {displayed}
      </m.span>
      <span className="sr-only">{`${label}: ${score} out of 100`}</span>
    </div>
  );
};

export const ScoreOverview = ({
  averageScore,
  categoryAverages,
}: ScoreOverviewProps) => (
  <ReportSection
    description="Average across every page that was scanned"
    title="Score overview"
  >
    {/* Capped: a 0–100 bar stretched across the full column reads as a
        progress indicator for the page rather than a score. */}
    <div className="flex max-w-xl flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <OverallRing score={averageScore} />
      <div className="flex w-full min-w-0 flex-col gap-3">
        {CATEGORIES.map(({ key, label }, index) => (
          <CategoryBar
            index={index}
            key={key}
            label={label}
            score={categoryAverages[key] || 0}
          />
        ))}
      </div>
    </div>
  </ReportSection>
);
