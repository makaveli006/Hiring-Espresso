import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { FilterBar } from '@/components/layout/FilterBar'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { FilterModal } from '@/components/filters/FilterModal'
import { AuthModal } from '@/components/auth/AuthModal'
import { useUIStore } from '@/store/useUIStore'

export function RootLayout({ children }: { children: ReactNode }) {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <>
      <Header />
      <FilterBar />
      <main className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6 flex-1 w-full">
        {children}
      </main>
      <Footer />
      <MobileNav />

      {/* Global modals */}
      <FilterModal />
      <AuthModal />
    </>
  )
}
