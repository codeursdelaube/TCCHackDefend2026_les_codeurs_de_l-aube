'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/components/providers/AuthProvider'
import { isClientSubscribed } from '@/lib/auth/subscription'

export interface AdSlotProps {
  slot: string
  format?: 'auto' | 'fluid'
  className?: string
  isSubscriber?: boolean
  style?: React.CSSProperties
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>
    googlefc?: {
      showRevocationMessage?: () => void
      callbackQueue?: Array<Record<string, unknown>>
    }
  }
}

export default function AdSlot({
  slot,
  format = 'auto',
  className = '',
  isSubscriber,
  style,
}: AdSlotProps) {
  const t = useTranslations('Ads')
  const { user } = useAuth()
  const isPushed = useRef(false)
  const [adBlocked, setAdBlocked] = useState(false)

  const adsEnabled =
    process.env.NEXT_PUBLIC_ADS_ENABLED === 'true' &&
    Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID)

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // Vérification de l'abonnement (côté serveur ou client)
  const subscriberActive =
    typeof isSubscriber === 'boolean'
      ? isSubscriber
      : isClientSubscribed(user)

  useEffect(() => {
    if (!adsEnabled || subscriberActive || isPushed.current) return

    // Vérifier si le conteneur est présent
    try {
      // Garde anti double push (React Strict Mode)
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
        isPushed.current = true
      }
    } catch (e: unknown) {
      // Bloqué par adblocker ou erreur d'initialisation : gestion silencieuse
      setAdBlocked(true)
    }
  }, [adsEnabled, subscriberActive])

  // Ne rien afficher si désactivé, abonné, bloqué ou sans client ID
  if (!adsEnabled || subscriberActive || adBlocked || !clientId) {
    return null
  }

  const minHeight = format === 'fluid' ? '120px' : '250px'

  return (
    <div
      className={`my-6 mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-border/70 bg-base-200/50 p-3 sm:p-4 text-center shadow-xs transition-all ${className}`}
      aria-label={t('label')}
    >
      <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold tracking-wider uppercase text-base-content/60">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70" />
          {t('label')}
        </span>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.googlefc?.showRevocationMessage) {
              window.googlefc.showRevocationMessage()
            }
          }}
          className="cursor-pointer text-[10px] text-base-content/50 hover:text-primary transition-colors hover:underline"
        >
          {t('manage_preferences')}
        </button>
      </div>

      <div
        className="flex w-full items-center justify-center overflow-hidden"
        style={{ minHeight }}
      >
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            minHeight,
            ...style,
          }}
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
