import { create } from 'zustand'
import type { PropertyFilters } from '../../types/property'
import type { ViewMode, SortOption } from '../../types/common'

interface PropertyState {
  filters: PropertyFilters
  viewMode: ViewMode
  sortBy: SortOption
  setFilters: (filters: Partial<PropertyFilters>) => void
  resetFilters: () => void
  setViewMode: (mode: ViewMode) => void
  setSortBy: (sort: SortOption) => void
}

const defaultFilters: PropertyFilters = {}

export const usePropertyStore = create<PropertyState>((set) => ({
  filters: defaultFilters,
  viewMode: 'grid',
  sortBy: 'date_desc',

  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),

  resetFilters: () => set({ filters: defaultFilters }),

  setViewMode: (viewMode) => set({ viewMode }),

  setSortBy: (sortBy) => set({ sortBy }),
}))
