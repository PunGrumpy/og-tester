import { type NextRequestWithUnkeyContext, withUnkey } from '@unkey/nextjs'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { parseError } from '@/lib/error'
import { parseOgTags } from '@/lib/parse-og-tags'

export const GET = withUnkey(
  async (request: NextRequestWithUnkeyContext) => {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OGTester/1.0)'
      }
    })

    if (!response.ok) {
      const message = parseError(response.statusText)
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const html = await response.text()
    const ogData = parseOgTags(html)

    return NextResponse.json(ogData)
  },
  {
    rootKey: env.UNKEY_ROOT_KEY,
    tags: ['og-tester']
  }
)
