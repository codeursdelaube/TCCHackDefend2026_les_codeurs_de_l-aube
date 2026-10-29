'use client'

import { useLocale, useTranslations } from 'next-intl'
import { FileText, Loader2, PlayCircle, CheckCircle2, Star } from 'lucide-react'
import { formatBookingDate, formatXof } from '@/lib/bookings/status'
import type { GuideBooking } from '@/lib/bookings/types'
import BookingStatusBadge from './BookingStatusBadge'
import BookingTimeline from './BookingTimeline'
import BookingDetails from './BookingDetails'
import ContactPanel from './ContactPanel'
import PartyAvatar from './PartyAvatar'

export type GuideBookingAction = 'send_quote' | 'start_mission' | 'complete_mission' | 'cancel'

interface GuideBookingCardProps {
  booking: GuideBooking
  busy: boolean
  canAct: boolean
  onAction: (booking: GuideBooking, action: GuideBookingAction) => void
}

export default function GuideBookingCard({ booking, busy, canAct, onAction }: GuideBookingCardProps) {
  const t = useTranslations('Bookings')
  const locale = useLocale()
  const touristName = booking.tourist.full_name

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PartyAvatar name={touristName} url={booking.tourist.avatar_url} />
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-bold">{touristName}</p>
            <p className="text-xs text-muted-foreground">
              {t(`mission.${booking.mission_type}`)} · {t('reference', { ref: booking.reference })} ·{' '}
              {t('requested_on', { date: formatBookingDate(booking.created_at, locale, { day: 'numeric', month: 'short' }) })}
            </p>
          </div>
        </div>
        <BookingStatusBadge status={booking.status} />
      </header>

      <div className="space-y-5 p-5">
        <BookingTimeline status={booking.status} />

        <p className="text-sm text-muted-foreground">
          {booking.status === 'cancelled'
            ? booking.cancelled_by_me ? t('cancelled_by_you') : t('cancelled_by_other')
            : t(`next.guide.${booking.status}`)}
          {booking.status === 'cancelled' && booking.cancellation_reason && (
            <span className="mt-1 block text-xs italic">{t('reason', { reason: booking.cancellation_reason })}</span>
          )}
        </p>

        <BookingDetails booking={booking} />

        {(booking.tourist_message || booking.special_needs) && (
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            {booking.tourist_message && (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('fields.tourist_message')}</p>
                <p className="mt-1 whitespace-pre-line text-foreground/85">{booking.tourist_message}</p>
              </>
            )}
            {booking.special_needs && (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-semibold">{t('fields.special_needs')} :</span> {booking.special_needs}
              </p>
            )}
            {booking.tourist.preferred_lang && (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-semibold">{t('fields.language')} :</span> {booking.tourist.preferred_lang.toUpperCase()}
              </p>
            )}
          </div>
        )}

        {booking.quote_amount && (
          <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('quote.your_quote')}</p>
            <p className="font-serif text-xl font-bold">{formatXof(booking.quote_amount, locale)}</p>
          </div>
        )}

        <ContactPanel status={booking.status} name={touristName} phone={booking.tourist.phone} role="tourist" />
      </div>

      {(['quote_requested', 'quote_sent', 'confirmed', 'in_progress'].includes(booking.status) || booking.review) && (
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
          {booking.review && (
            <span className="mr-auto inline-flex items-center gap-1.5 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              {t('actions.rating_received', { rating: booking.review.rating_overall })}
            </span>
          )}

          {booking.status === 'quote_requested' && (
            <>
              <button type="button" disabled={busy} onClick={() => onAction(booking, 'cancel')} className="btn-outline-brand min-h-9 px-3 text-xs">
                {t('actions.decline_request')}
              </button>
              <button type="button" disabled={busy || !canAct} onClick={() => onAction(booking, 'send_quote')} className="btn-brand min-h-9 px-4 text-xs">
                <FileText className="h-3.5 w-3.5" />
                {t('actions.send_quote')}
              </button>
            </>
          )}

          {['quote_sent', 'confirmed'].includes(booking.status) && (
            <button type="button" disabled={busy} onClick={() => onAction(booking, 'cancel')} className="btn-outline-brand min-h-9 px-3 text-xs">
              {booking.status === 'quote_sent' ? t('actions.withdraw_quote') : t('actions.cancel_booking')}
            </button>
          )}

          {booking.status === 'confirmed' && (
            <button type="button" disabled={busy || !canAct} onClick={() => onAction(booking, 'start_mission')} className="btn-brand min-h-9 px-4 text-xs">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
              {t('actions.start_mission')}
            </button>
          )}

          {booking.status === 'in_progress' && (
            <button type="button" disabled={busy || !canAct} onClick={() => onAction(booking, 'complete_mission')} className="btn-brand min-h-9 px-4 text-xs">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {t('actions.complete_mission')}
            </button>
          )}
        </footer>
      )}
    </article>
  )
}
