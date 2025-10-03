import type { Metadata } from '@/app/api/og/route'
import { cache } from 'react'

export const fetchMetadata = cache(async (url: string): Promise<Metadata> => {
  const formattedUrl = url.startsWith('http') ? url : `https://${url}`
  const response = await fetch(
    `/api/og?url=${encodeURIComponent(formattedUrl)}`
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      `Failed to fetch metadata: ${errorData.error || response.statusText}`
    )
  }

  return response.json()
})
