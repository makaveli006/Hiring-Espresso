import { useRef } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { JobCard } from './JobCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { Job } from '@/schemas/job.schema'

interface JobCarouselProps {
  title: string
  jobs: Job[]
  isLoading?: boolean
}

function CardSkeleton() {
  return (
    <div className="w-[286px] h-[408px] shrink-0 border border-border rounded-xl p-4 space-y-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </div>
  )
}

export function JobCarousel({ title, jobs, isLoading }: JobCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'right' ? 302 : -302, behavior: 'smooth' })
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          {title}
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </h2>
        <div className="flex gap-1" data-testid="carousel-scroll-controls">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-start gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
      </div>
    </section>
  )
}
