import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'
interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // 기본값을 system으로 설정
      setTheme: (theme: Theme) => set({ theme }),
      toggleTheme: () =>
        set((state: { theme: Theme }) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }))
    }),
    {
      name: 'theme'
    }
  )
)
export default useThemeStore
