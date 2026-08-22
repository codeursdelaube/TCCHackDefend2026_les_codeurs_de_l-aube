'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const syncTheme = () => {
      try {
        const primary = localStorage.getItem('heritogo_theme')
        const legacy = localStorage.getItem('theme')
        const theme = primary === 'dark' || primary === 'light'
          ? primary
          : legacy === 'dark' || legacy === 'light'
            ? legacy
            : 'light'

        document.documentElement.classList.toggle('dark', theme === 'dark')
        document.documentElement.dataset.theme = theme
        localStorage.setItem('heritogo_theme', theme)
        localStorage.setItem('theme', theme)
        document.cookie = `heritogo_theme=${theme}; path=/; max-age=31536000; SameSite=Lax`
        document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`
      } catch {}
    }

    syncTheme()
    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  return <>{children}</>
}
