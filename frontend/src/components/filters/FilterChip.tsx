import { cn } from '@/lib/utils'

interface FilterChipProps {
  label: string
  active?: boolean
  variant?: 'default' | 'company'
  onClick?: () => void
}

export function FilterChip({ label, active, variant = 'default', onClick }: FilterChipProps) {
  const isCompany = variant === 'company'

  return (
    <button
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap',
        isCompany
          ? active
            ? 'border-amber-500 bg-amber-50 text-amber-700'
            : 'border-amber-400 text-amber-600 hover:border-amber-500 hover:text-amber-700'
          : active
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800'
      )}
    >
      {label}
    </button>
  )
}
