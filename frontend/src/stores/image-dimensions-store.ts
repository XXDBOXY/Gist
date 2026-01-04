import { create } from 'zustand'
import {
  getDimensionsBatch,
  saveDimension as saveToDb,
  type ImageDimension,
} from '@/lib/image-dimensions-db'

interface ImageDimensionsState {
  dimensions: Record<string, ImageDimension>
  isLoading: boolean
  getDimension: (src: string) => ImageDimension | undefined
  setDimension: (src: string, width: number, height: number) => void
  loadFromDB: (srcs: string[]) => Promise<void>
}

export const useImageDimensionsStore = create<ImageDimensionsState>((set, get) => ({
  dimensions: {},
  isLoading: false,

  getDimension: (src) => get().dimensions[src],

  setDimension: (src, width, height) => {
    const dim: ImageDimension = {
      src,
      width,
      height,
      ratio: width / height,
    }
    set((state) => ({
      dimensions: { ...state.dimensions, [src]: dim },
    }))
    saveToDb(dim)
  },

  loadFromDB: async (srcs) => {
    if (srcs.length === 0) return

    set({ isLoading: true })
    try {
      const cached = await getDimensionsBatch(srcs)
      if (cached.size > 0) {
        set((state) => ({
          dimensions: {
            ...state.dimensions,
            ...Object.fromEntries(cached),
          },
        }))
      }
    } finally {
      set({ isLoading: false })
    }
  },
}))

export function useImageDimension(src: string | undefined) {
  return useImageDimensionsStore((state) =>
    src ? state.dimensions[src] : undefined
  )
}
