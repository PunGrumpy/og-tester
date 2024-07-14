import * as cheerio from 'cheerio'
import { NextResponse } from 'next/server'

import { cors } from '@/lib/cors'

const API_KEY = process.env.API_KEY

export async function GET(request: Request) {
  const apiKey = request.headers.get('x-api-key')

  if (apiKey !== API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid API Key' },
      { status: 401 }
    )
  }

  const corsResponse = await cors(
    request,
    new NextResponse(JSON.stringify({ message: 'CORS check passed' }))
  )

  if (corsResponse.status !== 200) {
    return corsResponse
  }

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const response = await fetch(url)
    const html = await response.text()
    const $ = cheerio.load(html)

    const metadata = {
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
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch URL' },
        { status: 500 }
      )
    }
  }
}
