'use client'

import { useState } from 'react'
import { Bell, MapPin, ShieldAlert, Trash2 } from 'lucide-react'
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent'
import { clearPrivacyConsent } from '@/lib/privacy/consent'
import { apiFetch } from '@/lib/utils/http'
import { createClient } from '@/lib/supabase/client'
import PrivacyModal from '@/components/PrivacyModal'

export default function PrivacySettings() {
  const { consent, setGeoConsent, setNotificationConsent } = usePrivacyConsent()
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggleNotifications(enabled: boolean) {
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationConsent(permission === 'granted')
      return
    }
    setNotificationConsent(false)
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      'Cette action est définitive. Votre compte et vos données HeriTogo seront supprimés. Continuer ?'
    )
    if (!confirmed) return
    setDeleting(true)
    setError(null)
    try {
      const result = await apiFetch('/api/profile', { method: 'DELETE' })
      if (!result.ok) {
        setError(result.error || 'Suppression impossible.')
        setDeleting(false)
        return
      }
      clearPrivacyConsent()
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/fr'
    } catch {
      setError('Suppression impossible.')
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-base-200 p-6 space-y-5 md:col-span-2">
      <div>
        <h3 className="font-serif text-lg font-bold">Confidentialité et consentements</h3>
        <p className="mt-1 text-xs text-base-content/60">
          Vous pouvez retirer un consentement à tout moment. Cela n’empêche pas d’utiliser le scanner, la carte ou les réservations.
        </p>
      </div>

      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border bg-base-100 p-4">
        <span className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 text-primary" />
          <span>
            <span className="block text-sm font-bold">Géolocalisation</span>
            <span className="mt-1 block text-xs text-base-content/60">
              Utilisée uniquement à la volée pour affiner un scan. Jamais historisée en base.
            </span>
          </span>
        </span>
        <input
          type="checkbox"
          className="toggle toggle-sm"
          checked={consent.geo === true}
          onChange={(e) => setGeoConsent(e.target.checked)}
        />
      </label>

      <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border bg-base-100 p-4">
        <span className="flex items-start gap-3">
          <Bell className="mt-0.5 h-4 w-4 text-primary" />
          <span>
            <span className="block text-sm font-bold">Notifications</span>
            <span className="mt-1 block text-xs text-base-content/60">
              Alertes liées à vos réservations, uniquement si vous les activez.
            </span>
          </span>
        </span>
        <input
          type="checkbox"
          className="toggle toggle-sm"
          checked={consent.notifications === true}
          onChange={(e) => void toggleNotifications(e.target.checked)}
        />
      </label>

      <button
        type="button"
        onClick={() => setPrivacyOpen(true)}
        className="text-xs font-bold text-primary underline"
      >
        Lire la politique de confidentialité
      </button>

      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/20">
        <p className="flex items-center gap-2 text-sm font-bold text-red-700">
          <ShieldAlert className="h-4 w-4" />
          Droit à l’oubli
        </p>
        <p className="mt-1 text-xs text-red-700/80">
          La suppression efface votre profil, vos réservations et vos documents de statut. Les pièces d’identité n’ont jamais été stockées chez nous.
        </p>
        <button
          type="button"
          disabled={deleting}
          onClick={() => void deleteAccount()}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-300 px-4 py-2 text-xs font-bold text-red-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {deleting ? 'Suppression…' : 'Supprimer définitivement mon compte'}
        </button>
        {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      </div>

      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  )
}
