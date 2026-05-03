import { SignIn, SignUp } from '@clerk/clerk-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUIStore } from '@/store/useUIStore'

const clerkAppearance = {
  elements: {
    rootBox: 'w-full',
    card: 'shadow-none rounded-none border-0 w-full',
    headerTitle: 'text-2xl font-semibold',
    socialButtonsBlockButton: 'border border-gray-200 rounded-lg',
    formButtonPrimary: 'bg-primary hover:bg-primary/90 text-white rounded-lg',
  },
}

export function AuthModal() {
  const open = useUIStore((s) => s.authModalOpen)
  const mode = useUIStore((s) => s.authModalMode)
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => setAuthModalOpen(nextOpen)}>
      <DialogContent className="max-w-md p-0 overflow-hidden [&>button]:hidden">
        {mode === 'signUp' ? (
          <SignUp
            appearance={clerkAppearance}
            afterSignUpUrl="/"
          />
        ) : (
          <SignIn
            appearance={clerkAppearance}
            afterSignInUrl="/"
            afterSignUpUrl="/"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
