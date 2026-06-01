import { intro, log, note, outro, spinner } from "@clack/prompts";
import { fetchSitemap } from "@og-tester/core";
import { Command } from "commander";
import color from "picocolors";

export const sitemapCommand = new Command("sitemap")
  .description("Fetch and parse a site's sitemap.xml")
  .argument("<url>", "The URL of the site")
  .option("--json", "Output raw JSON instead of pretty formatting")
  .action(async (url, options) => {
    let parsedUrl = url;
    if (!/^https?:\/\//iu.test(url)) {
      parsedUrl = `https://${url}`;
    }

    if (!options.json) {
      intro(color.bgCyan(color.black(" OG Tester — Sitemap.xml ")));
    }

    const s = spinner();
    if (!options.json) {
      s.start(
        `Fetching and parsing sitemap.xml for ${color.underline(parsedUrl)}...`
      );
    }

    try {
      const data = await fetchSitemap(parsedUrl);

      if (options.json) {
        console.log(JSON.stringify(data, null, 2));
        return;
      }

      s.stop("Successfully fetched and parsed sitemap.xml!");

      if (data.error) {
        log.error(color.red(data.error));
        outro(color.red("Exited with errors."));
        process.exit(1);
      }

      let summaryText = `Total URLs: ${color.bold(data.urls?.length ?? 0)}\n\n`;

      if (data.urls && data.urls.length > 0) {
        // Show top 15 URLs, page remaining
        const maxToShow = 15;
        const shownUrls = data.urls.slice(0, maxToShow);

        summaryText += `${color.bold("URLs Preview:")}\n`;
        for (const item of shownUrls) {
          summaryText += `  - ${color.cyan(item.loc)}`;
          if (item.priority) {
            summaryText += ` ${color.dim(`[priority: ${item.priority}]`)}`;
          }
          if (item.lastmod) {
            summaryText += ` ${color.dim(`(lastmod: ${item.lastmod})`)}`;
          }
          summaryText += "\n";
        }

        if (data.urls.length > maxToShow) {
          summaryText += `\n  ${color.dim(`... and ${data.urls.length - maxToShow} more URLs. Use --json to see all.`)}\n`;
        }
      } else {
        summaryText += "No URLs parsed from sitemap.\n";
      }

      note(summaryText, "Sitemap Summary");
      outro(color.green("Done!"));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (options.json) {
        console.error(JSON.stringify({ error: message }, null, 2));
        process.exit(1);
      }
      s.stop(color.red("Failed to fetch or parse sitemap"));
      log.error(color.red(message));
      outro(color.red("Exited with errors."));
      process.exit(1);
    }
  });
