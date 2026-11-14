import { intro, log, note, outro, spinner } from "@clack/prompts";
import type { OgDiagnostic, PageDiff } from "@og-tester/core";
import { diffPages, fetchOgTags, runScorePage } from "@og-tester/core";
import { Command } from "commander";
import color from "picocolors";

const withScheme = (url: string): string =>
  /^https?:\/\//iu.test(url) ? url : `https://${url}`;

const loadSide = async (side: "A" | "B", url: string) => {
  try {
    const data = await fetchOgTags(url);
    const result = await runScorePage(data, url);
    return { data, result, url };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${side} (${url}): ${message}`, { cause: error });
  }
};

const signed = (n: number): string => {
  if (n === 0) {
    return "0";
  }
  return n > 0 ? `+${n}` : `−${Math.abs(n)}`;
};

const colorDelta = (n: number, text: string): string => {
  if (n > 0) {
    return color.green(text);
  }
  return n < 0 ? color.red(text) : color.dim(text);
};

const formatDiagnostic = (d: OgDiagnostic, paint: (s: string) => string) =>
  `${paint(color.bold(d.tag))} — ${d.message} (${d.points} points)`;

export const formatDiff = (diff: PageDiff): string => {
  const header = `A ${diff.a.score} → B ${diff.b.score} (${signed(diff.scoreDelta)})`;
  const lines = [
    color.bold(colorDelta(diff.scoreDelta, header)),
    `  ${color.dim("A:")} ${diff.a.url}`,
    `  ${color.dim("B:")} ${diff.b.url}`,
  ];

  const changedCategories = diff.categories.filter((c) => c.delta !== 0);
  const isIdentical =
    diff.tags.length === 0 &&
    changedCategories.length === 0 &&
    diff.fixed.length === 0 &&
    diff.regressed.length === 0;
  if (isIdentical) {
    lines.push("", color.green("No differences."));
    return lines.join("\n");
  }

  if (diff.tags.length > 0) {
    lines.push("", color.bold(color.cyan("Differing tags:")));
    for (const tag of diff.tags) {
      lines.push(
        `  ${color.dim(tag.key)}`,
        `    ${color.red("A:")} ${tag.a ?? color.dim("(missing)")}`,
        `    ${color.green("B:")} ${tag.b ?? color.dim("(missing)")}`
      );
    }
  }

  if (changedCategories.length > 0) {
    lines.push("", color.bold(color.magenta("Categories:")));
    for (const c of changedCategories) {
      lines.push(
        `  ${c.id.padEnd(8)} ${c.a} → ${c.b} ${colorDelta(c.delta, `(${signed(c.delta)})`)}`
      );
    }
  }

  if (diff.regressed.length > 0) {
    lines.push("", color.bold(color.red("Regressed (only in B):")));
    for (const d of diff.regressed) {
      lines.push(`  ${color.red("✖")} ${formatDiagnostic(d, color.red)}`);
    }
  }

  if (diff.fixed.length > 0) {
    lines.push("", color.bold(color.green("Fixed (only in A):")));
    for (const d of diff.fixed) {
      lines.push(`  ${color.green("✔")} ${formatDiagnostic(d, color.green)}`);
    }
  }

  return lines.join("\n");
};

export const diffCommand = new Command("diff")
  .description(
    "Compare the tags and scores of two URLs, such as staging against production"
  )
  .argument("<a>", "The baseline URL")
  .argument("<b>", "The URL to compare against the baseline")
  .option("--json", "Output the diff as JSON instead of pretty formatting")
  .option(
    "--fail-on-regression",
    "Exit 1 if B scores lower than A or has diagnostics A does not"
  )
  .action(async (a: string, b: string, _local, command: Command) => {
    // The root program also declares --json, so commander hands it to the
    // root and the subcommand's own options never see it.
    const options = command.optsWithGlobals<{
      failOnRegression?: boolean;
      json?: boolean;
    }>();
    const urlA = withScheme(a);
    const urlB = withScheme(b);

    if (!options.json) {
      intro(color.bgCyan(color.black(" OG Tester — Diff ")));
    }

    const s = spinner();
    if (!options.json) {
      s.start(
        `Fetching ${color.underline(urlA)} and ${color.underline(urlB)}...`
      );
    }

    try {
      const [pageA, pageB] = await Promise.all([
        loadSide("A", urlA),
        loadSide("B", urlB),
      ]);
      const diff = diffPages(pageA, pageB);

      if (options.json) {
        console.log(JSON.stringify(diff, null, 2));
      } else {
        s.stop("Fetched both pages.");
        note(formatDiff(diff), "Diff");
      }

      const regressed = diff.regressed.length > 0 || diff.scoreDelta < 0;
      if (options.failOnRegression && regressed) {
        if (!options.json) {
          outro(color.red("B regressed compared to A."));
        }
        process.exit(1);
      }
      if (!options.json) {
        outro(color.green("Done!"));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (options.json) {
        console.error(JSON.stringify({ error: message }, null, 2));
        process.exit(1);
      }
      s.stop(color.red("Failed to fetch or parse tags"));
      log.error(color.red(message));
      outro(color.red("Exited with errors."));
      process.exit(1);
    }
  });
