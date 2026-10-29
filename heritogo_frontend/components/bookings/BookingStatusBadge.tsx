'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Clock, FileText, PlayCircle, XCircle, AlertTriangle, Hourglass } from 'lucide-react'
import type { BookingStatusValue } from '@/lib/bookings/status'

const STATUS_STYLES: Record<BookingStatusValue, { className: string; icon: typeof Clock }> = {
  quote_requested: { className: 'bg-accent/15 text-foreground border-accent/40', icon: Hourglass },
  quote_sent: { className: 'bg-primary/10 text-primary border-primary/30', icon: FileText },
  confirmed: { className: 'bg-forest/10 text-forest border-forest/30 dark:text-emerald-300', icon: CheckCircle2 },
  in_progress: { className: 'bg-primary text-primary-foreground border-primary', icon: PlayCircle },
  completed: { className: 'bg-muted text-foreground border-border', icon: CheckCircle2 },
  cancelled: { className: 'bg-muted text-muted-foreground border-border line-through decoration-1', icon: XCircle },
  disputed: { className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900', icon: AlertTriangle },
}

export default function BookingStatusBadge({ status }: { status: BookingStatusValue }) {
  const t = useTranslations('Bookings.status')
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.quote_requested
  const Icon = style.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold ${style.className}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="no-underline">{t(status)}</span>
    </span>
  )
}
