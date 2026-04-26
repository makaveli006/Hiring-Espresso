import { SignIn } from '@clerk/clerk-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUIStore } from '@/store/useUIStore'

export function AuthModal() {
  const open = useUIStore((s) => s.authModalOpen)
  const setAuthModalOpen = useUIStore((s) => s.setAuthModalOpen)

  return (
    <Dialog open={open} onOpenChange={setAuthModalOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden [&>button]:hidden">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none rounded-none border-0 w-full',
              headerTitle: 'text-2xl font-semibold',
              socialButtonsBlockButton: 'border border-gray-200 rounded-lg',
              formButtonPrimary:
                'bg-primary hover:bg-primary/90 text-white rounded-lg',
            },
          }}
          afterSignInUrl="/"
          afterSignUpUrl="/"
        />
      </DialogContent>
    </Dialog>
  )
}
