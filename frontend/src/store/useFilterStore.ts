import { create } from 'zustand'
import type { Filters } from '@/schemas/filter.schema'

interface FilterStore {
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  toggleWorkplaceType: (type: string) => void
  toggleDepartment: (department: string) => void
  setDepartments: (departments: string[]) => void
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

  toggleDepartment: (department) =>
    set((state) => {
      const current = state.filters.department ?? []
      const next = current.includes(department)
        ? current.filter((d) => d !== department)
        : [...current, department]
      return { filters: { ...state.filters, department: next.length ? next : undefined } }
    }),

  setDepartments: (departments) =>
    set((state) => {
      const next = Array.from(new Set(departments))
      return { filters: { ...state.filters, department: next.length ? next : undefined } }
    }),

  resetFilters: () => set({ filters: defaultFilters }),
}))
