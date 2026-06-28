'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const locale = params.locale || 'fr'
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const confirmSession = async () => {
      try {
        const hash = window.location.hash.replace(/^#/, '')
        const values = new URLSearchParams(hash)
        const accessToken = values.get('access_token')
        const refreshToken = values.get('refresh_token')

        if (!accessToken || !refreshToken) {
          setError('Lien de confirmation invalide ou expire.')
          return
        }

        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) {
          setError(sessionError.message)
          return
        }

        router.replace(`/${locale}/dashboard`)
      } catch (confirmError) {
        setError(confirmError instanceof Error ? confirmError.message : 'Impossible de confirmer la session.')
      }
    }

    confirmSession()
  }, [locale, router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-100 px-4 text-base-content">
      <div className="w-full max-w-md rounded-[28px] border border-border bg-base-200 p-6 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="font-serif text-2xl font-bold">Confirmation impossible</h1>
            <p className="mt-3 text-sm font-medium text-base-content/70">{error}</p>
            <button
              type="button"
              onClick={() => router.replace(`/${locale}/auth/login?error=lien_expire`)}
              className="btn btn-primary mt-6 rounded-2xl text-white"
            >
              Retour a la connexion
            </button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <h1 className="mt-4 font-serif text-2xl font-bold">Confirmation en cours</h1>
            <p className="mt-3 text-sm font-medium text-base-content/70">Nous securisons votre session.</p>
          </>
        )}
      </div>
    </main>
  )
}