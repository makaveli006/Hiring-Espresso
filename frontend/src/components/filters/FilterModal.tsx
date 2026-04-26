import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/useUIStore'
import { useFilterStore } from '@/store/useFilterStore'

const WORKPLACE_TYPES = ['Remote', 'Hybrid', 'Onsite']
const PHYSICAL_POSITIONS = ['Sitting / Desk Jobs', 'Active']
const PHYSICAL_ENVIRONMENTS = ['Office', 'Outdoor', 'Vehicle', 'Industrial', 'Customer-Facing']
const LABOR_INTENSITY = ['Low', 'Medium', 'High']

interface CheckGroupProps {
  title: string
  options: string[]
  selected: string[]
  onToggle: (v: string) => void
}

function CheckGroup({ title, options, selected, onToggle }: CheckGroupProps) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold text-sm text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selected.includes(opt.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_'))}
              onCheckedChange={() => onToggle(opt.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_'))}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function FilterModal() {
  const open = useUIStore((s) => s.activeFilterModal === 'locations')
  const setActiveFilterModal = useUIStore((s) => s.setActiveFilterModal)
  const { filters, toggleWorkplaceType } = useFilterStore()

  const workplaceSelected = filters.workplace_type?.map((t) => t) ?? []

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setActiveFilterModal(null)}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Locations &amp; Environments</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          {/* Location search */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-800 mb-3 flex items-center gap-1">
              📍 Locations
            </h3>
            <input
              type="text"
              placeholder="Search cities, states, countries, or continents"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button className="text-primary text-sm mt-2 font-medium">Anywhere in the world</button>
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

        <div className="px-6 py-4 border-t">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={() => setActiveFilterModal(null)}
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
