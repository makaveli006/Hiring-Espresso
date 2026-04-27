import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileNav } from '@/components/layout/MobileNav'
import { AuthModal } from '@/components/auth/AuthModal'

export function ContentLayout({ children }: { children: ReactNode }) {
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
