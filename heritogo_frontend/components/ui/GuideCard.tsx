'use client'

/* eslint-disable @next/next/no-img-element */

import { ShieldCheck, MapPin, Languages, Heart, Star, Briefcase } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import AuthGuardLink from '@/components/AuthGuardLink'
import { MISSION_TYPES, formatXof, rateForMission, type GuideRates } from '@/lib/bookings/status'

interface GuideCardProps {
  id: string
  name: string
  avatarUrl?: string | null
  initials: string
  zones: string[]
  languages: string[]
  specialties?: string[]
  rates: GuideRates
  rating: number
  reviewsCount: number
  missionsCount?: number
  experienceYears?: number
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export default function GuideCard({
  id,
  name,
  avatarUrl,
  initials,
  zones,
  languages,
  specialties = [],
  rates,
  rating,
  reviewsCount,
  missionsCount = 0,
  experienceYears,
  isFavorite,
  onToggleFavorite,
}: GuideCardProps) {
  const t = useTranslations('GuidesPage')
  const tp = useTranslations('GuideProfile')
  const locale = useLocale()

  const publishedRates = MISSION_TYPES.filter((m) => m !== 'hourly')
    .map((m) => rateForMission(rates, m))
    .filter((r): r is number => r !== null)
  const fromRate = publishedRates.length > 0 ? Math.min(...publishedRates) : null

  return (
    <article className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-shadow duration-300 hover:shadow-lg">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover" />
            ) : (
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-primary font-serif text-lg font-bold text-primary-foreground">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="flex items-center gap-1.5 font-serif text-lg font-bold">
                <span className="truncate">{name}</span>
                <ShieldCheck className="h-4 w-4 shrink-0 text-forest" aria-label={t('certified')} />
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                {reviewsCount > 0 ? (
                  <>
                    <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                    <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
                    <span>({tp('reviews_count', { count: reviewsCount })})</span>
                  </>
                ) : (
                  <span className="font-semibold text-foreground">{tp('new_guide')}</span>
                )}
              </p>
            </div>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? tp('in_favorites') : tp('add_favorite')}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-primary"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
            </button>
          )}
        </div>

        <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{zones.length > 0 ? zones.join(', ') : tp('not_specified')}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{languages.length > 0 ? languages.join(', ') : tp('not_specified')}</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {experienceYears !== undefined && `${tp('experience', { count: experienceYears })} · `}
              {tp('missions', { count: missionsCount })}
            </span>
          </li>
        </ul>

        {specialties.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {specialties.slice(0, 3).map((s) => (
              <span key={s} className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{s}</span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{t('rate_from')}</span>
          <span className="text-sm font-bold">{fromRate !== null ? formatXof(fromRate, locale) : t('on_quote')}</span>
        </div>
        <div className="flex items-center gap-2">
          <AuthGuardLink href={`/guides/${id}`} className="btn-outline-brand min-h-9 px-3 text-xs">
            {t('view_profile')}
          </AuthGuardLink>
          <AuthGuardLink href={`/booking/${id}`} className="btn-brand min-h-9 px-3 text-xs">
            {t('book')}
          </AuthGuardLink>
        </div>
      </div>
    </article>
  )
}
