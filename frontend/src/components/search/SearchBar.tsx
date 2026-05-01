import { Search, Sparkles } from 'lucide-react'
import { useFilterStore } from '@/store/useFilterStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function SearchBar() {
  const setFilter = useFilterStore((s) => s.setFilter)
  const [value, setValue] = useState('')
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic')
  const debounced = useDebounce(value, 300)

  useEffect(() => {
    setFilter('keyword', debounced || undefined)
  }, [debounced, setFilter])

  return (
    <div className="flex items-center flex-1 max-w-2xl border border-border rounded-full bg-background shadow-sm overflow-hidden">
      {/* Basic / Advanced tabs */}
      <div className="flex items-center shrink-0 px-1">
        <button
          onClick={() => setMode('basic')}
          className={cn(
            'px-3 py-1.5 text-sm font-semibold rounded-full transition-colors',
            mode === 'basic'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Basic
        </button>
        <button
          onClick={() => setMode('advanced')}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
            mode === 'advanced'
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Advanced
        </button>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border shrink-0" />

      {/* Search input */}
      <div className="flex items-center gap-2 flex-1 px-4 py-2">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
        />
      </div>
    </div>
  )
}
