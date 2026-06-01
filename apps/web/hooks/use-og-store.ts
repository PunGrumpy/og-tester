import { create } from 'zustand'
import type { OgData } from '@/lib/schemas/og'

interface OgStore {
  url: string
  data: OgData
  isEditing: boolean
  setResult: (url: string, data: OgData) => void
  setIsEditing: (isEditing: boolean) => void
  updateTag: (key: keyof OgData, value: string) => void
}

export const useOgStore = create<OgStore>(set => ({
  url: '',
  data: {},
  isEditing: false,
  setResult: (url, data) => set({ url, data, isEditing: false }),
  setIsEditing: isEditing => set({ isEditing }),
  updateTag: (key, value) =>
    set(state => ({
      data: {
        ...state.data,
        [key]: value
      }
    }))
}))
