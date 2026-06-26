'use client'
import { useEffect, useState } from 'react'
import { isFirstVisit, markOnboardingDone } from '@/lib/onboarding'

export function useOnboarding() {
  const [showTooltips, setShowTooltips] = useState(false)

  useEffect(() => {
    if (!isFirstVisit()) return

    const showTimer = window.setTimeout(() => setShowTooltips(true), 0)
    const hideTimer = window.setTimeout(() => {
      markOnboardingDone()
      setShowTooltips(false)
    }, 5000)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  const dismiss = () => {
    markOnboardingDone()
    setShowTooltips(false)
  }

  return { showTooltips, dismiss }
}
