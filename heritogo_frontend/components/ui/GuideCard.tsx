'use client'

import { Link } from '@/i18n/navigation'
import { ShieldCheck, MapPin, Languages, ArrowRight, Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import StarRating from './StarRating'
import AuthGuardLink from '@/components/AuthGuardLink'

interface GuideCardProps {
  id: string
  name: string
  avatarUrl?: string
  initials: string
  zone: string
  languages: string[]
  dailyRate?: string | null
  rating: number
  reviewsCount: number
  experienceYears?: number
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export default function GuideCard({
  id,
  name,
  avatarUrl,
  initials,
  zone,
  languages,
  dailyRate,
  rating,
  reviewsCount,
  experienceYears,
  isFavorite,
  onToggleFavorite,
}: GuideCardProps) {
  const t = useTranslations('GuidesPage')
  return (
    <article className="app-card group relative flex flex-col justify-between p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Top Header with Avatar, Certified Badge & Favorite */}
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                className="h-14 w-14 rounded-2xl object-cover border border-border"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-lg font-serif font-bold text-white shadow-sm">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5">
                <h3 className="font-serif text-base sm:text-lg font-bold text-foreground line-clamp-1">
                  {name}
                </h3>
                <span title={t('certified')} className="inline-flex">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                </span>
              </div>
              <div className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                <span className="min-w-0 truncate">{zone}</span>
              </div>
            </div>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={t('book')}
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-red-500 active:scale-95"
            >
              <Heart
                className={`h-4 w-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* Rating and Experience */}
        <div className="flex items-center justify-between gap-2 py-2 border-y border-border text-xs">
          <StarRating rating={rating} count={reviewsCount} className="min-w-0" />
          {experienceYears !== undefined && (
            <span className="shrink-0 whitespace-nowrap font-semibold text-muted-foreground">
              {experienceYears} ans d’exp.
            </span>
          )}
        </div>

        {/* Languages */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Languages className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="min-w-0 truncate font-medium">
            {Array.isArray(languages) ? languages.join(', ') : languages}
          </span>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-border pt-3">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            {t('rate_label')}
          </span>
          <span className="text-sm font-bold text-primary">
            {dailyRate ? `${dailyRate} FCFA` : '20 000 FCFA'}
            <span className="text-xs font-normal text-muted-foreground"> {t('per_day')}</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/guides/${id}`}
            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            {t('view_profile')}
          </Link>
          <AuthGuardLink
            href={`/booking/${id}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark transition-all"
          >
            <span>{t('book')}</span>
            <ArrowRight className="h-3 w-3" />
          </AuthGuardLink>
        </div>
      </div>
    </article>
  )
}
