import { Filter, Sparkles } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search/SearchBar'
import { LocationPill } from '@/components/search/LocationPill'
import { HeaderMenu } from '@/components/layout/HeaderMenu'
import { useUIStore } from '@/store/useUIStore'

interface HeaderProps {
  simple?: boolean
}

export function Header({ simple = false }: HeaderProps) {
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)
  const { isLoaded, isSignedIn } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-2">
      <div className="max-w-[1456px] mx-auto flex items-center gap-2">
        {/* Logo */}
        <Link to="/" className="shrink-0 flex items-center gap-1.5">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <span className="text-blue-500 font-extrabold hidden xl:block">
            HiringEspresso
          </span>
        </Link>

        {/* Search + location selector */}
        <SearchBar simple={simple} />
        {!simple && <LocationPill />}

        <div className="ml-auto flex items-center gap-3">
          {/* Add Career Page button */}
          <button className="hidden lg:flex items-center gap-1.5 bg-[#16a34a] hover:bg-[#15803d] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors shrink-0">
            <span className="text-base leading-none">⊕</span>
            Add Career Page
          </button>

          {/* Sign Up (signed-out only) */}
          {isLoaded && !isSignedIn && (
            <Button
              onClick={() => setAuthModalOpen(true, 'signUp')}
              className="bg-[#facc15] hover:bg-[#eab308] text-black rounded-full text-sm px-5 py-2.5 font-semibold shrink-0"
            >
              Sign up
            </Button>
          )}

          {!simple && (
            <div className="hidden md:flex items-center relative shrink-0">
              <span className="absolute -top-2 -right-1 bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none z-10">
                NEW
              </span>
              <button className="flex items-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] text-white text-sm font-semibold px-4 py-2.5 rounded-full transition-colors">
                <Sparkles className="w-4 h-4" />
                AI Search
              </button>
            </div>
          )}

          <HeaderMenu />
        </div>
      </div>
    </header>
  )
}
