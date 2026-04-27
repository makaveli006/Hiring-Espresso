import { Bookmark, TrendingUp, ExternalLink, FileText, Wrench } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useJobStore } from '@/store/useJobStore'
import type { Job } from '@/schemas/job.schema'

interface JobCardProps {
  job: Job
  index?: number
}

const WORKPLACE_STYLES: Record<string, string> = {
  remote: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  hybrid: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  onsite: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}

function yoeLabel(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${min}-${max}+ YOE`
  if (min != null) return `${min}+ YOE`
  return null
}

export function JobCard({ job, index = 0 }: JobCardProps) {
  const { isJobSaved, saveJob, unsaveJob } = useJobStore()
  const saved = isJobSaved(job.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 w-72 shrink-0 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header: time + save */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>🕐 {timeAgo(job.posted_at)}</span>
        <button
          onClick={() => (saved ? unsaveJob(job.id) : saveJob(job.id))}
          aria-label={saved ? 'Unsave job' : 'Save job'}
          className={cn('hover:text-primary transition-colors', saved && 'text-primary')}
        >
          <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Title + location badges */}
      <div>
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 mb-1">
          {job.title}
        </h3>
        {job.location_display && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            📍 {job.location_display}
          </p>
        )}
      </div>

      {/* Workplace + commitment badges */}
      <div className="flex flex-wrap gap-1">
        {job.workplace_type && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              WORKPLACE_STYLES[job.workplace_type] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {job.workplace_type.charAt(0).toUpperCase() + job.workplace_type.slice(1)}
          </span>
        )}
        {job.commitment && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
            {job.commitment.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        )}
      </div>

      {/* Company */}
      <div className="flex items-start gap-2">
        {job.company.logo_url ? (
          <img
            src={job.company.logo_url}
            alt={job.company.name}
            className="w-8 h-8 rounded object-contain border border-border shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs shrink-0">
            {job.company.name[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {job.company.name}
            {job.company.ticker && (
              <span className="text-muted-foreground font-normal ml-1 text-[10px]">
                {job.company.exchange} {job.company.ticker}
              </span>
            )}
          </p>
          {job.company.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{job.company.description}</p>
          )}
        </div>
      </div>

      {/* YOE badge + description */}
      {yoeLabel(job.yoe_min, job.yoe_max) && (
        <div className="flex items-center gap-1 text-xs">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
            {yoeLabel(job.yoe_min, job.yoe_max)}
          </span>
          {job.description && (
            <span className="text-muted-foreground line-clamp-1 flex-1">{job.description}</span>
          )}
        </div>
      )}

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
          <Wrench className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{job.skills.slice(0, 5).join(', ')}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
        {job.job_posting_url ? (
          <a
            href={job.job_posting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Job Posting
          </a>
        ) : (
          <span />
        )}
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          See views
        </span>
      </div>
    </motion.div>
  )
}
