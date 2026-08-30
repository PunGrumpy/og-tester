import { describe, expect, it } from "bun:test";

import { runScanSite } from "./scanner";

const SEED_URL = "https://example.test/";
const LINKED_URL = "https://example.test/about";

const seedHtml = `<!doctype html>
<html>
  <head><title>Home</title></head>
  <body><a href="/about">About</a></body>
</html>`;

const linkedHtml = `<!doctype html>
<html>
  <head><title>About</title></head>
  <body>No further links here.</body>
</html>`;

const notFound = () =>
  Promise.resolve(
    new Response("not found", { status: 404, statusText: "Not Found" })
  );

/**
 * Guards against a "seed-only" SSRF fix: the crawler discovers and fetches
 * links found in the seed page's HTML, so the injected fetch must reach those
 * requests too, not just the very first one.
 */
describe("runScanSite fetch injection", () => {
  it("routes both the seed request and crawler-discovered link requests through the injected fetch", async () => {
    const requestedUrls: string[] = [];

    const fakeFetch = (url: string, _init?: RequestInit): Promise<Response> => {
      requestedUrls.push(url);

      if (url === SEED_URL) {
        return Promise.resolve(
          new Response(seedHtml, {
            headers: { "Content-Type": "text/html" },
            status: 200,
          })
        );
      }

      if (url === LINKED_URL) {
        return Promise.resolve(
          new Response(linkedHtml, {
            headers: { "Content-Type": "text/html" },
            status: 200,
          })
        );
      }

      return notFound();
    };

    const report = await runScanSite({
      concurrency: 2,
      fetch: fakeFetch,
      maxUrls: 10,
      siteUrl: SEED_URL,
    });

    expect(requestedUrls).toContain(SEED_URL);
    expect(requestedUrls).toContain(LINKED_URL);
    expect(report.pages.map((page) => page.url)).toContain(LINKED_URL);
  });
});
