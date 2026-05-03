import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchJob, fetchJobs, hideJob, saveJob, unsaveJob } from '@/api/jobs'
import { useFilterStore } from '@/store/useFilterStore'
import { useJobStore } from '@/store/useJobStore'
import type { Filters } from '@/schemas/filter.schema'
import { MOCK_JOBS } from '@/data/mockJobs'

export function useInfiniteJobs() {
  const filters = useFilterStore((s) => s.filters)
  return useInfiniteQuery({
    queryKey: ['jobs', filters],
    queryFn: ({ pageParam }) => fetchJobs(filters, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    staleTime: 60_000,
  })
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => fetchJob(id),
    staleTime: 60_000,
  })
}

export function useSaveJob() {
  const { saveJob: saveLocal, unsaveJob: unsaveLocal } = useJobStore()
  const qc = useQueryClient()

  const save = useMutation({
    mutationFn: saveJob,
    onSuccess: (_, id) => {
      saveLocal(id)
      qc.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
  })

  const unsave = useMutation({
    mutationFn: unsaveJob,
    onSuccess: (_, id) => {
      unsaveLocal(id)
      qc.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
  })

  return { save, unsave }
}

export function useJobsForCarousel(filters: Partial<Filters>) {
  const isHybridCarousel =
    filters.workplace_type?.length === 1 && filters.workplace_type[0] === 'hybrid'

  return useQuery({
    queryKey: ['jobs-carousel', filters],
    queryFn: () => fetchJobs(filters as Filters),
    staleTime: 60_000,
    select: (data) => {
      if (!isHybridCarousel) return data.items

      const hybridDummyJobs = MOCK_JOBS
        .filter((job) => job.workplace_type === 'hybrid')
        .slice(0, 10)
      const existingIds = new Set(data.items.map((job) => job.id))
      const missingDummyJobs = hybridDummyJobs.filter((job) => !existingIds.has(job.id))

      return [...missingDummyJobs, ...data.items]
    },
  })
}

export function useHideJob() {
  const { hideJob: hideLocal } = useJobStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: hideJob,
    onSuccess: (_, id) => {
      hideLocal(id)
      qc.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}
