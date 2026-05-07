import { Menu, Sun, Moon } from 'lucide-react'
import { useAuth, UserButton } from '@clerk/clerk-react'
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
  const { isLoaded, isSignedIn } = useAuth()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 border border-border rounded-full px-3 py-2 hover:shadow-sm transition-shadow bg-background"
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4 text-muted-foreground" />
        {isSignedIn ? (
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
            <UserButton />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-300 shrink-0" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {isLoaded && !isSignedIn && (
          <>
            <DropdownMenuItem onClick={() => setAuthModalOpen(true, 'signUp')}>
              Sign up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setAuthModalOpen(true, 'signIn')}>
              Log in
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => { window.location.href = '/saved' }}>
          Saved jobs
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => { window.location.href = '/talent' }}>
          Talent Network
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => { window.location.href = '/about' }}>
          About Us
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            window.open('https://www.reddit.com/r/hiringespresso', '_blank', 'noopener,noreferrer')
          }}
        >
          <RedditIcon />
          Follow on Reddit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => { window.location.href = '/employers' }}>
          <span aria-hidden="true" className="text-base leading-none">🏢</span>
          Employers
        </DropdownMenuItem>

        {/* Light / Dark toggle */}
        <div className="flex flex-col px-4 pt-4 pb-2 border-t border-border">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center space-x-3 w-fit"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="text-sm font-medium text-foreground">
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <div className="flex items-center space-x-2 p-0.5 rounded-full bg-gray-200 shadow-inner border border-gray-300 dark:bg-gray-700 dark:border-gray-600">
              <div
                className={`rounded-full p-1 ${
                  theme === 'light' ? 'bg-yellow-300 ring-1 ring-yellow-400/80' : ''
                }`}
              >
                <Sun
                  className={`w-3 h-3 ${
                    theme === 'light' ? 'text-yellow-700' : 'text-gray-600 dark:text-gray-300'
                  }`}
                />
              </div>
              <div className={`rounded-full p-1 ${theme === 'dark' ? 'bg-gray-400' : ''}`}>
                <Moon className="w-3 h-3 text-gray-700 dark:text-gray-100" />
              </div>
            </div>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
