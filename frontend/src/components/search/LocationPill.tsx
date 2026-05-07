import { MapPin, ChevronDown } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

export function LocationPill() {
  const setActiveFilterModal = useUIStore((s) => s.setActiveFilterModal)

  return (
    <button
      onClick={() => setActiveFilterModal('locations')}
      className="hidden lg:flex items-center gap-2.5 border border-border rounded-full px-3.5 py-1.5 min-w-[240px] xl:min-w-[280px] 2xl:min-w-[300px] hover:bg-accent/40 transition-colors shrink-0"
    >
      <MapPin className="w-4 h-4 text-foreground shrink-0" />
      <div className="text-left min-w-0 leading-tight">
        <p className="text-sm font-semibold text-foreground">India</p>
        <p className="text-xs font-medium text-foreground truncate">
          Remote · Hybrid · Onsite · All Environments
        </p>
      </div>
      <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
    </button>
  )
}
