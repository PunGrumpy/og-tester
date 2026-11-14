import { afterEach, describe, expect, it } from "bun:test";

import { runScanSite } from "../scanner/scanner";

const links = (...paths: string[]) =>
  `<html><head><title>t</title></head><body>${paths
    .map((path) => `<a href="${path}">x</a>`)
    .join("")}</body></html>`;

const pages: Record<string, string> = {
  "/": links("/a", "/b"),
  "/a": links("/a1", "/a2"),
  "/a1": links(),
  "/a2": links(),
  "/b": links("/b1", "/b2"),
  "/b1": links(),
  "/b2": links(),
};

let server: ReturnType<typeof Bun.serve> | undefined;

afterEach(async () => {
  await server?.stop(true);
});

describe("crawl order under the maxUrls cutoff", () => {
  it("picks the same pages whichever response arrives first", async () => {
    server = Bun.serve({
      fetch: async (req) => {
        const { pathname } = new URL(req.url);
        if (pathname === "/a") {
          await Bun.sleep(150);
        }
        const html = pages[pathname];
        return html
          ? new Response(html, { headers: { "Content-Type": "text/html" } })
          : new Response("not found", { status: 404 });
      },
      port: 0,
    });

    const report = await runScanSite({
      concurrency: 2,
      maxUrls: 5,
      siteUrl: `http://localhost:${server.port}/`,
    });

    expect(
      report.pages.map((page) => new URL(page.url ?? "").pathname).toSorted()
    ).toEqual(["/", "/a", "/a1", "/a2", "/b"]);
  });
});
