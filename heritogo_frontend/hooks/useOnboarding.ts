'use client'
import { useState, useEffect } from 'react'
import { isFirstVisit, markOnboardingDone } from '@/lib/onboarding'

export function useOnboarding() {
  const [showTooltips, setShowTooltips] = useState(false)

  useEffect(() => {
    // Vérifie UNE SEULE FOIS côté client
    if (isFirstVisit()) {
      setShowTooltips(true)
      // Marque comme vu après 5 secondes
      const t = setTimeout(() => {
        markOnboardingDone()
        setShowTooltips(false)
      }, 5000)
      return () => clearTimeout(t)
    }
  }, []) // ← tableau vide : s'exécute UNE SEULE FOIS, jamais au changement de locale

  const dismiss = () => {
    markOnboardingDone()
    setShowTooltips(false)
  }

  return { showTooltips, dismiss }
}
