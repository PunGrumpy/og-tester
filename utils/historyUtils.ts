import { MetadataAttributes } from '@/types/metadata'
import { HistoryItem } from '@/types/storage'

export function updateHistory(
  history: HistoryItem[],
  url: string,
  metadata: MetadataAttributes
): HistoryItem[] {
  const now = Date.now()
  const existingIndex = history.findIndex(item => item.url === url)
  let newHistory

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
  localStorage.setItem('urlHistory', JSON.stringify(newHistory))
  return newHistory
}

export function deleteHistoryItem(
  history: HistoryItem[],
  urlToDelete: string
): HistoryItem[] {
  const newHistory = history.filter(item => item.url !== urlToDelete)
  localStorage.setItem('urlHistory', JSON.stringify(newHistory))
  return newHistory
}
