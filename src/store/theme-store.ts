import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'auto'

function resolveIsDark(theme: Theme): boolean {
  if (theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return theme === 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', resolveIsDark(theme))
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      toggleTheme: () => {
        const current = get().theme
        const isDark = resolveIsDark(current)
        const next: Theme = isDark ? 'light' : 'dark'
        applyTheme(next)
        set({ theme: next })
      },
    }),
    {
      name: 'stamux-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)