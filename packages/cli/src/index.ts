import { Command } from "commander";

import { checkCommand } from "./commands/check";
import { robotsCommand } from "./commands/robots";
import { scanCommand } from "./commands/scan";
import { sitemapCommand } from "./commands/sitemap";
import { defaultAction } from "./default-action";

const program = new Command();

program
  .name("og-tester")
  .version("0.1.0")
  .description(
    "Test and analyze Open Graph, Twitter Card, and meta tags from the command line"
  )
  .argument(
    "[url-or-dir]",
    "URL to check or directory of a local web app to scan",
    "."
  )
  .option(
    "-s, --site",
    "Scan the entire site (sitemap & crawler) instead of a single page"
  )
  .option(
    "--concurrency <number>",
    "Number of concurrent URL requests during scanning",
    (val) => Number.parseInt(val, 10)
  )
  .option(
    "--max-urls <number>",
    "Maximum number of URLs to discover and scan",
    (val) => Number.parseInt(val, 10)
  )
  .option("--json", "Output raw JSON report to stdout instead of TUI")
  .option("--output <path>", "File path to write the JSON report")
  .option(
    "--min-score <number>",
    "Minimum average score threshold (exit 1 if below)",
    (val) => Number.parseInt(val, 10)
  )
  .action(defaultAction);

program.addCommand(checkCommand);
program.addCommand(robotsCommand);
program.addCommand(sitemapCommand);
program.addCommand(scanCommand);

program.parse();
