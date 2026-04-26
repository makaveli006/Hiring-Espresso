import { JobCarousel } from '@/components/jobs/JobCarousel'
import { MOCK_JOBS } from '@/data/mockJobs'

const latestJobs = MOCK_JOBS.filter((j) => j.workplace_type === 'onsite')
const remoteJobs = MOCK_JOBS.filter((j) => j.workplace_type === 'remote')
const hybridJobs = MOCK_JOBS.filter((j) => j.workplace_type === 'hybrid')

export function HomePage() {
  return (
    <div>
      <JobCarousel title="Latest Jobs in India" jobs={latestJobs} />
      <JobCarousel title="Remote Jobs" jobs={remoteJobs} />
      {hybridJobs.length > 0 && (
        <JobCarousel title="Hybrid Jobs" jobs={hybridJobs} />
      )}
    </div>
  )
}
