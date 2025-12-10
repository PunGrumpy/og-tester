import { type NextRequestWithUnkeyContext, withUnkey } from '@unkey/nextjs'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export const GET = withUnkey(
  async (request: NextRequestWithUnkeyContext) => {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const response = await fetch(`${url}/robots.txt`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OGTester/1.0)'
      }
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch robots.txt' },
        { status: 500 }
      )
    }

    const data = await response.text()

    return NextResponse.json({ content: data })
  },
  {
    rootKey: env.UNKEY_ROOT_KEY,
    tags: ['og-tester', 'robots']
  }
)
