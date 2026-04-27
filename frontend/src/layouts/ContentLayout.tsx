import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { AuthModal } from '@/components/auth/AuthModal'
import { useUIStore } from '@/store/useUIStore'

export function ContentLayout({ children }: { children: ReactNode }) {
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
      <main className="max-w-2xl mx-auto px-4 py-10 pb-20 md:pb-10 flex-1 w-full">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <AuthModal />
    </>
  )
}
