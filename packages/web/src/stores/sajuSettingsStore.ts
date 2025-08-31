import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SajuBirthInfo } from '@/types/saju'

interface SajuSettingsState {
  birthInfo: SajuBirthInfo | null
  setBirthInfo: (info: SajuBirthInfo) => void
  clearBirthInfo: () => void
}

export const useSajuSettingsStore = create<SajuSettingsState>()(
  persist(
    (set) => ({
      birthInfo: null,
      setBirthInfo: (info) => set({ birthInfo: info }),
      clearBirthInfo: () => set({ birthInfo: null }),
    }),
    {
      name: 'saju-settings',
    }
  )
)