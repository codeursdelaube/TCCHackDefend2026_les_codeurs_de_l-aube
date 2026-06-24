'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const syncTheme = () => {
      try {
        const saved = localStorage.getItem('heritogo_theme')
        if (!saved) return

        // On vérifie l'état actuel du DOM pour ne pas faire de modifications inutiles
        const hasDarkClass = document.documentElement.classList.contains('dark')

        if (saved === 'dark' && !hasDarkClass) {
          document.documentElement.classList.add('dark')
        } else if (saved === 'light' && hasDarkClass) {
          document.documentElement.classList.remove('dark')
        }
      } catch (e) {}
    }

    // Écoute uniquement si l'utilisateur modifie le thème (ex: via un bouton toggle)
    window.addEventListener('storage', syncTheme)
    return () => window.removeEventListener('storage', syncTheme)
  }, [])

  return <>{children}</>
}
