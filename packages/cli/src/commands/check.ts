import { intro, log, note, outro, spinner } from "@clack/prompts";
import type { OgData } from "@og-tester/core";
import { fetchOgTags } from "@og-tester/core";
import { Command } from "commander";
import color from "picocolors";

const formatFields = (
  data: OgData,
  fields: string[],
  emptyMsg: string
): string => {
  let text = "";
  let found = false;
  for (const field of fields) {
    const val = (data as OgData)[field];
    if (val) {
      text += `  ${color.dim(field)}: ${val}\n`;
      found = true;
    }
  }
  return found ? text : `  ${emptyMsg}\n`;
};

const formatReport = (data: OgData): string => {
  let summaryText = "";

  summaryText += `${color.bold(color.cyan("General Tags:"))}\n`;
  summaryText += formatFields(
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
  );
  summaryText += "\n";

  summaryText += `${color.bold(color.magenta("Open Graph Tags (og:*):"))}\n`;
  summaryText += formatFields(
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
  );
  summaryText += "\n";

  summaryText += `${color.bold(color.blue("Twitter Card Tags (twitter:*):"))}\n`;
  summaryText += formatFields(
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
  );
  summaryText += "\n";

  summaryText += `${color.bold(color.yellow("Favicons & Icons:"))}\n`;
  if (data.favicons && data.favicons.length > 0) {
    for (const icon of data.favicons) {
      summaryText += `  ${color.dim(icon.rel)}: ${icon.href} ${icon.sizes ? `(${icon.sizes})` : ""}\n`;
    }
  } else {
    summaryText += "  No icons detected.\n";
  }

  return summaryText;
};

export const checkCommand = new Command("check")
  .description("Fetch and analyze Open Graph and meta tags for a URL")
  .argument("<url>", "The URL to check")
  .option("--json", "Output raw JSON instead of pretty formatting")
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

      if (options.json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      s.stop("Successfully fetched and parsed tags!");
      note(formatReport(data), "Report");
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
