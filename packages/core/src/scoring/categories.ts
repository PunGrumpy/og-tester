import type { OgRule } from "./rules";

export interface RuleCategory {
  id: "og" | "twitter" | "seo" | "image";
  name: string;
  maxScore: number;
  rules: OgRule[];
}

export const CATEGORY_IDS = ["og", "twitter", "seo", "image"] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_INFO: Record<
  CategoryId,
  { name: string; maxScore: number }
> = {
  image: { maxScore: 15, name: "og:image Validation" },
  og: { maxScore: 40, name: "Open Graph" },
  seo: { maxScore: 25, name: "Core SEO" },
  twitter: { maxScore: 20, name: "Twitter Card" },
};
