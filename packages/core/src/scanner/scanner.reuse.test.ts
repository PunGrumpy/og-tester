import { afterEach, describe, expect, it } from "bun:test";

import { runScanSite } from "./scanner";

const pages: Record<string, string> = {
  "/": `<html><head><title>Home</title><meta property="og:title" content="Home OG"></head>
<body><a href="/a">a</a><a href="/b">b</a></body></html>`,
  "/a": `<html><head><title>A</title><meta property="og:title" content="A OG"></head>
<body><a href="/b">b</a></body></html>`,
  "/b": `<html><head><title>B</title><meta property="og:title" content="B OG"></head>
<body>leaf</body></html>`,
};

let server: ReturnType<typeof Bun.serve> | undefined;

afterEach(async () => {
  await server?.stop(true);
});

describe("runScanSite on the crawl path", () => {
  it("fetches each page once and reports the entry page's tags", async () => {
    const hits = new Map<string, number>();
    server = Bun.serve({
      fetch: (req) => {
        const { pathname } = new URL(req.url);
        hits.set(pathname, (hits.get(pathname) ?? 0) + 1);
        const html = pages[pathname];
        return html
          ? new Response(html, { headers: { "Content-Type": "text/html" } })
          : new Response("not found", { status: 404 });
      },
      port: 0,
    });

    const report = await runScanSite({
      concurrency: 2,
      maxUrls: 10,
      siteUrl: `http://localhost:${server.port}/`,
    });

    expect(
      report.pages.map((page) => new URL(page.url ?? "").pathname).toSorted()
    ).toEqual(["/", "/a", "/b"]);
    for (const path of Object.keys(pages)) {
      expect(hits.get(path)).toBe(1);
    }
    expect(report.entryOg?.title).toBe("Home");
    expect(report.entryOg?.["og:title"]).toBe("Home OG");
  });
});
