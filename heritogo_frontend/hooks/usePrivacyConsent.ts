'use client'

import { useEffect, useState } from 'react'
import { readPrivacyConsent, writePrivacyConsent, type PrivacyConsent } from '@/lib/privacy/consent'

export function usePrivacyConsent() {
  const [consent, setConsent] = useState<PrivacyConsent>({
    geo: null,
    notifications: null,
    updatedAt: null,
  })

  useEffect(() => {
    const sync = () => setConsent(readPrivacyConsent())
    sync()
    window.addEventListener('heritogo-consent-change', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('heritogo-consent-change', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return {
    consent,
    setGeoConsent: (geo: boolean) => setConsent(writePrivacyConsent({ geo })),
    setNotificationConsent: (notifications: boolean) =>
      setConsent(writePrivacyConsent({ notifications })),
  }
}
