import * as Effect from "effect/Effect";

import { OgDiagnostic } from "../schemas/diagnostic";
import type { OgData } from "../schemas/og";

// Rule definition
export interface OgRule {
  tag: string;
  weight: number;
  check: (data: OgData) => Effect.Effect<OgDiagnostic | null>;
}

// Helper to create scoring rules
const createOgRule = (
  tag: keyof OgData,
  weight: number,
  severity: "error" | "warning" | "info",
  message: string,
  suggestion: string
): OgRule => ({
  check: (data) =>
    Effect.succeed(
      data[tag]
        ? null
        : new OgDiagnostic({
            message,
            points: weight,
            severity,
            suggestion,
            tag,
          })
    ),
  tag,
  weight,
});

// Score weights:
// og:title       — 25
// og:description — 25
// og:image       — 25
// og:url         — 15
// og:type        — 10
// Total          = 100

export const ogRules: OgRule[] = [
  createOgRule(
    "og:title",
    25,
    "error",
    "Missing og:title tag",
    '<meta property="og:title" content="Your Page Title" />'
  ),
  createOgRule(
    "og:description",
    25,
    "error",
    "Missing og:description tag",
    '<meta property="og:description" content="Your Page Description" />'
  ),
  createOgRule(
    "og:image",
    25,
    "error",
    "Missing og:image tag",
    '<meta property="og:image" content="https://example.com/og-image.png" />'
  ),
  createOgRule(
    "og:url",
    15,
    "warning",
    "Missing og:url tag",
    '<meta property="og:url" content="https://example.com/page-url" />'
  ),
  createOgRule(
    "og:type",
    10,
    "info",
    "Missing og:type tag",
    '<meta property="og:type" content="website" />'
  ),
];
