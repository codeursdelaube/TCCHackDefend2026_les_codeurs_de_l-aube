'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { CalendarCheck } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/utils/http'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { formatXof, isActiveBooking } from '@/lib/bookings/status'
import type { TouristBooking } from '@/lib/bookings/types'
import TouristBookingCard, { type TouristBookingAction } from './TouristBookingCard'
import ConfirmDialog from './ConfirmDialog'
import ReviewModal from '@/components/ReviewModal'

interface PendingAction {
  key: number
  booking: TouristBooking
  action: TouristBookingAction
}

export default function TouristBookingsPanel({ bookings, onChanged }: { bookings: TouristBooking[]; onChanged: () => Promise<void> | void }) {
  const t = useTranslations('Bookings')
  const locale = useLocale()
  const [filter, setFilter] = useState<'active' | 'history'>('active')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [reviewFor, setReviewFor] = useState<TouristBooking | null>(null)

  const active = useMemo(() => bookings.filter((b) => isActiveBooking(b.status)), [bookings])
  const history = useMemo(() => bookings.filter((b) => !isActiveBooking(b.status)), [bookings])
  const visible = filter === 'active' ? active : history
  const awaitingDecision = active.filter((b) => b.status === 'quote_sent').length

  const runAction = async (booking: TouristBooking, action: TouristBookingAction, reason?: string) => {
    setBusyId(booking.id)
    try {
      const result = await apiFetch('/api/tourist/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, action, reason: reason || undefined }),
      })
      if (!result.ok) {
        toast.error(result.error || t('toast.error'))
        return
      }
      toast.success(t(`toast.${action}`))
      setPending(null)
      await onChanged()
    } catch (err) {
      toast.error(getUserFriendlyError(err))
    } finally {
      setBusyId(null)
    }
  }

  const dialog = pending && (() => {
    const { booking, action } = pending
    if (action === 'accept_quote') {
      return {
        title: t('dialog.accept_title'),
        description: t('dialog.accept_desc', { amount: formatXof(booking.quote_amount, locale), guide: booking.guide.profile.full_name }),
        confirmLabel: t('actions.accept_quote'),
        tone: 'primary' as const,
      }
    }
    if (action === 'decline_quote') {
      return {
        title: t('dialog.decline_title'),
        description: t('dialog.decline_desc'),
        confirmLabel: t('actions.decline_quote'),
        tone: 'danger' as const,
        reason: { label: t('dialog.reason_label'), placeholder: t('dialog.reason_placeholder_decline') },
      }
    }
    const confirmed = booking.status === 'confirmed'
    return {
      title: confirmed ? t('dialog.cancel_booking_title') : t('dialog.cancel_request_title'),
      description: confirmed ? t('dialog.cancel_booking_desc') : t('dialog.cancel_request_desc'),
      confirmLabel: confirmed ? t('actions.cancel_booking') : t('actions.cancel_request'),
      tone: 'danger' as const,
      reason: { label: t('dialog.reason_label'), placeholder: t('dialog.reason_placeholder'), required: confirmed },
    }
  })()

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-border bg-card p-1" role="tablist">
          {(['active', 'history'] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-md px-4 py-1.5 text-xs font-bold transition-colors ${
                filter === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t(`filters.${key}`, { count: key === 'active' ? active.length : history.length })}
            </button>
          ))}
        </div>
        {awaitingDecision > 0 && (
          <p className="text-xs font-semibold text-primary">{t('awaiting_decision', { count: awaitingDecision })}</p>
        )}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <CalendarCheck className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <h3 className="mt-3 font-serif text-lg font-bold">{t(filter === 'active' ? 'empty.active_title' : 'empty.history_title')}</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t(filter === 'active' ? 'empty.active_desc_tourist' : 'empty.history_desc')}</p>
          {filter === 'active' && (
            <Link href="/guides" className="btn-brand mt-5">
              {t('empty.find_guide')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((booking) => (
            <TouristBookingCard
              key={booking.id}
              booking={booking}
              busy={busyId === booking.id}
              onAction={(b, action) => setPending({ key: Date.now(), booking: b, action })}
              onReview={setReviewFor}
            />
          ))}
        </div>
      )}

      {pending && dialog && (
        <ConfirmDialog
          key={pending.key}
          open
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          tone={dialog.tone}
          reason={'reason' in dialog ? dialog.reason : undefined}
          loading={busyId === pending.booking.id}
          onConfirm={(reason) => runAction(pending.booking, pending.action, reason)}
          onClose={() => setPending(null)}
        />
      )}

      {reviewFor && (
        <ReviewModal
          bookingId={reviewFor.id}
          guideName={reviewFor.guide.profile.full_name}
          isOpen
          onClose={() => setReviewFor(null)}
          onSuccess={async () => {
            toast.success(t('toast.review'))
            await onChanged()
          }}
        />
      )}
    </section>
  )
}
