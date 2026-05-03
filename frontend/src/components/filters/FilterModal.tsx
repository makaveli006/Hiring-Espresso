import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock3,
  DollarSign,
  EyeOff,
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
        className="h-12 w-full rounded-xl border border-gray-300 bg-white pl-8 pr-3 text-base text-gray-900 placeholder:text-gray-500 outline-none focus:border-pink-500"
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
        className="h-12 w-full appearance-none rounded-xl border border-gray-300 bg-white px-3 pr-9 text-base text-gray-900 outline-none focus:border-pink-500"
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

function parseSalaryAmount(value: string): number | undefined {
  const normalized = value.replace(/,/g, '').replace(/[^\d.]/g, '').trim()
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function FilterModal() {
  const activeModal = useUIStore((s) => s.activeFilterModal)
  const open =
    activeModal === 'locations' || activeModal === 'departments' || activeModal === 'salary'
  const setActiveFilterModal = useUIStore((s) => s.setActiveFilterModal)
  const { filters, setFilter, toggleWorkplaceType, toggleDepartment, setDepartments } =
    useFilterStore()

  const [departmentSearchText, setDepartmentSearchText] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(ALL_DEPARTMENT_GROUP_TITLES)

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

  useEffect(() => {
    if (activeModal === 'departments') {
      setDepartmentSearchText('')
      setExpandedGroups(ALL_DEPARTMENT_GROUP_TITLES)
    }
  }, [activeModal])

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
    setActiveFilterModal(null)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && setActiveFilterModal(null)}>
      <DialogContent
        className={`flex max-h-[88vh] w-[95vw] max-w-[680px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px] ${
          activeModal === 'departments' || activeModal === 'salary' ? 'bg-white text-gray-900' : ''
        }`}
      >
        {activeModal === 'salary' ? (
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
                  <h3 className="text-lg font-semibold text-gray-900">Desired Compensation</h3>

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
                    <h3 className="text-lg font-semibold text-gray-900">Minimum Compensation</h3>
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
                      <span className="text-lg text-gray-500">-</span>
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
                    <h3 className="text-lg font-semibold text-gray-900">Maximum Compensation</h3>
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
                      <span className="text-lg text-gray-500">-</span>
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
                    <span className="text-lg font-semibold">Listed Frequency</span>
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
                    <span className="text-lg font-semibold">Listed Currency</span>
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
                        className={`h-12 w-full text-base outline-none placeholder:text-pink-500 ${
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
                  className="h-12 w-full rounded-md bg-pink-500 text-lg font-semibold text-white hover:bg-pink-600 sm:w-[320px]"
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
