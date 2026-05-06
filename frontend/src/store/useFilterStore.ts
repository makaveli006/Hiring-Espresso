import { create } from 'zustand'
import type { Filters } from '@/schemas/filter.schema'

interface FilterStore {
  filters: Filters
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  toggleWorkplaceType: (type: string) => void
  toggleCommitment: (type: string) => void
  setCommitments: (commitments: string[]) => void
  setExperienceSeniority: (seniority: string[]) => void
  setExperienceRoleType: (roleTypes: string[]) => void
  setExperienceRanges: (ranges: {
    roleIndustryMin?: number
    roleIndustryMax?: number
    roleIndustryExcludeMissing?: boolean
    managementMin?: number
    managementMax?: number
    managementExcludeMissing?: boolean
  }) => void
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

  toggleCommitment: (type) =>
    set((state) => {
      const current = state.filters.commitment ?? []
      const next = current.includes(type)
        ? current.filter((commitment) => commitment !== type)
        : [...current, type]
      return { filters: { ...state.filters, commitment: next.length ? next : undefined } }
    }),

  setCommitments: (commitments) =>
    set((state) => {
      const next = Array.from(new Set(commitments))
      return { filters: { ...state.filters, commitment: next.length ? next : undefined } }
    }),

  setExperienceSeniority: (seniority) =>
    set((state) => {
      const next = Array.from(new Set(seniority))
      return {
        filters: { ...state.filters, experience_seniority: next.length ? next : undefined },
      }
    }),

  setExperienceRoleType: (roleTypes) =>
    set((state) => {
      const next = Array.from(new Set(roleTypes))
      return {
        filters: { ...state.filters, experience_role_type: next.length ? next : undefined },
      }
    }),

  setExperienceRanges: (ranges) =>
    set((state) => ({
      filters: {
        ...state.filters,
        experience_role_industry_min: ranges.roleIndustryMin,
        experience_role_industry_max: ranges.roleIndustryMax,
        experience_role_industry_exclude_missing: ranges.roleIndustryExcludeMissing,
        experience_management_min: ranges.managementMin,
        experience_management_max: ranges.managementMax,
        experience_management_exclude_missing: ranges.managementExcludeMissing,
      },
    })),

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
