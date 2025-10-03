import * as cheerio from 'cheerio'
import { type NextRequest, NextResponse } from 'next/server'

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

const FETCH_TIMEOUT = 10000 // 10 seconds
const CACHE_MAX_AGE = 300 // 5 minutes

const fetchWithTimeout = async (
  url: string,
  timeout: number
): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OGTester/1.0)'
      }
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

const extractMetadata = ($: cheerio.CheerioAPI, baseUrl: string): Metadata => {
  // Build maps for fast O(1) lookup instead of repeated DOM traversal
  const metaPropertyMap = new Map<string, string>()
  const metaNameMap = new Map<string, string>()

  // Single pass through all meta tags
  $('meta').each((_, element) => {
    const el = $(element)
    const content = el.attr('content')
    if (!content) {
      return
    }

    const property = el.attr('property')
    if (property) {
      metaPropertyMap.set(property, content)
    }

    const name = el.attr('name')
    if (name) {
      metaNameMap.set(name, content)
    }
  })

  // Extract favicon with single query
  const faviconLinks = $('link[rel*="icon"]')
  let favicon: string | undefined

  for (const link of faviconLinks.toArray()) {
    const href = $(link).attr('href')
    if (href) {
      try {
        favicon = new URL(href, baseUrl).toString()
        break
      } catch {
        // Skip invalid URLs
      }
    }
  }

  // Extract structured data
  const structuredData =
    $('script[type="application/ld+json"]').first().html() || undefined

  return {
    ogTitle: metaPropertyMap.get('og:title'),
    ogDescription: metaPropertyMap.get('og:description'),
    ogImage: metaPropertyMap.get('og:image'),
    ogUrl: metaPropertyMap.get('og:url'),
    ogSiteName: metaPropertyMap.get('og:site_name'),
    ogType: metaPropertyMap.get('og:type'),
    ogLocale: metaPropertyMap.get('og:locale'),
    ogVideoUrl: metaPropertyMap.get('og:video'),
    ogVideoType: metaPropertyMap.get('og:video:type'),
    articleAuthor: metaPropertyMap.get('article:author'),
    articlePublishedTime: metaPropertyMap.get('article:published_time'),
    twitterCard: metaNameMap.get('twitter:card'),
    twitterSite: metaNameMap.get('twitter:site'),
    twitterTitle: metaNameMap.get('twitter:title'),
    twitterDescription: metaNameMap.get('twitter:description'),
    twitterImage: metaNameMap.get('twitter:image'),
    favicon,
    structuredData
  }
}

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  try {
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.statusText}` },
        { status: response.status }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)
    const metadata = extractMetadata($, url)

    return NextResponse.json(metadata, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate`
      }
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch URL'

    return NextResponse.json(
      {
        error: message.includes('abort')
          ? 'Request timeout'
          : 'Failed to fetch URL'
      },
      { status: 500 }
    )
  }
}
