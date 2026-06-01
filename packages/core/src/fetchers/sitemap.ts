import { parseSitemap } from "../parsers/sitemap";
import type { SitemapData } from "../schemas/sitemap";

export const fetchSitemap = async (url: string): Promise<SitemapData> => {
  const { origin } = new URL(url);
  const sitemapUrl = `${origin}/sitemap.xml`;

  const response = await fetch(sitemapUrl);

  if (!response.ok) {
    return { error: `Failed to fetch sitemap.xml: ${response.status}` };
  }

  const content = await response.text();
  const urls = parseSitemap(content);
  return { content, urls };
};
