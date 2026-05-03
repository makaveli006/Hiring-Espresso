import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, ChevronUp, Search, X } from 'lucide-react'
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

interface CheckGroupProps {
  title: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
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

export function FilterModal() {
  const activeModal = useUIStore((s) => s.activeFilterModal)
  const open = activeModal === 'locations' || activeModal === 'departments'
  const setActiveFilterModal = useUIStore((s) => s.setActiveFilterModal)
  const { filters, toggleWorkplaceType, toggleDepartment, setDepartments } = useFilterStore()

  const [searchText, setSearchText] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<string[]>(ALL_DEPARTMENT_GROUP_TITLES)
  const workplaceSelected = filters.workplace_type?.map((t) => t) ?? []
  const selectedDepartments = filters.department ?? []

  useEffect(() => {
    if (activeModal === 'departments') {
      setSearchText('')
      setExpandedGroups(ALL_DEPARTMENT_GROUP_TITLES)
    }
  }, [activeModal])

  const filteredDepartmentGroups = useMemo(() => {
    const query = searchText.trim().toLowerCase()

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
  }, [searchText])

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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && setActiveFilterModal(null)}>
      <DialogContent
        className={`flex max-h-[85vh] w-[95vw] max-w-[620px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[620px] ${
          activeModal === 'departments' ? 'bg-white text-gray-900' : ''
        }`}
      >
        {activeModal === 'departments' ? (
          <>
            <DialogHeader className="border-b border-gray-200 px-6 py-4 pr-12">
              <DialogTitle className="text-lg font-semibold text-gray-900">Departments</DialogTitle>
            </DialogHeader>

            <div className="border-b border-gray-200 px-6 py-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
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
                  onClick={() => setActiveFilterModal(null)}
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
                onClick={() => setActiveFilterModal(null)}
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
