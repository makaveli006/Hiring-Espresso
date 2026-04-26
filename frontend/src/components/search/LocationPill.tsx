import { MapPin, ChevronDown } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'

export function LocationPill() {
  const setActiveFilterModal = useUIStore((s) => s.setActiveFilterModal)

  return (
    <button
      onClick={() => setActiveFilterModal('locations')}
      className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
      <span className="font-medium">India</span>
      <span className="text-gray-400 text-xs hidden sm:block">
        Remote · Hybrid · Onsite · All Environments
      </span>
      <ChevronDown className="w-4 h-4 text-gray-400" />
    </button>
  )
}
