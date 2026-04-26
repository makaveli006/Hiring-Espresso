import { Home, Bookmark, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Bookmark, label: 'Saved', href: '/saved' },
  { icon: MessageCircle, label: 'Messages', href: '/messages' },
  { icon: User, label: 'Profile', href: '/profile' },
]

export function MobileNav() {
  const current = typeof window !== 'undefined' ? window.location.pathname : '/'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex md:hidden z-40">
      {NAV_ITEMS.map(({ icon: Icon, label, href }) => (
        <a
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-3 text-xs gap-1 transition-colors',
            current === href ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="sr-only">{label}</span>
        </a>
      ))}
    </nav>
  )
}
