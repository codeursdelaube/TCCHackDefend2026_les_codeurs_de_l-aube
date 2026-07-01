'use client'

import { useEffect } from 'react'
import { WifiOff, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[HériTogo] Erreur applicative:', error)
  }, [error])

  const isNetworkError =
    error?.message?.toLowerCase().includes('fetch') ||
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('failed') ||
    !navigator.onLine

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base-100 px-4 text-base-content">
      <div className="w-full max-w-md rounded-3xl border border-border bg-base-200 p-8 shadow-xl text-center space-y-6">

        {/* Icône */}
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl text-white shadow-md"
          style={{ background: isNetworkError ? '#BF360C' : '#004D40' }}
        >
          {isNetworkError
            ? <WifiOff className="h-9 w-9" />
            : <span className="text-4xl font-black">!</span>
          }
        </div>

        {/* Titre */}
        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold">
            {isNetworkError
              ? 'Connexion introuvable'
              : 'Une erreur est survenue'}
          </h1>
          <p className="text-sm text-base-content/60 leading-6 font-medium">
            {isNetworkError
              ? "Impossible de charger cette page. Vérifiez votre connexion internet et réessayez."
              : "Cette page n'a pas pu s'afficher correctement. Notre équipe a été notifiée."}
          </p>
        </div>

        {/* Statut réseau */}
        <div className="rounded-2xl bg-base-100 border border-border/60 p-4 text-xs font-bold text-base-content/50 flex items-center justify-center gap-2">
          <span className={`h-2 w-2 rounded-full ${navigator.onLine ? 'bg-success' : 'bg-error animate-pulse'}`} />
          {navigator.onLine ? 'Réseau disponible' : 'Hors ligne — pas de connexion'}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="btn flex-1 rounded-2xl border-none text-white font-black gap-2"
            style={{ background: '#004D40' }}
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
          <a
            href="/"
            className="btn flex-1 rounded-2xl border border-border bg-base-100 font-black gap-2"
          >
            <Home className="h-4 w-4" />
            Accueil
          </a>
        </div>

      </div>
    </div>
  )
}
