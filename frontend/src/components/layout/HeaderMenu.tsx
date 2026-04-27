import { Menu, Sun, Moon, Bookmark, Users, Info, Building2 } from 'lucide-react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUIStore } from '@/store/useUIStore'

function RedditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="text-orange-500 shrink-0"
    >
      <circle cx="10" cy="10" r="10" fill="#FF4500" />
      <path
        fill="white"
        d="M16.67 10a1.46 1.46 0 0 0-2.47-1 7.12 7.12 0 0 0-3.85-1.23l.65-3.07 2.13.45a1 1 0 1 0 1-.97 1 1 0 0 0-.95.68l-2.38-.5a.15.15 0 0 0-.18.11l-.73 3.44a7.14 7.14 0 0 0-3.89 1.23 1.46 1.46 0 1 0-1.61 2.39 2.87 2.87 0 0 0 0 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 0 0 0-.44 1.46 1.46 0 0 0 .62-1.53zM7.27 11a1 1 0 1 1 1 1 1 1 0 0 1-1-1zm5.58 2.71a3.58 3.58 0 0 1-2.85.71 3.58 3.58 0 0 1-2.85-.71.15.15 0 0 1 .21-.21 3.27 3.27 0 0 0 2.64.56 3.27 3.27 0 0 0 2.64-.56.15.15 0 0 1 .21.21zm-.13-1.71a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"
      />
    </svg>
  )
}

export function HeaderMenu() {
  const { setAuthModalOpen, theme, setTheme } = useUIStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <SignedOut>
          <DropdownMenuItem onSelect={() => setAuthModalOpen(true)}>
            Sign up
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setAuthModalOpen(true)}>
            Log in
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </SignedOut>

        <DropdownMenuItem asChild>
          <a href="/saved" className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            Saved jobs
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="/talent" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Talent Network
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/about" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            About Us
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href="https://www.reddit.com/r/hiringcafe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <RedditIcon />
            Follow on Reddit
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a href="/employers" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Employers
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Light / Dark toggle */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
          <div className="flex items-center gap-1 rounded-full bg-gray-100 p-0.5">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                theme === 'light' ? 'bg-amber-400 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Light mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Dark mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
