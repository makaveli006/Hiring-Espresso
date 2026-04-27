import { create } from 'zustand'

type Theme = 'light' | 'dark'

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme:v1')
    if (stored === 'dark' || stored === 'light') return stored
  } catch {}
  return 'light'
}

interface UIStore {
  authModalOpen: boolean
  locationModalOpen: boolean
  activeFilterModal: string | null
  theme: Theme
  setAuthModalOpen: (open: boolean) => void
  setLocationModalOpen: (open: boolean) => void
  setActiveFilterModal: (name: string | null) => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIStore>((set) => ({
  authModalOpen: false,
  locationModalOpen: false,
  activeFilterModal: null,
  theme: loadTheme(),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setLocationModalOpen: (open) => set({ locationModalOpen: open }),
  setActiveFilterModal: (name) => set({ activeFilterModal: name }),
  setTheme: (theme) => {
    try { localStorage.setItem('theme:v1', theme) } catch {}
    set({ theme })
  },
}))
