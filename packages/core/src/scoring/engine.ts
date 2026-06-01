import * as Effect from "effect/Effect";

import type { OgDiagnostic } from "../schemas/diagnostic";
import type { OgData } from "../schemas/og";
import { ScoreResult } from "../schemas/score";
import { ogRules } from "./rules";

export const scoreOgTags = (data: OgData): Effect.Effect<ScoreResult> =>
  Effect.gen(function* runScore() {
    const results = yield* Effect.all(ogRules.map((rule) => rule.check(data)));
    const diagnostics = results.filter(
      (result): result is OgDiagnostic => result !== null
    );
    const deductions = diagnostics.reduce((acc, d) => acc + d.points, 0);

    return new ScoreResult({
      diagnostics,
      maxScore: 100,
      passed: deductions === 0,
      score: Math.max(0, 100 - deductions),
    });
  });

// Convenience wrapper — run Effect and return plain result
export const runScoreOgTags = (data: OgData): Promise<ScoreResult> =>
  Effect.runPromise(scoreOgTags(data));
