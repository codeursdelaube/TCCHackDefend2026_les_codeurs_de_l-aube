'use client'

import { useEffect, useState } from 'react'
import { Download, Smartphone, Check, Share, PlusSquare, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PwaInstallButton({ className = '' }: { className?: string }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [showIosModal, setShowIosModal] = useState(false)

  useEffect(() => {
    // 1. Vérifier si l'application est déjà installée
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true)
    }

    // 2. Détecter iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIos(isIosDevice)

    // 3. Capturer l'événement natif d'installation Chrome / Android / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isInstalled) return

    if (installPrompt) {
      // Déclencher le prompt natif
      await installPrompt.prompt()
      const choiceResult = await installPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
      }
      setInstallPrompt(null)
    } else if (isIos) {
      // Afficher les instructions pour Safari iOS
      setShowIosModal(true)
    } else {
      // Sur PC / navigateurs sans prompt immédiat, donner des indications
      setShowIosModal(true)
    }
  }

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 ${className}`}>
        <Check className="h-4 w-4" />
        <span>Application installée</span>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className={`group inline-flex items-center justify-center gap-2.5 rounded-2xl border border-secondary/30 bg-secondary/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-secondary transition-all hover:bg-secondary hover:text-white active:scale-95 shadow-sm cursor-pointer ${className}`}
      >
        <Smartphone className="h-4 w-4 transition-transform group-hover:scale-110" />
        <span>Installer l&apos;application (PWA)</span>
        <Download className="h-3.5 w-3.5 opacity-70" />
      </button>

      {/* Modal d'instructions d'installation */}
      <AnimatePresence>
        {showIosModal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-[32px] border border-border bg-base-100 p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="absolute right-4 top-4 rounded-xl p-2 text-base-content/50 hover:bg-base-200"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <Smartphone className="h-7 w-7" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-base-content">
                Installer HeriTogo
              </h3>
              <p className="mt-2 text-sm text-base-content/65 leading-relaxed font-medium">
                Accédez à vos guides, cartes et scans même hors ligne, sans passer par un magasin d&apos;applications.
              </p>

              <div className="mt-6 space-y-3.5 rounded-2xl bg-base-200 p-4 text-xs font-semibold text-base-content/80">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-black text-white">
                    1
                  </span>
                  <span>
                    Sur votre navigateur, appuyez sur le bouton <strong>Partager</strong>{' '}
                    <Share className="inline h-3.5 w-3.5 text-secondary" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-black text-white">
                    2
                  </span>
                  <span>
                    Faites défiler et sélectionnez{' '}
                    <strong>« Sur l&apos;écran d&apos;accueil »</strong>{' '}
                    <PlusSquare className="inline h-3.5 w-3.5 text-secondary" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-black text-white">
                    3
                  </span>
                  <span>Profitez de l&apos;application en plein écran avec le mode hors-ligne !</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="mt-6 w-full rounded-2xl bg-secondary py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:brightness-110 active:scale-98"
              >
                J&apos;ai compris
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
