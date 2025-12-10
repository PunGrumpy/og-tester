import { create } from 'zustand'
import type { OgTags } from '@/lib/schema'

type OgStore = {
  url: string
  data: OgTags
  setResult: (url: string, data: OgTags) => void
}

export const useOgStore = create<OgStore>(set => ({
  url: '',
  data: {},
  setResult: (url, data) => set({ url, data })
}))
