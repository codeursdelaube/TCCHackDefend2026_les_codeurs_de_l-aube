'use client'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'
const KEY = 'heritogo_theme'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = localStorage.getItem(KEY) as Theme | null
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const initial = saved ?? (prefersDark ? 'dark' : 'light')
      setTheme(initial)
      setMounted(true)
    }, 0)

    return () => window.clearTimeout(timer)
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
    document.cookie = `heritogo_theme=${next}; path=/; max-age=31536000`
  }

  return {
    theme,
    toggle,
    isDark: theme === 'dark',
    mounted,
  }
}
