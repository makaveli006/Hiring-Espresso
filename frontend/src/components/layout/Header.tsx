import { Filter, Sparkles } from 'lucide-react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search/SearchBar'
import { HeaderMenu } from '@/components/layout/HeaderMenu'
import { useUIStore } from '@/store/useUIStore'

export function Header() {
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)
  const { isSignedIn } = useAuth()

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

        {/* Search (Basic/Advanced toggle is now inside SearchBar) */}
        <SearchBar />

        <div className="ml-auto flex items-center gap-3">
          {/* Add Career Page button */}
          <button className="hidden lg:flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors shrink-0">
            <span className="text-base leading-none">⊕</span>
            Add Career Page
          </button>

          {/* AI Search button */}
          <div className="hidden md:flex items-center relative shrink-0">
            <span className="absolute -top-2 -right-1 bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10">
              NEW
            </span>
            <button className="flex items-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              <Sparkles className="w-4 h-4" />
              AI Search
            </button>
          </div>

          {/* Sign Up / User */}
          {isSignedIn ? (
            <UserButton />
          ) : (
            <Button
              onClick={() => setAuthModalOpen(true, 'signUp')}
              className="bg-primary hover:bg-primary/90 text-white rounded-full text-sm px-5 font-semibold shrink-0"
            >
              Sign up
            </Button>
          )}

          <HeaderMenu />
        </div>
      </div>
    </header>
  )
}
