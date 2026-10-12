'use client'

import { useEffect } from 'react'

/**
 * La PWA hors-ligne a été retirée : elle pouvait remplacer une navigation
 * valide par la page "Mode hors ligne". Ce composant supprime les workers et
 * caches hérités chez les visiteurs qui avaient déjà utilisé l'ancienne app.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {})

    if ('caches' in window) {
      caches.keys()
        .then((keys) => Promise.all(keys
          .filter((key) => key.startsWith('heritogo-'))
          .map((key) => caches.delete(key))))
        .catch(() => {})
    }
  }, [])

  return null
}
