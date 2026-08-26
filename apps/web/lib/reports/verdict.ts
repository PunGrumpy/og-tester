import type { CategoryAverages } from "@/hooks/use-scanner-store";

export const CATEGORY_META = [
  { id: "og", label: "Open Graph", max: 40 },
  { id: "seo", label: "Core SEO", max: 25 },
  { id: "twitter", label: "Twitter Card", max: 20 },
  { id: "image", label: "Image validation", max: 15 },
] as const satisfies readonly {
  id: keyof CategoryAverages;
  label: string;
  max: number;
}[];

export const getVerdict = (score: number): string => {
  if (score >= 90) {
    return "Strong metadata across the site";
  }
  if (score >= 75) {
    return "Solid, with gaps worth closing";
  }
  if (score >= 50) {
    return "Important tags are missing";
  }
  return "Most pages will not preview well";
};

export type Standing = "clean" | "partial" | "weak";

export const getStanding = (percent: number): Standing => {
  if (percent >= 90) {
    return "clean";
  }
  if (percent >= 50) {
    return "partial";
  }
  return "weak";
};

export const STANDING_GLYPH: Record<Standing, string> = {
  clean: "✓",
  partial: "~",
  weak: "✗",
};

export const STANDING_TEXT: Record<Standing, string> = {
  clean: "text-score-excellent",
  partial: "text-score-fair",
  weak: "text-score-poor",
};

export const STANDING_LABEL: Record<Standing, string> = {
  clean: "Passing",
  partial: "Partial",
  weak: "Failing",
};

export const toPoints = (percent: number, max: number): number =>
  Math.round((percent / 100) * max * 10) / 10;
