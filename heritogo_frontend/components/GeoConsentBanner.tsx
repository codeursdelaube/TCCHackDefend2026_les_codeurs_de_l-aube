'use client'

import { MapPin } from 'lucide-react'
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent'

export default function GeoConsentBanner() {
  const { consent, setGeoConsent } = usePrivacyConsent()
  if (consent.geo !== null) return null

  return (
    <div className="mb-4 rounded-2xl border border-border bg-card p-4 text-sm shadow-sm">
      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-bold text-foreground">Affiner le scan avec votre position ?</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            La position reste en mémoire le temps du scan, n’est pas enregistrée dans notre base, et vous pouvez la refuser : le scanner fonctionne quand même.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setGeoConsent(true)}
              className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white"
            >
              Autoriser
            </button>
            <button
              type="button"
              onClick={() => setGeoConsent(false)}
              className="rounded-full border border-border px-4 py-2 text-xs font-bold"
            >
              Refuser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
