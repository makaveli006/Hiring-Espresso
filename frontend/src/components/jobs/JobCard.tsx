import { useState } from 'react'
import {
  Clock, MapPin, FileText, Wrench,
  ExternalLink, Eye, Bookmark, Send,
  Share2, Globe, BookmarkX, Flag,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatCommitment(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function CompanyLogo({ job, size = 'sm' }: { job: Job; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-[56px] h-[56px]' : 'w-9 h-9'
  const text = size === 'lg' ? 'text-2xl' : 'text-sm'

  if (job.company.logo_url) {
    return (
      <img
        src={job.company.logo_url}
        alt={job.company.name}
        className={cn(dim, 'rounded-lg object-contain bg-white border border-border shrink-0')}
      />
    )
  }
  return (
    <div
      className={cn(
        dim,
        text,
        'rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground shrink-0',
      )}
    >
      {job.company.name[0]}
    </div>
  )
}

// ─── Hover overlay card ───────────────────────────────────────────────────────

function JobCardHover({ job }: { job: Job }) {
  const { isJobSaved, saveJob, unsaveJob, isJobApplied, markApplied, hideJob } = useJobStore()
  const saved = isJobSaved(job.id)
  const applied = isJobApplied(job.id)
  const yoe = yoeLabel(job.yoe_min, job.yoe_max)

  return (
    <div className="w-full h-full bg-neutral-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">

      {/* Top action row */}
      <div className="flex items-center gap-2 p-3 pb-2">
        <button
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors"
          aria-label="Share job"
        >
          <Share2 className="w-3.5 h-3.5 text-gray-700" />
        </button>

        <button
          onClick={() => (saved ? unsaveJob(job.id) : saveJob(job.id))}
          aria-label={saved ? 'Unsave job' : 'Save job'}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold rounded-full py-1.5 transition-colors',
            saved
              ? 'border border-white/40 text-white hover:bg-white/10'
              : 'bg-primary text-white hover:bg-primary/90',
          )}
        >
          <Bookmark className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Save'}
        </button>

        <button
          onClick={() => markApplied(job.id)}
          className={cn(
            'flex-1 flex items-center justify-center text-sm font-semibold rounded-full py-1.5 border transition-colors',
            applied
              ? 'border-green-400 text-green-300'
              : 'border-white/40 text-white hover:bg-white/10',
          )}
        >
          {applied ? 'Applied ✓' : 'Mark Applied'}
        </button>
      </div>

      {/* Location + badges */}
      <div className="flex items-start gap-2 px-3 pb-2">
        {job.company.website ? (
          <a
            href={job.company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 bg-white rounded-full flex items-center justify-center shrink-0 mt-0.5 hover:bg-gray-100 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-gray-700" />
          </a>
        ) : (
          <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <Globe className="w-3.5 h-3.5 text-white/40" />
          </div>
        )}
        <div className="flex flex-col gap-1 min-w-0">
          {job.location_display && (
            <p className="text-xs text-white font-medium leading-tight">{job.location_display}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {job.workplace_type && (
              <span className="text-xs border border-white/30 text-white/90 px-2 py-0.5 rounded-full">
                {capitalize(job.workplace_type)}
              </span>
            )}
            {job.commitment && (
              <span className="text-xs border border-white/30 text-white/90 px-2 py-0.5 rounded-full">
                {formatCommitment(job.commitment)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="flex items-start gap-2 px-3 pb-2">
        <CompanyLogo job={job} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white leading-snug">
            {job.company.name}
            {job.company.ticker && (
              <span className="text-white/50 font-normal ml-1 text-[10px]">
                {job.company.exchange} {job.company.ticker} :
              </span>
            )}
          </p>
          {job.company.description && (
            <p className="text-xs text-white/70 line-clamp-2 mt-0.5">{job.company.description}</p>
          )}
        </div>
      </div>

      {/* YOE + description */}
      {(yoe || job.description) && (
        <div className="flex items-start gap-1.5 px-3 pb-2 text-xs">
          <FileText className="w-3 h-3 text-white/50 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            {yoe && (
              <span className="bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full font-medium w-fit">
                {yoe}
              </span>
            )}
            {job.description && (
              <p className="text-white/80 line-clamp-4 leading-relaxed">{job.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex items-center gap-1.5 px-3 pb-3 text-xs text-white/70">
          <Wrench className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{job.skills.join(', ')}</span>
        </div>
      )}

      {/* Apply Directly + action icons */}
      <div className="flex items-center gap-2 px-3 pb-3">
        {job.job_posting_url ? (
          <a
            href={job.job_posting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center border border-white/40 rounded-full py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Apply Directly
          </a>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => hideJob(job.id)}
            className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Hide job"
          >
            <BookmarkX className="w-3.5 h-3.5 text-rose-500" />
          </button>
          <button
            className="w-7 h-7 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            aria-label="Report job"
          >
            <Flag className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 pt-2 pb-2.5">
        <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
          {job.job_posting_url ? (
            <a
              href={job.job_posting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Job Posting
            </a>
          ) : (
            <span />
          )}
          <span className="hover:text-white/80 cursor-pointer transition-colors">View all</span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />1 views</span>
          <span className="flex items-center gap-1"><Bookmark className="w-2.5 h-2.5" />0 saves</span>
          <span className="flex items-center gap-1"><Send className="w-2.5 h-2.5" />0 applications</span>
        </div>
      </div>
    </div>
  )
}

// ─── Base card ────────────────────────────────────────────────────────────────

export function JobCard({ job, index = 0 }: JobCardProps) {
  const [hovered, setHovered] = useState(false)
  const yoe = yoeLabel(job.yoe_min, job.yoe_max)

  return (
    <div
      className="relative w-[286px] h-[408px] shrink-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Base card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.25 }}
        className="bg-card border border-border rounded-xl shadow-sm flex h-full flex-col w-full overflow-hidden"
      >
        {/* ── Header: title + clock ── */}
        <div className="px-4 pt-3 pb-1.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base leading-snug line-clamp-2 flex-1">
              {job.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo(job.posted_at)}</span>
            </div>
          </div>
        </div>

        {/* ── Location pill ── */}
        {job.location_display && (
          <div className="px-4 pb-1.5">
            <span className="inline-flex items-center gap-1.5 border border-border rounded-full px-2.5 py-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              {job.location_display}
            </span>
          </div>
        )}

        {/* ── Tags: workplace + commitment ── */}
        {(job.workplace_type || job.commitment) && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {job.workplace_type && (
              <span
                className={cn(
                  'border text-xs px-2.5 py-1 rounded-full font-medium',
                  WORKPLACE_STYLES[job.workplace_type] ?? 'border-border text-muted-foreground',
                )}
              >
                {capitalize(job.workplace_type)}
              </span>
            )}
            {job.commitment && (
              <span className="border border-border text-xs px-2.5 py-1 rounded-full font-medium text-foreground">
                {formatCommitment(job.commitment)}
              </span>
            )}
          </div>
        )}

        {/* ── Company block ── */}
        <div className="px-4 pb-2 flex items-start gap-3">
          <CompanyLogo job={job} size="lg" />
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="font-bold text-gray-900 dark:text-foreground text-sm">
                {job.company.name}
              </span>
              {job.company.ticker && (
                <span className="text-[10px] text-muted-foreground">
                  {job.company.exchange} {job.company.ticker} :
                </span>
              )}
            </div>
            {job.company.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                {job.company.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Requirements / description ── */}
        {job.description && (
          <div className="px-4 pb-1.5 flex items-start gap-2">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {yoe && (
                <span className="inline-flex items-center border border-purple-400 text-purple-600 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full mr-1.5 font-medium align-middle">
                  {yoe}
                </span>
              )}
              {job.description}
            </p>
          </div>
        )}

        {/* ── Skills ── */}
        {job.skills && job.skills.length > 0 && (
          <div className="px-4 pb-2 flex items-start gap-2">
            <Wrench className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
              {job.skills.join(', ')}
            </p>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-auto border-t border-border px-4 pt-2 pb-2.5">
          {/* Row 1: Job Posting | View all */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            {job.job_posting_url ? (
              <a
                href={job.job_posting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                Job Posting
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-muted-foreground">Job Posting</span>
            )}
            <button className="hover:text-primary transition-colors">View all</button>
          </div>

          {/* Row 2: stats */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              1 views
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="w-3 h-3" />
              0 saves
            </span>
            <span className="flex items-center gap-1">
              <Send className="w-3 h-3" />
              0 applications
            </span>
          </div>
        </div>
      </motion.div>

      {/* Dark scrim over base card on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50 rounded-xl z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20"
          >
            <JobCardHover job={job} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
