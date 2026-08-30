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
      canonical: "https://example.com/complete",
      charset: "utf-8",
      description:
        "A complete meta description used for characterization testing of the parser.",
      lang: "en",
      "og:description": "Complete fixture og description for testing purposes.",
      "og:site_name": "Example Site",
      "og:title": "Complete Fixture OG Title",
      "og:type": "website",
      "og:url": "https://example.com/complete",
      rawHead:
        '<meta charset="utf-8" />\n    <title>Complete Fixture Page Title Example</title>\n    <meta\n      name="description"\n      content="A complete meta description used for characterization testing of the parser."\n    />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link rel="canonical" href="https://example.com/complete" />\n    <meta property="og:title" content="Complete Fixture OG Title" />\n    <meta\n      property="og:description"\n      content="Complete fixture og description for testing purposes."\n    />\n    <meta property="og:url" content="https://example.com/complete" />\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="Example Site" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="Complete Fixture Twitter Title" />',
      title: "Complete Fixture Page Title Example",
      "twitter:card": "summary_large_image",
      "twitter:title": "Complete Fixture Twitter Title",
      viewport: "width=device-width, initial-scale=1.0",
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
      "og:title": "Partial Fixture OG Title",
      rawHead:
        '<title>Partial Fixture Title</title>\n    <meta property="og:title" content="Partial Fixture OG Title" />',
      title: "Partial Fixture Title",
    });
  });

  test("does not truncate values at an apostrophe or an embedded opposite quote", async () => {
    const html = await readFixture("apostrophe.html");
    const result = parseOgTags(html, "https://example.com/");

    expect(result).toEqual({
      canonical: "https://example.com/apostrophe",
      charset: "utf-8",
      description:
        "It's a great description that also mentions someone's day at work.",
      lang: "en",
      "og:description":
        'She said "hello world" during testing of this parser fixture.',
      "og:title": "It's a great day for testing open graph tags",
      "og:type": "website",
      "og:url": "https://example.com/apostrophe",
      rawHead:
        '<meta charset="utf-8" />\n    <title>Don\'t Panic: A Test Fixture Title Example</title>\n    <meta\n      name="description"\n      content="It\'s a great description that also mentions someone\'s day at work."\n    />\n    <link rel="canonical" href="https://example.com/apostrophe" />\n    <meta property="og:title" content="It\'s a great day for testing open graph tags" />\n    <meta\n      property="og:description"\n      content=\'She said "hello world" during testing of this parser fixture.\'\n    />\n    <meta property="og:url" content="https://example.com/apostrophe" />\n    <meta property="og:type" content="website" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="Don\'t miss this: apostrophe test for twitter card" />',
      title: "Don't Panic: A Test Fixture Title Example",
      "twitter:card": "summary_large_image",
      "twitter:title": "Don't miss this: apostrophe test for twitter card",
    });
  });
});
