'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, RefreshCw, Home, Wifi, WifiOff } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale || 'fr'
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  )

  useEffect(() => {
    console.error('[error.tsx]', error)

    const update = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)

    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-100 px-4 pb-32 pt-20 text-base-content">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-base-200 p-8 text-center shadow-xl">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: '#004D40' }}
        >
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-xl font-bold italic text-base-content">
            Une erreur est survenue
          </h2>
          <p className="text-sm leading-6 text-base-content/60">
            {isOnline
              ? "Cette page n'a pas pu s'afficher correctement. Notre équipe a été notifiée."
              : 'Vous semblez être hors ligne. Vérifiez votre connexion internet.'}
          </p>
        </div>

        <div
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
            isOnline ? 'bg-base-100' : 'bg-error/10'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-base-content">Réseau disponible</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-error" />
              <span className="text-error">Pas de connexion</span>
            </>
          )}
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: '#004D40' }}
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>

          <Link
            href="/"
            locale={locale}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-base-100 py-3 text-sm font-bold text-base-content transition-all hover:bg-base-300"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}