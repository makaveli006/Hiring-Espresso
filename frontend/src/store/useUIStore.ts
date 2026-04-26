import { create } from 'zustand'

interface UIStore {
  authModalOpen: boolean
  locationModalOpen: boolean
  activeFilterModal: string | null
  setAuthModalOpen: (open: boolean) => void
  setLocationModalOpen: (open: boolean) => void
  setActiveFilterModal: (name: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
  authModalOpen: false,
  locationModalOpen: false,
  activeFilterModal: null,
  setAuthModalOpen: (open) => set({ authModalOpen: open }),
  setLocationModalOpen: (open) => set({ locationModalOpen: open }),
  setActiveFilterModal: (name) => set({ activeFilterModal: name }),
}))
