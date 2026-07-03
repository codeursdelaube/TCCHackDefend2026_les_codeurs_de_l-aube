'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

export default function ServiceWorkerRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return
    if (!('serviceWorker' in navigator)) return

    let refreshing = false

    const showPromptFor = (worker: ServiceWorker | null) => {
      if (!worker) return
      setWaitingWorker(worker)
      setShowUpdatePrompt(true)
    }

    const listenForWaitingWorker = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting && navigator.serviceWorker.controller) {
        showPromptFor(registration.waiting)
      }

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing
        if (!installingWorker) return

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showPromptFor(installingWorker)
          }
        })
      })
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        listenForWaitingWorker(registration)
        window.setTimeout(() => registration.update().catch(() => {}), 3000)
      })
      .catch((err) => console.error('SW error:', err))

    const handleControllerChange = () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
  }, [])

  const installUpdate = () => {
    if (!waitingWorker) return
    waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    setShowUpdatePrompt(false)
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed inset-x-3 bottom-24 z-[80] mx-auto max-w-md rounded-2xl border border-border bg-base-100 p-4 text-base-content shadow-2xl sm:bottom-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <RefreshCw className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">Mise a jour disponible</p>
          <p className="mt-1 text-xs font-medium leading-5 text-base-content/65">
            Une nouvelle version de Heritogo est prete. Installez-la pour profiter des derniers correctifs.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={installUpdate}
              className="btn btn-sm rounded-xl border-none bg-primary px-4 text-xs font-bold text-primary-content"
            >
              Installer
            </button>
            <button
              type="button"
              onClick={() => setShowUpdatePrompt(false)}
              className="btn btn-ghost btn-sm rounded-xl px-3 text-xs font-bold"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowUpdatePrompt(false)}
          className="rounded-xl p-1.5 text-base-content/50 transition hover:bg-base-200 hover:text-base-content"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}