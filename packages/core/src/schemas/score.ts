import * as Schema from "effect/Schema";

import { OgDiagnostic } from "./diagnostic";

// Result of scoring
export class ScoreResult extends Schema.Class<ScoreResult>("ScoreResult")({
  diagnostics: Schema.Array(OgDiagnostic),
  maxScore: Schema.Number,
  passed: Schema.Boolean,
  score: Schema.Number,
}) {}
