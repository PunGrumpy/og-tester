import type { SitemapUrl } from "../schemas/sitemap";

const URL_REGEX = /<url>([\s\S]*?)<\/url>/giu;
const LOC_REGEX = /<loc>([^<]+)<\/loc>/iu;
const LASTMOD_REGEX = /<lastmod>([^<]+)<\/lastmod>/iu;
const CHANGEFREQ_REGEX = /<changefreq>([^<]+)<\/changefreq>/iu;
const PRIORITY_REGEX = /<priority>([^<]+)<\/priority>/iu;

export const parseSitemap = (xml: string): SitemapUrl[] => {
  const urls: SitemapUrl[] = [];

  for (const match of xml.matchAll(URL_REGEX)) {
    const [, urlBlock] = match;
    if (urlBlock === undefined) {
      continue;
    }

    const locMatch = urlBlock.match(LOC_REGEX);
    if (!locMatch) {
      continue;
    }

    const sitemapUrl: SitemapUrl = {
      loc: locMatch[1].trim(),
    };

    const lastmodMatch = urlBlock.match(LASTMOD_REGEX);
    if (lastmodMatch) {
      sitemapUrl.lastmod = lastmodMatch[1].trim();
    }

    const changefreqMatch = urlBlock.match(CHANGEFREQ_REGEX);
    if (changefreqMatch) {
      sitemapUrl.changefreq = changefreqMatch[1].trim();
    }

    const priorityMatch = urlBlock.match(PRIORITY_REGEX);
    if (priorityMatch) {
      sitemapUrl.priority = priorityMatch[1].trim();
    }

    urls.push(sitemapUrl);
  }

  return urls;
};

const SITEMAP_REGEX = /<sitemap>([\s\S]*?)<\/sitemap>/giu;

export const isSitemapIndex = (xml: string): boolean =>
  /<sitemapindex/iu.test(xml);

export const parseSitemapIndex = (xml: string): string[] => {
  const urls: string[] = [];

  for (const match of xml.matchAll(SITEMAP_REGEX)) {
    const [, sitemapBlock] = match;
    if (sitemapBlock === undefined) {
      continue;
    }

    const locMatch = sitemapBlock.match(LOC_REGEX);
    if (locMatch) {
      urls.push(locMatch[1].trim());
    }
  }

  return urls;
};
