import { type NextRequestWithUnkeyContext, withUnkey } from '@unkey/nextjs'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { parseSitemap } from './parse-sitemap'

export const GET = withUnkey(
  async (request: NextRequestWithUnkeyContext) => {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const response = await fetch(`${url}/sitemap.xml`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OGTester/1.0)'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sitemap.xml' },
        { status: 500 }
      )
    }

    const data = await response.text()
    const urls = parseSitemap(data)

    return NextResponse.json({ content: data, urls })
  },
  {
    rootKey: env.UNKEY_ROOT_KEY,
    tags: ['og-tester', 'robots']
  }
)
