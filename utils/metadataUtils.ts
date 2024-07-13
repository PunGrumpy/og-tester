import { MetadataAttributes } from '@/types/metadata'

export async function fetchMetadata(url: string): Promise<MetadataAttributes> {
  const response = await fetch(
    `/api/fetchMetadata?url=${encodeURIComponent(url)}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch metadata')
  }
  return response.json()
}

export function validateMetadata(metadata: MetadataAttributes): string[] {
  const issues = []
  if (!metadata.ogTitle) issues.push('Missing og:title')
  if (!metadata.ogDescription) issues.push('Missing og:description')
  if (!metadata.ogImage) issues.push('Missing og:image')
  if (!metadata.twitterCard) issues.push('Missing twitter:card')
  return issues
}
