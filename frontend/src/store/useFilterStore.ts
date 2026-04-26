import { create } from 'zustand'
import type { Filters } from '@/schemas/filter.schema'

interface FilterStore {
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  toggleWorkplaceType: (type: string) => void
  resetFilters: () => void
}

const defaultFilters: Filters = {}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: defaultFilters,

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  toggleWorkplaceType: (type) =>
    set((state) => {
      const current = state.filters.workplace_type ?? []
      const next = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type]
      return { filters: { ...state.filters, workplace_type: next.length ? next : undefined } }
    }),

  resetFilters: () => set({ filters: defaultFilters }),
}))
