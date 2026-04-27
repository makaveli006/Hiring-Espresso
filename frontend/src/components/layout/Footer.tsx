import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-6 px-4 text-sm text-muted-foreground">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-semibold text-foreground">HiringEspresso</span>
        <div className="flex items-center gap-6">
          <a href="/about" className="hover:text-foreground transition-colors">About</a>
          <Link to="/talent" className="hover:text-foreground transition-colors">Talent Network</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
        </div>
        <p className="text-xs text-muted-foreground/70">© 2026 HiringEspresso. All rights reserved.</p>
      </div>
    </footer>
  )
}
