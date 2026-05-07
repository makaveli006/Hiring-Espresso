import { JobCarousel } from '@/components/jobs/JobCarousel'
import { useJobsForCarousel } from '@/hooks/useJobs'

export function HomePage() {
  const onsite = useJobsForCarousel({ workplace_type: ['onsite'] })
  const remote = useJobsForCarousel({ workplace_type: ['remote'] })
  const hybrid = useJobsForCarousel({ workplace_type: ['hybrid'] })

  return (
    <div>
      <JobCarousel
        title="Latest Jobs in India"
        jobs={onsite.data ?? []}
        isLoading={onsite.isLoading}
      />
      <JobCarousel title="Remote Jobs" jobs={remote.data ?? []} isLoading={remote.isLoading} />
      <JobCarousel title="Hybrid Jobs" jobs={hybrid.data ?? []} isLoading={hybrid.isLoading} />
    </div>
  )
}
