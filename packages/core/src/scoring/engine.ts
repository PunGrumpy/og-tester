import * as Effect from "effect/Effect";

import type { OgDiagnostic } from "../schemas/diagnostic";
import type { OgData } from "../schemas/og";
import { CATEGORY_INFO, CATEGORY_IDS } from "./categories";
import type { CategoryId } from "./categories";
import type { ImageMeta } from "./image";
import { ogRules } from "./rules";

export interface CategoryScore {
  id: CategoryId;
  name: string;
  score: number;
  maxScore: number;
  diagnostics: OgDiagnostic[];
}

export interface PageScoreResult {
  url?: string;
  score: number;
  maxScore: number;
  passed: boolean;
  diagnostics: OgDiagnostic[];
  categories: CategoryScore[];
}

export const scoreOgTags = (
  data: OgData,
  context?: { pageUrl?: string; imageMeta?: ImageMeta | null }
): Effect.Effect<PageScoreResult> =>
  Effect.gen(function* runScore() {
    const results = yield* Effect.all(
      ogRules.map((rule) =>
        rule.check(data, context).pipe(
          Effect.map((diag) => {
            if (diag) {
              // Attach category to diagnostic if it is not there already
              return { category: rule.category, diag };
            }
            return null;
          })
        )
      )
    );

    const activeDiagnostics = results.filter(
      (res): res is { diag: OgDiagnostic; category: CategoryId } => res !== null
    );

    const categories: CategoryScore[] = CATEGORY_IDS.map((catId) => {
      const info = CATEGORY_INFO[catId];
      const catDiags = activeDiagnostics
        .filter((item) => item.category === catId)
        .map((item) => item.diag);

      const deductions = catDiags.reduce((sum, d) => sum + d.points, 0);
      const score = Math.max(0, info.maxScore - deductions);

      return {
        diagnostics: catDiags,
        id: catId,
        maxScore: info.maxScore,
        name: info.name,
        score,
      };
    });

    const overallScore = categories.reduce((sum, c) => sum + c.score, 0);
    const allDiagnostics = activeDiagnostics.map((item) => item.diag);

    return {
      categories,
      diagnostics: allDiagnostics,
      maxScore: 100,
      passed: allDiagnostics.length === 0,
      score: overallScore,
      url: context?.pageUrl,
    };
  });

// Convenience wrapper — run Effect and return plain result
export const runScoreOgTags = (
  data: OgData,
  context?: { pageUrl?: string; imageMeta?: ImageMeta | null }
): Promise<PageScoreResult> => Effect.runPromise(scoreOgTags(data, context));
