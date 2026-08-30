import { describe, expect, test } from "bun:test";

import { parseOgTags } from "../parsers/og";
import { runScoreOgTags } from "./engine";

// These tests characterize the CURRENT scoring output of runScoreOgTags for a
// handful of fixtures. They pin exact numbers as they exist today, not what
// the "correct" score should be — do not change scoring rules to make these
// tests pass differently; update them deliberately when scoring intentionally
// changes.
//
// runScoreOgTags (packages/core/src/scoring/engine.ts) is a pure function: it
// takes already-parsed OgData and an optional imageMeta and never performs
// network I/O itself (only scorePage/runScorePage in scoring/page.ts fetches
// og:image over the network via checkImageMeta). None of the fixtures used
// here declare an og:image, so the "image" category below is scored without
// imageMeta and without any network access — it is fully deterministic.

const FIXTURES_DIR = new URL("../../test/fixtures/", import.meta.url);

const readFixture = (name: string): Promise<string> =>
  Bun.file(new URL(name, FIXTURES_DIR)).text();

const categoryScores = (categories: { id: string; score: number; maxScore: number }[]) =>
  categories.map(({ id, score, maxScore }) => ({ id, maxScore, score }));

describe("runScoreOgTags", () => {
  test("scores a complete head", async () => {
    const html = await readFixture("complete.html");
    const data = parseOgTags(html, "https://example.com/");
    const result = await runScoreOgTags(data, { pageUrl: "https://example.com/" });

    expect(result.score).toBe(63);
    expect(result.maxScore).toBe(100);
    expect(result.passed).toBe(false);
    expect(categoryScores(result.categories)).toEqual([
      { id: "og", maxScore: 40, score: 20 },
      { id: "twitter", maxScore: 20, score: 10 },
      { id: "seo", maxScore: 25, score: 23 },
      { id: "image", maxScore: 15, score: 10 },
    ]);
  });

  test("scores an empty head", async () => {
    const html = await readFixture("empty.html");
    const data = parseOgTags(html, "https://example.com/");
    const result = await runScoreOgTags(data, { pageUrl: "https://example.com/" });

    expect(result.score).toBe(13);
    expect(result.maxScore).toBe(100);
    expect(result.passed).toBe(false);
    expect(categoryScores(result.categories)).toEqual([
      { id: "og", maxScore: 40, score: 0 },
      { id: "twitter", maxScore: 20, score: 0 },
      { id: "seo", maxScore: 25, score: 3 },
      { id: "image", maxScore: 15, score: 10 },
    ]);
  });

  test("scores a partial head", async () => {
    const html = await readFixture("partial.html");
    const data = parseOgTags(html, "https://example.com/");
    const result = await runScoreOgTags(data, { pageUrl: "https://example.com/" });

    expect(result.score).toBe(23);
    expect(result.maxScore).toBe(100);
    expect(result.passed).toBe(false);
    expect(categoryScores(result.categories)).toEqual([
      { id: "og", maxScore: 40, score: 6 },
      { id: "twitter", maxScore: 20, score: 0 },
      { id: "seo", maxScore: 25, score: 7 },
      { id: "image", maxScore: 15, score: 10 },
    ]);
  });
});
