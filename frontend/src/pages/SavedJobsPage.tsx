import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { useUIStore } from '@/store/useUIStore'
import { useJobStore } from '@/store/useJobStore'
import { JobCard } from '@/components/jobs/JobCard'
import { MOCK_JOBS } from '@/data/mockJobs'
import { cn } from '@/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

// ─── Bear illustration ────────────────────────────────────────────────────────

function BearWithChecklist() {
  return (
    <svg
      width="180"
      height="140"
      viewBox="0 0 220 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M70 46C70 34 78 26 90 26H124C145 26 162 42 162 63C162 73 154 82 144 82H100C83 82 70 69 70 52V46Z"
        fill="#F3E5D3"
      />

      <path
        d="M84 112L87 64L127 66L124 116C124 116 114 120 101 119C91 118 84 112 84 112Z"
        fill="#7B60D8"
        stroke="#5C45B6"
        strokeWidth="2"
      />
      <path d="M94 77L98 81L105 73" stroke="#F2EFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M94 93L98 97L105 89" stroke="#F2EFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M94 109L98 113L105 105" stroke="#F2EFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M110 79H121" stroke="#B9A8EE" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M110 95H121" stroke="#B9A8EE" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M110 111H121" stroke="#B9A8EE" strokeWidth="2.5" strokeLinecap="round" />

      <circle cx="145" cy="64" r="35" fill="#ECEFF3" stroke="#6B7280" strokeWidth="1.5" />
      <circle cx="126" cy="45" r="10" fill="#ECEFF3" stroke="#6B7280" strokeWidth="1.5" />
      <circle cx="165" cy="45" r="10" fill="#ECEFF3" stroke="#6B7280" strokeWidth="1.5" />
      <circle cx="128" cy="46" r="4.5" fill="#DCE1E9" />
      <circle cx="163" cy="46" r="4.5" fill="#DCE1E9" />
      <ellipse cx="145" cy="72" rx="10" ry="8" fill="#F6F7FA" />
      <circle cx="136" cy="62" r="2.7" fill="#1F2937" />
      <circle cx="154" cy="62" r="2.7" fill="#1F2937" />
      <path d="M141 69H149" stroke="#374151" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M142 74C144 76 147 76 149 74" stroke="#374151" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M128 56L134 58" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      <path d="M156 58L162 56" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      <path d="M128 67L134 67" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      <path d="M156 67L162 67" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />

      <path
        d="M126 88C133 83 146 83 154 87C163 91 170 100 170 109C163 114 151 118 138 116C124 114 115 106 121 96L126 88Z"
        fill="#ECEFF3"
        stroke="#6B7280"
        strokeWidth="1.5"
      />
      <path d="M139 91L132 103" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
      <rect
        x="127"
        y="102"
        width="18"
        height="4"
        rx="2"
        transform="rotate(-55 127 102)"
        fill="#DFB870"
        stroke="#6B7280"
      />
      <path d="M152 96C160 99 166 99 171 97" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />

      <path d="M86 73C90 69 98 69 101 74" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
      <circle cx="95" cy="73" r="8" fill="#ECEFF3" stroke="#6B7280" strokeWidth="1.5" />
    </svg>
  )
}

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const faqs = [
  {
    question: 'What is Application Tracker?',
    answer:
      "Application Tracker is Hiring Espresso's free tool to help you keep track of your job applications. You can add jobs, track your progress, and write notes. It's 100% free and easy to use.",
  },
  {
    question: 'How does it work?',
    answer:
      'When you save jobs on Hiring Espresso or mark them as applied, they will automatically appear in your Application Tracker. You can also move jobs between lists, add notes, and track your progress.',
  },
  {
    question: 'How is it different from saving jobs on a spreadsheet?',
    answer:
      "Application Tracker is designed specifically for job applications. It's easy to use, and it's integrated with Hiring Espresso's job search. You can also add notes and track your progress.",
  },
  {
    question: 'Is it free?',
    answer: "Yes! It's 100% free for job seekers to use.",
  },
  {
    question: 'Can companies see my Application Tracker?',
    answer:
      'No, your Application Tracker is private and secure. Employers will never be able to see your account activity, including your Application Tracker.',
  },
]

// ─── Tracker (signed-in) ──────────────────────────────────────────────────────

type Section = 'tracker' | 'saved-searches' | 'boards'
type Chip = 'saved' | 'applied' | 'interviewing' | 'rejected' | 'hidden'

const CHIPS: { id: Chip; label: string }[] = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'hidden', label: 'Hidden' },
]

const CHIP_LABEL: Record<Chip, string> = {
  saved: 'saved',
  applied: 'applied',
  interviewing: 'interviewing',
  rejected: 'rejected',
  hidden: 'hidden',
}

function TrackerView() {
  const [activeSection, setActiveSection] = useState<Section>('tracker')
  const [activeChip, setActiveChip] = useState<Chip>('saved')

  const {
    savedJobIds,
    appliedJobIds,
    interviewingJobIds,
    rejectedJobIds,
    hiddenJobIds,
  } = useJobStore()

  const idsByChip: Record<Chip, string[]> = {
    saved: savedJobIds,
    applied: appliedJobIds,
    interviewing: interviewingJobIds,
    rejected: rejectedJobIds,
    hidden: hiddenJobIds,
  }

  const activeIds = idsByChip[activeChip]
  const jobs = MOCK_JOBS.filter((j) => activeIds.includes(j.id))

  const sections: { id: Section; label: string }[] = [
    { id: 'tracker', label: 'Tracker' },
    { id: 'saved-searches', label: 'Saved Searches' },
    { id: 'boards', label: 'Boards' },
  ]

  return (
    <div className="min-h-[60vh] font-sans -mx-4 -mt-6">
      {/* Top section tabs — full-width border spanning edge to edge */}
      <div className="border-b border-border px-4 sm:px-8 pt-2">
        <nav className="flex gap-6">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'py-3 text-[14px] font-medium transition-colors border-b-2 -mb-px',
                activeSection === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {activeSection === 'tracker' ? (
        <div className="px-4 sm:px-8 py-6">
          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            {CHIPS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveChip(id)}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors',
                  activeChip === id
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Section heading */}
          <h2 className="mt-5 text-[15px] font-bold text-foreground">
            Your {CHIP_LABEL[activeChip]} jobs ({jobs.length})
          </h2>

          {/* Content */}
          <div className="mt-4">
            {jobs.length === 0 ? (
              <div className="rounded-xl border border-border bg-white px-8 min-h-[280px] flex flex-col items-center justify-center text-center dark:bg-card">
                <p className="text-[15px] font-semibold text-foreground">
                  No {CHIP_LABEL[activeChip]} jobs
                </p>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                  Start{' '}
                  <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">
                    adding jobs
                  </Link>{' '}
                  to your list.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-5">
                {jobs.map((job, i) => (
                  <JobCard key={job.id} job={job} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-4 sm:px-8 py-16 text-center">
          <p className="text-[14px] text-muted-foreground">Coming soon</p>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SavedJobsPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)

  if (!isLoaded) return null

  if (isSignedIn) {
    return <TrackerView />
  }

  return (
    <section className="bg-white px-4 py-12 font-sans text-foreground sm:px-6 sm:py-14">
      <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
        <div className="mb-6">
          <BearWithChecklist />
        </div>

        <span className="mb-5 inline-flex rounded-full bg-[#f8e6cd] px-4 py-1.5 text-[13px] font-medium text-[#8a3a00]">
          Hiring Espresso Application Tracker
        </span>

        <h1 className="max-w-[560px] text-[28px] font-semibold leading-tight tracking-tight text-[#0c2240]">
          Your saved jobs will appear here
        </h1>

        <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-[#0c2240]">
          The Application Tracker helps you keep track of your job search progress. It&apos;s free
          and easy to use.
        </p>

        <button
          onClick={() => setAuthModalOpen(true, 'signIn')}
          className="mt-7 rounded-md bg-[#ca8d00] px-8 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#af7900]"
        >
          Log in to view
        </button>

        <p className="mt-3 text-[13px] font-semibold text-[#0c2240]">100% free, forever!</p>
      </div>

      <div className="mx-auto mt-12 w-full max-w-[640px] text-left">
        <h2 className="mb-2 text-[15px] font-semibold text-[#ca8d00]">Frequently Asked Questions</h2>
        <Accordion className="mt-2" multiple>
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${index}`}
              className="border-b border-[#e5e5e5]"
            >
              <AccordionTrigger className="py-4 text-[15px] font-normal text-[#0c2240] hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[14px] leading-relaxed text-[#203249]">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
