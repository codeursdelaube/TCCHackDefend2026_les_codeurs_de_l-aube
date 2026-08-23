'use client'

import { useState } from 'react'
import { Star, X, Loader2 } from 'lucide-react'
import { COLORS } from '@/lib/constants/colors'
import { apiFetch } from '@/lib/utils/http'

interface ReviewModalProps {
  bookingId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ReviewModal({ bookingId, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  if (!isOpen) return null

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          rating_overall: rating,
          comment
        })
      })

      if (!result.ok) {
        setError(result.error || 'Erreur lors de la soumission')
        return
      }

      onSuccess()
      onClose()
    } catch {
      setError('Impossible de soumettre votre avis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-base-200 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-serif text-xl font-bold text-base-content">Laisser un avis</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-1 hover:bg-base-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center">
          <p className="text-sm font-semibold text-base-content/75 mb-2">Note globale</p>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                className="transition-transform active:scale-95"
              >
                <Star
                  className="h-8 w-8"
                  style={{
                    fill: star <= (hoverRating ?? rating) ? COLORS.gold : 'none',
                    stroke: COLORS.gold
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="form-control w-full">
            <div className="label mb-1">
              <span className="label-text text-sm font-semibold">Commentaire</span>
              <span className="label-text-alt text-xs text-base-content/50">Admin uniquement</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="textarea textarea-bordered h-24 rounded-2xl bg-base-100 p-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Écrivez votre commentaire ici (visible uniquement par l'équipe administrative)..."
            />
            <span className="mt-1 text-[10px] text-base-content/55 font-medium leading-4">
              ℹ️ Pour des raisons de confidentialité, votre commentaire textuel ne sera pas affiché publiquement. Seule la note en étoiles sera visible sur le profil du guide.
            </span>
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
            style={{ backgroundColor: COLORS.forest }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Soumettre'}
          </button>
        </div>
      </div>
    </div>
  )
}
