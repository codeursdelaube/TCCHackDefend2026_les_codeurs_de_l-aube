'use client'

import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'
import { COLORS } from '@/lib/constants/colors'

const COOKIE_NAME = 'heritogo_cookie_consent'
const MAX_AGE = 60 * 60 * 24 * 365

function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1] ?? null
}

function saveConsent(value: 'accepted' | 'refused') {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(!getCookie(COOKIE_NAME))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const answer = (value: 'accepted' | 'refused') => {
    saveConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-3 bottom-4 z-[90] mx-auto max-w-2xl rounded-2xl border border-border bg-base-100 p-4 text-base-content shadow-2xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: COLORS.forest }}
          >
            <Cookie className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-black">Cookies Heritogo</p>
            <p className="mt-1 text-xs leading-5 text-base-content/65">
              Nous utilisons des cookies pour garder votre session, votre langue et votre theme.
              Vous pouvez accepter ou refuser les cookies non essentiels.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => answer('refused')}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border px-4 text-xs font-black hover:bg-base-200"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => answer('accepted')}
            className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-xs font-black text-white hover:brightness-110"
            style={{ backgroundColor: COLORS.rust }}
          >
            Accepter
          </button>
          <button
            type="button"
            onClick={() => answer('refused')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-base-content/60 hover:bg-base-200 hover:text-base-content"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}