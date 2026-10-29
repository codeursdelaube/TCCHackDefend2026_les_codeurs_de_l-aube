'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { CheckCircle2, Loader2, Star, Share2 } from 'lucide-react'
import { formatBookingDate, formatXof } from '@/lib/bookings/status'
import type { TouristBooking } from '@/lib/bookings/types'
import BookingStatusBadge from './BookingStatusBadge'
import BookingTimeline from './BookingTimeline'
import BookingDetails from './BookingDetails'
import ContactPanel from './ContactPanel'
import PartyAvatar from './PartyAvatar'

export type TouristBookingAction = 'accept_quote' | 'decline_quote' | 'cancel_request'

interface TouristBookingCardProps {
  booking: TouristBooking
  busy: boolean
  onAction: (booking: TouristBooking, action: TouristBookingAction) => void
  onReview: (booking: TouristBooking) => void
}

export default function TouristBookingCard({ booking, busy, onAction, onReview }: TouristBookingCardProps) {
  const t = useTranslations('Bookings')
  const locale = useLocale()
  const guideName = booking.guide.profile.full_name

  const share = () => {
    const text = t('share_text', { guide: guideName, date: formatBookingDate(booking.start_date, locale) })
    if (navigator.share) {
      navigator.share({ title: 'HeriTogo', text, url: window.location.origin }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text).catch(() => {})
    }
  }

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <PartyAvatar name={guideName} url={booking.guide.profile.avatar_url} />
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-bold">{guideName}</p>
            <p className="text-xs text-muted-foreground">
              {t(`mission.${booking.mission_type}`)} · {t('reference', { ref: booking.reference })}
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
            : t(`next.tourist.${booking.status}`)}
          {booking.status === 'cancelled' && booking.cancellation_reason && (
            <span className="mt-1 block text-xs italic">{t('reason', { reason: booking.cancellation_reason })}</span>
          )}
        </p>

        <BookingDetails booking={booking} />

        {booking.quote_amount && (
          <div className={`rounded-lg border p-4 ${booking.status === 'quote_sent' ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/40'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('quote.title')}</p>
              <p className="font-serif text-2xl font-bold text-foreground">{formatXof(booking.quote_amount, locale)}</p>
            </div>
            {booking.quote_message && (
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/85">{booking.quote_message}</p>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">{t('quote.payment_note')}</p>
          </div>
        )}

        {booking.tourist_message && (
          <details className="text-sm">
            <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-primary">{t('fields.your_message')}</summary>
            <p className="mt-2 whitespace-pre-line text-foreground/85">{booking.tourist_message}</p>
            {booking.special_needs && <p className="mt-2 text-xs text-muted-foreground">{t('fields.special_needs')} : {booking.special_needs}</p>}
          </details>
        )}

        <ContactPanel status={booking.status} name={guideName} phone={booking.guide.profile.phone} role="guide" />
      </div>

      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">
        <Link href={`/guides/${booking.guide.id}`} className="mr-auto text-xs font-bold text-muted-foreground hover:text-primary">
          {t('actions.view_guide')}
        </Link>

        {['confirmed', 'in_progress'].includes(booking.status) && (
          <button type="button" onClick={share} className="btn-outline-brand min-h-9 px-3 text-xs">
            <Share2 className="h-3.5 w-3.5" />
            {t('actions.share')}
          </button>
        )}

        {booking.status === 'quote_requested' && (
          <button type="button" disabled={busy} onClick={() => onAction(booking, 'cancel_request')} className="btn-outline-brand min-h-9 px-3 text-xs">
            {t('actions.cancel_request')}
          </button>
        )}

        {booking.status === 'confirmed' && (
          <button type="button" disabled={busy} onClick={() => onAction(booking, 'cancel_request')} className="btn-outline-brand min-h-9 px-3 text-xs">
            {t('actions.cancel_booking')}
          </button>
        )}

        {booking.status === 'quote_sent' && (
          <>
            <button type="button" disabled={busy} onClick={() => onAction(booking, 'decline_quote')} className="btn-outline-brand min-h-9 px-3 text-xs">
              {t('actions.decline_quote')}
            </button>
            <button type="button" disabled={busy} onClick={() => onAction(booking, 'accept_quote')} className="btn-brand min-h-9 px-4 text-xs">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {t('actions.accept_quote')}
            </button>
          </>
        )}

        {booking.status === 'completed' && !booking.review && (
          <button type="button" onClick={() => onReview(booking)} className="btn-brand min-h-9 px-4 text-xs">
            <Star className="h-3.5 w-3.5" />
            {t('actions.leave_review')}
          </button>
        )}

        {booking.status === 'completed' && booking.review && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            {t('actions.review_left', { rating: booking.review.rating_overall })}
          </span>
        )}
      </footer>
    </article>
  )
}
