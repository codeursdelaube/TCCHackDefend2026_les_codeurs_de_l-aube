'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AlertTriangle, Compass, Home, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Link } from '@/i18n/navigation'

const ERROR_TEXTS = {
  fr: {
    titleOnline: 'Un imprévu sur votre itinéraire',
    titleOffline: 'Connexion interrompue',
    descOnline: "Le guide n'a pas pu charger ces données pour le moment. Vos informations enregistrées restent en sécurité.",
    descOffline: 'Votre appareil semble hors-ligne. Les pages déjà visitées restent accessibles.',
    networkOnline: 'Réseau actif · Tentative de reconnexion',
    networkOffline: 'Mode hors-ligne disponible',
    reloading: 'Rechargement…',
    retry: 'Réessayer',
    backHome: "Retour à l'accueil",
  },
  en: {
    titleOnline: 'An unexpected issue on your journey',
    titleOffline: 'Connection interrupted',
    descOnline: 'The guide could not load this data at the moment. Your saved information remains safe.',
    descOffline: 'Your device appears to be offline. Previously visited pages remain accessible.',
    networkOnline: 'Network active · Reconnecting',
    networkOffline: 'Offline mode available',
    reloading: 'Reloading…',
    retry: 'Retry',
    backHome: 'Back to home',
  },
  es: {
    titleOnline: 'Un imprevisto en su itinerario',
    titleOffline: 'Conexión interrumpida',
    descOnline: 'La guía no pudo cargar estos datos en este momento. Su información guardada permanece segura.',
    descOffline: 'Su dispositivo parece estar sin conexión. Las páginas visitadas anteriormente siguen accesibles.',
    networkOnline: 'Red activa · Intentando reconectar',
    networkOffline: 'Modo fuera de línea disponible',
    reloading: 'Recargando…',
    retry: 'Reintentar',
    backHome: 'Volver al inicio',
  },
  zh: {
    titleOnline: '行程中出现意外',
    titleOffline: '连接已中断',
    descOnline: '指南目前无法加载此数据。您保存的信息仍然安全。',
    descOffline: '您的设备似乎已离线。已访问过的页面仍然可以查看。',
    networkOnline: '网络正常 · 正在重试连接',
    networkOffline: '离线模式可用',
    reloading: '重新加载…',
    retry: '重试',
    backHome: '返回首页',
  },
} as const

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams<{ locale: string }>()
  const rawLocale = params?.locale || 'fr'
  const locale = (rawLocale in ERROR_TEXTS ? rawLocale : 'fr') as keyof typeof ERROR_TEXTS
  const txt = ERROR_TEXTS[locale]
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
            {isOnline ? txt.titleOnline : txt.titleOffline}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isOnline ? txt.descOnline : txt.descOffline}
          </p>
        </div>

        {/* Statut réseau */}
        <div className={`flex items-center justify-center gap-2 rounded-2xl p-3 text-xs font-bold ${
          isOnline
            ? 'bg-primary/10 text-primary'
            : 'bg-amber-500/15 text-amber-700'
        }`}>
          {isOnline ? (
            <><Wifi className="h-4 w-4" /><span>{txt.networkOnline}</span></>
          ) : (
            <><WifiOff className="h-4 w-4 text-amber-500" /><span>{txt.networkOffline}</span></>
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
            <span>{retrying ? txt.reloading : txt.retry}</span>
          </button>

          <Link
            href="/"
            locale={locale}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-secondary py-3 text-xs font-bold text-foreground transition-all hover:bg-primary active:scale-95"
          >
            <Home className="h-4 w-4 text-primary" />
            <span>{txt.backHome}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}