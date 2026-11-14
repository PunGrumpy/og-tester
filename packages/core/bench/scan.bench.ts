/* eslint-disable no-await-in-loop -- runs are sequential on purpose */
// Times runScanSite against a local site of interlinked pages with no sitemap,
// so every scan takes the crawl path. Run: bun packages/core/bench/scan.bench.ts
import { runScanSite } from "../src/scanner/scanner";

const PAGES = 60;
const RUNS = 5;
const MAX_URLS = 50;
const CONCURRENCY = 5;

const median = (values: number[]) =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

const pageHtml = (index: number) => {
  const links = [1, 2, 3, 7]
    .map((step) => `<a href="/p${(index + step) % PAGES}">p</a>`)
    .join("");
  return `<!doctype html><html><head><title>Page ${index}</title>
<meta property="og:title" content="Page ${index}"></head><body>${links}</body></html>`;
};

// Delay is a pure function of the path, so every branch sees the same site.
const hash = (text: string) => {
  let h = 7;
  for (const char of text) {
    h = (h * 31 + (char.codePointAt(0) ?? 0)) % 1_000_003;
  }
  return h;
};

const scenarios: Record<string, (path: string) => number> = {
  fixed100: () => 100,
  skewed50to1500: (path) => 50 + (hash(path) % 1451),
};

const runScenario = async (
  name: string,
  delayFor: (path: string) => number
) => {
  const times: number[] = [];
  const requestCounts: number[] = [];
  const pageCounts: number[] = [];

  for (let run = 0; run < RUNS; run += 1) {
    const hits = new Map<string, number>();
    const server = Bun.serve({
      fetch: async (req) => {
        const { pathname } = new URL(req.url);
        hits.set(pathname, (hits.get(pathname) ?? 0) + 1);
        const match = /^\/p(?<index>\d+)$/u.exec(pathname);
        if (pathname === "/" || match) {
          await Bun.sleep(delayFor(pathname));
          const index = match ? Number(match.groups?.index) : 0;
          return new Response(pageHtml(index), {
            headers: { "Content-Type": "text/html" },
          });
        }
        return new Response("not found", { status: 404 });
      },
      port: 0,
    });

    const started = performance.now();
    const report = await runScanSite({
      concurrency: CONCURRENCY,
      maxUrls: MAX_URLS,
      siteUrl: `http://localhost:${server.port}/`,
    });
    times.push(performance.now() - started);
    await server.stop(true);

    requestCounts.push([...hits.values()].reduce((sum, n) => sum + n, 0));
    pageCounts.push(report.totalPages);
  }

  console.log(
    `${name.padEnd(16)} pages=${median(pageCounts)} requests=${median(requestCounts)} ` +
      `median=${Math.round(median(times))}ms runs=${times.map((t) => Math.round(t)).join(",")}`
  );
};

for (const [name, delayFor] of Object.entries(scenarios)) {
  await runScenario(name, delayFor);
}
