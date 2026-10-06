'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertTriangle, Compass, Home, RefreshCw, Wifi, WifiOff } from 'lucide-react'
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
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    console.error('[HeriTogo Error Handler]', error)
    const update = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [error])

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => {
      reset()
      setRetrying(false)
    }, 400)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-card px-4 pb-28 pt-20 text-foreground">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 text-center shadow-xl">

        {/* Icône */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
          <Compass className="h-10 w-10 animate-pulse" />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            {isOnline ? 'Un imprévu sur votre itinéraire' : 'Connexion interrompue'}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isOnline
              ? "Le guide n'a pas pu charger ces données pour le moment. Vos informations enregistrées restent en sécurité."
              : 'Votre appareil semble hors-ligne. Les pages déjà visitées restent accessibles.'}
          </p>
        </div>

        {/* Statut réseau */}
        <div className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-xs font-bold ${
          isOnline
            ? 'bg-primary text-primary'
            : 'bg-amber-500/15 text-amber-700'
        }`}>
          {isOnline ? (
            <><Wifi className="h-4 w-4" /><span>Réseau actif · Tentative de reconnexion</span></>
          ) : (
            <><WifiOff className="h-4 w-4 text-amber-500" /><span>Mode hors-ligne disponible</span></>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--primary)' }}
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Rechargement…' : 'Réessayer'}</span>
          </button>

          <Link
            href="/"
            locale={locale}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary py-3 text-xs font-bold text-foreground transition-all hover:bg-primary active:scale-95"
          >
            <Home className="h-4 w-4 text-primary" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}