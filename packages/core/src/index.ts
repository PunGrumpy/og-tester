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
export { scoreOgTags, runScoreOgTags } from "./scoring/index";
export { ogRules } from "./scoring/index";
export { OgDiagnostic, Severity } from "./schemas/diagnostic";
export { ScoreResult } from "./schemas/score";
