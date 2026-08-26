import { setTimeout } from "node:timers/promises";

import { intro, log, note, outro, spinner } from "@clack/prompts";
import type { OgData } from "@og-tester/core";
import { fetchOgTags, runScorePage } from "@og-tester/core";
import { Command } from "commander";
import color from "picocolors";

import { parseScore } from "../options";

const formatFields = (
  data: OgData,
  fields: string[],
  emptyMsg: string
): string => {
  const dataRecord = data as Record<string, unknown>;
  const lines = fields
    .map((field) => {
      const val = dataRecord[field];
      return val ? `  ${color.dim(field)}: ${val}` : null;
    })
    .filter((line): line is string => line !== null);

  return lines.length > 0 ? `${lines.join("\n")}\n` : `  ${emptyMsg}\n`;
};

export const formatReport = (data: OgData): string => {
  const sections = [
    `${color.bold(color.cyan("General Tags:"))}\n${formatFields(
      data,
      [
        "title",
        "description",
        "author",
        "canonical",
        "robots",
        "keywords",
        "themeColor",
      ],
      "No general tags detected."
    )}`,
    `${color.bold(color.magenta("Open Graph Tags (og:*):"))}\n${formatFields(
      data,
      [
        "og:title",
        "og:description",
        "og:image",
        "og:url",
        "og:type",
        "og:site_name",
        "og:locale",
      ],
      "No Open Graph tags detected."
    )}`,
    `${color.bold(color.blue("Twitter Card Tags (twitter:*):"))}\n${formatFields(
      data,
      [
        "twitter:card",
        "twitter:title",
        "twitter:description",
        "twitter:image",
        "twitter:site",
        "twitter:creator",
      ],
      "No Twitter Card tags detected."
    )}`,
    `${color.bold(color.yellow("Favicons & Icons:"))}\n${
      data.favicons && data.favicons.length > 0
        ? `${data.favicons
            .map(
              (icon) =>
                `  ${color.dim(icon.rel)}: ${icon.href}${icon.sizes ? ` (${icon.sizes})` : ""}`
            )
            .join("\n")}\n`
        : "  No icons detected.\n"
    }`,
  ];

  return sections.join("\n");
};

const getLabel = (score: number): string => {
  if (score === 100) {
    return "Great";
  }
  if (score >= 75) {
    return "Good";
  }
  if (score >= 50) {
    return "Fair";
  }
  return "Poor";
};

const colorizeScore = (text: string, score: number): string => {
  if (score >= 75) {
    return color.green(text);
  }
  if (score >= 50) {
    return color.yellow(text);
  }
  return color.red(text);
};

export const buildScoreHeader = (
  score: number,
  branding = "OG Tester — Check Tags"
): string => {
  const label = getLabel(score);

  let faceLines: string[] = [];
  if (score === 100) {
    faceLines = ["╭/\\─────/\\╮", "│ ( ^.^ ) │", "│ ⚞  ⩊  ⚟ │", "╰─────────╯"];
  } else if (score >= 75) {
    faceLines = ["╭/\\─────/\\╮", "│ ( ◕.◕ ) │", "│ ⚞  ◡  ⚟ │", "╰─────────╯"];
  } else if (score >= 50) {
    faceLines = ["╭/\\─────/\\╮", "│ ( •.• ) │", "│ ⚞  ─  ⚟ │", "╰─────────╯"];
  } else {
    faceLines = ["╭/\\─────/\\╮", "│ ( ✕.✕ ) │", "│ ⚞  ︵ ⚟ │", "╰─────────╯"];
  }
  const coloredFace = faceLines.map((line) => colorizeScore(line, score));

  const barChars = 20;
  const filledCount = Math.round((score / 100) * barChars);
  const emptyCount = barChars - filledCount;
  const scoreBar =
    colorizeScore("█".repeat(filledCount), score) +
    color.dim("░".repeat(emptyCount));

  const scoreLine = `${colorizeScore(`${score}`, score)} ${color.dim("/ 100")} ${colorizeScore(label, score)}`;
  const brandingLine = color.dim(branding);

  const rightLines = [scoreLine, scoreBar, brandingLine, ""];

  return coloredFace
    .map((faceLine, i) => {
      const rightLine = rightLines[i];
      const separator = rightLine ? "  " : "";
      return `${faceLine}${separator}${rightLine}`;
    })
    .join("\n");
};

export const drawScoreBlock = (
  score: number,
  branding = "OG Tester — Check Tags",
  title = "Score"
): string => {
  const content = buildScoreHeader(score, branding);
  const body = content
    .split("\n")
    .map((line) => `${color.dim("│")}  ${line}`)
    .join("\n");

  return [
    `${color.cyan("◇")}  ${color.bold(title)}`,
    color.dim("│"),
    body,
    color.dim("│"),
    "",
  ].join("\n");
};

export const checkCommand = new Command("check")
  .description("Fetch and analyze Open Graph and meta tags for a URL")
  .argument("<url>", "The URL to check")
  .option("--json", "Output raw JSON instead of pretty formatting")
  .option(
    "--min-score <number>",
    "Minimum score threshold (exit 1 if below)",
    parseScore
  )
  .action(async (url, options) => {
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
      const scoreResult = await runScorePage(data, parsedUrl);

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
            // oxlint-disable-next-line eslint/no-await-in-loop -- animation frame pacing
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
  });
