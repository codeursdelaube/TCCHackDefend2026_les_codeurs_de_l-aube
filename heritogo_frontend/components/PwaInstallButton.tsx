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
        <span>Installer l&apos;application</span>
        <Download className="h-3.5 w-3.5 opacity-70" />
      </button>

      {/* Modal d'instructions d'installation iOS / Navigateur */}
      <AnimatePresence>
        {showIosModal && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm rounded-[28px] border border-border bg-base-100 p-6 shadow-2xl text-base-content"
            >
              <button
                onClick={() => setShowIosModal(false)}
                className="absolute right-4 top-4 rounded-full p-2 text-base-content/60 hover:bg-base-200 cursor-pointer"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Smartphone className="h-7 w-7" />
              </div>

              <h3 className="text-center font-serif text-xl font-bold">
                Installer HeriTogo sur votre écran
              </h3>
              <p className="mt-2 text-center text-xs font-medium text-base-content/70 leading-relaxed">
                Accédez à tous vos guides et monuments instantanément depuis votre écran d&apos;accueil, même sans connexion.
              </p>

              <div className="mt-6 space-y-3 rounded-2xl bg-base-200 p-4 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base-100 text-primary font-bold shadow-xs">
                    1
                  </div>
                  <p>
                    Appuyez sur le bouton <strong className="text-primary font-bold">Partager</strong> (<Share className="inline h-3.5 w-3.5 align-middle mx-1 text-primary" />) en bas de Safari.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base-100 text-primary font-bold shadow-xs">
                    2
                  </div>
                  <p>
                    Faites défiler puis choisissez <strong className="text-primary font-bold">&laquo; Sur l&apos;écran d&apos;accueil &raquo;</strong> (<PlusSquare className="inline h-3.5 w-3.5 align-middle mx-1 text-primary" />).
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-base-100 text-primary font-bold shadow-xs">
                    3
                  </div>
                  <p>
                    Appuyez sur <strong className="text-primary font-bold">&laquo; Ajouter &raquo;</strong> en haut à droite.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIosModal(false)}
                className="mt-6 w-full rounded-2xl bg-primary py-3 text-xs font-black uppercase tracking-wider text-primary-content shadow-md transition-all hover:brightness-110 active:scale-95 cursor-pointer"
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
