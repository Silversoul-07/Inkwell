'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Theme = 'light' | 'dark' | 'sepia' | 'novelai' | 'midnight' | 'nord' | 'forest'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEMES: Theme[] = ['light', 'dark', 'sepia', 'novelai', 'midnight', 'nord', 'forest']
const DEFAULT_THEME: Theme = 'light'

function getInitialTheme(): Theme {
  // Server-side: return default theme
  if (typeof window === 'undefined') return DEFAULT_THEME

  // Client-side: try to get from localStorage
  const stored = localStorage.getItem('theme') as Theme
  return stored && THEMES.includes(stored) ? stored : DEFAULT_THEME
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting - this is intentional for SSR hydration
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    document.documentElement.classList.remove(...THEMES)
    document.documentElement.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  // Prevent flash of unstyled content and hydration mismatches
  // by not rendering children until mounted on client
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
