import { MetadataAttributes } from '@/types/metadata'

type HistoryItem = {
  url: string
  timestamp: number
  metadata: MetadataAttributes
}

export type { HistoryItem }
