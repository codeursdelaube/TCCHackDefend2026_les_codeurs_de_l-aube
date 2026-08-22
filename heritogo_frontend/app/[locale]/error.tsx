'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff, Compass, Sparkles } from 'lucide-react'
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
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF8] dark:bg-[#1A120C] px-4 pb-28 pt-20 text-base-content">
      <div className="w-full max-w-md space-y-6 rounded-[32px] border border-[#E6D9C4] dark:border-border bg-white dark:bg-[#241811] p-8 text-center shadow-2xl">
        
        {/* Icône d'état Café & Blanc */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#3B2519] dark:bg-[#C99A3E] text-white dark:text-[#2A1C14] shadow-lg">
          <Compass className="h-10 w-10 animate-pulse" />
        </div>

        {/* Message intelligent */}
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-base-content">
            {isOnline ? 'Un imprévu sur votre itinéraire' : 'Connexion interrompue'}
          </h2>
          <p className="text-xs font-medium leading-relaxed text-base-content/70">
            {isOnline
              ? "Le guide n'a pas pu charger ces données pour le moment. Vos informations enregistrées restent en sécurité."
              : 'Votre appareil semble hors-ligne. Vos guides et pages déjà enregistrés restent accessibles.'}
          </p>
        </div>

        {/* Statut Réseau */}
        <div
          className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-xs font-bold ${
            isOnline
              ? 'bg-[#F1E7D8]/60 dark:bg-base-300 text-[#3B2519] dark:text-[#F1E7D8]'
              : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4 text-emerald-500" />
              <span>Réseau actif • Tentative de reconnexion</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-amber-500" />
              <span>Mode hors-ligne disponible</span>
            </>
          )}
        </div>

        {/* Boutons de récupération immédiate */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B2519] dark:bg-[#C99A3E] py-3.5 text-xs font-black uppercase tracking-wider text-white dark:text-[#2A1C14] shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
            <span>{retrying ? 'Rechargement...' : 'Réessayer'}</span>
          </button>

          <Link
            href="/"
            locale={locale}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-base-200 py-3 text-xs font-bold text-base-content transition-all hover:bg-base-300 active:scale-95"
          >
            <Home className="h-4 w-4 text-[#A9754A]" />
            <span>Retour à l&apos;accueil</span>
          </Link>
        </div>
      </div>
    </div>
  )
}