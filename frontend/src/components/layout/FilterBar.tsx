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
  const hasSelectedJobTitlesKeywords =
    Boolean(filters.job_title_terms) ||
    Boolean(filters.job_title_boolean_query) ||
    Boolean(filters.technical_keywords_terms) ||
    Boolean(filters.technical_keywords_boolean_query) ||
    Boolean(filters.job_description_boolean_query) ||
    Boolean(filters.requirements_keywords_boolean_query)
  const hasSelectedEducation =
    Boolean(filters.education_associates_requirement) ||
    Boolean(filters.education_bachelors_requirement) ||
    Boolean(filters.education_masters_requirement) ||
    Boolean(filters.education_doctorate_requirement)
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
  const hasSelectedFoundingYear =
    filters.founding_year_min != null || filters.founding_year_max != null
  const hasSelectedCompanySize = (filters.company_size?.length ?? 0) > 0
  const hasSelectedCompany =
    Boolean(filters.company_names) ||
    Boolean(filters.company_exclude_names) ||
    Boolean(filters.company_hq_countries) ||
    Boolean(filters.company_exclude_hq_countries)
  const hasSelectedIndustry =
    Boolean(filters.industry_organization_type) ||
    Boolean(filters.industry_exclude_organization_types) ||
    Boolean(filters.industry_company_industry) ||
    Boolean(filters.industry_exclude_industries) ||
    Boolean(filters.industry_company_activities_keywords) ||
    Boolean(filters.industry_exclude_company_industries_keywords) ||
    Boolean(filters.industry_usajobs_policy)
  const hasSelectedStageFunding =
    Boolean(filters.stage_investors) ||
    Boolean(filters.stage_exclude_investors) ||
    Boolean(filters.stage_latest_round) ||
    Boolean(filters.stage_exclude_latest_round) ||
    filters.stage_raised_in_or_after != null ||
    filters.stage_latest_round_amount_raised != null
  const hasSelectedBenefitsPerks = (filters.benefits_perks?.length ?? 0) > 0
  const hasSelectedEncouragedToApply = (filters.encouraged_to_apply?.length ?? 0) > 0
  const hasSelectedLicenses =
    Boolean(filters.licenses_hide_required) ||
    Boolean(filters.licenses_keywords) ||
    Boolean(filters.licenses_exclude_keywords)
  const hasSelectedSecurityClearance = (filters.security_clearance?.length ?? 0) > 0
  const hasSelectedLanguages =
    Boolean(filters.language_requirements) || Boolean(filters.language_exclude_requirements)
  const hasSelectedShifts =
    Boolean(filters.shift_morning) ||
    Boolean(filters.shift_afternoon) ||
    Boolean(filters.shift_overnight) ||
    Boolean(filters.shift_weekend_availability) ||
    Boolean(filters.shift_holiday_availability) ||
    Boolean(filters.shift_overtime_availability) ||
    (filters.shift_oncall_requirements?.length ?? 0) > 0
  const hasSelectedTravelRequirement =
    (filters.travel_air?.length ?? 0) > 0 || (filters.travel_land?.length ?? 0) > 0

  return (
    <div className="border-b border-border bg-background px-4 py-3">
      <div className="max-w-[1456px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2" data-testid="filter-chip-row">
          {FILTER_CHIPS.map((chip) => (
            <FilterChip
              key={chip.modal}
              label={chip.label}
              active={
                activeModal === chip.modal ||
                (chip.modal === 'departments' && hasSelectedDepartments) ||
                (chip.modal === 'commitment' && hasSelectedCommitment) ||
                (chip.modal === 'titles' && hasSelectedJobTitlesKeywords) ||
                (chip.modal === 'education' && hasSelectedEducation) ||
                (chip.modal === 'experience' && hasSelectedExperience) ||
                (chip.modal === 'salary' && hasSelectedSalary) ||
                (chip.modal === 'languages' && hasSelectedLanguages) ||
                (chip.modal === 'shifts' && hasSelectedShifts) ||
                (chip.modal === 'travel' && hasSelectedTravelRequirement) ||
                (chip.modal === 'benefits' && hasSelectedBenefitsPerks) ||
                (chip.modal === 'encouraged' && hasSelectedEncouragedToApply) ||
                (chip.modal === 'licenses' && hasSelectedLicenses) ||
                (chip.modal === 'security' && hasSelectedSecurityClearance)
              }
              onClick={() =>
                setActiveFilterModal(activeModal === chip.modal ? null : chip.modal)
              }
            />
          ))}
          <span className="text-gray-300 text-base shrink-0 px-1 select-none">|</span>

          {COMPANY_CHIPS.map((chip) => (
            <FilterChip
              key={chip.modal}
              label={chip.label}
              active={
                activeModal === chip.modal ||
                (chip.modal === 'company' && hasSelectedCompany) ||
                (chip.modal === 'industry' && hasSelectedIndustry) ||
                (chip.modal === 'founding' && hasSelectedFoundingYear) ||
                (chip.modal === 'size' && hasSelectedCompanySize) ||
                (chip.modal === 'stage' && hasSelectedStageFunding)
              }
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
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdufAHZxy8x4xCg6QVbuC9IZrritgpBh9DzcBlS0bWGFq1XQg/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-600 underline dark:text-teal-400 hover:underline"
            >
              Add a Company
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}


