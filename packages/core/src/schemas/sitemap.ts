import { z } from "zod";

export const sitemapUrlSchema = z.object({
  changefreq: z.string().optional(),
  lastmod: z.string().optional(),
  loc: z.string(),
  priority: z.string().optional(),
});

export type SitemapUrl = z.infer<typeof sitemapUrlSchema>;

export const sitemapSchema = z.object({
  content: z.string().optional(),
  error: z.string().optional(),
  urls: z.array(sitemapUrlSchema).optional(),
});

export type SitemapData = z.infer<typeof sitemapSchema>;
