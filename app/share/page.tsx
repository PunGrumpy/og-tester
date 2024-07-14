'use client'

import { notFound, useSearchParams } from 'next/navigation'

import { SharedMetadataResults } from '@/components/SharedMetadataResults'

export default function SharePage() {
  const searchParams = useSearchParams()
  const url = searchParams.get('url')

  if (!url) {
    notFound()
  }

  return <SharedMetadataResults url={url} />
}
