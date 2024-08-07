import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { MetadataAttributes } from '@/types/metadata'
import { HistoryItem } from '@/types/storage'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function updateHistory(
  history: HistoryItem[],
  url: string,
  metadata: MetadataAttributes
): HistoryItem[] {
  const now = Date.now()
  const existingIndex = history.findIndex(item => item.url === url)
  let newHistory: HistoryItem[]

  if (existingIndex !== -1) {
    newHistory = [
      { url, timestamp: now, metadata },
      ...history.slice(0, existingIndex),
      ...history.slice(existingIndex + 1)
    ]
  } else {
    newHistory = [{ url, timestamp: now, metadata }, ...history]
  }

  newHistory = newHistory.slice(0, 10)
  if (typeof window !== 'undefined') {
    localStorage.setItem('urlHistory', JSON.stringify(newHistory))
  }
  return newHistory
}

export function deleteHistoryItem(
  history: HistoryItem[],
  urlToDelete: string
): HistoryItem[] {
  const newHistory = history.filter(item => item.url !== urlToDelete)
  if (typeof window !== 'undefined') {
    localStorage.setItem('urlHistory', JSON.stringify(newHistory))
  }
  return newHistory
}

export async function fetchMetadata(url: string): Promise<MetadataAttributes> {
  const response = await fetch(`/api/og?url=${encodeURIComponent(url)}`, {
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_API_KEY || ''
    }
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('API Error:', errorData)
    throw new Error(
      `Failed to fetch metadata: ${errorData.error || response.statusText}`
    )
  }

  return response.json()
}

export function validateMetadata(metadata: MetadataAttributes): string[] {
  const issues: string[] = []
  if (!metadata.ogTitle) issues.push('Missing og:title')
  if (!metadata.ogDescription) issues.push('Missing og:description')
  if (!metadata.ogImage) issues.push('Missing og:image')
  if (!metadata.twitterCard) issues.push('Missing twitter:card')
  return issues
}
