import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface JobStore {
  savedJobIds: string[]
  hiddenJobIds: string[]
  saveJob: (id: string) => void
  unsaveJob: (id: string) => void
  hideJob: (id: string) => void
  isJobSaved: (id: string) => boolean
  isJobHidden: (id: string) => boolean
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      savedJobIds: [],
      hiddenJobIds: [],

      saveJob: (id) =>
        set((s) => ({ savedJobIds: [...new Set([...s.savedJobIds, id])] })),

      unsaveJob: (id) =>
        set((s) => ({ savedJobIds: s.savedJobIds.filter((j) => j !== id) })),

      hideJob: (id) =>
        set((s) => ({ hiddenJobIds: [...new Set([...s.hiddenJobIds, id])] })),

      isJobSaved: (id) => get().savedJobIds.includes(id),
      isJobHidden: (id) => get().hiddenJobIds.includes(id),
    }),
    { name: 'job-store' }
  )
)
