import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 py-6 px-4 text-sm text-gray-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-semibold text-gray-800">HiringEspresso</span>
        <div className="flex items-center gap-6">
          <a href="/about" className="hover:text-gray-800 transition-colors">About</a>
          <a href="/talent" className="hover:text-gray-800 transition-colors">Talent Network</a>
          <a href="/terms" className="hover:text-gray-800 transition-colors">Terms</a>
          <Link to="/privacy" className="hover:text-gray-800 transition-colors">Privacy</Link>
        </div>
        <p className="text-xs text-gray-400">© 2026 HiringEspresso. All rights reserved.</p>
      </div>
    </footer>
  )
}
