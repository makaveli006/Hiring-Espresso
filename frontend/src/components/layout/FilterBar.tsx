import { FilterChip } from '@/components/filters/FilterChip'
import { useUIStore } from '@/store/useUIStore'
import { useFilterStore } from '@/store/useFilterStore'

const FILTER_CHIPS = [
  { label: 'Departments', modal: 'departments' },
  { label: 'Salary', modal: 'salary' },
  { label: 'Commitment', modal: 'commitment' },
  { label: 'Experience', modal: 'experience' },
  { label: 'Job Titles & Keywords', modal: 'titles' },
  { label: 'Education', modal: 'education' },
  { label: 'Licenses & Certifications', modal: 'licenses' },
  { label: 'Security Clearance', modal: 'security' },
  { label: 'Languages', modal: 'languages' },
  { label: 'Shifts & Schedules', modal: 'shifts' },
  { label: 'Travel Requirement', modal: 'travel' },
  { label: 'Benefits & Perks', modal: 'benefits' },
  { label: 'Encouraged to Apply', modal: 'encouraged' },
]

const COMPANY_CHIPS = [
  { label: 'Company', modal: 'company' },
  { label: 'Industry', modal: 'industry' },
  { label: 'Stage & Funding', modal: 'stage' },
  { label: 'Size', modal: 'size' },
  { label: 'Founding Year', modal: 'founding' },
]

export function FilterBar() {
  const setActiveFilterModal = useUIStore((s) => s.setActiveFilterModal)
  const activeModal = useUIStore((s) => s.activeFilterModal)
  const filters = useFilterStore((s) => s.filters)

  return (
    <div className="border-b border-border bg-background px-4 py-3">
      <div className="max-w-[1456px] mx-auto w-full">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_CHIPS.map((chip) => (
            <FilterChip
              key={chip.modal}
              label={chip.label}
              active={activeModal === chip.modal}
              onClick={() =>
                setActiveFilterModal(activeModal === chip.modal ? null : chip.modal)
              }
            />
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-3">
          <span className="text-gray-300 text-base shrink-0 px-1 select-none">|</span>

          {COMPANY_CHIPS.map((chip) => (
            <FilterChip
              key={chip.modal}
              label={chip.label}
              active={activeModal === chip.modal}
              variant="company"
              onClick={() =>
                setActiveFilterModal(activeModal === chip.modal ? null : chip.modal)
              }
            />
          ))}
        </div>
      </div>

      {/* Active workplace filter badge */}
      {filters.workplace_type && filters.workplace_type.length > 0 && (
        <div className="max-w-[1456px] mx-auto mt-2 flex gap-1">
          {filters.workplace_type.map((t) => (
            <span
              key={t}
              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* "Know a company that's hiring?" banner */}
      <div className="max-w-[1456px] mx-auto mt-3">
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 px-4 py-1.5 flex items-center justify-center gap-2 text-sm">
          <span>🏢</span>
          <span className="text-teal-800 dark:text-teal-200 font-medium">
            Know a company that's hiring?{' '}
            <button className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              Add a Company
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}


