// Parsers

// Fetchers (fetch + parse combined)
export { fetchOgTags, fetchOgTagsEffect } from "./fetchers/og";
export { fetchRobotsTxt, fetchRobotsTxtEffect } from "./fetchers/robots";
export { fetchSitemap, fetchSitemapEffect } from "./fetchers/sitemap";
export { parseOgTags } from "./parsers/og";
export { parseSitemap } from "./parsers/sitemap";

// Types (inferred from schemas)
export type { FaviconData, ImageInfo, OgData } from "./schemas/og";

// Schemas
export { faviconSchema, imageInfoSchema, ogSchema } from "./schemas/og";
export type { RobotsData } from "./schemas/robots";
export { robotsSchema } from "./schemas/robots";
export type { SitemapData, SitemapUrl } from "./schemas/sitemap";
export { sitemapSchema, sitemapUrlSchema } from "./schemas/sitemap";

// Scoring
export { scoreOgTags, runScoreOgTags } from "./scoring/engine";
export type { PageScoreResult, CategoryScore } from "./scoring/engine";
export { ogRules } from "./scoring/rules";
export type { OgRule } from "./scoring/rules";
export { CATEGORY_INFO, CATEGORY_IDS } from "./scoring/categories";
export type { CategoryId, RuleCategory } from "./scoring/categories";
export { checkImageMeta, parseImageMeta } from "./scoring/image";
export type { ImageMeta } from "./scoring/image";
export { OgDiagnostic, Severity } from "./schemas/diagnostic";
export { ScoreResult } from "./schemas/score";

// Crawler & Discovery
export { crawlSite } from "./crawler/crawler";
export type { CrawlerOptions } from "./crawler/crawler";
export { discoverUrls } from "./crawler/discovery";
export type { DiscoveryOptions } from "./crawler/discovery";

// Scanner
export { scanSite, runScanSite } from "./scanner/scanner";
export type {
  ScanOptions,
  ScanProgressEvent,
  ScanReport,
} from "./scanner/scanner";
