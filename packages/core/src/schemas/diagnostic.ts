import * as Schema from "effect/Schema";

// Severity level of each diagnostic (using Schema.Literals for v4)
export const Severity = Schema.Literals(["error", "warning", "info"]);
export type Severity = Schema.Schema.Type<typeof Severity>;

// Diagnostic — Problem found in each rule
export class OgDiagnostic extends Schema.Class<OgDiagnostic>("OgDiagnostic")({
  message: Schema.String,
  points: Schema.Number,
  severity: Severity,
  suggestion: Schema.String,
  tag: Schema.String,
}) {}
