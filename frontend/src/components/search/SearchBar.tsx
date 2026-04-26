import { Search } from 'lucide-react'
import { useFilterStore } from '@/store/useFilterStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useEffect, useState } from 'react'

export function SearchBar() {
  const setFilter = useFilterStore((s) => s.setFilter)
  const [value, setValue] = useState('')
  const debounced = useDebounce(value, 300)

  useEffect(() => {
    setFilter('keyword', debounced || undefined)
  }, [debounced, setFilter])

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 flex-1 max-w-md">
      <Search className="w-4 h-4 text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="Search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 w-full"
      />
    </div>
  )
}
