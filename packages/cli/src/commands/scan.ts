import { writeFile } from "node:fs/promises";

import { intro, log, note, outro, spinner } from "@clack/prompts";
import { runScanSite } from "@og-tester/core";
import type { ScanReport } from "@og-tester/core";
import { Command } from "commander";
import color from "picocolors";

import { drawScoreBlock } from "./check";

export const getScoreColor = (score: number) => {
  if (score >= 90) {
    return color.green;
  }
  if (score >= 75) {
    return color.cyan;
  }
  if (score >= 50) {
    return color.yellow;
  }
  return color.red;
};

const saveReportFile = async (
  output: string,
  report: ScanReport,
  jsonMode: boolean
) => {
  try {
    await writeFile(output, JSON.stringify(report, null, 2), "utf-8");
    if (!jsonMode) {
      log.info(`Report saved to ${color.cyan(output)}`);
    }
  } catch (error) {
    if (!jsonMode) {
      log.error(
        `Failed to save report to ${output}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
};

export const displayTuiReport = (report: ScanReport) => {
  // Print cat-face score block for the site-wide average score
  process.stdout.write(
    drawScoreBlock(
      report.averageScore,
      "OG Tester — Site Scan",
      "Site-wide Average Score"
    )
  );

  // 1. Site-wide Average Dashboard
  const dashboardText = [
    `${color.bold("Category Breakdown:")}`,
    `  ${color.dim("•")} Open Graph (OG) Tags:     ${getScoreColor(report.categoryAverages.og)(report.categoryAverages.og)}%`,
    `  ${color.dim("•")} Twitter Card Tags:      ${getScoreColor(report.categoryAverages.twitter)(report.categoryAverages.twitter)}%`,
    `  ${color.dim("•")} Core Search SEO:         ${getScoreColor(report.categoryAverages.seo)(report.categoryAverages.seo)}%`,
    `  ${color.dim("•")} og:image Validation:     ${getScoreColor(report.categoryAverages.image)(report.categoryAverages.image)}%`,
    "",
    `${color.bold("Page Score Distribution:")}`,
    `  ${color.green("Excellent (90-100)")}:  ${report.summary.excellent} pages`,
    `  ${color.cyan("Good (75-89)")}:       ${report.summary.good} pages`,
    `  ${color.yellow("Fair (50-74)")}:       ${report.summary.fair} pages`,
    `  ${color.red("Poor (0-49)")}:       ${report.summary.poor} pages`,
  ].join("\n");

  note(dashboardText, "Dashboard");

  // 2. Worst Performing Pages (sorted ascending by score)
  const sortedPages = [...report.pages].toSorted((a, b) => a.score - b.score);
  const worstPagesCount = Math.min(10, sortedPages.length);
  if (worstPagesCount > 0) {
    const worstPagesList = sortedPages
      .slice(0, worstPagesCount)
      .map((page) => {
        const path = page.url ? new URL(page.url).pathname : "/";
        const colorFn = getScoreColor(page.score);
        return `  [${colorFn(page.score.toString().padStart(3))}/100] ${color.dim(path || "/")} — ${page.diagnostics.length} issues`;
      })
      .join("\n");

    note(
      worstPagesList +
        (sortedPages.length > 10
          ? `\n  ... and ${sortedPages.length - 10} more pages`
          : ""),
      `Top Issues - Worst ${worstPagesCount} Pages`
    );
  }

  // 3. Group and Display Common Site-wide Issues
  const issueGroups: Record<
    string,
    { tag: string; message: string; count: number; severity: string }
  > = {};
  for (const page of report.pages) {
    for (const diag of page.diagnostics) {
      const key = `${diag.tag}:${diag.message}`;
      if (!issueGroups[key]) {
        issueGroups[key] = {
          count: 0,
          message: diag.message,
          severity: diag.severity,
          tag: diag.tag,
        };
      }
      issueGroups[key].count += 1;
    }
  }

  const sortedIssues = Object.values(issueGroups).toSorted(
    (a, b) => b.count - a.count
  );
  const topIssuesCount = Math.min(5, sortedIssues.length);
  if (topIssuesCount > 0) {
    const issuesList = sortedIssues
      .slice(0, topIssuesCount)
      .map((issue) => {
        let sevColor = color.blue;
        if (issue.severity === "error") {
          sevColor = color.red;
        } else if (issue.severity === "warning") {
          sevColor = color.yellow;
        }
        return `  ${sevColor(issue.tag)} — ${issue.message}\n    Failing on ${color.bold(issue.count)} pages (${Math.round((issue.count / report.totalPages) * 100)}% of site)`;
      })
      .join("\n\n");

    note(issuesList, `Top ${topIssuesCount} Site-wide Common Issues`);
  }
};

export const scanCommand = new Command("scan")
  .description(
    "Scan an entire site (sitemap & crawler fallback) and perform OG/SEO scoring"
  )
  .argument("<site-url>", "The website base URL to scan")
  .option(
    "--concurrency <number>",
    "Number of concurrent URL requests",
    (val) => Number.parseInt(val, 10),
    5
  )
  .option(
    "--max-urls <number>",
    "Maximum number of URLs to discover and scan",
    (val) => Number.parseInt(val, 10),
    200
  )
  .option("--json", "Output raw JSON report to stdout instead of TUI")
  .option(
    "--output <path>",
    "File path to write the JSON report",
    "./og-report.json"
  )
  .option(
    "--min-score <number>",
    "Minimum average score threshold (exit 1 if below)",
    (val) => Number.parseInt(val, 10)
  )
  .action(async (siteUrl, options) => {
    let parsedUrl = siteUrl;
    if (!/^https?:\/\//iu.test(siteUrl)) {
      parsedUrl = `https://${siteUrl}`;
    }

    if (!options.json) {
      intro(color.bgCyan(color.black(" OG Tester — Site Scanner ")));
    }

    const s = spinner();
    let currentPhase: "discovery" | "checking" | "complete" = "discovery";

    if (!options.json) {
      s.start(
        `Discovering URLs from sitemap / homepage for ${color.underline(parsedUrl)}...`
      );
    }

    try {
      const report = await runScanSite({
        concurrency: options.concurrency,
        maxUrls: options.maxUrls,
        onProgress: (event) => {
          if (options.json) {
            return;
          }

          if (event.type === "discovery") {
            currentPhase = "discovery";
            s.message(`Discovering site URLs...`);
          } else if (event.type === "checking") {
            if (currentPhase !== "checking") {
              currentPhase = "checking";
            }
            const progressMsg = `Scanning: [${event.completedUrls}/${event.totalUrls}] ${event.url} (${getScoreColor(event.result?.score || 0)(event.result?.score || 0)}/100)`;
            s.message(progressMsg);
          } else if (event.type === "complete") {
            currentPhase = "complete";
          }
        },
        siteUrl: parsedUrl,
      });

      if (!options.json) {
        s.stop(`Successfully scanned ${report.totalPages} pages!`);
      }

      // Write report to file
      if (options.output) {
        await saveReportFile(options.output, report, !!options.json);
      }

      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        if (
          options.minScore !== undefined &&
          report.averageScore < options.minScore
        ) {
          process.exit(1);
        }
        return;
      }

      // Display TUI Results
      displayTuiReport(report);

      // CI check
      if (
        options.minScore !== undefined &&
        report.averageScore < options.minScore
      ) {
        outro(
          color.red(
            `Scan failed: Average score ${report.averageScore} is below the threshold of ${options.minScore}`
          )
        );
        process.exit(1);
      }

      outro(
        color.green(`Scan complete! Average score: ${report.averageScore}/100`)
      );
    } catch (error) {
      if (options.json) {
        console.error(
          JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          })
        );
        process.exit(1);
      } else {
        s.stop("Failed to scan!");
        log.error(
          `Scan error: ${error instanceof Error ? error.message : String(error)}`
        );
        process.exit(1);
      }
    }
  });
