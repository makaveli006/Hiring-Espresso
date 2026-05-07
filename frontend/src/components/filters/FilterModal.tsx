import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock3,
  DollarSign,
  EyeOff,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/useUIStore'
import { useFilterStore } from '@/store/useFilterStore'

const WORKPLACE_TYPES = ['Remote', 'Hybrid', 'Onsite']
const COMMITMENT_OPTIONS = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
  { label: 'Temporary', value: 'temporary' },
  { label: 'Seasonal', value: 'seasonal' },
  { label: 'Volunteer', value: 'volunteer' },
] as const
const ENCOURAGED_TO_APPLY_OPTIONS = [
  { label: 'Military Veterans', value: 'military_veterans' },
  { label: 'Fair Chance', value: 'fair_chance' },
] as const
const BENEFITS_PERKS_OPTIONS = [
  { label: 'Generous Paid Time Off', value: 'generous_paid_time_off' },
  { label: '401k Matching', value: '401k_matching' },
  { label: 'Retirement Plan', value: 'retirement_plan' },
  { label: 'Visa Sponsorship', value: 'visa_sponsorship' },
  { label: 'Four Day Work Week', value: 'four_day_work_week' },
  { label: 'Generous Parental Leave', value: 'generous_parental_leave' },
  { label: 'Tuition Reimbursement', value: 'tuition_reimbursement' },
  { label: 'Relocation Assistance', value: 'relocation_assistance' },
] as const
const TRAVEL_REQUIREMENT_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Extensive', value: 'extensive' },
] as const
const SHIFT_REQUIREMENT_OPTIONS = [
  { label: 'Required', value: 'required' },
  { label: 'Optional', value: 'optional' },
  { label: 'Not Indicated', value: 'not_indicated' },
] as const
const SHIFT_AVAILABILITY_OPTIONS = [
  { label: 'Required', value: 'required' },
  { label: 'Not Indicated', value: 'not_indicated' },
  { label: "Doesn't Matter", value: 'doesnt_matter' },
] as const
const SHIFT_ONCALL_OPTIONS = [
  { label: 'None', value: 'none' },
  { label: 'Occasional (once a month or less)', value: 'occasional_once_a_month_or_less' },
  { label: 'Regular (once a week or more)', value: 'regular_once_a_week_or_more' },
] as const
type ShiftOncallValue = (typeof SHIFT_ONCALL_OPTIONS)[number]['value']
const SECURITY_CLEARANCE_OPTIONS = [
  { label: 'No explicit reference to clearance', value: 'no_explicit_reference_to_clearance' },
  { label: 'Confidential', value: 'confidential' },
  { label: 'Secret', value: 'secret' },
  { label: 'Top Secret', value: 'top_secret' },
  { label: 'Top Secret/SCI', value: 'top_secret_sci' },
  { label: 'Public Trust', value: 'public_trust' },
  { label: 'Interim Clearances', value: 'interim_clearances' },
  { label: 'Other', value: 'other' },
] as const
type SecurityClearanceValue = (typeof SECURITY_CLEARANCE_OPTIONS)[number]['value']
const EXPERIENCE_SENIORITY_OPTIONS = [
  { label: 'No Prior Experience Required', value: 'no_prior_experience_required' },
  { label: 'Entry Level', value: 'entry_level' },
  { label: 'Mid Level', value: 'mid_level' },
  { label: 'Senior Level', value: 'senior_level' },
] as const
const EXPERIENCE_ROLE_TYPE_OPTIONS = [
  { label: 'Individual Contributor', value: 'individual_contributor' },
  { label: 'People Manager', value: 'people_manager' },
] as const
const EXPERIENCE_SLIDER_MIN = 0
const EXPERIENCE_SLIDER_MAX = 20
const EXPERIENCE_SENIORITY_RANGES: Record<string, { min: number; max: number | null }> = {
  no_prior_experience_required: { min: 0, max: 0 },
  entry_level: { min: 0, max: 2 },
  mid_level: { min: 3, max: 5 },
  senior_level: { min: 6, max: null },
}
const PHYSICAL_POSITIONS = ['Sitting / Desk Jobs', 'Active']
const PHYSICAL_ENVIRONMENTS = ['Office', 'Outdoor', 'Vehicle', 'Industrial', 'Customer-Facing']
const LABOR_INTENSITY = ['Low', 'Medium', 'High']

const DEPARTMENT_GROUPS = [
  {
    title: 'Technology',
    options: [
      'Engineering',
      'Software Development',
      'Information Technology',
      'Data and Analytics',
    ],
  },
  {
    title: 'Design and Creative',
    options: ['Design', 'Creative and Art Services'],
  },
  {
    title: 'Business Operations',
    options: [
      'Project and Program Management',
      'Product Management',
      'Business Operations',
      'Legal and Compliance',
      'Finance and Accounting',
      'Human Resources',
      'Administrative & Clerical Support',
    ],
  },
  {
    title: 'Sales and Marketing',
    options: [
      'Sales',
      'Marketing',
      'Communications and Public Affairs',
      'Business Development',
    ],
  },
  {
    title: 'Healthcare',
    options: [
      'Healthcare Services - Advanced Practice',
      'Healthcare Services - Allied Health',
      'Healthcare Services - Nursing',
      'Healthcare Services - Pharmacy',
      'Healthcare Services - Veterinary',
    ],
  },
  {
    title: 'Education',
    options: ['Education services'],
  },
  {
    title: 'Customer and Social Services',
    options: ['Customer Service', 'Social Services'],
  },
  {
    title: 'Skilled Trades - Construction, Mechanical, Repair, Labor, etc',
    options: [
      'Skilled Trades - Construction',
      'Skilled Trades - Mechanical and Electrical',
      'Skilled Trades - Manufacturing and Industrial',
      'Skilled Trades - Maintenance and Repair',
      'Skilled Trades - General Labor',
    ],
  },
  {
    title: 'Transportation and Logistics',
    options: ['Transportation Services', 'Supply Chain / Logistics / Procurement'],
  },
  {
    title: 'Quality and Safety',
    options: ['Quality Assurance', 'Environment, Health, and Safety'],
  },
  {
    title: 'Research and Development',
    options: ['Research and Development (R&D)'],
  },
  {
    title: 'Food and Hospitality',
    options: ['Food and Beverage Services'],
  },
  {
    title: 'Protective Services',
    options: ['Protective Services'],
  },
  {
    title: 'Custodial Services',
    options: ['Custodial Services'],
  },
] as const

const ALL_DEPARTMENT_GROUP_TITLES = DEPARTMENT_GROUPS.map((group) => group.title)
const SALARY_FREQUENCY_OPTIONS = ['Hourly', 'Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Yearly']
const LISTED_FREQUENCY_OPTIONS = ['Any', ...SALARY_FREQUENCY_OPTIONS]
const LISTED_CURRENCY_OPTIONS = ['Any', 'usd', 'eur', 'cad', 'gbp', 'inr', 'aud', 'mxn']
const COMPANY_SIZE_OPTIONS = [
  '1 - 10 employees',
  '11 - 50 employees',
  '51 - 200 employees',
  '201 - 500 employees',
  '501 - 1000 employees',
  '1001 - 2000 employees',
  '2001 - 5000 employees',
  '5001 - 10000 employees',
  '10001+ employees',
] as const
const USAJOBS_POLICY_OPTIONS = [
  { label: 'Ok to include jobs from USAJobs.gov', value: 'include' },
  { label: 'Only show jobs from USAJobs.gov', value: 'only' },
  { label: 'Do not show any jobs from USAJobs.gov', value: 'exclude' },
] as const

interface CheckGroupProps {
  title: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
}

interface MoneyInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
}

interface FrequencySelectProps {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
}

interface StageSearchFieldProps {
  fieldId: string
  activeFieldId: string | null
  onActiveFieldChange: (fieldId: string | null) => void
  label: string
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  openOnFocus?: boolean
}

interface ExperienceRangeSliderProps {
  title: string
  expanded: boolean
  minValue: number
  maxValue: number
  excludeMissing: boolean
  onChange: (minValue: number, maxValue: number) => void
  onExcludeMissingChange: (checked: boolean) => void
  onFirstInteraction: () => void
  onReset: () => void
  testId: string
}

function CheckGroup({ title, options, selected, onToggle }: CheckGroupProps) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={selected.includes(opt.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_'))}
              onCheckedChange={() =>
                onToggle(opt.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_'))
              }
              className="data-[checked]:border-primary data-[checked]:bg-primary"
            />
            <span className="text-sm text-foreground">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function MoneyInput({ value, onChange, placeholder, ariaLabel }: MoneyInputProps) {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500">
        $
      </span>
      <input
        type="text"
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-pink-500"
      />
    </div>
  )
}

function FrequencySelect({ value, onChange, ariaLabel }: FrequencySelectProps) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 pr-9 text-sm text-gray-900 outline-none focus:border-pink-500"
      >
        {SALARY_FREQUENCY_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
    </div>
  )
}

function StageSearchField({
  fieldId,
  activeFieldId,
  onActiveFieldChange,
  label,
  value,
  onChange,
  ariaLabel,
  openOnFocus = false,
}: StageSearchFieldProps) {
  const open = activeFieldId === fieldId
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-900">{label}</h3>
      <div className="relative">
        <div className="relative rounded-md border border-gray-300 bg-white pl-3 pr-14 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
        <input
          type="text"
          aria-label={ariaLabel}
          value={value}
          onFocus={() => {
            if (openOnFocus) onActiveFieldChange(fieldId)
          }}
          onChange={(event) => {
            onChange(event.target.value)
            if (!open) onActiveFieldChange(fieldId)
          }}
          placeholder="Type to search..."
          className="h-12 w-full text-sm text-gray-900 placeholder:text-gray-500 outline-none"
        />
        <span className="pointer-events-none absolute right-11 top-1/2 h-6 -translate-y-1/2 border-l border-gray-300" />
          <button
            type="button"
            aria-label={`${label} dropdown`}
            onClick={() => onActiveFieldChange(open ? null : fieldId)}
            className="absolute right-0 top-0 h-12 w-11 text-gray-500 hover:text-gray-700"
          >
            <ChevronDown className="mx-auto h-5 w-5" />
          </button>
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 rounded-md border border-gray-300 bg-white py-4 text-center text-sm text-gray-500 shadow-sm">
            No options
          </div>
        )}
      </div>
    </div>
  )
}

function parseSalaryAmount(value: string): number | undefined {
  const normalized = value.replace(/,/g, '').replace(/[^\d.]/g, '').trim()
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseFoundingYearInput(value: string, currentYear: number): number | undefined {
  const normalized = value.trim()
  if (!normalized) return undefined
  if (!/^\d{4}$/.test(normalized)) return undefined
  const parsed = Number(normalized)
  if (!Number.isInteger(parsed)) return undefined
  if (parsed > currentYear) return undefined
  return parsed
}

function ExperienceRangeSlider({
  title,
  expanded,
  minValue,
  maxValue,
  excludeMissing,
  onChange,
  onExcludeMissingChange,
  onFirstInteraction,
  onReset,
  testId,
}: ExperienceRangeSliderProps) {
  const range = EXPERIENCE_SLIDER_MAX - EXPERIENCE_SLIDER_MIN
  const left = ((minValue - EXPERIENCE_SLIDER_MIN) / range) * 100
  const right = ((maxValue - EXPERIENCE_SLIDER_MIN) / range) * 100
  const trackRef = useRef<HTMLDivElement | null>(null)
  const draggingThumbRef = useRef<'min' | 'max' | null>(null)

  const clampSliderValue = (rawValue: number) =>
    Math.max(EXPERIENCE_SLIDER_MIN, Math.min(EXPERIENCE_SLIDER_MAX, rawValue))

  const maybeExpand = (nextMinValue: number, nextMaxValue: number) => {
    if (expanded) return
    if (nextMinValue > EXPERIENCE_SLIDER_MIN || nextMaxValue < EXPERIENCE_SLIDER_MAX) {
      onFirstInteraction()
    }
  }

  const updateValueFromPointer = (clientX: number, thumb: 'min' | 'max') => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    if (rect.width <= 0) return

    const clampedX = Math.max(rect.left, Math.min(clientX, rect.right))
    const ratio = (clampedX - rect.left) / rect.width
    const nextRaw = EXPERIENCE_SLIDER_MIN + ratio * range
    const snapped = clampSliderValue(Math.round(nextRaw))

    if (thumb === 'min') {
      const nextMinValue = Math.min(snapped, maxValue)
      maybeExpand(nextMinValue, maxValue)
      onChange(nextMinValue, maxValue)
      return
    }

    const nextMaxValue = Math.max(snapped, minValue)
    maybeExpand(minValue, nextMaxValue)
    onChange(minValue, nextMaxValue)
  }

  const onThumbPointerDown =
    (thumb: 'min' | 'max') => (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      draggingThumbRef.current = thumb
      event.currentTarget.setPointerCapture(event.pointerId)
      updateValueFromPointer(event.clientX, thumb)
    }

  const onThumbPointerMove =
    (thumb: 'min' | 'max') => (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (draggingThumbRef.current !== thumb) return
      updateValueFromPointer(event.clientX, thumb)
    }

  const onThumbPointerEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    draggingThumbRef.current = null
  }

  return (
    <div
      className={`overflow-x-hidden rounded-2xl border bg-white px-5 py-5 shadow-sm ${
        expanded ? 'border-pink-300 shadow-pink-100' : 'border-gray-300'
      }`}
      data-testid={testId}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {expanded ? (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-red-500 hover:text-red-600"
            aria-label={`Reset ${title}`}
            data-testid={`${testId}-reset`}
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        ) : null}
      </div>
      {expanded ? (
        <>
          <label className="mt-4 flex items-center gap-3">
            <Checkbox
              checked={excludeMissing}
              onCheckedChange={(checked) => onExcludeMissingChange(checked === true)}
              className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
              data-testid={`${testId}-exclude-missing`}
            />
            <span className="text-sm leading-tight text-gray-800">
              Exclude jobs that haven't mentioned this
            </span>
            <CircleHelp className="h-6 w-6 text-gray-500 sm:h-4 sm:w-4" />
          </label>
          <p
            className="mt-5 text-sm font-semibold leading-none text-pink-500"
            data-testid={`${testId}-range-label`}
          >
            {minValue} - {maxValue} years
          </p>
        </>
      ) : null}
      <div className="mt-7 px-4">
        <div ref={trackRef} className="relative h-10" data-testid={`${testId}-track`}>
          <div className="pointer-events-none absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-pink-200" />
          <div
            className="pointer-events-none absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-pink-500"
            style={{ left: `${left}%`, width: `${Math.max(right - left, 0)}%` }}
          />
          <button
            type="button"
            className="absolute top-1/2 z-30 h-10 w-10 -translate-y-1/2 -translate-x-1/2 cursor-grab touch-none rounded-full active:cursor-grabbing"
            style={{ left: `${left}%` }}
            onPointerDown={onThumbPointerDown('min')}
            onPointerMove={onThumbPointerMove('min')}
            onPointerUp={onThumbPointerEnd}
            onPointerCancel={onThumbPointerEnd}
            aria-label={`${title} minimum years thumb`}
            data-testid={`${testId}-min-thumb`}
          >
            <span className="block h-8 w-8 rounded-full bg-pink-300 shadow-sm" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="absolute top-1/2 z-40 h-10 w-10 -translate-y-1/2 -translate-x-1/2 cursor-grab touch-none rounded-full active:cursor-grabbing"
            style={{ left: `${right}%` }}
            onPointerDown={onThumbPointerDown('max')}
            onPointerMove={onThumbPointerMove('max')}
            onPointerUp={onThumbPointerEnd}
            onPointerCancel={onThumbPointerEnd}
            aria-label={`${title} maximum years thumb`}
            data-testid={`${testId}-max-thumb`}
          >
            <span className="block h-8 w-8 rounded-full bg-pink-300 shadow-sm" aria-hidden="true" />
          </button>
          <input
            type="range"
            min={EXPERIENCE_SLIDER_MIN}
            max={EXPERIENCE_SLIDER_MAX}
            value={minValue}
            onChange={(event) => {
              const next = Math.min(Number(event.target.value), maxValue)
              maybeExpand(next, maxValue)
              onChange(next, maxValue)
            }}
            className="experience-range-input absolute inset-0 z-10 h-10 w-full opacity-0"
            aria-label={`${title} minimum years`}
            data-testid={`${testId}-min`}
          />
          <input
            type="range"
            min={EXPERIENCE_SLIDER_MIN}
            max={EXPERIENCE_SLIDER_MAX}
            value={maxValue}
            onChange={(event) => {
              const next = Math.max(Number(event.target.value), minValue)
              maybeExpand(minValue, next)
              onChange(minValue, next)
            }}
            className="experience-range-input absolute inset-0 z-10 h-10 w-full opacity-0"
            aria-label={`${title} maximum years`}
            data-testid={`${testId}-max`}
          />
        </div>
      </div>
    </div>
  )
}

function getYoeBoundsFromSeniority(seniorityValues: string[]) {
  if (seniorityValues.length === 0) {
    return { yoeMin: undefined, yoeMax: undefined }
  }

  const ranges = seniorityValues
    .map((value) => EXPERIENCE_SENIORITY_RANGES[value])
    .filter((range): range is { min: number; max: number | null } => Boolean(range))

  if (ranges.length === 0) {
    return { yoeMin: undefined, yoeMax: undefined }
  }

  const yoeMin = Math.min(...ranges.map((range) => range.min))
  if (ranges.some((range) => range.max === null)) {
    return { yoeMin, yoeMax: undefined }
  }

  const yoeMax = Math.max(...ranges.map((range) => range.max as number))
  return { yoeMin, yoeMax }
}

function normalizeExperienceRange(minValue: number, maxValue: number) {
  if (minValue === EXPERIENCE_SLIDER_MIN && maxValue === EXPERIENCE_SLIDER_MAX) {
    return { minValue: undefined, maxValue: undefined }
  }

  return { minValue, maxValue }
}

export function FilterModal() {
  const activeModal = useUIStore((s) => s.activeFilterModal)
  const open =
    activeModal === 'locations' ||
    activeModal === 'departments' ||
    activeModal === 'salary' ||
    activeModal === 'commitment' ||
    activeModal === 'experience' ||
    activeModal === 'shifts' ||
    activeModal === 'travel' ||
    activeModal === 'company' ||
    activeModal === 'industry' ||
    activeModal === 'stage' ||
    activeModal === 'founding' ||
    activeModal === 'size' ||
    activeModal === 'benefits' ||
    activeModal === 'encouraged' ||
    activeModal === 'languages' ||
    activeModal === 'security' ||
    activeModal === 'licenses'
  const setActiveFilterModal = useUIStore((s) => s.setActiveFilterModal)
  const {
    filters,
    setFilter,
    toggleWorkplaceType,
    toggleDepartment,
    setDepartments,
    setCommitments,
    setExperienceSeniority,
    setExperienceRoleType,
    setExperienceRanges,
  } = useFilterStore()

  const [departmentSearchText, setDepartmentSearchText] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(ALL_DEPARTMENT_GROUP_TITLES)
  const [selectedCommitments, setSelectedCommitments] = useState<string[]>([])
  const [activeCompanyDropdownField, setActiveCompanyDropdownField] = useState<string | null>(null)
  const [companyNamesInput, setCompanyNamesInput] = useState('')
  const [companyExcludeNamesInput, setCompanyExcludeNamesInput] = useState('')
  const [companyHqCountriesInput, setCompanyHqCountriesInput] = useState('')
  const [companyExcludeHqCountriesInput, setCompanyExcludeHqCountriesInput] = useState('')
  const [activeIndustryDropdownField, setActiveIndustryDropdownField] = useState<string | null>(
    null
  )
  const [activeLicensesDropdownField, setActiveLicensesDropdownField] = useState<string | null>(
    null
  )
  const [licensesHideRequired, setLicensesHideRequired] = useState<'yes' | 'no'>('no')
  const [licensesKeywordsInput, setLicensesKeywordsInput] = useState('')
  const [licensesExcludeKeywordsInput, setLicensesExcludeKeywordsInput] = useState('')
  const [industryOrganizationTypeInput, setIndustryOrganizationTypeInput] = useState('')
  const [industryExcludeOrganizationTypesInput, setIndustryExcludeOrganizationTypesInput] =
    useState('')
  const [industryCompanyIndustryInput, setIndustryCompanyIndustryInput] = useState('')
  const [industryExcludeIndustriesInput, setIndustryExcludeIndustriesInput] = useState('')
  const [industryCompanyActivitiesKeywordsInput, setIndustryCompanyActivitiesKeywordsInput] =
    useState('')
  const [
    industryExcludeCompanyIndustriesKeywordsInput,
    setIndustryExcludeCompanyIndustriesKeywordsInput,
  ] = useState('')
  const [industryUsaJobsPolicy, setIndustryUsaJobsPolicy] = useState<'include' | 'only' | 'exclude'>(
    'include'
  )
  const [activeStageDropdownField, setActiveStageDropdownField] = useState<string | null>(null)
  const [activeLanguagesDropdownField, setActiveLanguagesDropdownField] = useState<string | null>(
    null
  )
  const [languageRequirementsInput, setLanguageRequirementsInput] = useState('')
  const [languageExcludeRequirementsInput, setLanguageExcludeRequirementsInput] = useState('')
  const [stageInvestorsInput, setStageInvestorsInput] = useState('')
  const [stageExcludeInvestorsInput, setStageExcludeInvestorsInput] = useState('')
  const [stageLatestRoundInput, setStageLatestRoundInput] = useState('')
  const [stageExcludeLatestRoundInput, setStageExcludeLatestRoundInput] = useState('')
  const [stageRaisedInOrAfterInput, setStageRaisedInOrAfterInput] = useState('')
  const [stageLatestRoundAmountInput, setStageLatestRoundAmountInput] = useState('')
  const [selectedShiftMorning, setSelectedShiftMorning] = useState<
    'required' | 'optional' | 'not_indicated' | undefined
  >(undefined)
  const [selectedShiftAfternoon, setSelectedShiftAfternoon] = useState<
    'required' | 'optional' | 'not_indicated' | undefined
  >(undefined)
  const [selectedShiftOvernight, setSelectedShiftOvernight] = useState<
    'required' | 'optional' | 'not_indicated' | undefined
  >(undefined)
  const [selectedShiftWeekendAvailability, setSelectedShiftWeekendAvailability] = useState<
    'required' | 'not_indicated' | 'doesnt_matter'
  >('doesnt_matter')
  const [selectedShiftHolidayAvailability, setSelectedShiftHolidayAvailability] = useState<
    'required' | 'not_indicated' | 'doesnt_matter'
  >('doesnt_matter')
  const [selectedShiftOvertimeAvailability, setSelectedShiftOvertimeAvailability] = useState<
    'required' | 'not_indicated' | 'doesnt_matter'
  >('doesnt_matter')
  const [selectedShiftOncallRequirements, setSelectedShiftOncallRequirements] = useState<
    ShiftOncallValue[]
  >(SHIFT_ONCALL_OPTIONS.map((option) => option.value))
  const [selectedTravelAir, setSelectedTravelAir] = useState<string[]>([])
  const [selectedTravelLand, setSelectedTravelLand] = useState<string[]>([])
  const [selectedBenefitsPerks, setSelectedBenefitsPerks] = useState<string[]>([])
  const [selectedEncouragedToApply, setSelectedEncouragedToApply] = useState<string[]>([])
  const [selectedSecurityClearances, setSelectedSecurityClearances] = useState<
    SecurityClearanceValue[]
  >(SECURITY_CLEARANCE_OPTIONS.map((option) => option.value))
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([])
  const [foundingYearMinInput, setFoundingYearMinInput] = useState('')
  const [foundingYearMaxInput, setFoundingYearMaxInput] = useState('')
  const [selectedExperienceSeniority, setSelectedExperienceSeniority] = useState<string[]>([])
  const [selectedExperienceRoleType, setSelectedExperienceRoleType] = useState<string[]>([])
  const [roleIndustryRange, setRoleIndustryRange] = useState<[number, number]>([
    EXPERIENCE_SLIDER_MIN,
    EXPERIENCE_SLIDER_MAX,
  ])
  const [isRoleIndustryExpanded, setIsRoleIndustryExpanded] = useState(false)
  const [roleIndustryExcludeMissing, setRoleIndustryExcludeMissing] = useState(false)
  const [managementRange, setManagementRange] = useState<[number, number]>([
    EXPERIENCE_SLIDER_MIN,
    EXPERIENCE_SLIDER_MAX,
  ])
  const [isManagementExpanded, setIsManagementExpanded] = useState(false)
  const [managementExcludeMissing, setManagementExcludeMissing] = useState(false)

  const [isSalaryAdvancedMode, setIsSalaryAdvancedMode] = useState(false)
  const [hideUndisclosedSalaries, setHideUndisclosedSalaries] = useState(false)
  const [desiredCompensationAmount, setDesiredCompensationAmount] = useState('')
  const [desiredCompensationFrequency, setDesiredCompensationFrequency] = useState('Yearly')
  const [minimumCompMin, setMinimumCompMin] = useState('')
  const [minimumCompMax, setMinimumCompMax] = useState('')
  const [minimumCompFrequency, setMinimumCompFrequency] = useState('Yearly')
  const [maximumCompMin, setMaximumCompMin] = useState('')
  const [maximumCompMax, setMaximumCompMax] = useState('')
  const [maximumCompFrequency, setMaximumCompFrequency] = useState('Yearly')
  const [listedFrequency, setListedFrequency] = useState('Any')
  const [listedCurrency, setListedCurrency] = useState('Any')
  const [listedCurrencySearch, setListedCurrencySearch] = useState('')
  const [listedCurrencyOpen, setListedCurrencyOpen] = useState(false)
  const listedCurrencyRef = useRef<HTMLDivElement | null>(null)

  const workplaceSelected = filters.workplace_type?.map((t) => t) ?? []
  const selectedDepartments = filters.department ?? []
  const currentYear = new Date().getFullYear()
  const parsedFoundingYearMin = parseFoundingYearInput(foundingYearMinInput, currentYear)
  const parsedFoundingYearMax = parseFoundingYearInput(foundingYearMaxInput, currentYear)
  const hasFoundingYearMinInput = foundingYearMinInput.trim().length > 0
  const hasFoundingYearMaxInput = foundingYearMaxInput.trim().length > 0
  const isFoundingYearMinValid = !hasFoundingYearMinInput || parsedFoundingYearMin != null
  const isFoundingYearMaxValid = !hasFoundingYearMaxInput || parsedFoundingYearMax != null
  const isFoundingYearRangeValid =
    parsedFoundingYearMin == null ||
    parsedFoundingYearMax == null ||
    parsedFoundingYearMin <= parsedFoundingYearMax
  const canApplyFoundingYear =
    isFoundingYearMinValid && isFoundingYearMaxValid && isFoundingYearRangeValid

  useEffect(() => {
    if (activeModal === 'departments') {
      setDepartmentSearchText('')
      setExpandedGroups(ALL_DEPARTMENT_GROUP_TITLES)
    }
  }, [activeModal])

  useEffect(() => {
    if (activeModal !== 'commitment') return
    setSelectedCommitments(filters.commitment ?? [])
  }, [activeModal, filters.commitment])

  useEffect(() => {
    if (activeModal !== 'company') return
    setActiveCompanyDropdownField(null)
    setCompanyNamesInput(filters.company_names ?? '')
    setCompanyExcludeNamesInput(filters.company_exclude_names ?? '')
    setCompanyHqCountriesInput(filters.company_hq_countries ?? '')
    setCompanyExcludeHqCountriesInput(filters.company_exclude_hq_countries ?? '')
  }, [
    activeModal,
    filters.company_exclude_hq_countries,
    filters.company_exclude_names,
    filters.company_hq_countries,
    filters.company_names,
  ])

  useEffect(() => {
    if (activeModal !== 'licenses') return
    setActiveLicensesDropdownField(null)
    setLicensesHideRequired(filters.licenses_hide_required ? 'yes' : 'no')
    setLicensesKeywordsInput(filters.licenses_keywords ?? '')
    setLicensesExcludeKeywordsInput(filters.licenses_exclude_keywords ?? '')
  }, [
    activeModal,
    filters.licenses_exclude_keywords,
    filters.licenses_hide_required,
    filters.licenses_keywords,
  ])

  useEffect(() => {
    if (activeModal !== 'industry') return
    setActiveIndustryDropdownField(null)
    setIndustryOrganizationTypeInput(filters.industry_organization_type ?? '')
    setIndustryExcludeOrganizationTypesInput(filters.industry_exclude_organization_types ?? '')
    setIndustryCompanyIndustryInput(filters.industry_company_industry ?? '')
    setIndustryExcludeIndustriesInput(filters.industry_exclude_industries ?? '')
    setIndustryCompanyActivitiesKeywordsInput(filters.industry_company_activities_keywords ?? '')
    setIndustryExcludeCompanyIndustriesKeywordsInput(
      filters.industry_exclude_company_industries_keywords ?? ''
    )
    const policy = filters.industry_usajobs_policy
    setIndustryUsaJobsPolicy(policy === 'only' || policy === 'exclude' ? policy : 'include')
  }, [
    activeModal,
    filters.industry_company_activities_keywords,
    filters.industry_company_industry,
    filters.industry_exclude_company_industries_keywords,
    filters.industry_exclude_industries,
    filters.industry_exclude_organization_types,
    filters.industry_organization_type,
    filters.industry_usajobs_policy,
  ])

  useEffect(() => {
    if (activeModal !== 'languages') return
    setActiveLanguagesDropdownField(null)
    setLanguageRequirementsInput(filters.language_requirements ?? '')
    setLanguageExcludeRequirementsInput(filters.language_exclude_requirements ?? '')
  }, [activeModal, filters.language_exclude_requirements, filters.language_requirements])

  useEffect(() => {
    if (activeModal !== 'stage') return
    setActiveStageDropdownField(null)
    setStageInvestorsInput(filters.stage_investors ?? '')
    setStageExcludeInvestorsInput(filters.stage_exclude_investors ?? '')
    setStageLatestRoundInput(filters.stage_latest_round ?? '')
    setStageExcludeLatestRoundInput(filters.stage_exclude_latest_round ?? '')
    setStageRaisedInOrAfterInput(
      filters.stage_raised_in_or_after != null ? String(filters.stage_raised_in_or_after) : ''
    )
    setStageLatestRoundAmountInput(
      filters.stage_latest_round_amount_raised != null
        ? String(filters.stage_latest_round_amount_raised)
        : ''
    )
  }, [
    activeModal,
    filters.stage_exclude_investors,
    filters.stage_exclude_latest_round,
    filters.stage_investors,
    filters.stage_latest_round,
    filters.stage_latest_round_amount_raised,
    filters.stage_raised_in_or_after,
  ])

  useEffect(() => {
    if (activeModal !== 'shifts') return
    setSelectedShiftMorning(filters.shift_morning)
    setSelectedShiftAfternoon(filters.shift_afternoon)
    setSelectedShiftOvernight(filters.shift_overnight)
    setSelectedShiftWeekendAvailability(filters.shift_weekend_availability ?? 'doesnt_matter')
    setSelectedShiftHolidayAvailability(filters.shift_holiday_availability ?? 'doesnt_matter')
    setSelectedShiftOvertimeAvailability(filters.shift_overtime_availability ?? 'doesnt_matter')
    setSelectedShiftOncallRequirements(
      filters.shift_oncall_requirements?.length
        ? filters.shift_oncall_requirements
        : SHIFT_ONCALL_OPTIONS.map((option) => option.value)
    )
  }, [
    activeModal,
    filters.shift_afternoon,
    filters.shift_holiday_availability,
    filters.shift_morning,
    filters.shift_oncall_requirements,
    filters.shift_overnight,
    filters.shift_overtime_availability,
    filters.shift_weekend_availability,
  ])

  useEffect(() => {
    if (activeModal !== 'travel') return
    setSelectedTravelAir(filters.travel_air ?? [])
    setSelectedTravelLand(filters.travel_land ?? [])
  }, [activeModal, filters.travel_air, filters.travel_land])

  useEffect(() => {
    if (activeModal !== 'benefits') return
    setSelectedBenefitsPerks(filters.benefits_perks ?? [])
  }, [activeModal, filters.benefits_perks])

  useEffect(() => {
    if (activeModal !== 'encouraged') return
    setSelectedEncouragedToApply(filters.encouraged_to_apply ?? [])
  }, [activeModal, filters.encouraged_to_apply])

  useEffect(() => {
    if (activeModal !== 'security') return
    setSelectedSecurityClearances(
      filters.security_clearance?.length
        ? (filters.security_clearance as SecurityClearanceValue[])
        : SECURITY_CLEARANCE_OPTIONS.map((option) => option.value)
    )
  }, [activeModal, filters.security_clearance])

  useEffect(() => {
    if (activeModal !== 'size') return
    setSelectedCompanySizes(filters.company_size ?? [])
  }, [activeModal, filters.company_size])

  useEffect(() => {
    if (activeModal !== 'founding') return
    setFoundingYearMinInput(
      filters.founding_year_min != null ? String(filters.founding_year_min) : ''
    )
    setFoundingYearMaxInput(
      filters.founding_year_max != null ? String(filters.founding_year_max) : ''
    )
  }, [activeModal, filters.founding_year_max, filters.founding_year_min])

  useEffect(() => {
    if (activeModal !== 'experience') return
    const roleIndustryHasAdvancedState =
      filters.experience_role_industry_min != null ||
      filters.experience_role_industry_max != null ||
      Boolean(filters.experience_role_industry_exclude_missing)
    const managementHasAdvancedState =
      filters.experience_management_min != null ||
      filters.experience_management_max != null ||
      Boolean(filters.experience_management_exclude_missing)

    setSelectedExperienceSeniority(filters.experience_seniority ?? [])
    setSelectedExperienceRoleType(filters.experience_role_type ?? [])
    setRoleIndustryRange([
      filters.experience_role_industry_min ?? EXPERIENCE_SLIDER_MIN,
      filters.experience_role_industry_max ?? EXPERIENCE_SLIDER_MAX,
    ])
    setIsRoleIndustryExpanded(roleIndustryHasAdvancedState)
    setRoleIndustryExcludeMissing(Boolean(filters.experience_role_industry_exclude_missing))
    setManagementRange([
      filters.experience_management_min ?? EXPERIENCE_SLIDER_MIN,
      filters.experience_management_max ?? EXPERIENCE_SLIDER_MAX,
    ])
    setIsManagementExpanded(managementHasAdvancedState)
    setManagementExcludeMissing(Boolean(filters.experience_management_exclude_missing))
  }, [
    activeModal,
    filters.experience_management_exclude_missing,
    filters.experience_management_max,
    filters.experience_management_min,
    filters.experience_role_industry_exclude_missing,
    filters.experience_role_industry_max,
    filters.experience_role_industry_min,
    filters.experience_role_type,
    filters.experience_seniority,
  ])

  useEffect(() => {
    if (activeModal !== 'salary') return

    setIsSalaryAdvancedMode(false)
    setHideUndisclosedSalaries(false)
    setDesiredCompensationAmount(filters.salary_min != null ? String(filters.salary_min) : '')
    setDesiredCompensationFrequency('Yearly')
    setMinimumCompMin(filters.salary_minimum_min ?? '')
    setMinimumCompMax(filters.salary_minimum_max ?? '')
    setMinimumCompFrequency(filters.salary_minimum_frequency ?? 'Yearly')
    setMaximumCompMin(filters.salary_maximum_min ?? '')
    setMaximumCompMax(filters.salary_maximum_max ?? '')
    setMaximumCompFrequency(filters.salary_maximum_frequency ?? 'Yearly')
    setListedFrequency(filters.salary_listed_frequency ?? 'Any')
    setListedCurrency(filters.salary_currency ?? 'Any')
    setListedCurrencySearch('')
    setListedCurrencyOpen(false)
  }, [
    activeModal,
    filters.salary_currency,
    filters.salary_listed_frequency,
    filters.salary_maximum_frequency,
    filters.salary_maximum_max,
    filters.salary_maximum_min,
    filters.salary_min,
    filters.salary_minimum_frequency,
    filters.salary_minimum_max,
    filters.salary_minimum_min,
  ])

  useEffect(() => {
    if (!listedCurrencyOpen) return

    const onDocumentPointerDown = (event: MouseEvent) => {
      if (!listedCurrencyRef.current) return
      if (listedCurrencyRef.current.contains(event.target as Node)) return
      setListedCurrencyOpen(false)
      setListedCurrencySearch('')
    }

    document.addEventListener('mousedown', onDocumentPointerDown)
    return () => document.removeEventListener('mousedown', onDocumentPointerDown)
  }, [listedCurrencyOpen])

  const filteredDepartmentGroups = useMemo(() => {
    const query = departmentSearchText.trim().toLowerCase()

    if (!query) {
      return DEPARTMENT_GROUPS.map((group) => ({
        title: group.title,
        options: [...group.options],
      }))
    }

    return DEPARTMENT_GROUPS.map((group) => {
      const groupMatches = group.title.toLowerCase().includes(query)
      const matchingOptions = groupMatches
        ? [...group.options]
        : group.options.filter((option) => option.toLowerCase().includes(query))

      return {
        title: group.title,
        options: matchingOptions,
      }
    }).filter((group) => group.options.length > 0)
  }, [departmentSearchText])

  const filteredListedCurrencyOptions = useMemo(() => {
    const query = listedCurrencySearch.trim().toLowerCase()
    if (!query) return LISTED_CURRENCY_OPTIONS
    return LISTED_CURRENCY_OPTIONS.filter((option) => option.toLowerCase().includes(query))
  }, [listedCurrencySearch])

  const toggleGroupExpanded = (title: string) => {
    setExpandedGroups((current) =>
      current.includes(title)
        ? current.filter((groupTitle) => groupTitle !== title)
        : [...current, title]
    )
  }

  const clearAllDepartments = () => {
    setDepartments([])
  }

  const clearAllCommitments = () => {
    setSelectedCommitments([])
    setCommitments([])
  }

  const toggleCompanySize = (sizeLabel: string) => {
    setSelectedCompanySizes((current) =>
      current.includes(sizeLabel)
        ? current.filter((item) => item !== sizeLabel)
        : [...current, sizeLabel]
    )
  }

  const selectAllCompanySizes = () => {
    setSelectedCompanySizes([])
  }

  const clearAllExperience = () => {
    setSelectedExperienceSeniority([])
    setSelectedExperienceRoleType([])
    setRoleIndustryRange([EXPERIENCE_SLIDER_MIN, EXPERIENCE_SLIDER_MAX])
    setIsRoleIndustryExpanded(false)
    setRoleIndustryExcludeMissing(false)
    setManagementRange([EXPERIENCE_SLIDER_MIN, EXPERIENCE_SLIDER_MAX])
    setIsManagementExpanded(false)
    setManagementExcludeMissing(false)
    setExperienceSeniority([])
    setExperienceRoleType([])
    setExperienceRanges({})
    setFilter('yoe_min', undefined)
    setFilter('yoe_max', undefined)
  }

  const resetRoleIndustryCard = () => {
    setRoleIndustryRange([EXPERIENCE_SLIDER_MIN, EXPERIENCE_SLIDER_MAX])
    setRoleIndustryExcludeMissing(false)
    setIsRoleIndustryExpanded(false)
  }

  const resetManagementCard = () => {
    setManagementRange([EXPERIENCE_SLIDER_MIN, EXPERIENCE_SLIDER_MAX])
    setManagementExcludeMissing(false)
    setIsManagementExpanded(false)
  }

  const removeDepartment = (department: string) => {
    setDepartments(selectedDepartments.filter((item) => item !== department))
  }

  const clearAllSalary = () => {
    setIsSalaryAdvancedMode(false)
    setHideUndisclosedSalaries(false)
    setDesiredCompensationAmount('')
    setDesiredCompensationFrequency('Yearly')
    setMinimumCompMin('')
    setMinimumCompMax('')
    setMinimumCompFrequency('Yearly')
    setMaximumCompMin('')
    setMaximumCompMax('')
    setMaximumCompFrequency('Yearly')
    setListedFrequency('Any')
    setListedCurrency('Any')
    setListedCurrencySearch('')
    setListedCurrencyOpen(false)

    setFilter('salary_min', undefined)
    setFilter('salary_minimum_min', undefined)
    setFilter('salary_minimum_max', undefined)
    setFilter('salary_minimum_frequency', undefined)
    setFilter('salary_maximum_min', undefined)
    setFilter('salary_maximum_max', undefined)
    setFilter('salary_maximum_frequency', undefined)
    setFilter('salary_listed_frequency', undefined)
    setFilter('salary_currency', undefined)
  }

  const applyAndClose = () => {
    if (activeModal === 'commitment') {
      setCommitments(selectedCommitments)
    }
    if (activeModal === 'company') {
      const normalizedCompanyNames = companyNamesInput.trim()
      const normalizedExcludeCompanyNames = companyExcludeNamesInput.trim()
      const normalizedHqCountries = companyHqCountriesInput.trim()
      const normalizedExcludeHqCountries = companyExcludeHqCountriesInput.trim()

      setFilter('company_names', normalizedCompanyNames || undefined)
      setFilter('company_exclude_names', normalizedExcludeCompanyNames || undefined)
      setFilter('company_hq_countries', normalizedHqCountries || undefined)
      setFilter('company_exclude_hq_countries', normalizedExcludeHqCountries || undefined)
    }
    if (activeModal === 'industry') {
      const normalizedOrganizationType = industryOrganizationTypeInput.trim()
      const normalizedExcludeOrganizationTypes = industryExcludeOrganizationTypesInput.trim()
      const normalizedCompanyIndustry = industryCompanyIndustryInput.trim()
      const normalizedExcludeIndustries = industryExcludeIndustriesInput.trim()
      const normalizedCompanyActivitiesKeywords = industryCompanyActivitiesKeywordsInput.trim()
      const normalizedExcludeCompanyIndustriesKeywords =
        industryExcludeCompanyIndustriesKeywordsInput.trim()

      setFilter('industry_organization_type', normalizedOrganizationType || undefined)
      setFilter(
        'industry_exclude_organization_types',
        normalizedExcludeOrganizationTypes || undefined
      )
      setFilter('industry_company_industry', normalizedCompanyIndustry || undefined)
      setFilter('industry_exclude_industries', normalizedExcludeIndustries || undefined)
      setFilter(
        'industry_company_activities_keywords',
        normalizedCompanyActivitiesKeywords || undefined
      )
      setFilter(
        'industry_exclude_company_industries_keywords',
        normalizedExcludeCompanyIndustriesKeywords || undefined
      )
      setFilter(
        'industry_usajobs_policy',
        industryUsaJobsPolicy === 'include' ? undefined : industryUsaJobsPolicy
      )
    }
    if (activeModal === 'licenses') {
      const normalizedLicensesKeywords = licensesKeywordsInput.trim()
      const normalizedLicensesExcludeKeywords = licensesExcludeKeywordsInput.trim()
      setFilter('licenses_hide_required', licensesHideRequired === 'yes' ? true : undefined)
      setFilter('licenses_keywords', normalizedLicensesKeywords || undefined)
      setFilter('licenses_exclude_keywords', normalizedLicensesExcludeKeywords || undefined)
    }
    if (activeModal === 'stage') {
      const normalizedInvestors = stageInvestorsInput.trim()
      const normalizedExcludeInvestors = stageExcludeInvestorsInput.trim()
      const normalizedLatestRound = stageLatestRoundInput.trim()
      const normalizedExcludeLatestRound = stageExcludeLatestRoundInput.trim()
      const normalizedRaisedInOrAfter = stageRaisedInOrAfterInput.trim()
      const raisedInOrAfter =
        /^\d{4}$/.test(normalizedRaisedInOrAfter) && Number(normalizedRaisedInOrAfter) > 0
          ? Number(normalizedRaisedInOrAfter)
          : undefined

      setFilter('stage_investors', normalizedInvestors || undefined)
      setFilter('stage_exclude_investors', normalizedExcludeInvestors || undefined)
      setFilter('stage_latest_round', normalizedLatestRound || undefined)
      setFilter('stage_exclude_latest_round', normalizedExcludeLatestRound || undefined)
      setFilter('stage_raised_in_or_after', raisedInOrAfter)
      setFilter('stage_latest_round_amount_raised', parseSalaryAmount(stageLatestRoundAmountInput))
    }
    if (activeModal === 'languages') {
      const normalizedLanguageRequirements = languageRequirementsInput.trim()
      const normalizedLanguageExcludeRequirements = languageExcludeRequirementsInput.trim()
      setFilter('language_requirements', normalizedLanguageRequirements || undefined)
      setFilter(
        'language_exclude_requirements',
        normalizedLanguageExcludeRequirements || undefined
      )
    }
    if (activeModal === 'shifts') {
      setFilter('shift_morning', selectedShiftMorning)
      setFilter('shift_afternoon', selectedShiftAfternoon)
      setFilter('shift_overnight', selectedShiftOvernight)
      setFilter(
        'shift_weekend_availability',
        selectedShiftWeekendAvailability === 'doesnt_matter'
          ? undefined
          : selectedShiftWeekendAvailability
      )
      setFilter(
        'shift_holiday_availability',
        selectedShiftHolidayAvailability === 'doesnt_matter'
          ? undefined
          : selectedShiftHolidayAvailability
      )
      setFilter(
        'shift_overtime_availability',
        selectedShiftOvertimeAvailability === 'doesnt_matter'
          ? undefined
          : selectedShiftOvertimeAvailability
      )
      setFilter(
        'shift_oncall_requirements',
        selectedShiftOncallRequirements.length === SHIFT_ONCALL_OPTIONS.length
          ? undefined
          : selectedShiftOncallRequirements
      )
    }
    if (activeModal === 'travel') {
      setFilter('travel_air', selectedTravelAir.length ? selectedTravelAir : undefined)
      setFilter('travel_land', selectedTravelLand.length ? selectedTravelLand : undefined)
    }
    if (activeModal === 'benefits') {
      setFilter('benefits_perks', selectedBenefitsPerks.length ? selectedBenefitsPerks : undefined)
    }
    if (activeModal === 'encouraged') {
      setFilter(
        'encouraged_to_apply',
        selectedEncouragedToApply.length ? selectedEncouragedToApply : undefined
      )
    }
    if (activeModal === 'security') {
      setFilter(
        'security_clearance',
        selectedSecurityClearances.length === SECURITY_CLEARANCE_OPTIONS.length
          ? undefined
          : selectedSecurityClearances
      )
    }
    if (activeModal === 'experience') {
      const { yoeMin, yoeMax } = getYoeBoundsFromSeniority(selectedExperienceSeniority)
      const normalizedRoleIndustry = normalizeExperienceRange(
        roleIndustryRange[0],
        roleIndustryRange[1]
      )
      const normalizedManagement = normalizeExperienceRange(
        managementRange[0],
        managementRange[1]
      )

      setExperienceSeniority(selectedExperienceSeniority)
      setExperienceRoleType(selectedExperienceRoleType)
      setExperienceRanges({
        roleIndustryMin: normalizedRoleIndustry.minValue,
        roleIndustryMax: normalizedRoleIndustry.maxValue,
        roleIndustryExcludeMissing:
          roleIndustryExcludeMissing || normalizedRoleIndustry.minValue != null || normalizedRoleIndustry.maxValue != null
            ? roleIndustryExcludeMissing
            : undefined,
        managementMin: normalizedManagement.minValue,
        managementMax: normalizedManagement.maxValue,
        managementExcludeMissing:
          managementExcludeMissing || normalizedManagement.minValue != null || normalizedManagement.maxValue != null
            ? managementExcludeMissing
            : undefined,
      })
      setFilter('yoe_min', yoeMin)
      setFilter('yoe_max', yoeMax)
    }
    if (activeModal === 'salary') {
      const trimmedMinimumMin = minimumCompMin.trim()
      const trimmedMinimumMax = minimumCompMax.trim()
      const hasMinimumCompValue = Boolean(trimmedMinimumMin || trimmedMinimumMax)
      const trimmedMaximumMin = maximumCompMin.trim()
      const trimmedMaximumMax = maximumCompMax.trim()
      const hasMaximumCompValue = Boolean(trimmedMaximumMin || trimmedMaximumMax)

      setFilter('salary_min', parseSalaryAmount(desiredCompensationAmount))
      setFilter('salary_minimum_min', trimmedMinimumMin || undefined)
      setFilter('salary_minimum_max', trimmedMinimumMax || undefined)
      setFilter(
        'salary_minimum_frequency',
        hasMinimumCompValue ? minimumCompFrequency : undefined
      )
      setFilter('salary_maximum_min', trimmedMaximumMin || undefined)
      setFilter('salary_maximum_max', trimmedMaximumMax || undefined)
      setFilter(
        'salary_maximum_frequency',
        hasMaximumCompValue ? maximumCompFrequency : undefined
      )
      setFilter(
        'salary_listed_frequency',
        listedFrequency === 'Any' ? undefined : listedFrequency
      )
      setFilter('salary_currency', listedCurrency === 'Any' ? undefined : listedCurrency)
    }
    if (activeModal === 'founding') {
      if (!canApplyFoundingYear) return
      setFilter('founding_year_min', parsedFoundingYearMin)
      setFilter('founding_year_max', parsedFoundingYearMax)
    }
    if (activeModal === 'size') {
      setFilter('company_size', selectedCompanySizes.length ? selectedCompanySizes : undefined)
    }
    setActiveFilterModal(null)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && setActiveFilterModal(null)}>
      <DialogContent
        className={`flex max-h-[88vh] w-[95vw] max-w-[680px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px] ${
          activeModal === 'departments' ||
          activeModal === 'salary' ||
          activeModal === 'commitment' ||
          activeModal === 'experience' ||
          activeModal === 'shifts' ||
          activeModal === 'travel' ||
          activeModal === 'company' ||
          activeModal === 'industry' ||
          activeModal === 'stage' ||
          activeModal === 'founding' ||
          activeModal === 'size' ||
          activeModal === 'benefits' ||
          activeModal === 'encouraged' ||
          activeModal === 'languages' ||
          activeModal === 'security' ||
          activeModal === 'licenses'
            ? 'bg-white text-gray-900'
            : ''
        }`}
      >
        {activeModal === 'experience' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Experience</DialogTitle>
            </DialogHeader>

            <div
              data-testid="experience-scroll-area"
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-x-none px-6 py-6 [touch-action:pan-y]"
            >
              <section>
                <h3 className="mb-4 text-sm font-semibold leading-none text-gray-900">
                  Seniority
                </h3>
                <div className="space-y-4">
                  {EXPERIENCE_SENIORITY_OPTIONS.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-3">
                      <Checkbox
                        checked={selectedExperienceSeniority.includes(option.value)}
                        onCheckedChange={() =>
                          setSelectedExperienceSeniority((current) =>
                            current.includes(option.value)
                              ? current.filter((item) => item !== option.value)
                              : [...current, option.value]
                          )
                        }
                        className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                      />
                      <span className="text-sm leading-tight text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="mt-10">
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="text-sm font-semibold leading-none text-gray-900">
                    Role Type
                  </h3>
                  <CircleHelp className="h-6 w-6 text-gray-500 sm:h-4 sm:w-4" />
                </div>
                <div className="space-y-4">
                  {EXPERIENCE_ROLE_TYPE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-3">
                      <Checkbox
                        checked={selectedExperienceRoleType.includes(option.value)}
                        onCheckedChange={() =>
                          setSelectedExperienceRoleType((current) =>
                            current.includes(option.value)
                              ? current.filter((item) => item !== option.value)
                              : [...current, option.value]
                          )
                        }
                        className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                      />
                      <span className="text-sm leading-tight text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="mt-10 space-y-6">
                <ExperienceRangeSlider
                  title="Years of Experience: Role & Industry"
                  expanded={isRoleIndustryExpanded}
                  minValue={roleIndustryRange[0]}
                  maxValue={roleIndustryRange[1]}
                  onChange={(minValue, maxValue) => setRoleIndustryRange([minValue, maxValue])}
                  excludeMissing={roleIndustryExcludeMissing}
                  onExcludeMissingChange={setRoleIndustryExcludeMissing}
                  onFirstInteraction={() => setIsRoleIndustryExpanded(true)}
                  onReset={resetRoleIndustryCard}
                  testId="experience-role-industry-slider"
                />
                <ExperienceRangeSlider
                  title="Years of Experience: Management & Leadership"
                  expanded={isManagementExpanded}
                  minValue={managementRange[0]}
                  maxValue={managementRange[1]}
                  onChange={(minValue, maxValue) => setManagementRange([minValue, maxValue])}
                  excludeMissing={managementExcludeMissing}
                  onExcludeMissingChange={setManagementExcludeMissing}
                  onFirstInteraction={() => setIsManagementExpanded(true)}
                  onReset={resetManagementCard}
                  testId="experience-management-slider"
                />
              </section>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clearAllExperience}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Clear all
                </button>
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'commitment' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Commitment</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                {COMMITMENT_OPTIONS.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={selectedCommitments.includes(option.value)}
                      onCheckedChange={() =>
                        setSelectedCommitments((current) =>
                          current.includes(option.value)
                            ? current.filter((item) => item !== option.value)
                            : [...current, option.value]
                        )
                      }
                      className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                    />
                    <span className="text-sm text-gray-800">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clearAllCommitments}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Clear all
                </button>
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'travel' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Travel Requirement
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 pb-8">
              <section>
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Air Travel Requirement</h3>
                <div className="space-y-5">
                  {TRAVEL_REQUIREMENT_OPTIONS.map((option) => (
                    <label key={`air-${option.value}`} className="flex cursor-pointer items-center gap-3">
                      <Checkbox
                        checked={selectedTravelAir.includes(option.value)}
                        onCheckedChange={() =>
                          setSelectedTravelAir((current) =>
                            current.includes(option.value)
                              ? current.filter((item) => item !== option.value)
                              : [...current, option.value]
                          )
                        }
                        className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                      />
                      <span className="text-sm text-gray-800">{option.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="mt-8">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Land Travel Requirement</h3>
                <div className="space-y-5">
                  {TRAVEL_REQUIREMENT_OPTIONS.map((option) => (
                    <label key={`land-${option.value}`} className="flex cursor-pointer items-center gap-3">
                      <Checkbox
                        checked={selectedTravelLand.includes(option.value)}
                        onCheckedChange={() =>
                          setSelectedTravelLand((current) =>
                            current.includes(option.value)
                              ? current.filter((item) => item !== option.value)
                              : [...current, option.value]
                          )
                        }
                        className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                      />
                      <span className="text-sm text-gray-800">{option.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'shifts' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Shifts &amp; Schedules
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 pb-8">
              <div className="space-y-8">
                {[
                  {
                    title: 'Morning / Day / First Shift',
                    value: selectedShiftMorning,
                    onChange: setSelectedShiftMorning,
                  },
                  {
                    title: 'Afternoon / Evening / Second Shift',
                    value: selectedShiftAfternoon,
                    onChange: setSelectedShiftAfternoon,
                  },
                  {
                    title: 'Overnight / Graveyard / Third Shift',
                    value: selectedShiftOvernight,
                    onChange: setSelectedShiftOvernight,
                  },
                ].map((row) => (
                  <section key={row.title}>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">{row.title}</h3>
                    <div className="flex flex-wrap gap-3">
                      {SHIFT_REQUIREMENT_OPTIONS.map((option) => {
                        const isSelected = row.value === option.value
                        return (
                          <button
                            key={`${row.title}-${option.value}`}
                            type="button"
                            onClick={() =>
                              row.onChange(isSelected ? undefined : option.value)
                            }
                            className={`inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm text-gray-800 transition-colors ${
                              isSelected
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-gray-400 bg-white hover:bg-gray-50'
                            }`}
                            aria-pressed={isSelected}
                            aria-label={`${row.title} ${option.label}`}
                          >
                            <span
                              className={`h-4 w-4 rounded-full border ${
                                isSelected
                                  ? 'border-pink-500 bg-pink-500'
                                  : 'border-gray-700 bg-white'
                              }`}
                            />
                            <span>{option.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}

                <section>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Weekend Availability</h3>
                  <div className="space-y-4">
                    {SHIFT_AVAILABILITY_OPTIONS.map((option) => {
                      const isSelected = selectedShiftWeekendAvailability === option.value
                      return (
                        <button
                          key={`weekend-${option.value}`}
                          type="button"
                          onClick={() => setSelectedShiftWeekendAvailability(option.value)}
                          className="flex items-center gap-3 text-left"
                          aria-pressed={isSelected}
                          aria-label={`Weekend Availability ${option.label}`}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                              isSelected ? 'border-pink-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected ? (
                              <span className="h-3.5 w-3.5 rounded-full bg-pink-500" />
                            ) : null}
                          </span>
                          <span className="text-sm text-gray-800">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Holiday Availability</h3>
                  <div className="space-y-4">
                    {SHIFT_AVAILABILITY_OPTIONS.map((option) => {
                      const isSelected = selectedShiftHolidayAvailability === option.value
                      return (
                        <button
                          key={`holiday-${option.value}`}
                          type="button"
                          onClick={() => setSelectedShiftHolidayAvailability(option.value)}
                          className="flex items-center gap-3 text-left"
                          aria-pressed={isSelected}
                          aria-label={`Holiday Availability ${option.label}`}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                              isSelected ? 'border-pink-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected ? (
                              <span className="h-3.5 w-3.5 rounded-full bg-pink-500" />
                            ) : null}
                          </span>
                          <span className="text-sm text-gray-800">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Overtime Availability</h3>
                  <div className="space-y-4">
                    {SHIFT_AVAILABILITY_OPTIONS.map((option) => {
                      const isSelected = selectedShiftOvertimeAvailability === option.value
                      return (
                        <button
                          key={`overtime-${option.value}`}
                          type="button"
                          onClick={() => setSelectedShiftOvertimeAvailability(option.value)}
                          className="flex items-center gap-3 text-left"
                          aria-pressed={isSelected}
                          aria-label={`Overtime Availability ${option.label}`}
                        >
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                              isSelected ? 'border-pink-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected ? (
                              <span className="h-3.5 w-3.5 rounded-full bg-pink-500" />
                            ) : null}
                          </span>
                          <span className="text-sm text-gray-800">{option.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-sm font-semibold text-gray-900">Oncall Requirements</h3>
                  <div className="space-y-4">
                    {SHIFT_ONCALL_OPTIONS.map((option) => (
                      <label key={option.value} className="flex cursor-pointer items-center gap-3">
                        <Checkbox
                          checked={selectedShiftOncallRequirements.includes(option.value)}
                          onCheckedChange={() =>
                            setSelectedShiftOncallRequirements((current) =>
                              current.includes(option.value)
                                ? current.filter((item) => item !== option.value)
                                : [...current, option.value]
                            )
                          }
                          className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                        />
                        <span className="text-sm text-gray-800">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'languages' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Languages</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
              <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                <div className="space-y-6">
                  <StageSearchField
                    fieldId="language-requirements"
                    activeFieldId={activeLanguagesDropdownField}
                    onActiveFieldChange={setActiveLanguagesDropdownField}
                    label="Language Requirements"
                    value={languageRequirementsInput}
                    onChange={setLanguageRequirementsInput}
                    ariaLabel="Language requirements"
                    openOnFocus={false}
                  />
                  <StageSearchField
                    fieldId="language-exclude-requirements"
                    activeFieldId={activeLanguagesDropdownField}
                    onActiveFieldChange={setActiveLanguagesDropdownField}
                    label="Exclude Language Requirements"
                    value={languageExcludeRequirementsInput}
                    onChange={setLanguageExcludeRequirementsInput}
                    ariaLabel="Exclude language requirements"
                    openOnFocus={false}
                  />
                </div>
              </section>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'company' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Company</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                  <div className="space-y-6">
                    <StageSearchField
                      fieldId="company-names"
                      activeFieldId={activeCompanyDropdownField}
                      onActiveFieldChange={setActiveCompanyDropdownField}
                      label="Company Name"
                      value={companyNamesInput}
                      onChange={setCompanyNamesInput}
                      ariaLabel="Company names"
                    />
                    <StageSearchField
                      fieldId="company-exclude-names"
                      activeFieldId={activeCompanyDropdownField}
                      onActiveFieldChange={setActiveCompanyDropdownField}
                      label="Exclude Company Names"
                      value={companyExcludeNamesInput}
                      onChange={setCompanyExcludeNamesInput}
                      ariaLabel="Exclude company names"
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                  <div className="space-y-6">
                    <StageSearchField
                      fieldId="company-hq-countries"
                      activeFieldId={activeCompanyDropdownField}
                      onActiveFieldChange={setActiveCompanyDropdownField}
                      label="Company HQ Country"
                      value={companyHqCountriesInput}
                      onChange={setCompanyHqCountriesInput}
                      ariaLabel="Company HQ countries"
                    />
                    <StageSearchField
                      fieldId="company-exclude-hq-countries"
                      activeFieldId={activeCompanyDropdownField}
                      onActiveFieldChange={setActiveCompanyDropdownField}
                      label="Exclude HQ Countries"
                      value={companyExcludeHqCountriesInput}
                      onChange={setCompanyExcludeHqCountriesInput}
                      ariaLabel="Exclude HQ countries"
                    />
                  </div>
                </section>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'licenses' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Licenses &amp; Certifications
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
              <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">
                      Hide jobs that require licenses or certifications?
                    </h3>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setLicensesHideRequired('yes')}
                        className={`h-9 rounded-md border px-4 text-sm transition-colors ${
                          licensesHideRequired === 'yes'
                            ? 'border-pink-500 bg-pink-500 text-white'
                            : 'border-gray-500 bg-white text-gray-800'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setLicensesHideRequired('no')}
                        className={`h-9 rounded-md border px-4 text-sm transition-colors ${
                          licensesHideRequired === 'no'
                            ? 'border-pink-500 bg-pink-500 text-white'
                            : 'border-gray-500 bg-white text-gray-800'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <StageSearchField
                    fieldId="licenses-keywords"
                    activeFieldId={activeLicensesDropdownField}
                    onActiveFieldChange={setActiveLicensesDropdownField}
                    label="Licenses & Certifications Keywords"
                    value={licensesKeywordsInput}
                    onChange={setLicensesKeywordsInput}
                    ariaLabel="Licenses and certifications keywords"
                  />
                  <StageSearchField
                    fieldId="licenses-exclude-keywords"
                    activeFieldId={activeLicensesDropdownField}
                    onActiveFieldChange={setActiveLicensesDropdownField}
                    label="Exclude Licenses & Certifications Keywords"
                    value={licensesExcludeKeywordsInput}
                    onChange={setLicensesExcludeKeywordsInput}
                    ariaLabel="Exclude licenses and certifications keywords"
                  />
                </div>
              </section>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'industry' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Industry</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                  <div className="space-y-6">
                    <StageSearchField
                      fieldId="industry-organization-type"
                      activeFieldId={activeIndustryDropdownField}
                      onActiveFieldChange={setActiveIndustryDropdownField}
                      label="Organization Type"
                      value={industryOrganizationTypeInput}
                      onChange={setIndustryOrganizationTypeInput}
                      ariaLabel="Industry organization type"
                    />
                    <StageSearchField
                      fieldId="industry-exclude-organization-types"
                      activeFieldId={activeIndustryDropdownField}
                      onActiveFieldChange={setActiveIndustryDropdownField}
                      label="Exclude Organization Types"
                      value={industryExcludeOrganizationTypesInput}
                      onChange={setIndustryExcludeOrganizationTypesInput}
                      ariaLabel="Industry exclude organization types"
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                  <div className="space-y-6">
                    <StageSearchField
                      fieldId="industry-company-industry"
                      activeFieldId={activeIndustryDropdownField}
                      onActiveFieldChange={setActiveIndustryDropdownField}
                      label="Company Industry"
                      value={industryCompanyIndustryInput}
                      onChange={setIndustryCompanyIndustryInput}
                      ariaLabel="Industry company industry"
                    />
                    <StageSearchField
                      fieldId="industry-exclude-industries"
                      activeFieldId={activeIndustryDropdownField}
                      onActiveFieldChange={setActiveIndustryDropdownField}
                      label="Exclude Industries"
                      value={industryExcludeIndustriesInput}
                      onChange={setIndustryExcludeIndustriesInput}
                      ariaLabel="Industry exclude industries"
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                  <div className="space-y-6">
                    <StageSearchField
                      fieldId="industry-company-activities-keywords"
                      activeFieldId={activeIndustryDropdownField}
                      onActiveFieldChange={setActiveIndustryDropdownField}
                      label="Company Activities & Keywords"
                      value={industryCompanyActivitiesKeywordsInput}
                      onChange={setIndustryCompanyActivitiesKeywordsInput}
                      ariaLabel="Industry company activities keywords"
                    />
                    <StageSearchField
                      fieldId="industry-exclude-company-industries-keywords"
                      activeFieldId={activeIndustryDropdownField}
                      onActiveFieldChange={setActiveIndustryDropdownField}
                      label="Exclude Company Industries & Keywords"
                      value={industryExcludeCompanyIndustriesKeywordsInput}
                      onChange={setIndustryExcludeCompanyIndustriesKeywordsInput}
                      ariaLabel="Industry exclude company industries keywords"
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">USA Federal Jobs</h3>
                    {USAJOBS_POLICY_OPTIONS.map((option) => (
                      <label key={option.value} className="flex cursor-pointer items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIndustryUsaJobsPolicy(option.value)}
                          aria-label={option.label}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                            industryUsaJobsPolicy === option.value
                              ? 'border-pink-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {industryUsaJobsPolicy === option.value ? (
                            <span className="h-3 w-3 rounded-full bg-pink-500" />
                          ) : null}
                        </button>
                        <span className="text-sm text-gray-800">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'stage' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Stage & Funding</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                  <div className="space-y-6">
                    <StageSearchField
                      fieldId="stage-investors"
                      activeFieldId={activeStageDropdownField}
                      onActiveFieldChange={setActiveStageDropdownField}
                      label="Investors"
                      value={stageInvestorsInput}
                      onChange={setStageInvestorsInput}
                      ariaLabel="Stage investors"
                    />
                    <StageSearchField
                      fieldId="stage-exclude-investors"
                      activeFieldId={activeStageDropdownField}
                      onActiveFieldChange={setActiveStageDropdownField}
                      label="Exclude Investors"
                      value={stageExcludeInvestorsInput}
                      onChange={setStageExcludeInvestorsInput}
                      ariaLabel="Stage exclude investors"
                    />
                  </div>
                </section>

                <section className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm">
                  <div className="space-y-6">
                    <StageSearchField
                      fieldId="stage-latest-round"
                      activeFieldId={activeStageDropdownField}
                      onActiveFieldChange={setActiveStageDropdownField}
                      label="Latest Round"
                      value={stageLatestRoundInput}
                      onChange={setStageLatestRoundInput}
                      ariaLabel="Stage latest round"
                    />
                    <StageSearchField
                      fieldId="stage-exclude-latest-round"
                      activeFieldId={activeStageDropdownField}
                      onActiveFieldChange={setActiveStageDropdownField}
                      label="Exclude Latest Round"
                      value={stageExcludeLatestRoundInput}
                      onChange={setStageExcludeLatestRoundInput}
                      ariaLabel="Stage exclude latest round"
                    />
                  </div>
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Raised In Or After</h3>
                  <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Stage raised in or after year"
                    placeholder="Year"
                    value={stageRaisedInOrAfterInput}
                    onChange={(event) =>
                      setStageRaisedInOrAfterInput(event.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    className="h-12 w-[120px] rounded-md border border-gray-300 px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                  />
                </section>

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Latest Round Amount Raised
                  </h3>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      aria-label="Stage latest round amount raised"
                      value={stageLatestRoundAmountInput}
                      onChange={(event) => setStageLatestRoundAmountInput(event.target.value)}
                      placeholder=""
                      className="h-12 w-full rounded-md border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-900 outline-none focus:border-gray-900"
                    />
                  </div>
                </section>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'benefits' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Benefits & Perks
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
              <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
                {BENEFITS_PERKS_OPTIONS.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={selectedBenefitsPerks.includes(option.value)}
                      onCheckedChange={() =>
                        setSelectedBenefitsPerks((current) =>
                          current.includes(option.value)
                            ? current.filter((item) => item !== option.value)
                            : [...current, option.value]
                        )
                      }
                      className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                    />
                    <span className="text-sm text-gray-800">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'encouraged' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Encouraged to Apply
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
              <div className="space-y-5">
                {ENCOURAGED_TO_APPLY_OPTIONS.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={selectedEncouragedToApply.includes(option.value)}
                      onCheckedChange={() =>
                        setSelectedEncouragedToApply((current) =>
                          current.includes(option.value)
                            ? current.filter((item) => item !== option.value)
                            : [...current, option.value]
                        )
                      }
                      className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                    />
                    <span className="text-sm text-gray-800">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'security' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Security Clearance
              </DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
              <div className="space-y-5">
                {SECURITY_CLEARANCE_OPTIONS.map((option, index) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={selectedSecurityClearances.includes(option.value)}
                      onCheckedChange={() =>
                        setSelectedSecurityClearances((current) =>
                          current.includes(option.value)
                            ? current.filter((item) => item !== option.value)
                            : [...current, option.value]
                        )
                      }
                      className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                    />
                    <span className={`text-sm ${index === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'salary' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Salary</DialogTitle>
            </DialogHeader>

            <div
              data-testid="salary-scroll-area"
              className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6"
            >
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <div className="mb-4 flex items-center gap-2 text-pink-600">
                  <EyeOff className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-semibold">Undisclosed Salary Preference</span>
                  <CircleHelp className="h-4 w-4 text-gray-400" />
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={hideUndisclosedSalaries}
                    onCheckedChange={(checked) => setHideUndisclosedSalaries(Boolean(checked))}
                    className="size-5 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                  />
                  <span className="text-sm text-gray-700">Hide jobs with undisclosed salaries</span>
                </label>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsSalaryAdvancedMode((prev) => !prev)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-gray-700 px-2.5 text-sm font-semibold text-pink-600"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {isSalaryAdvancedMode ? 'Simple Mode' : 'Advanced Mode'}
                </button>
              </div>

              {!isSalaryAdvancedMode ? (
                <div className="mt-4 rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900">Desired Compensation</h3>

                  <div className="mt-3 space-y-3">
                    <MoneyInput
                      value={desiredCompensationAmount}
                      onChange={setDesiredCompensationAmount}
                      placeholder="Enter amount"
                      ariaLabel="Desired compensation amount"
                    />
                    <FrequencySelect
                      value={desiredCompensationFrequency}
                      onChange={setDesiredCompensationFrequency}
                      ariaLabel="Desired compensation frequency"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-5">
                  <div className="rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-900">Minimum Compensation</h3>
                    <p className="mt-6 text-sm text-gray-600">
                      If a job offers $X - $Y, this controls the $X part.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
                      <MoneyInput
                        value={minimumCompMin}
                        onChange={setMinimumCompMin}
                        placeholder="No Min"
                        ariaLabel="Minimum compensation minimum amount"
                      />
                      <span className="text-sm text-gray-500">-</span>
                      <MoneyInput
                        value={minimumCompMax}
                        onChange={setMinimumCompMax}
                        placeholder="No Max"
                        ariaLabel="Minimum compensation maximum amount"
                      />
                    </div>

                    <div className="mt-4">
                      <FrequencySelect
                        value={minimumCompFrequency}
                        onChange={setMinimumCompFrequency}
                        ariaLabel="Minimum compensation frequency"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-900">Maximum Compensation</h3>
                    <p className="mt-6 text-sm text-gray-600">
                      If a job offers $X - $Y, this controls the $Y part.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
                      <MoneyInput
                        value={maximumCompMin}
                        onChange={setMaximumCompMin}
                        placeholder="No Min"
                        ariaLabel="Maximum compensation minimum amount"
                      />
                      <span className="text-sm text-gray-500">-</span>
                      <MoneyInput
                        value={maximumCompMax}
                        onChange={setMaximumCompMax}
                        placeholder="No Max"
                        ariaLabel="Maximum compensation maximum amount"
                      />
                    </div>

                    <div className="mt-4">
                      <FrequencySelect
                        value={maximumCompFrequency}
                        onChange={setMaximumCompFrequency}
                        ariaLabel="Maximum compensation frequency"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div data-testid="listed-frequency-group">
                  <div className="mb-4 flex items-center gap-2 text-gray-800">
                    <Clock3 className="h-5 w-5 text-pink-500" />
                    <span className="text-sm font-semibold">Listed Frequency</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {LISTED_FREQUENCY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setListedFrequency(option)}
                        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                          listedFrequency === option
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center gap-2 text-gray-800">
                    <DollarSign className="h-5 w-5 text-pink-500" />
                    <span className="text-sm font-semibold">Listed Currency</span>
                  </div>

                  <div ref={listedCurrencyRef} className="relative">
                    <div
                      data-testid="listed-currency-control"
                      className={`relative rounded-lg border bg-white pl-3 pr-20 ${
                        listedCurrencyOpen ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="text"
                        aria-label="Listed Currency"
                        value={listedCurrencyOpen ? listedCurrencySearch : listedCurrency}
                        onFocus={() => setListedCurrencyOpen(true)}
                        onChange={(event) => {
                          if (!listedCurrencyOpen) setListedCurrencyOpen(true)
                          setListedCurrencySearch(event.target.value)
                        }}
                        placeholder="Any"
                        className={`h-12 w-full text-sm outline-none placeholder:text-pink-500 ${
                          listedCurrency === 'Any' && !listedCurrencyOpen && !listedCurrencySearch
                            ? 'text-pink-500'
                            : 'text-gray-900'
                        }`}
                      />

                      {(listedCurrencyOpen || listedCurrency !== 'Any' || listedCurrencySearch) && (
                        <button
                          type="button"
                          aria-label="Clear listed currency"
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                            setListedCurrency('Any')
                            setListedCurrencySearch('')
                            setListedCurrencyOpen(false)
                          }}
                          className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}

                      <span className="pointer-events-none absolute right-11 top-1/2 h-6 -translate-y-1/2 border-l border-gray-300" />

                      <button
                        type="button"
                        aria-label="Toggle listed currency options"
                        onClick={() => setListedCurrencyOpen((prev) => !prev)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${listedCurrencyOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    {listedCurrencyOpen && (
                      <div
                        data-testid="listed-currency-menu"
                        className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-20 max-h-72 overflow-y-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
                      >
                        {filteredListedCurrencyOptions.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No options</div>
                        ) : (
                          filteredListedCurrencyOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setListedCurrency(option)
                                setListedCurrencySearch('')
                                setListedCurrencyOpen(false)
                              }}
                              className={`block w-full px-4 py-2 text-left text-sm ${
                                listedCurrency === option
                                  ? 'bg-slate-200 text-gray-900'
                                  : 'text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              {option}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clearAllSalary}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Clear all
                </button>
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'founding' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Founding Year</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 px-6 py-6">
              <h3 className="text-sm font-semibold text-gray-900">Enter Founding Year Range</h3>

              <div className="mt-3 flex items-center gap-3">
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Founding year minimum"
                  placeholder="Min Year"
                  value={foundingYearMinInput}
                  onChange={(event) =>
                    setFoundingYearMinInput(event.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  className={`h-12 w-[120px] rounded-md border px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none ${
                    hasFoundingYearMinInput && !isFoundingYearMinValid
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-gray-900'
                  }`}
                  data-testid="founding-year-min-input"
                />
                <span className="text-sm text-gray-500">to</span>
                <input
                  type="text"
                  inputMode="numeric"
                  aria-label="Founding year maximum"
                  placeholder="Present"
                  value={foundingYearMaxInput}
                  onChange={(event) =>
                    setFoundingYearMaxInput(event.target.value.replace(/\D/g, '').slice(0, 4))
                  }
                  className={`h-12 w-[120px] rounded-md border px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none ${
                    (hasFoundingYearMaxInput && !isFoundingYearMaxValid) || !isFoundingYearRangeValid
                      ? 'border-red-500'
                      : 'border-gray-300 focus:border-gray-900'
                  }`}
                  data-testid="founding-year-max-input"
                />
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                  disabled={!canApplyFoundingYear}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'size' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Size</DialogTitle>
            </DialogHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                <label className="flex cursor-pointer items-center gap-3">
                  <Checkbox
                    checked={selectedCompanySizes.length === 0}
                    onCheckedChange={selectAllCompanySizes}
                    className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                  />
                  <span className="text-sm text-gray-800">All</span>
                </label>

                {COMPANY_SIZE_OPTIONS.map((sizeOption) => (
                  <label key={sizeOption} className="flex cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={selectedCompanySizes.includes(sizeOption)}
                      onCheckedChange={() => toggleCompanySize(sizeOption)}
                      className="size-6 rounded-[4px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                    />
                    <span className="text-sm text-gray-800">{sizeOption}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex justify-end">
                <Button
                  className="h-12 w-full rounded-md bg-pink-500 text-sm font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : activeModal === 'departments' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Departments</DialogTitle>
            </DialogHeader>

            <div className="border-b border-gray-200 px-6 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={departmentSearchText}
                  onChange={(event) => setDepartmentSearchText(event.target.value)}
                  placeholder="Search departments..."
                  className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none focus:border-pink-500"
                />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedGroups(ALL_DEPARTMENT_GROUP_TITLES)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  <ChevronDown className="h-4 w-4" />
                  Expand All
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedGroups([])}
                  className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  <ChevronUp className="h-4 w-4" />
                  Collapse All
                </button>
              </div>

              {selectedDepartments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedDepartments.map((department) => (
                    <button
                      key={department}
                      type="button"
                      onClick={() => removeDepartment(department)}
                      aria-label={`Remove ${department}`}
                      className="inline-flex items-center gap-1 rounded-full bg-pink-500 px-3 py-1 text-xs font-medium text-white"
                    >
                      {department}
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6">
              {filteredDepartmentGroups.length === 0 ? (
                <div className="py-6 text-sm text-gray-500">No departments found.</div>
              ) : (
                filteredDepartmentGroups.map((group) => {
                  const isExpanded = expandedGroups.includes(group.title)
                  const totalInGroup =
                    DEPARTMENT_GROUPS.find((item) => item.title === group.title)?.options.length ?? 0
                  const selectedInGroup = (
                    DEPARTMENT_GROUPS.find((item) => item.title === group.title)?.options ?? []
                  ).filter((option) => selectedDepartments.includes(option)).length

                  return (
                    <section key={group.title} className="border-b border-gray-200 py-1">
                      <button
                        type="button"
                        onClick={() => toggleGroupExpanded(group.title)}
                        className="flex w-full items-center justify-between py-3 text-left"
                      >
                        <span className="text-sm font-semibold text-gray-900">
                          {group.title}
                          {selectedInGroup > 0 ? ` (${selectedInGroup}/${totalInGroup})` : ''}
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="space-y-2 pb-3 pl-6">
                          {group.options.map((option) => (
                            <label key={option} className="flex cursor-pointer items-center gap-2">
                              <Checkbox
                                checked={selectedDepartments.includes(option)}
                                onCheckedChange={() => toggleDepartment(option)}
                                className="size-4 rounded-[3px] border-gray-300 data-[checked]:border-pink-500 data-[checked]:bg-pink-500"
                              />
                              <span className="text-sm text-gray-800">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </section>
                  )
                })
              )}
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={clearAllDepartments}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Clear all
                </button>

                <Button
                  className="rounded-md bg-pink-500 px-6 text-white hover:bg-pink-600"
                  onClick={applyAndClose}
                >
                  Apply
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="border-b px-6 pt-6 pb-4">
              <DialogTitle>Locations &amp; Environments</DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-1 text-sm font-semibold text-foreground">
                  📍 Locations
                </h3>
                <input
                  type="text"
                  placeholder="Search cities, states, countries, or continents"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                />
                <button className="mt-2 text-sm font-medium text-primary">
                  Anywhere in the world
                </button>
              </div>

              <CheckGroup
                title="Workplace Type"
                options={WORKPLACE_TYPES}
                selected={workplaceSelected}
                onToggle={toggleWorkplaceType}
              />
              <CheckGroup
                title="Physical Position"
                options={PHYSICAL_POSITIONS}
                selected={[]}
                onToggle={() => {}}
              />
              <CheckGroup
                title="Physical Environment"
                options={PHYSICAL_ENVIRONMENTS}
                selected={[]}
                onToggle={() => {}}
              />
              <CheckGroup
                title="Physical Labor Intensity"
                options={LABOR_INTENSITY}
                selected={[]}
                onToggle={() => {}}
              />
              <CheckGroup
                title="Cognitive Demand"
                options={LABOR_INTENSITY}
                selected={[]}
                onToggle={() => {}}
              />
              <CheckGroup
                title="Computer Usage Level"
                options={LABOR_INTENSITY}
                selected={[]}
                onToggle={() => {}}
              />
              <CheckGroup
                title="Oral Communication Level"
                options={LABOR_INTENSITY}
                selected={[]}
                onToggle={() => {}}
              />
            </div>

            <div className="border-t px-6 py-4">
              <Button
                className="w-full bg-primary text-white hover:bg-primary/90"
                onClick={applyAndClose}
              >
                Apply
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
