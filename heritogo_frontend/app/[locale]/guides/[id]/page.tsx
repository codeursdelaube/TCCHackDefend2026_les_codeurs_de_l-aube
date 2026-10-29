'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { getInitials } from '@/lib/auth/redirect'
import {
  MapPin, ShieldCheck, Heart, Loader2, ArrowLeft, Calendar, Briefcase,
  Languages, Share2, UserCheck, Star, Flag, CheckCircle2, Compass,
} from 'lucide-react'
import { toast } from 'sonner'
import ReportModal from '@/components/ReportModal'
import TextToSpeech from '@/components/TextToSpeech'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetchCached } from '@/lib/utils/http'
import { safeJsonParse, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/storage'
import AuthGuardLink from '@/components/AuthGuardLink'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { MISSION_TYPES, formatBookingDate, formatXof, rateForMission } from '@/lib/bookings/status'

interface RatingBreakdown {
  count: number
  overall: number | null
  punctuality: number | null
  knowledge: number | null
  communication: number | null
}

interface GuideDetail {
  id: string
  experience_years: number
  specialties: string[]
  languages: string[]
  coverage_zones: string[]
  hourly_rate?: string | null
  half_day_rate?: string | null
  full_day_rate?: string | null
  virtual_rate?: string | null
  avg_rating: string
  total_reviews: number
  total_missions: number
  reviewed_at?: string | null
  created_at: string
  profile: {
    full_name: string
    avatar_url?: string | null
    preferred_lang?: string | null
    bio?: string | null
  }
  availability: { available_date: string }[]
  rating_breakdown?: RatingBreakdown
}

function RatingBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
      <span className="w-8 text-right font-bold">{value.toFixed(1)}</span>
    </div>
  )
}

export default function GuideDetailPage() {
  const t = useTranslations('GuideProfile')
  const tb = useTranslations('Bookings')
  const locale = useLocale()
  const { isAuthenticated, loading: authLoading } = useRequireAuth()
  const params = useParams<{ locale: string; id: string }>()
  const guideId = params?.id

  const [guide, setGuide] = useState<GuideDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), []).includes(guideId || '')
  })

  useEffect(() => {
    if (!guideId || authLoading || !isAuthenticated) return
    let cancelled = false
    apiFetchCached<{ guide?: GuideDetail }>(`/api/guides/${guideId}`, {
      cacheKey: `public-guide-${guideId}`,
      ttlMs: 10 * 60 * 1000,
    })
      .then((result) => {
        if (cancelled) return
        if (!result.ok || !result.data?.guide) {
          setError(result.error || t('error'))
          return
        }
        setGuide(result.data.guide)
      })
      .catch((err: unknown) => !cancelled && setError(getUserFriendlyError(err)))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [guideId, authLoading, isAuthenticated, t])

  const toggleFavorite = () => {
    if (!guideId) return
    let favList = safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), [])
    if (favList.includes(guideId)) {
      favList = favList.filter((id) => id !== guideId)
      setIsFavorite(false)
      toast.info(t('fav_removed'))
    } else {
      favList.push(guideId)
      setIsFavorite(true)
      toast.success(t('fav_added'))
    }
    safeLocalStorageSet('heritogo_favorites', JSON.stringify(favList))
  }

  const shareGuide = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: `${guide?.profile.full_name} — HeriTogo`, text: t('share_text'), url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(url).then(() => toast.success(t('link_copied'))).catch(() => {})
    }
  }

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 pt-24 text-center">
        <UserCheck className="h-10 w-10 text-muted-foreground/50" />
        <h1 className="font-serif text-xl font-bold">{t('unavailable')}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{error || t('error')}</p>
        <Link href="/guides" className="btn-brand">{t('back')}</Link>
      </main>
    )
  }

  const hasReviews = guide.total_reviews > 0
  const rating = Number(guide.avg_rating)
  const breakdown = guide.rating_breakdown
  const pricedMissions = MISSION_TYPES.map((m) => ({ type: m, rate: rateForMission(guide, m) })).filter((m) => m.rate !== null)
  const memberSince = formatBookingDate(guide.reviewed_at || guide.created_at, locale, { month: 'long', year: 'numeric' })
  const bio = guide.profile.bio || t('default_bio')

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link href="/guides" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>

        {/* En-tête */}
        <section className="mt-6 flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="relative shrink-0">
              {guide.profile.avatar_url ? (
                <Image
                  src={guide.profile.avatar_url}
                  alt={guide.profile.full_name}
                  width={112}
                  height={112}
                  unoptimized
                  className="h-28 w-28 rounded-xl border border-border object-cover"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-primary font-serif text-3xl font-bold text-primary-foreground">
                  {getInitials(guide.profile.full_name)}
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 rounded-lg border-2 border-card bg-forest p-1 text-white" title={t('verified')}>
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{guide.profile.full_name}</h1>
              <p className="inline-flex items-center gap-1.5 rounded-md border border-forest/30 bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t('verified')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
                {hasReviews ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {rating.toFixed(1)}
                    <span className="font-normal text-muted-foreground">({t('reviews_count', { count: guide.total_reviews })})</span>
                  </span>
                ) : (
                  <span className="font-semibold text-foreground">{t('new_guide')}</span>
                )}
                <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4 text-primary" />{t('experience', { count: guide.experience_years })}</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-primary" />{t('missions', { count: guide.total_missions })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:justify-end">
            <button type="button" onClick={toggleFavorite} aria-pressed={isFavorite} className="btn-outline-brand min-h-10 px-3.5 text-xs">
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
              {isFavorite ? t('in_favorites') : t('add_favorite')}
            </button>
            <button type="button" onClick={shareGuide} className="btn-outline-brand min-h-10 px-3.5 text-xs">
              <Share2 className="h-4 w-4" />
              {t('share')}
            </button>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-serif text-xl font-bold">{t('about')}</h2>
                <TextToSpeech text={bio} className="min-h-9 px-3 text-xs" />
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85 sm:text-base">{bio}</p>

              <dl className="mt-6 grid gap-6 border-t border-border pt-6 sm:grid-cols-2">
                <div>
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <Languages className="h-4 w-4 text-primary" />{t('languages')}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {guide.languages.length > 0
                      ? guide.languages.map((l) => <span key={l} className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold">{l}</span>)
                      : <span className="text-xs text-muted-foreground">{t('not_specified')}</span>}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />{t('zones')}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {guide.coverage_zones.length > 0
                      ? guide.coverage_zones.map((z) => <span key={z} className="rounded-md border border-border px-2.5 py-1 text-xs font-semibold">{z}</span>)
                      : <span className="text-xs text-muted-foreground">{t('not_specified')}</span>}
                  </dd>
                </div>
                {guide.specialties.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      <Compass className="h-4 w-4 text-primary" />{t('specialties')}
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {guide.specialties.map((s) => (
                        <span key={s} className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{s}</span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-serif text-xl font-bold">{t('ratings_title')}</h2>
              {hasReviews && breakdown ? (
                <div className="mt-4 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                  <div className="text-center sm:pr-6 sm:text-left">
                    <p className="font-serif text-5xl font-bold">{rating.toFixed(1)}</p>
                    <div className="mt-1 flex justify-center gap-0.5 sm:justify-start">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`h-4 w-4 ${i <= Math.round(rating) ? 'fill-accent text-accent' : 'text-border'}`} />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t('based_on', { count: guide.total_reviews })}</p>
                  </div>
                  <div className="space-y-2.5">
                    <RatingBar label={t('punctuality')} value={breakdown.punctuality} />
                    <RatingBar label={t('knowledge')} value={breakdown.knowledge} />
                    <RatingBar label={t('communication')} value={breakdown.communication} />
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t('no_reviews')}</p>
              )}
              <p className="mt-4 text-[11px] text-muted-foreground">{t('ratings_note')}</p>
            </section>

            <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
                <Calendar className="h-5 w-5 text-primary" />
                {t('availability')}
              </h2>
              {guide.availability.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {guide.availability.map((av) => (
                    <div key={av.available_date} className="rounded-lg border border-forest/25 bg-forest/5 p-2.5 text-center">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        {formatBookingDate(av.available_date.slice(0, 10), locale, { weekday: 'short' })}
                      </p>
                      <p className="font-serif text-sm font-bold">
                        {formatBookingDate(av.available_date.slice(0, 10), locale, { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t('on_request')}</p>
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg font-bold">{t('pricing')}</h2>
              {pricedMissions.length > 0 ? (
                <dl className="mt-4 divide-y divide-border text-sm">
                  {pricedMissions.map(({ type, rate }) => (
                    <div key={type} className="flex items-center justify-between py-2.5">
                      <dt className="text-muted-foreground">{tb(`mission.${type}`)}</dt>
                      <dd className="font-bold">
                        {formatXof(rate, locale)}
                        {type === 'hourly' && <span className="font-normal text-muted-foreground">{t('per_hour')}</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t('pricing_on_quote')}</p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t('pricing_note')}</p>
              <AuthGuardLink href={`/booking/${guide.id}`} className="btn-brand mt-5 w-full">
                {t('request_quote')}
              </AuthGuardLink>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">{t('request_quote_note')}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="h-4 w-4 text-forest" />
                {t('trust_title')}
              </h2>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                {(['trust_1', 'trust_2', 'trust_3', 'trust_4'] as const).map((key) => (
                  <li key={key} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-forest" />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground">{t('member_since', { date: memberSince })}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              {reportSuccess ? (
                <p className="text-center text-xs font-semibold text-forest">{t('report_success')}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="inline-flex w-full items-center justify-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-red-700"
                >
                  <Flag className="h-3.5 w-3.5" />
                  {t('report')}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      <ReportModal
        reportedId={guide.id}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={() => setReportSuccess(true)}
      />
    </main>
  )
}
