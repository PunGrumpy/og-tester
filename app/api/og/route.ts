import { type NextRequest, NextResponse } from 'next/server'
import { type HTMLElement, parse } from 'node-html-parser'
import { createQueryHelpers, getAttribute } from '@/lib/html-parser'

export type Metadata = {
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

const FETCH_TIMEOUT = 10_000 // 10 seconds
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

const extractFavicon = (helpers: ReturnType<typeof createQueryHelpers>) => {
  const faviconLinks = helpers.selectAll('link[rel~=icon]')

  for (const link of faviconLinks) {
    const href = getAttribute(link, 'href')
    if (href) {
      const resolved = helpers.resolveUrl(href)
      if (resolved) {
        return resolved
      }
    }
  }

  return
}

const extractStructuredData = (
  helpers: ReturnType<typeof createQueryHelpers>
) => {
  const element = helpers.select('script[type="application/ld+json"]')
  return element?.text
}

const extractOpenGraphMetadata = (
  helpers: ReturnType<typeof createQueryHelpers>
) => ({
  ogTitle: helpers.getOg('og:title') ?? undefined,
  ogDescription: helpers.getOg('og:description') ?? undefined,
  ogImage: helpers.getOg('og:image') ?? undefined,
  ogUrl: helpers.getOg('og:url') ?? undefined,
  ogSiteName: helpers.getOg('og:site_name') ?? undefined,
  ogType: helpers.getOg('og:type') ?? undefined,
  ogLocale: helpers.getOg('og:locale') ?? undefined,
  ogVideoUrl: helpers.getOg('og:video') ?? undefined,
  ogVideoType: helpers.getOg('og:video:type') ?? undefined
})

const extractArticleMetadata = (
  helpers: ReturnType<typeof createQueryHelpers>
) => ({
  articleAuthor: helpers.getOg('og:article:author') ?? undefined,
  articlePublishedTime: helpers.getOg('og:article:published_time') ?? undefined
})

const extractTwitterMetadata = (
  helpers: ReturnType<typeof createQueryHelpers>
) => ({
  twitterCard: helpers.getTwitter('twitter:card') ?? undefined,
  twitterSite: helpers.getTwitter('twitter:site') ?? undefined,
  twitterTitle: helpers.getTwitter('twitter:title') ?? undefined,
  twitterDescription: helpers.getTwitter('twitter:description') ?? undefined,
  twitterImage: helpers.getTwitter('twitter:image') ?? undefined
})

const extractMetadata = (root: HTMLElement, baseUrl: string): Metadata => {
  const helpers = createQueryHelpers(root, baseUrl)

  return {
    ...extractOpenGraphMetadata(helpers),
    ...extractArticleMetadata(helpers),
    ...extractTwitterMetadata(helpers),
    favicon: extractFavicon(helpers),
    structuredData: extractStructuredData(helpers)
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
    const root = parse(html)
    const metadata = extractMetadata(root, url)

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
