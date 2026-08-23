'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ConfirmStatus = 'loading' | 'success' | 'error'

export default function AuthConfirmPage() {
  const { locale } = useParams<{ locale: string }>()
  const [status, setStatus] = useState<ConfirmStatus>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const redirectToDashboard = () => {
      window.setTimeout(() => {
        window.location.href = `/${locale || 'fr'}/dashboard`
      }, 1500)
    }

    const redirectToLogin = (withExpiredError = false) => {
      window.setTimeout(() => {
        window.location.href = `/${locale || 'fr'}/auth/login${withExpiredError ? '?error=lien_expire' : ''}`
      }, 3000)
    }

    const markSuccess = () => {
      setStatus('success')
      setMessage('Email confirmé ! Redirection vers votre espace...')
      redirectToDashboard()
    }

    const markError = (errorMessage: string, withExpiredError = false) => {
      setStatus('error')
      setMessage(errorMessage)
      redirectToLogin(withExpiredError)
    }

    const handleConfirmation = async () => {
      const supabase = createClient()

      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const tokenHash = params.get('token_hash')
        const type = params.get('type')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error) {
            markSuccess()
            return
          }
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          markSuccess()
          return
        }

        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as 'signup' | 'email' | 'recovery' | 'invite',
          })

          if (!error) {
            markSuccess()
            return
          }
        }

        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const errorDescription = hashParams.get('error_description')
        if (errorDescription) {
          markError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')), true)
          return
        }

        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (!error) {
            markSuccess()
            return
          }
        }

        markError('Lien invalide ou expiré. Veuillez vous reconnecter.')
      } catch (confirmError) {
        const errorMessage = confirmError instanceof Error
          ? confirmError.message
          : 'Impossible de confirmer votre email.'
        markError(errorMessage, true)
      }
    }

    handleConfirmation()
  }, [locale])

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-100 px-4 text-base-content">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-base-200 p-8 text-center shadow-lg">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <h1 className="font-serif text-xl font-bold">Confirmation en cours...</h1>
            <p className="mt-2 text-sm text-base-content/60">Patientez quelques secondes.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h1 className="font-serif text-xl font-bold">Compte confirmé !</h1>
            <p className="mt-2 text-sm text-base-content/60">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 h-12 w-12 text-error" />
            <h1 className="font-serif text-xl font-bold">Lien expiré</h1>
            <p className="mt-2 text-sm text-base-content/60">{message}</p>
            <p className="mt-1 text-xs text-base-content/45">Redirection automatique...</p>
          </>
        )}
      </div>
    </main>
  )
}
