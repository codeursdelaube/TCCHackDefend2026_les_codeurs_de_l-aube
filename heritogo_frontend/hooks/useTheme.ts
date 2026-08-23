'use client'
import { useEffect, useState } from 'react'
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/storage'

type Theme = 'light' | 'dark'
const PRIMARY_KEY = 'heritogo_theme'
const LEGACY_KEY = 'theme'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.dataset.theme = theme
  safeLocalStorageSet(PRIMARY_KEY, theme)
  safeLocalStorageSet(LEGACY_KEY, theme)
  document.cookie = `${PRIMARY_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`
  document.cookie = `${LEGACY_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const primary = safeLocalStorageGet(PRIMARY_KEY)
    const legacy = safeLocalStorageGet(LEGACY_KEY)
    const initial = isTheme(primary) ? primary : isTheme(legacy) ? legacy : 'light'
    setThemeState(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    applyTheme(next)
  }

  return { theme, setTheme, toggle: () => setTheme(theme === 'light' ? 'dark' : 'light'), isDark: theme === 'dark', mounted }
}
