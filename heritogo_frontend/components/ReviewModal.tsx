'use client'

import { useId, useState } from 'react'
import { Star, X, Loader2, Lock } from 'lucide-react'
import { apiFetch, clearClientCache } from '@/lib/utils/http'
import { useTranslations } from 'next-intl'

interface ReviewModalProps {
  bookingId: string
  guideName?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type Criterion = 'rating_punctuality' | 'rating_knowledge' | 'rating_communication'
const CRITERIA: Criterion[] = ['rating_punctuality', 'rating_knowledge', 'rating_communication']

function StarInput({ value, onChange, label, size = 'md' }: { value: number; onChange: (v: number) => void; label: string; size?: 'md' | 'lg' }) {
  const [hover, setHover] = useState<number | null>(null)
  const dim = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5'
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star}/5`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          className="cursor-pointer transition-transform active:scale-95"
        >
          <Star className={`${dim} ${star <= (hover ?? value) ? 'fill-accent text-accent' : 'text-border'}`} />
        </button>
      ))}
    </div>
  )
}

export default function ReviewModal({ bookingId, guideName, isOpen, onClose, onSuccess }: ReviewModalProps) {
  const t = useTranslations('Bookings.review')
  const titleId = useId()
  const [rating, setRating] = useState(0)
  const [criteria, setCriteria] = useState<Record<Criterion, number>>({
    rating_punctuality: 0,
    rating_knowledge: 0,
    rating_communication: 0,
  })
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!rating) {
      setError(t('error_rating_required'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          rating_overall: rating,
          rating_punctuality: criteria.rating_punctuality || null,
          rating_knowledge: criteria.rating_knowledge || null,
          rating_communication: criteria.rating_communication || null,
          comment,
        }),
      })

      if (!result.ok) {
        setError(result.error || t('error_generic'))
        return
      }

      clearClientCache('public-guide')
      clearClientCache('public-guides')
      onSuccess()
      onClose()
    } catch {
      setError(t('error_generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center" onClick={() => !loading && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-serif text-xl font-bold">{t('title')}</h2>
            {guideName && <p className="mt-1 text-xs text-muted-foreground">{t('subtitle', { name: guideName })}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={loading} aria-label={t('close')} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-sm font-semibold">{t('overall')}</p>
          <StarInput value={rating} onChange={setRating} label={t('overall')} size="lg" />
        </div>

        <div className="mt-6 space-y-3 rounded-lg bg-muted/50 p-4">
          {CRITERIA.map((key) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground/85">{t(key)}</span>
              <StarInput value={criteria[key]} onChange={(v) => setCriteria((prev) => ({ ...prev, [key]: v }))} label={t(key)} />
            </div>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="field-label">{t('comment')}</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={3}
            className="field resize-none"
            placeholder={t('placeholder')}
          />
          <span className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-4 text-muted-foreground">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            {t('privacy_note')}
          </span>
        </label>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="btn-outline-brand">
            {t('cancel')}
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading || !rating} className="btn-brand">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
