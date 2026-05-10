import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface JobStore {
  savedJobIds: string[]
  hiddenJobIds: string[]
  appliedJobIds: string[]
  interviewingJobIds: string[]
  rejectedJobIds: string[]

  saveJob: (id: string) => void
  unsaveJob: (id: string) => void
  hideJob: (id: string) => void
  markApplied: (id: string) => void
  markInterviewing: (id: string) => void
  markRejected: (id: string) => void

  isJobSaved: (id: string) => boolean
  isJobHidden: (id: string) => boolean
  isJobApplied: (id: string) => boolean
  isJobInterviewing: (id: string) => boolean
  isJobRejected: (id: string) => boolean
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      savedJobIds: [],
      hiddenJobIds: [],
      appliedJobIds: [],
      interviewingJobIds: [],
      rejectedJobIds: [],

      saveJob: (id) =>
        set((s) => ({ savedJobIds: [...new Set([...s.savedJobIds, id])] })),

      unsaveJob: (id) =>
        set((s) => ({ savedJobIds: s.savedJobIds.filter((j) => j !== id) })),

      hideJob: (id) =>
        set((s) => ({ hiddenJobIds: [...new Set([...s.hiddenJobIds, id])] })),

      markApplied: (id) =>
        set((s) => ({ appliedJobIds: [...new Set([...s.appliedJobIds, id])] })),

      markInterviewing: (id) =>
        set((s) => ({ interviewingJobIds: [...new Set([...s.interviewingJobIds, id])] })),

      markRejected: (id) =>
        set((s) => ({ rejectedJobIds: [...new Set([...s.rejectedJobIds, id])] })),

      isJobSaved: (id) => get().savedJobIds.includes(id),
      isJobHidden: (id) => get().hiddenJobIds.includes(id),
      isJobApplied: (id) => get().appliedJobIds.includes(id),
      isJobInterviewing: (id) => get().interviewingJobIds.includes(id),
      isJobRejected: (id) => get().rejectedJobIds.includes(id),
    }),
    { name: 'job-store' }
  )
)
