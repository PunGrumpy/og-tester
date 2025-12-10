import { create } from 'zustand'
import type { OgData } from '@/lib/schemas/og'

type OgStore = {
  url: string
  data: OgData
  setResult: (url: string, data: OgData) => void
}

export const useOgStore = create<OgStore>(set => ({
  url: '',
  data: {},
  setResult: (url, data) => set({ url, data })
}))
