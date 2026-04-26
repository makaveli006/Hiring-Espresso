import { Menu, Filter } from 'lucide-react'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search/SearchBar'
import { LocationPill } from '@/components/search/LocationPill'
import { useUIStore } from '@/store/useUIStore'

export function Header() {
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Logo */}
        <a href="/" className="shrink-0 flex items-center gap-1.5">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-primary text-base">HiringEspresso</span>
        </a>

        {/* Search */}
        <SearchBar />

        {/* Location */}
        <div className="hidden md:block">
          <LocationPill />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <SignedOut>
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm px-5 font-semibold"
            >
              Sign up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700">
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
        </div>
      </div>
    </header>
  )
}
