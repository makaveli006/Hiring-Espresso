import { MapPin, ChevronDown } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

export function LocationPill() {
  const setActiveFilterModal = useUIStore((s) => s.setActiveFilterModal)

  return (
    <button
      onClick={() => setActiveFilterModal('locations')}
      className="flex items-center gap-2 border border-border rounded-full px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
    >
      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="font-medium">India</span>
      <span className="text-muted-foreground text-xs hidden sm:block">
        Remote · Hybrid · Onsite · All Environments
      </span>
      <ChevronDown className="w-4 h-4 text-muted-foreground" />
    </button>
  )
}
