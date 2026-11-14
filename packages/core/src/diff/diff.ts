import type { OgDiagnostic } from "../schemas/diagnostic";
import type { OgData } from "../schemas/og";
import type { PageScoreResult } from "../scoring/engine";
import { TAG_FIELDS } from "./fields";

export type DiffTagKey = (typeof TAG_FIELDS)[number];

export interface DiffInput {
  data: OgData;
  result: PageScoreResult;
  url: string;
}

export interface PageDiff {
  a: { url: string; score: number };
  b: { url: string; score: number };
  /** b.score - a.score. Negative means B is worse. */
  scoreDelta: number;
  /** Every scoring category, including the unchanged ones. */
  categories: { id: string; a: number; b: number; delta: number }[];
  /** Only the tags whose value differs. An absent side means the tag is missing there. */
  tags: { key: DiffTagKey; a?: string; b?: string }[];
  /** Diagnostics present on A and absent on B. */
  fixed: OgDiagnostic[];
  /** Diagnostics present on B and absent on A. */
  regressed: OgDiagnostic[];
}

// A diagnostic is "the same" on both sides when it targets the same tag.
// Messages embed measured values ("length (61)"), so comparing them would
// report a title that drifted from 61 to 65 characters as fixed and regressed.
// The score and category deltas carry that severity change instead.
const onlyIn = (
  from: OgDiagnostic[],
  other: OgDiagnostic[]
): OgDiagnostic[] => {
  const otherTags = new Set(other.map((d) => d.tag));
  return from.filter((d) => !otherTags.has(d.tag));
};

const tagValue = (data: OgData, key: DiffTagKey): string | undefined =>
  data[key] || undefined;

export const diffPages = (a: DiffInput, b: DiffInput): PageDiff => {
  const bCategories = new Map(b.result.categories.map((c) => [c.id, c.score]));

  const tags: PageDiff["tags"] = [];
  for (const key of TAG_FIELDS) {
    const av = tagValue(a.data, key);
    const bv = tagValue(b.data, key);
    if (av !== bv) {
      tags.push({ a: av, b: bv, key });
    }
  }

  return {
    a: { score: a.result.score, url: a.url },
    b: { score: b.result.score, url: b.url },
    categories: a.result.categories.map((c) => {
      const bScore = bCategories.get(c.id) ?? 0;
      return { a: c.score, b: bScore, delta: bScore - c.score, id: c.id };
    }),
    fixed: onlyIn(a.result.diagnostics, b.result.diagnostics),
    regressed: onlyIn(b.result.diagnostics, a.result.diagnostics),
    scoreDelta: b.result.score - a.result.score,
    tags,
  };
};
