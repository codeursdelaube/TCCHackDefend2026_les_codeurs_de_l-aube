'use client'

import { useState } from 'react'
import { AlertTriangle, X, Loader2 } from 'lucide-react'
import { COLORS } from '@/lib/constants/colors'
import { apiFetch } from '@/lib/utils/http'

interface ReportModalProps {
  reportedId: string // Le guide_profile.id
  bookingId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const REASONS = [
  { value: 'inappropriate_behavior', label: 'Comportement inapproprié' },
  { value: 'fake_profile', label: 'Faux profil' },
  { value: 'no_show', label: 'Absence non justifiée' },
  { value: 'fraud', label: 'Fraude' },
  { value: 'other', label: 'Autre' }
]

export default function ReportModal({ reportedId, bookingId, isOpen, onClose, onSuccess }: ReportModalProps) {
  const [reason, setReason] = useState('inappropriate_behavior')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError('Veuillez fournir une description détaillée.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_id: reportedId,
          reason,
          description,
          booking_id: bookingId || null
        })
      })

      if (!result.ok) {
        setError(result.error || 'Erreur lors de la soumission')
        return
      }

      onSuccess()
      onClose()
    } catch {
      setError('Impossible de soumettre le signalement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-base-200 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-error" />
            <h3 className="font-serif text-xl font-bold text-base-content">Signaler ce guide</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-1 hover:bg-base-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300 leading-5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Veuillez signaler tout comportement suspect, fraude, absence ou faux profil. Vos signalements sont traités de manière confidentielle par notre équipe administrative sous 24h.</span>
        </div>

        <div className="mt-6 space-y-4">
          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-semibold">Motif du signalement</span>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="select select-bordered w-full rounded-2xl bg-base-100 focus:border-primary focus:outline-none"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text mb-1 text-sm font-semibold">Description détaillée</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea textarea-bordered h-24 rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Veuillez décrire précisément les faits..."
              required
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-error/30 bg-error/10 px-4 py-2.5 text-xs font-bold text-error">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline flex-1 rounded-2xl text-xs font-bold"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn flex-1 rounded-2xl border-none text-xs font-bold text-white"
            style={{ backgroundColor: COLORS.rust }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  )
}
