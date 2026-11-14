import { describe, expect, test } from "bun:test";

import { parseOgTags } from "../parsers/og";
import { runScoreOgTags } from "../scoring/engine";
import { diffPages } from "./diff";
import type { DiffInput } from "./diff";

const FIXTURES_DIR = new URL("../../test/fixtures/", import.meta.url);

const load = async (name: string, url: string): Promise<DiffInput> => {
  const html = await Bun.file(new URL(name, FIXTURES_DIR)).text();
  const data = parseOgTags(html, url);
  const result = await runScoreOgTags(data, { pageUrl: url });
  return { data, result, url };
};

const complete = await load("complete.html", "https://a.example/");
const partial = await load("partial.html", "https://b.example/");

describe("diffPages", () => {
  test("reports the score drop from complete to partial", () => {
    const diff = diffPages(complete, partial);

    expect(diff.a).toEqual({ score: 63, url: "https://a.example/" });
    expect(diff.b).toEqual({ score: 23, url: "https://b.example/" });
    expect(diff.scoreDelta).toBe(-40);
    expect(diff.categories).toEqual([
      { a: 20, b: 6, delta: -14, id: "og" },
      { a: 10, b: 0, delta: -10, id: "twitter" },
      { a: 23, b: 7, delta: -16, id: "seo" },
      { a: 10, b: 10, delta: 0, id: "image" },
    ]);
  });

  test("lists only the tags whose value differs", () => {
    const diff = diffPages(complete, partial);

    expect(diff.tags).toEqual([
      {
        a: "Complete Fixture Page Title Example",
        b: "Partial Fixture Title",
        key: "title",
      },
      {
        a: "A complete meta description used for characterization testing of the parser.",
        b: undefined,
        key: "description",
      },
      { a: "https://example.com/complete", b: undefined, key: "canonical" },
      {
        a: "Complete Fixture OG Title",
        b: "Partial Fixture OG Title",
        key: "og:title",
      },
      {
        a: "Complete fixture og description for testing purposes.",
        b: undefined,
        key: "og:description",
      },
      { a: "https://example.com/complete", b: undefined, key: "og:url" },
      { a: "website", b: undefined, key: "og:type" },
      { a: "Example Site", b: undefined, key: "og:site_name" },
      { a: "summary_large_image", b: undefined, key: "twitter:card" },
      {
        a: "Complete Fixture Twitter Title",
        b: undefined,
        key: "twitter:title",
      },
    ]);
  });

  test("fixed and regressed are the diagnostics unique to each side", () => {
    const fixed = diffPages(partial, complete);
    const regressed = diffPages(complete, partial);

    const fixedTags = fixed.fixed.map((d) => d.tag);
    const regressedTags = regressed.regressed.map((d) => d.tag);

    expect(fixedTags).toContain("og:url");
    expect(fixedTags).toContain("twitter:card");
    expect(fixedTags).not.toContain("og:title");
    expect(regressedTags).toEqual(fixedTags);
    expect(regressed.fixed).toEqual([]);
  });

  test("a page diffed against itself has no differences", () => {
    const diff = diffPages(complete, complete);

    expect(diff.scoreDelta).toBe(0);
    expect(diff.tags).toEqual([]);
    expect(diff.fixed).toEqual([]);
    expect(diff.regressed).toEqual([]);
    expect(diff.categories.every((c) => c.delta === 0)).toBe(true);
  });

  test("swapping the sides mirrors the diff", () => {
    const forward = diffPages(complete, partial);
    const backward = diffPages(partial, complete);

    expect(backward.scoreDelta).toBe(-forward.scoreDelta);
    expect(backward.fixed).toEqual(forward.regressed);
    expect(backward.regressed).toEqual(forward.fixed);
    expect(backward.tags).toEqual(
      forward.tags.map(({ key, a, b }) => ({ a: b, b: a, key }))
    );
    expect(backward.categories.map((c) => c.delta)).toEqual(
      forward.categories.map((c) => 0 - c.delta)
    );
  });

  test("a tag present on one side only keeps the other side absent", () => {
    const withoutDescription = {
      ...complete,
      data: { ...complete.data, description: undefined },
    };

    const diff = diffPages(complete, withoutDescription);

    expect(diff.tags).toEqual([
      {
        a: "A complete meta description used for characterization testing of the parser.",
        b: undefined,
        key: "description",
      },
    ]);
  });

  test("an empty string counts as an absent tag", () => {
    const blank = {
      ...complete,
      data: { ...complete.data, description: "" },
    };
    const absent = {
      ...complete,
      data: { ...complete.data, description: undefined },
    };

    expect(diffPages(blank, absent).tags).toEqual([]);
  });
});
