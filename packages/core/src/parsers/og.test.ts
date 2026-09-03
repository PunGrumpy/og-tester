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
        '<meta charset="utf-8" />\n    <title>Don\'t Panic: A Test Fixture Title Example</title>\n    <meta\n      name="description"\n      content="It\'s a great description that also mentions someone\'s day at work."\n    />\n    <link rel="canonical" href="https://example.com/apostrophe" />\n    <meta\n      property="og:title"\n      content="It\'s a great day for testing open graph tags"\n    />\n    <meta\n      property="og:description"\n      content=\'She said "hello world" during testing of this parser fixture.\'\n    />\n    <meta property="og:url" content="https://example.com/apostrophe" />\n    <meta property="og:type" content="website" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta\n      name="twitter:title"\n      content="Don\'t miss this: apostrophe test for twitter card"\n    />',
      title: "Don't Panic: A Test Fixture Title Example",
      "twitter:card": "summary_large_image",
      "twitter:title": "Don't miss this: apostrophe test for twitter card",
    });
  });

  test("parses a minified single-line page with long inline scripts in linear time", async () => {
    const html = await readFixture("minified-inline-script.html");
    const startedAt = performance.now();
    const result = parseOgTags(html, "https://example.com/");
    const elapsedMs = performance.now() - startedAt;

    // The previous regexes backtracked across the whole document on this
    // shape of page and needed minutes. A 2s budget leaves room for a slow CI
    // runner while still failing loudly on a regression.
    expect(elapsedMs).toBeLessThan(2000);
    expect(result.title).toBe("Minified inline script fixture");
    expect(result.description).toBe(
      "A minified page whose head sits on one line with long inline scripts."
    );
    expect(result["og:title"]).toBe("Minified Inline Script Fixture");
    expect(result["og:image"]).toBe("https://example.com/og.png");
    expect(result["twitter:card"]).toBe("summary");
    expect(result.themeColorLight).toBe("#FFFFFF");
    expect(result.themeColorDark).toBe("#000000");
    expect(result.themeColor).toBeUndefined();
    expect(result.favicons).toEqual([
      {
        href: "https://example.com/favicon.ico",
        rel: "icon",
        sizes: "32x32",
        type: "image/x-icon",
      },
    ]);
    expect(
      Object.keys(result).filter((key) => key.startsWith("og:extra"))
    ).toHaveLength(30);
  });

  test("reads attributes regardless of their order inside the tag", () => {
    const html = [
      "<head>",
      '<meta content="Order does not matter" name="description">',
      '<meta content="/cover.png" property="og:image">',
      '<meta content="@example" name="twitter:site">',
      '<link href="/apple.png" rel="apple-touch-icon" sizes="180x180">',
      '<link href="https://example.com/page" rel="canonical">',
      "</head>",
    ].join("");
    const result = parseOgTags(html, "https://example.com/");

    expect(result.description).toBe("Order does not matter");
    expect(result["og:image"]).toBe("https://example.com/cover.png");
    expect(result["twitter:site"]).toBe("@example");
    expect(result.canonical).toBe("https://example.com/page");
    expect(result.favicons).toEqual([
      {
        href: "https://example.com/apple.png",
        rel: "apple-touch-icon",
        sizes: "180x180",
        type: undefined,
      },
    ]);
  });

  test("keeps a favicon rel inside its own tag and lists shortcut icons first", () => {
    const html = [
      "<head>",
      '<link rel="stylesheet" href="/app.css">',
      '<link rel="icon" href="/icon.png" type="image/png">',
      '<link rel="shortcut icon" href="/favicon.ico">',
      "</head>",
    ].join("");
    const result = parseOgTags(html, "https://example.com/");

    expect(result.favicons).toEqual([
      {
        href: "https://example.com/favicon.ico",
        rel: "shortcut icon",
        sizes: undefined,
        type: undefined,
      },
      {
        href: "https://example.com/icon.png",
        rel: "icon",
        sizes: undefined,
        type: "image/png",
      },
    ]);
  });

  describe("HTML entity decoding", () => {
    const ENTITY_CASES: [name: string, input: string, expected: string][] = [
      ["decodes numeric decimal entities", "Don&#8217;t stop", "Don’t stop"],
      ["decodes numeric hex entities", "A&#x2019;s test", "A’s test"],
      ["decodes basic named entities", "Fish &amp; Chips", "Fish & Chips"],
      ["decodes lt and gt", "1 &lt; 2 &gt; 0", "1 < 2 > 0"],
      [
        "does not double-decode escaped entities",
        "code &amp;lt; here",
        "code &lt; here",
      ],
      [
        "decodes named entities beyond the old list (mdash)",
        "wait &mdash; what",
        "wait — what",
      ],
      [
        "decodes named entities beyond the old list (hellip)",
        "dots&hellip;",
        "dots…",
      ],
      [
        "passes unknown named entities through unchanged",
        "&unknownthing; stays",
        "&unknownthing; stays",
      ],
      [
        "leaves out-of-range numeric entities unchanged",
        "big &#1114112; nope",
        "big &#1114112; nope",
      ],
    ];

    for (const [name, input, expected] of ENTITY_CASES) {
      test(name, () => {
        const html = `<head><meta property="og:title" content="${input}" /></head>`;
        const result = parseOgTags(html);

        expect(result["og:title"]).toBe(expected);
      });
    }

    test("decodes entities in the title tag", () => {
      const html = "<head><title>Don&#8217;t stop &amp; go</title></head>";
      const result = parseOgTags(html);

      expect(result.title).toBe("Don’t stop & go");
    });
  });
});
