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
  const hasSelectedDepartments = (filters.department?.length ?? 0) > 0
  const hasSelectedCommitment = (filters.commitment?.length ?? 0) > 0
  const hasSelectedExperience =
    (filters.experience_seniority?.length ?? 0) > 0 ||
    (filters.experience_role_type?.length ?? 0) > 0 ||
    filters.experience_role_industry_min != null ||
    filters.experience_role_industry_max != null ||
    Boolean(filters.experience_role_industry_exclude_missing) ||
    filters.experience_management_min != null ||
    filters.experience_management_max != null ||
    Boolean(filters.experience_management_exclude_missing) ||
    filters.yoe_min != null ||
    filters.yoe_max != null
  const hasSelectedSalary =
    filters.salary_min != null ||
    Boolean(filters.salary_minimum_min) ||
    Boolean(filters.salary_minimum_max) ||
    Boolean(filters.salary_minimum_frequency) ||
    Boolean(filters.salary_maximum_min) ||
    Boolean(filters.salary_maximum_max) ||
    Boolean(filters.salary_maximum_frequency) ||
    Boolean(filters.salary_listed_frequency) ||
    Boolean(filters.salary_currency)

  return (
    <div className="border-b border-border bg-background px-4 py-3">
      <div className="max-w-[1456px] mx-auto w-full">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_CHIPS.map((chip) => (
            <FilterChip
              key={chip.modal}
              label={chip.label}
              active={
                activeModal === chip.modal ||
                (chip.modal === 'departments' && hasSelectedDepartments) ||
                (chip.modal === 'commitment' && hasSelectedCommitment) ||
                (chip.modal === 'experience' && hasSelectedExperience) ||
                (chip.modal === 'salary' && hasSelectedSalary)
              }
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


