import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PropertyListItem } from '../../types/property'

interface FavoriteState {
  favorites: PropertyListItem[]
  toggleFavorite: (property: PropertyListItem) => void
  isFavorite: (id: string) => boolean
  clearFavorites: () => void
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (property) =>
        set((state) => ({
          favorites: state.favorites.some((f) => f.id === property.id)
            ? state.favorites.filter((f) => f.id !== property.id)
            : [...state.favorites, property],
        })),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      clearFavorites: () => set({ favorites: [] }),
    }),
    { name: 'estateflow-favorites' },
  ),
)
