'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getOAuthCallbackUrl, persistOAuthReturn } from '@/lib/auth/oauthReturn'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.55-5.17 3.55-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.47 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09C3.25 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.22 7.22 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.27A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}

type Props = {
  locale: string
  label: string
  redirectTo?: string
  role?: 'tourist' | 'guide'
  disabled?: boolean
}

export default function GoogleAuthButton({
  locale,
  label,
  redirectTo,
  role,
  disabled = false,
}: Props) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (disabled || pending) return
    setError(null)
    setPending(true)

    try {
      const supabase = createClient()
      const next =
        redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//')
          ? redirectTo
          : `/${locale}/dashboard`

      persistOAuthReturn({ next, locale, role })

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getOAuthCallbackUrl(),
        },
      })

      if (oauthError) {
        setError(oauthError.message || 'Connexion Google impossible.')
        setPending(false)
      }
    } catch {
      setError('Connexion Google impossible.')
      setPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || pending}
        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-6 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-background cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleMark />}
        <span>{label}</span>
      </button>
      {error && (
        <p className="text-center text-xs font-semibold text-red-600">{error}</p>
      )}
    </div>
  )
}
