import { Filter } from 'lucide-react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search/SearchBar'
import { HeaderMenu } from '@/components/layout/HeaderMenu'
import { useUIStore } from '@/store/useUIStore'

function ThemeToggle() {
  const { theme, setTheme } = useUIStore()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        isDark ? 'bg-gray-700' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          isDark ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function Header() {
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)
  const { isSignedIn } = useAuth()

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

        <div className="ml-auto flex items-center gap-2">
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
