import { z } from 'zod'

export const sitemapUrlSchema = z.object({
  loc: z.string(),
  lastmod: z.string().optional(),
  changefreq: z.string().optional(),
  priority: z.string().optional()
})

export type SitemapUrl = z.infer<typeof sitemapUrlSchema>

export const sitemapSchema = z.object({
  content: z.string().optional(),
  urls: z.array(sitemapUrlSchema).optional(),
  error: z.string().optional()
})

export type SitemapData = z.infer<typeof sitemapSchema>
