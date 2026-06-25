import { existsSync, readFileSync, lstatSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve, relative } from "node:path";
import { setTimeout } from "node:timers/promises";

import { intro, log, note, outro, spinner } from "@clack/prompts";
import {
  fetchOgTags,
  runScoreOgTags,
  runScanSite,
  parseOgTags,
} from "@og-tester/core";
import type { PageScoreResult, ScanReport } from "@og-tester/core";
import color from "picocolors";

import { formatReport, drawScoreBlock } from "./commands/check";
import { getScoreColor, displayTuiReport } from "./commands/scan";

export interface CliOptions {
  site?: boolean;
  scan?: boolean;
  concurrency?: number;
  maxUrls?: number;
  minScore?: number;
  output?: string;
  json?: boolean;
}

interface ResolvedOptions {
  concurrency: number;
  json: boolean;
  maxUrls: number;
  minScore?: number;
  output?: string;
  scan: boolean;
}

interface OgTesterConfig {
  url?: string;
  scan?: boolean;
  concurrency?: number;
  maxUrls?: number;
  minScore?: number;
  output?: string;
}

const getHtmlFiles = async (
  dir: string,
  rootDir: string
): Promise<string[]> => {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".git" ||
        entry.name === ".next" ||
        entry.name === ".turbo" ||
        entry.name === "build" ||
        (entry.name === "dist" && dir !== rootDir)
      ) {
        continue;
      }
      files.push(...(await getHtmlFiles(fullPath, rootDir)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
};

const loadConfig = (dirPath: string): OgTesterConfig | null => {
  const jsonConfigPath = join(dirPath, "og-tester.config.json");
  if (existsSync(jsonConfigPath)) {
    try {
      const content = readFileSync(jsonConfigPath, "utf-8");
      return JSON.parse(content) as OgTesterConfig;
    } catch {
      log.warn(`Warning: Failed to parse ${jsonConfigPath}`);
    }
  }

  const packageJsonPath = join(dirPath, "package.json");
  if (existsSync(packageJsonPath)) {
    try {
      const content = readFileSync(packageJsonPath, "utf-8");
      const packageJson = JSON.parse(content);
      if (packageJson.ogTester) {
        return packageJson.ogTester as OgTesterConfig;
      }
    } catch {
      // Ignore package.json parsing issues.
    }
  }

  return null;
};

const saveReportFile = async (
  output: string,
  report: ScanReport,
  jsonMode: boolean
): Promise<void> => {
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

const checkUrl = async (
  url: string,
  options: ResolvedOptions
): Promise<void> => {
  let parsedUrl = url;
  if (!/^https?:\/\//iu.test(url)) {
    parsedUrl = `https://${url}`;
  }

  if (!options.json) {
    intro(color.bgCyan(color.black(" OG Tester — Check Tags ")));
  }

  const s = spinner();
  if (!options.json) {
    s.start(`Fetching and parsing ${color.underline(parsedUrl)}...`);
  }

  try {
    const data = await fetchOgTags(parsedUrl);
    const scoreResult = await runScoreOgTags(data);

    if (options.json) {
      const jsonOutput = {
        ...data,
        diagnostics: scoreResult.diagnostics,
        maxScore: scoreResult.maxScore,
        passed: scoreResult.passed,
        score: scoreResult.score,
      };
      console.log(JSON.stringify(jsonOutput, null, 2));

      if (
        options.minScore !== undefined &&
        scoreResult.score < options.minScore
      ) {
        process.exit(1);
      }
      return;
    }

    s.stop("Successfully fetched and parsed tags!");
    note(formatReport(data), "Report");

    const shouldAnimate = process.stdout.isTTY && !options.json;

    if (shouldAnimate) {
      process.stdout.write("\u001B[?25l");
      try {
        const frames = 15;
        const delay = 30;
        for (let i = 0; i <= frames; i += 1) {
          const animatedScore = Math.round((scoreResult.score * i) / frames);
          if (i > 0) {
            process.stdout.write("\u001B[7A\u001B[J");
          }
          process.stdout.write(drawScoreBlock(animatedScore));
          await setTimeout(delay);
        }
      } finally {
        process.stdout.write("\u001B[?25h");
      }
    } else {
      process.stdout.write(drawScoreBlock(scoreResult.score));
    }

    if (scoreResult.diagnostics.length > 0) {
      const recommendationsText = scoreResult.diagnostics
        .map((d) => {
          let icon = color.blue("ℹ");
          if (d.severity === "error") {
            icon = color.red("✖");
          } else if (d.severity === "warning") {
            icon = color.yellow("⚠");
          }
          return `${icon} ${color.bold(d.tag)} — ${d.message} (-${d.points} points)\n    ${color.dim("→ Add:")} ${color.green(d.suggestion)}`;
        })
        .join("\n\n");
      note(recommendationsText, "Recommendations");
    }

    if (
      options.minScore !== undefined &&
      scoreResult.score < options.minScore
    ) {
      outro(
        color.red(
          `Score ${scoreResult.score} is below minimum ${options.minScore}`
        )
      );
      process.exit(1);
    }

    outro(color.green("Done!"));
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
};

const scanUrl = async (
  url: string,
  options: ResolvedOptions
): Promise<void> => {
  let parsedUrl = url;
  if (!/^https?:\/\//iu.test(url)) {
    parsedUrl = `https://${url}`;
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

    if (options.output) {
      await saveReportFile(options.output, report, options.json);
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

    displayTuiReport(report);

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
};

const processScanResults = async (
  pageScores: PageScoreResult[],
  resolvedDir: string,
  options: ResolvedOptions
): Promise<void> => {
  const totalPages = pageScores.length;
  const sumScore = pageScores.reduce((sum, p) => sum + p.score, 0);
  const averageScore = Math.round(sumScore / totalPages);

  const categorySums = { image: 0, og: 0, seo: 0, twitter: 0 };
  for (const page of pageScores) {
    for (const cat of page.categories) {
      const percentage =
        cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0;
      if (cat.id in categorySums) {
        categorySums[cat.id as keyof typeof categorySums] += percentage;
      }
    }
  }

  const categoryAverages = {
    image: Math.round(categorySums.image / totalPages),
    og: Math.round(categorySums.og / totalPages),
    seo: Math.round(categorySums.seo / totalPages),
    twitter: Math.round(categorySums.twitter / totalPages),
  };

  const summary = { excellent: 0, fair: 0, good: 0, poor: 0 };
  for (const page of pageScores) {
    if (page.score >= 90) {
      summary.excellent += 1;
    } else if (page.score >= 75) {
      summary.good += 1;
    } else if (page.score >= 50) {
      summary.fair += 1;
    } else {
      summary.poor += 1;
    }
  }

  const report: ScanReport = {
    averageScore,
    categoryAverages,
    pages: pageScores,
    scannedAt: new Date().toISOString(),
    siteUrl: resolvedDir,
    summary,
    totalPages,
  };

  if (options.output) {
    await saveReportFile(options.output, report, options.json);
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

  displayTuiReport(report);

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
};

const scanLocalDirectory = async (
  dirPath: string,
  options: ResolvedOptions
): Promise<void> => {
  const resolvedDir = resolve(dirPath);

  if (!options.json) {
    intro(color.bgCyan(color.black(" OG Tester — Local HTML Scanner ")));
  }

  const s = spinner();
  if (!options.json) {
    s.start(`Searching for HTML files in ${color.underline(resolvedDir)}...`);
  }

  try {
    const htmlFiles = await getHtmlFiles(resolvedDir, resolvedDir);

    if (htmlFiles.length === 0) {
      s.stop("No HTML files found!");
      if (options.json) {
        console.error(JSON.stringify({ error: "No HTML files found" }));
      } else {
        log.warn(`No .html files were found recursively in ${resolvedDir}.`);
        outro(
          "Ensure the directory contains HTML files (e.g. from static export/build)."
        );
      }
      process.exit(1);
    }

    if (!options.json) {
      s.message(`Found ${htmlFiles.length} HTML files. Parsing and scoring...`);
    }

    const pageScores: PageScoreResult[] = [];
    let completed = 0;

    for (const filePath of htmlFiles) {
      const relativePath = relative(resolvedDir, filePath);
      const htmlContent = await readFile(filePath, "utf-8");

      const dummyUrl = `file:///${relativePath.replaceAll("\\", "/")}`;
      const ogData = parseOgTags(htmlContent, dummyUrl);
      const scoreResult = await runScoreOgTags(ogData, { pageUrl: dummyUrl });

      scoreResult.url = `/${relativePath.replaceAll("\\", "/")}`;

      pageScores.push(scoreResult);
      completed += 1;

      if (!options.json) {
        s.message(
          `Scanned: [${completed}/${htmlFiles.length}] ${scoreResult.url} (${getScoreColor(scoreResult.score)(scoreResult.score)}/100)`
        );
      }
    }

    s.stop(`Successfully scanned ${pageScores.length} pages!`);

    await processScanResults(pageScores, resolvedDir, options);
  } catch (error) {
    if (options.json) {
      console.error(
        JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        })
      );
    } else {
      s.stop("Failed to scan!");
      log.error(
        `Scan error: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    process.exit(1);
  }
};

const resolveOptions = (
  cliOptions: CliOptions,
  config: OgTesterConfig | null
): ResolvedOptions => ({
  concurrency: cliOptions.concurrency ?? config?.concurrency ?? 5,
  json: cliOptions.json ?? false,
  maxUrls: cliOptions.maxUrls ?? config?.maxUrls ?? 200,
  minScore: cliOptions.minScore ?? config?.minScore,
  output: cliOptions.output ?? config?.output,
  scan: cliOptions.site || cliOptions.scan || config?.scan || false,
});

const resolveTargetUrl = (
  urlOrDir: string,
  config: OgTesterConfig | null
): { isUrl: boolean; url: string } => {
  if (
    urlOrDir &&
    (urlOrDir.startsWith("http://") || urlOrDir.startsWith("https://"))
  ) {
    return { isUrl: true, url: urlOrDir };
  }
  if (
    urlOrDir &&
    /^[a-z0-9]+([-.]?[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/iu.test(
      urlOrDir
    )
  ) {
    return { isUrl: true, url: `https://${urlOrDir}` };
  }
  if (config?.url) {
    return { isUrl: true, url: config.url };
  }
  return { isUrl: false, url: "" };
};

export const defaultAction = async (
  urlOrDir: string,
  cliOptions: CliOptions
): Promise<void> => {
  const targetPath = resolve(urlOrDir || ".");
  let config: OgTesterConfig | null = null;
  let isDirectory = false;

  try {
    const stats = existsSync(targetPath) ? lstatSync(targetPath) : null;
    isDirectory = stats ? stats.isDirectory() : false;
    if (isDirectory) {
      config = loadConfig(targetPath);
    }
  } catch {
    // Ignore issues checking directory path.
  }

  const options = resolveOptions(cliOptions, config);
  const target = resolveTargetUrl(urlOrDir, config);

  if (target.isUrl) {
    await (options.scan
      ? scanUrl(target.url, options)
      : checkUrl(target.url, options));
  } else if (isDirectory) {
    await scanLocalDirectory(targetPath, options);
  } else {
    log.error(`Error: Path or URL "${urlOrDir}" is not accessible.`);
    process.exit(1);
  }
};
