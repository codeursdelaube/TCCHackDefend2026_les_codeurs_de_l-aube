'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Calendar, Clock, MapPin, Users, Compass, Timer } from 'lucide-react'
import { formatBookingDate, formatBookingTime } from '@/lib/bookings/status'
import type { BookingBase } from '@/lib/bookings/types'

/** Grille des informations logistiques d'une réservation. */
export default function BookingDetails({ booking }: { booking: BookingBase }) {
  const t = useTranslations('Bookings')
  const locale = useLocale()
  const time = formatBookingTime(booking.start_time)
  const duration = booking.duration_hours ? Number(booking.duration_hours) : null

  const items = [
    { icon: Calendar, label: t('fields.date'), value: formatBookingDate(booking.start_date, locale) },
    time ? { icon: Clock, label: t('fields.time'), value: time } : null,
    duration ? { icon: Timer, label: t('fields.duration'), value: t('fields.duration_value', { hours: duration }) } : null,
    { icon: Users, label: t('fields.group'), value: t('fields.group_value', { count: booking.group_size }) },
    booking.meeting_point ? { icon: MapPin, label: t('fields.meeting_point'), value: booking.meeting_point } : null,
    booking.destination ? { icon: Compass, label: t('fields.destination'), value: booking.destination } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-2.5">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="text-sm font-semibold text-foreground wrap-break-word">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
