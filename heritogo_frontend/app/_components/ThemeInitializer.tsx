'use client'

/**
 * ThemeInitializer Component
 * Initialise le thème côté client pour éviter les erreurs de hydration
 * Lit le thème depuis les cookies ou localStorage et l'applique au DOM
 * Assure la persistance du thème entre les chargements de page
 */
import { useEffect } from 'react'

export default function ThemeInitializer() {
  useEffect(() => {
    // Fonction pour lire le thème depuis les cookies ou localStorage
    const getTheme = (): string => {
      try {
        // Essayer de lire depuis les cookies d'abord
        const cookieTheme = document.cookie
          .split('; ')
          .find(row => row.startsWith('theme='))
          ?.split('=')[1]
        
        // Essayer de lire depuis localStorage
        const localTheme = localStorage.getItem('theme')
        
        // Priorité: cookie > localStorage > light
        const theme = cookieTheme || localTheme || 'light'
        
        // Synchroniser localStorage avec le cookie
        if (cookieTheme && localTheme !== cookieTheme) {
          localStorage.setItem('theme', cookieTheme)
        }
        
        // Synchroniser le cookie avec localStorage
        if (localTheme && !cookieTheme) {
          document.cookie = `theme=${localTheme}; path=/; max-age=31536000; SameSite=Lax`
        }
        
        return theme
      } catch {
        return 'light'
      }
    }

    // Appliquer le thème immédiatement
    const theme = getTheme()
    document.documentElement.setAttribute('data-theme', theme)

    // Écouter les changements de thème pour persister
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme') {
        const newTheme = e.newValue || 'light'
        document.documentElement.setAttribute('data-theme', newTheme)
        document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return null
}
