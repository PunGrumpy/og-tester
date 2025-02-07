import * as cheerio from 'cheerio'
import { NextResponse } from 'next/server'

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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    const metadata: Metadata = {
      ogTitle: $('meta[property="og:title"]').attr('content'),
      ogDescription: $('meta[property="og:description"]').attr('content'),
      ogImage: $('meta[property="og:image"]').attr('content'),
      ogUrl: $('meta[property="og:url"]').attr('content'),
      ogSiteName: $('meta[property="og:site_name"]').attr('content'),
      ogType: $('meta[property="og:type"]').attr('content'),
      twitterCard: $('meta[name="twitter:card"]').attr('content'),
      twitterSite: $('meta[name="twitter:site"]').attr('content'),
      twitterTitle: $('meta[name="twitter:title"]').attr('content'),
      twitterDescription: $('meta[name="twitter:description"]').attr('content'),
      twitterImage: $('meta[name="twitter:image"]').attr('content')
    }

    return NextResponse.json(metadata)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch URL' },
      {
        status: 500,
        statusText: error instanceof Error ? error.message : 'An error occurred'
      }
    )
  }
}
