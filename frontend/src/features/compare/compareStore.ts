import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ComparePropertySnapshot } from '../../types/property'

const MAX_COMPARE = 3

interface CompareState {
  selectedProperties: ComparePropertySnapshot[]
  toggleCompare: (snapshot: ComparePropertySnapshot) => boolean
  removeFromCompare: (id: string) => void
  clearCompare: () => void
  isSelected: (id: string) => boolean
  isFull: () => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      selectedProperties: [],

      toggleCompare: (snapshot) => {
        const { selectedProperties } = get()
        if (selectedProperties.some((p) => p.id === snapshot.id)) {
          set({ selectedProperties: selectedProperties.filter((p) => p.id !== snapshot.id) })
          return true
        }
        if (selectedProperties.length >= MAX_COMPARE) return false
        set({ selectedProperties: [...selectedProperties, snapshot] })
        return true
      },

      removeFromCompare: (id) =>
        set((state) => ({
          selectedProperties: state.selectedProperties.filter((p) => p.id !== id),
        })),

      clearCompare: () => set({ selectedProperties: [] }),

      isSelected: (id) => get().selectedProperties.some((p) => p.id === id),

      isFull: () => get().selectedProperties.length >= MAX_COMPARE,
    }),
    { name: 'estateflow-compare' },
  ),
)
