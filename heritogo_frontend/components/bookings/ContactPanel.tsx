'use client'

import { useTranslations } from 'next-intl'
import { Lock, Phone, MessageCircle } from 'lucide-react'
import { isContactShared, type BookingStatusValue } from '@/lib/bookings/status'

function whatsappLink(phone: string) {
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}`
}

/** Coordonnées de l'autre partie, visibles uniquement après confirmation du devis. */
export default function ContactPanel({
  status,
  name,
  phone,
  role,
}: {
  status: BookingStatusValue
  name: string
  phone?: string | null
  role: 'guide' | 'tourist'
}) {
  const t = useTranslations('Bookings.contact')

  if (status === 'cancelled' || status === 'disputed') return null

  if (!isContactShared(status)) {
    return (
      <p className="flex items-start gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {t('hidden')}
      </p>
    )
  }

  if (!phone) {
    return (
      <p className="rounded-lg bg-muted/60 px-3 py-2.5 text-xs text-muted-foreground">
        {t(role === 'guide' ? 'no_phone_guide' : 'no_phone_tourist', { name })}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-forest/25 bg-forest/5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {t(role === 'guide' ? 'title_guide' : 'title_tourist')}
        </p>
        <p className="text-sm font-bold text-foreground">{phone}</p>
      </div>
      <div className="flex gap-2">
        <a href={`tel:${phone}`} className="btn-outline-brand min-h-9 px-3 text-xs">
          <Phone className="h-3.5 w-3.5" />
          {t('call')}
        </a>
        <a href={whatsappLink(phone)} target="_blank" rel="noopener noreferrer" className="btn-outline-brand min-h-9 px-3 text-xs">
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}
