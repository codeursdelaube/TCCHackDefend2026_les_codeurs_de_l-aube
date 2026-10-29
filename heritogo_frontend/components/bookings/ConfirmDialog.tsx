'use client'

import { useEffect, useId, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel: string
  tone?: 'primary' | 'danger'
  /** Affiche un champ « motif ». `required` impose une saisie avant validation. */
  reason?: { label: string; placeholder?: string; required?: boolean; maxLength?: number }
  loading?: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}

/** Boîte de dialogue accessible remplaçant les window.confirm du parcours de réservation. */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = 'primary',
  reason,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const t = useTranslations('Bookings.dialog')
  const titleId = useId()
  // Les parents passent une `key` propre à chaque ouverture pour repartir d'un motif vide.
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, loading, onClose])

  if (!open) return null

  const missingReason = Boolean(reason?.required && !value.trim())

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
          <h2 id={titleId} className="font-serif text-xl font-bold">{title}</h2>
          <button type="button" onClick={onClose} disabled={loading} aria-label={t('close')} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {description && <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</div>}

        {reason && (
          <label className="mt-5 block">
            <span className="field-label">
              {reason.label}
              {reason.required && <span className="text-primary"> *</span>}
            </span>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={reason.maxLength ?? 500}
              rows={3}
              placeholder={reason.placeholder}
              className="field resize-none"
              autoFocus
            />
          </label>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="btn-outline-brand">
            {t('back')}
          </button>
          <button
            type="button"
            disabled={loading || missingReason}
            onClick={() => onConfirm(value.trim())}
            className={tone === 'danger' ? 'btn-brand bg-red-700! text-white! hover:bg-red-800!' : 'btn-brand'}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
