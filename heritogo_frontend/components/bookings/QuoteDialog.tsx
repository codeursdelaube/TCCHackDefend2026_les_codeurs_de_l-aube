'use client'

import { useEffect, useId, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Loader2, X } from 'lucide-react'
import { MAX_QUOTE_AMOUNT, estimateBookingAmount, formatBookingDate, formatXof, type GuideRates } from '@/lib/bookings/status'
import type { GuideBooking } from '@/lib/bookings/types'

interface QuoteDialogProps {
  booking: GuideBooking
  rates: GuideRates
  loading: boolean
  error: string | null
  onSubmit: (amount: number, message: string) => void
  onClose: () => void
}

export default function QuoteDialog({ booking, rates, loading, error, onSubmit, onClose }: QuoteDialogProps) {
  const t = useTranslations('Bookings.quote_dialog')
  const tb = useTranslations('Bookings')
  const locale = useLocale()
  const titleId = useId()
  const suggested = estimateBookingAmount(rates, booking.mission_type, Number(booking.duration_hours) || 1)
  const [amount, setAmount] = useState(suggested ? String(suggested) : '')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loading, onClose])

  const parsed = Number(amount)
  const valid = Number.isInteger(parsed) && parsed > 0 && parsed <= MAX_QUOTE_AMOUNT

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center bg-black/50 p-4 backdrop-blur-[2px] sm:items-center" onClick={() => !loading && onClose()}>
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) onSubmit(parsed, message.trim())
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-serif text-xl font-bold">{t('title')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {booking.tourist.full_name} · {tb(`mission.${booking.mission_type}`)} · {formatBookingDate(booking.start_date, locale)} ·{' '}
              {tb('fields.group_value', { count: booking.group_size })}
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} aria-label={tb('dialog.close')} className="rounded-md p-1 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="field-label">{t('amount_label')} *</span>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_QUOTE_AMOUNT}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ''))}
                className="field pr-14 font-semibold"
                required
                autoFocus
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">XOF</span>
            </div>
            <span className="mt-1 block text-[11px] text-muted-foreground">
              {suggested ? t('amount_hint', { amount: formatXof(suggested, locale) }) : t('amount_hint_none')}
            </span>
          </label>

          <label className="block">
            <span className="field-label">{t('message_label')}</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder={t('message_placeholder')}
              className="field resize-none"
            />
          </label>

          <p className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">{t('commitment')}</p>

          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={loading} className="btn-outline-brand">
            {tb('dialog.back')}
          </button>
          <button type="submit" disabled={loading || !valid} className="btn-brand">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {valid ? t('submit_amount', { amount: formatXof(parsed, locale) }) : t('submit')}
          </button>
        </div>
      </form>
    </div>
  )
}
