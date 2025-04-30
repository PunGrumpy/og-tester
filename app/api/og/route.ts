import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export interface Metadata {
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  ogSiteName?: string
  ogType?: string
  twitterCard?: string
  twitterSite?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  articleAuthor?: string
  articlePublishedTime?: string
  ogLocale?: string
  ogVideoUrl?: string
  ogVideoType?: string
  favicon?: string
  structuredData?: string
}

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'shell',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded' })

    const metadata: Metadata = await page.evaluate(() => {
      const getMeta = (selector: string, attr: string = 'content') =>
        document.querySelector(selector)?.getAttribute(attr) || undefined

      const favicon =
        getMeta('link[rel="icon"]', 'href') ||
        getMeta('link[rel="shortcut icon"]', 'href') ||
        getMeta('link[rel="apple-touch-icon"]', 'href') ||
        getMeta('link[rel="apple-touch-icon-precomposed"]', 'href')

      const structuredData =
        document.querySelector('script[type="application/ld+json"]')
          ?.textContent || undefined

      return {
        ogTitle: getMeta('meta[property="og:title"]'),
        ogDescription: getMeta('meta[property="og:description"]'),
        ogImage: getMeta('meta[property="og:image"]'),
        ogUrl: getMeta('meta[property="og:url"]'),
        ogSiteName: getMeta('meta[property="og:site_name"]'),
        ogType: getMeta('meta[property="og:type"]'),

        twitterCard: getMeta('meta[name="twitter:card"]'),
        twitterSite: getMeta('meta[name="twitter:site"]'),
        twitterTitle: getMeta('meta[name="twitter:title"]'),
        twitterDescription: getMeta('meta[name="twitter:description"]'),
        twitterImage: getMeta('meta[name="twitter:image"]'),

        articleAuthor: getMeta('meta[property="article:author"]'),
        articlePublishedTime: getMeta(
          'meta[property="article:published_time"]'
        ),
        ogLocale: getMeta('meta[property="og:locale"]'),
        ogVideoUrl: getMeta('meta[property="og:video"]'),
        ogVideoType: getMeta('meta[property="og:video:type"]'),
        favicon,
        structuredData
      }
    })

    // Convert favicon to absolute URL
    if (metadata.favicon) {
      try {
        metadata.favicon = new URL(metadata.favicon, url).toString()
      } catch {
        metadata.favicon = undefined
      }
    }

    await browser.close()
    return NextResponse.json(metadata)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    )
  }
}
