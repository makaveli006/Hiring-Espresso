import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface JobStore {
  savedJobIds: string[]
  hiddenJobIds: string[]
  appliedJobIds: string[]
  saveJob: (id: string) => void
  unsaveJob: (id: string) => void
  hideJob: (id: string) => void
  markApplied: (id: string) => void
  isJobSaved: (id: string) => boolean
  isJobHidden: (id: string) => boolean
  isJobApplied: (id: string) => boolean
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      savedJobIds: [],
      hiddenJobIds: [],
      appliedJobIds: [],

      saveJob: (id) =>
        set((s) => ({ savedJobIds: [...new Set([...s.savedJobIds, id])] })),

      unsaveJob: (id) =>
        set((s) => ({ savedJobIds: s.savedJobIds.filter((j) => j !== id) })),

      hideJob: (id) =>
        set((s) => ({ hiddenJobIds: [...new Set([...s.hiddenJobIds, id])] })),

      markApplied: (id) =>
        set((s) => ({ appliedJobIds: [...new Set([...s.appliedJobIds, id])] })),

      isJobSaved: (id) => get().savedJobIds.includes(id),
      isJobHidden: (id) => get().hiddenJobIds.includes(id),
      isJobApplied: (id) => get().appliedJobIds.includes(id),
    }),
    { name: 'job-store' }
  )
)
