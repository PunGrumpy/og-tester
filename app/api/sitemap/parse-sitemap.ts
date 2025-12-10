import type { SitemapUrl } from '@/lib/schemas/sitemap'

const URL_REGEX = /<url>([\s\S]*?)<\/url>/gi
const LOC_REGEX = /<loc>([^<]+)<\/loc>/i
const LASTMOD_REGEX = /<lastmod>([^<]+)<\/lastmod>/i
const CHANGEFREQ_REGEX = /<changefreq>([^<]+)<\/changefreq>/i
const PRIORITY_REGEX = /<priority>([^<]+)<\/priority>/i

export const parseSitemap = (xml: string): SitemapUrl[] => {
  const urls: SitemapUrl[] = []

  for (const match of xml.matchAll(URL_REGEX)) {
    if (match[1] === undefined) {
      continue
    }

    const urlBlock = match[1]

    const locMatch = urlBlock.match(LOC_REGEX)
    if (!locMatch) {
      continue
    }

    const sitemapUrl: SitemapUrl = {
      loc: locMatch[1].trim()
    }

    const lastmodMatch = urlBlock.match(LASTMOD_REGEX)
    if (lastmodMatch) {
      sitemapUrl.lastmod = lastmodMatch[1].trim()
    }

    const changefreqMatch = urlBlock.match(CHANGEFREQ_REGEX)
    if (changefreqMatch) {
      sitemapUrl.changefreq = changefreqMatch[1].trim()
    }

    const priorityMatch = urlBlock.match(PRIORITY_REGEX)
    if (priorityMatch) {
      sitemapUrl.priority = priorityMatch[1].trim()
    }

    urls.push(sitemapUrl)
  }

  return urls
}
