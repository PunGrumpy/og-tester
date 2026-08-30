import { describe, expect, test } from "bun:test";

import { parseOgTags } from "./og";

// These tests characterize the CURRENT behavior of parseOgTags. They are not
// a spec of correct behavior — some of the pinned values (e.g. absent fields
// on the empty fixture) reflect known parser limitations. Do not "fix" the
// parser to make these tests pass differently; update the fixtures/tests
// deliberately when parser behavior intentionally changes.

const FIXTURES_DIR = new URL("../../test/fixtures/", import.meta.url);

const readFixture = (name: string): Promise<string> =>
  Bun.file(new URL(name, FIXTURES_DIR)).text();

describe("parseOgTags", () => {
  test("parses a complete head with title, meta, og:*, and twitter:* tags", async () => {
    const html = await readFixture("complete.html");
    const result = parseOgTags(html, "https://example.com/");

    expect(result).toEqual({
      title: "Complete Fixture Page Title Example",
      description:
        "A complete meta description used for characterization testing of the parser.",
      viewport: "width=device-width, initial-scale=1.0",
      "og:title": "Complete Fixture OG Title",
      "og:description":
        "Complete fixture og description for testing purposes.",
      "og:url": "https://example.com/complete",
      "og:type": "website",
      "og:site_name": "Example Site",
      "twitter:card": "summary_large_image",
      "twitter:title": "Complete Fixture Twitter Title",
      canonical: "https://example.com/complete",
      lang: "en",
      charset: "utf-8",
      rawHead:
        '<meta charset="utf-8" />\n  <title>Complete Fixture Page Title Example</title>\n  <meta name="description" content="A complete meta description used for characterization testing of the parser." />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <link rel="canonical" href="https://example.com/complete" />\n  <meta property="og:title" content="Complete Fixture OG Title" />\n  <meta property="og:description" content="Complete fixture og description for testing purposes." />\n  <meta property="og:url" content="https://example.com/complete" />\n  <meta property="og:type" content="website" />\n  <meta property="og:site_name" content="Example Site" />\n  <meta name="twitter:card" content="summary_large_image" />\n  <meta name="twitter:title" content="Complete Fixture Twitter Title" />',
    });
  });

  test("returns only an empty rawHead for a head with no tags", async () => {
    const html = await readFixture("empty.html");
    const result = parseOgTags(html, "https://example.com/");

    expect(result).toEqual({ rawHead: "" });
  });

  test("parses only the fields present in a partial head", async () => {
    const html = await readFixture("partial.html");
    const result = parseOgTags(html, "https://example.com/");

    expect(result).toEqual({
      title: "Partial Fixture Title",
      "og:title": "Partial Fixture OG Title",
      rawHead:
        '<title>Partial Fixture Title</title>\n  <meta property="og:title" content="Partial Fixture OG Title" />',
    });
  });
});
