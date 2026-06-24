'use client'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'heritogo_theme'

export function useTheme() {
  // Initialise sans lire localStorage (évite l'hydratation mismatch)
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Lecture localStorage uniquement côté client
    const saved = localStorage.getItem(KEY) as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved ?? (prefersDark ? 'dark' : 'light')
    setTheme(initial)
    setMounted(true)
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem(KEY, next)
    if (next === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    theme,
    toggle,
    isDark: theme === 'dark',
    mounted, // ← toujours vérifier mounted avant d'afficher le toggle
  }
}
