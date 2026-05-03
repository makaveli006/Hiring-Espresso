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
        'shrink-0 rounded-[8px] border px-4 py-1.5 text-[13px] font-semibold leading-none transition-colors whitespace-nowrap',
        isCompany
          ? active
            ? 'border-amber-500 bg-amber-50 text-amber-700'
            : 'border-amber-400 text-amber-700 hover:border-amber-500'
          : active
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border text-gray-700 hover:border-gray-500'
      )}
    >
      {label}
    </button>
  )
}
