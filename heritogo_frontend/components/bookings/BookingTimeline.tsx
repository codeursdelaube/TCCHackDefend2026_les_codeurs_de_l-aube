'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { BOOKING_STEPS, type BookingStatusValue } from '@/lib/bookings/status'

/** Frise horizontale des 5 étapes du parcours ; masquée pour une réservation annulée. */
export default function BookingTimeline({ status }: { status: BookingStatusValue }) {
  const t = useTranslations('Bookings.steps')
  const current = BOOKING_STEPS.indexOf(status as (typeof BOOKING_STEPS)[number])
  if (current < 0) return null

  return (
    <ol className="flex items-center gap-1" aria-label={t('aria')}>
      {BOOKING_STEPS.map((step, idx) => {
        const done = idx < current || status === 'completed'
        const active = idx === current && status !== 'completed'
        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-1.5 text-center">
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${idx === 0 ? 'opacity-0' : done || active ? 'bg-primary' : 'bg-border'}`} />
              <span
                aria-current={active ? 'step' : undefined}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                  done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : active
                      ? 'border-primary bg-card text-primary ring-4 ring-primary/15'
                      : 'border-border bg-card text-muted-foreground'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              <span className={`h-0.5 flex-1 ${idx === BOOKING_STEPS.length - 1 ? 'opacity-0' : done ? 'bg-primary' : 'bg-border'}`} />
            </div>
            <span className={`hidden text-[10px] font-semibold sm:block ${active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t(step)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
