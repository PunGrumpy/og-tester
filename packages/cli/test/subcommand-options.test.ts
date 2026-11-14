import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const entry = new URL("../src/index.ts", import.meta.url).pathname;
const fixture = new URL(
  "../../core/test/fixtures/complete.html",
  import.meta.url
);

let server: ReturnType<typeof Bun.serve>;
let baseUrl: string;

beforeAll(async () => {
  const html = await Bun.file(fixture).text();
  server = Bun.serve({
    fetch: (req) =>
      new URL(req.url).pathname === "/sitemap.xml"
        ? new Response("not found", { status: 404 })
        : new Response(html, { headers: { "content-type": "text/html" } }),
    port: 0,
  });
  baseUrl = `http://127.0.0.1:${server.port}/`;
});

afterAll(() => server.stop(true));

const runCli = async (...args: string[]) => {
  const proc = Bun.spawn(["bun", entry, ...args], {
    stderr: "pipe",
    stdout: "pipe",
  });
  const [stdout, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    proc.exited,
  ]);
  return { exitCode, stdout };
};

describe("options shared by the root command and its subcommands", () => {
  test("check --json prints JSON, not the TUI", async () => {
    const { exitCode, stdout } = await runCli("check", baseUrl, "--json");
    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout).score).toBeNumber();
  });

  test("check --min-score exits 1 when the score is below it", async () => {
    const { exitCode } = await runCli("check", baseUrl, "--min-score", "100");
    expect(exitCode).toBe(1);
  });

  test("scan --json prints the report as JSON", async () => {
    const { exitCode, stdout } = await runCli(
      "scan",
      baseUrl,
      "--json",
      "--max-urls",
      "1",
      "--min-score",
      "0",
      "--output",
      path.join(mkdtempSync(path.join(tmpdir(), "og-tester-")), "report.json")
    );
    expect(exitCode).toBe(0);
    expect(JSON.parse(stdout).averageScore).toBeNumber();
  });

  test.each([
    ["after", false],
    ["before", true],
  ])("the default action accepts --json %s the URL", async (_, before) => {
    const args = before ? ["--json", baseUrl] : [baseUrl, "--json"];
    const { stdout } = await runCli(...args);
    expect(JSON.parse(stdout).title).toBeString();
  });
});
