'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const syncTheme = () => {
      try {
        const saved = localStorage.getItem('heritogo_theme')
        if (!saved) return

        const hasDarkClass = document.documentElement.classList.contains('dark')

        if (saved === 'dark' && !hasDarkClass) {
          document.documentElement.classList.add('dark')
        } else if (saved === 'light' && hasDarkClass) {
          document.documentElement.classList.remove('dark')
        }
      } catch {}
    }

    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  return <>{children}</>
}
