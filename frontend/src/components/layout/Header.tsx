import { useState } from 'react'
import { Filter, Sparkles } from 'lucide-react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search/SearchBar'
import { HeaderMenu } from '@/components/layout/HeaderMenu'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

export function Header() {
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)
  const { isSignedIn } = useAuth()
  const [mode, setMode] = useState<'basic' | 'advanced'>('basic')

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Logo */}
        <a href="/" className="shrink-0 flex items-center gap-1.5">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-primary text-base hidden sm:inline">HiringEspresso</span>
        </a>

        {/* Basic / Advanced toggle */}
        <div className="flex rounded-full border border-border overflow-hidden shrink-0">
          <button
            onClick={() => setMode('basic')}
            className={cn(
              'px-3 py-1 text-xs font-medium transition-colors',
              mode === 'basic'
                ? 'bg-primary text-white'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            Basic
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={cn(
              'px-3 py-1 text-xs font-medium transition-colors',
              mode === 'advanced'
                ? 'bg-primary text-white'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            Advanced
          </button>
        </div>

        {/* Search */}
        <SearchBar />

        <div className="ml-auto flex items-center gap-2">
          {/* AI Search button */}
          <button className="hidden md:flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            AI Search
            <span className="bg-green-500 text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none">
              NEW
            </span>
          </button>

          {/* Add Career Page button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 text-xs"
          >
            + Add Career Page
          </Button>

          {!isSignedIn && (
            <Button
              onClick={() => setAuthModalOpen(true, 'signUp')}
              className="bg-primary hover:bg-primary/90 text-white rounded-full text-sm px-5 font-semibold"
            >
              Sign up
            </Button>
          )}
          {isSignedIn && <UserButton />}
          <HeaderMenu />
        </div>
      </div>
    </header>
  )
}
