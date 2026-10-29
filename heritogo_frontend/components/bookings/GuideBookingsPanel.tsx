'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Inbox, CalendarClock, Archive, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/utils/http'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { formatXof, type GuideRates } from '@/lib/bookings/status'
import type { GuideBooking } from '@/lib/bookings/types'
import GuideBookingCard, { type GuideBookingAction } from './GuideBookingCard'
import ConfirmDialog from './ConfirmDialog'
import QuoteDialog from './QuoteDialog'

export type GuideBookingsView = 'requests' | 'missions' | 'history'

interface GuideBookingsPanelProps {
  bookings: GuideBooking[]
  rates: GuideRates
  approved: boolean
  view: GuideBookingsView
  onViewChange: (view: GuideBookingsView) => void
  onChanged: () => Promise<void> | void
}

interface PendingAction {
  key: number
  booking: GuideBooking
  action: Exclude<GuideBookingAction, 'send_quote'>
}

export default function GuideBookingsPanel({ bookings, rates, approved, view, onViewChange, onChanged }: GuideBookingsPanelProps) {
  const t = useTranslations('Bookings')
  const locale = useLocale()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [quoteFor, setQuoteFor] = useState<GuideBooking | null>(null)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  const groups = useMemo(() => ({
    requests: bookings.filter((b) => b.status === 'quote_requested' || b.status === 'quote_sent'),
    missions: bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'in_progress')
      .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    history: bookings.filter((b) => ['completed', 'cancelled', 'disputed'].includes(b.status)),
  }), [bookings])

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === 'completed')
    return {
      newRequests: bookings.filter((b) => b.status === 'quote_requested').length,
      upcoming: groups.missions.length,
      completed: completed.length,
      revenue: completed.reduce((sum, b) => sum + (Number(b.quote_amount) || 0), 0),
    }
  }, [bookings, groups.missions.length])

  const post = async (booking: GuideBooking, body: Record<string, unknown>) => {
    setBusyId(booking.id)
    try {
      const result = await apiFetch('/api/guide/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, ...body }),
      })
      if (!result.ok) return result.error || t('toast.error')
      await onChanged()
      return null
    } catch (err) {
      return getUserFriendlyError(err)
    } finally {
      setBusyId(null)
    }
  }

  const sendQuote = async (amount: number, message: string) => {
    if (!quoteFor) return
    setQuoteError(null)
    const error = await post(quoteFor, { action: 'send_quote', quoteAmount: amount, quoteMessage: message || undefined })
    if (error) {
      setQuoteError(error)
      return
    }
    toast.success(t('toast.send_quote'))
    setQuoteFor(null)
  }

  const confirmAction = async (reason: string) => {
    if (!pending) return
    const error = await post(pending.booking, { action: pending.action, cancellationReason: reason || undefined })
    if (error) {
      toast.error(error)
      return
    }
    toast.success(t(`toast.${pending.action}`))
    setPending(null)
  }

  const dialog = pending && (() => {
    const { booking, action } = pending
    if (action === 'start_mission') {
      return { title: t('dialog.start_title'), description: t('dialog.start_desc'), confirmLabel: t('actions.start_mission'), tone: 'primary' as const }
    }
    if (action === 'complete_mission') {
      return {
        title: t('dialog.complete_title'),
        description: t('dialog.complete_desc', { amount: formatXof(booking.quote_amount, locale) }),
        confirmLabel: t('actions.complete_mission'),
        tone: 'primary' as const,
      }
    }
    const isRequest = booking.status === 'quote_requested'
    const isConfirmed = booking.status === 'confirmed'
    return {
      title: isRequest ? t('dialog.decline_request_title') : isConfirmed ? t('dialog.cancel_booking_title') : t('dialog.withdraw_title'),
      description: isRequest ? t('dialog.decline_request_desc') : isConfirmed ? t('dialog.guide_cancel_booking_desc') : t('dialog.withdraw_desc'),
      confirmLabel: isRequest ? t('actions.decline_request') : isConfirmed ? t('actions.cancel_booking') : t('actions.withdraw_quote'),
      tone: 'danger' as const,
      reason: { label: t('dialog.reason_label'), placeholder: t('dialog.reason_placeholder_guide'), required: isConfirmed },
    }
  })()

  const tabs: { id: GuideBookingsView; icon: typeof Inbox; count: number }[] = [
    { id: 'requests', icon: Inbox, count: groups.requests.length },
    { id: 'missions', icon: CalendarClock, count: groups.missions.length },
    { id: 'history', icon: Archive, count: groups.history.length },
  ]
  const visible = groups[view]

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: t('stats.new_requests'), value: stats.newRequests, highlight: stats.newRequests > 0 },
          { label: t('stats.upcoming'), value: stats.upcoming },
          { label: t('stats.completed'), value: stats.completed },
          { label: t('stats.revenue'), value: formatXof(stats.revenue, locale) },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl border bg-card p-4 ${stat.highlight ? 'border-primary/40' : 'border-border'}`}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
            <p className={`mt-1 font-serif text-2xl font-bold ${stat.highlight ? 'text-primary' : ''}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {!approved && (
        <p className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {t('pending_approval')}
        </p>
      )}

      <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {tabs.map(({ id, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => onViewChange(id)}
            className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
              view === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {t(`guide_tabs.${id}`)}
            <span className={`rounded-lg px-1.5 text-[10px] ${view === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{count}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="font-serif text-lg font-bold">{t(`empty.guide_${view}_title`)}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{t(`empty.guide_${view}_desc`)}</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((booking) => (
            <GuideBookingCard
              key={booking.id}
              booking={booking}
              busy={busyId === booking.id}
              canAct={approved}
              onAction={(b, action) => {
                if (action === 'send_quote') {
                  setQuoteError(null)
                  setQuoteFor(b)
                } else {
                  setPending({ key: Date.now(), booking: b, action })
                }
              }}
            />
          ))}
        </div>
      )}

      {quoteFor && (
        <QuoteDialog
          booking={quoteFor}
          rates={rates}
          loading={busyId === quoteFor.id}
          error={quoteError}
          onSubmit={sendQuote}
          onClose={() => setQuoteFor(null)}
        />
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
          onConfirm={confirmAction}
          onClose={() => setPending(null)}
        />
      )}
    </section>
  )
}
