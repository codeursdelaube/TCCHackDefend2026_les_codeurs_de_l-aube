'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, MessageSquare, Compass, Timer,
  Loader2, AlertCircle, CheckCircle2, ShieldCheck, Star, Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetch, apiFetchCached } from '@/lib/utils/http'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import PartyAvatar from '@/components/bookings/PartyAvatar'
import {
  MAX_BOOKING_HORIZON_DAYS,
  MAX_GROUP_SIZE,
  MISSION_TYPES,
  estimateBookingAmount,
  formatBookingDate,
  formatXof,
  rateForMission,
  type MissionTypeValue,
} from '@/lib/bookings/status'

interface GuideInfo {
  id: string
  experience_years: number
  languages: string[]
  coverage_zones: string[]
  full_day_rate?: string | null
  half_day_rate?: string | null
  hourly_rate?: string | null
  virtual_rate?: string | null
  avg_rating: string
  total_reviews: number
  total_missions: number
  profile: { full_name: string; avatar_url?: string | null }
  availability: { available_date: string }[]
}

function isoDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function BookingPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth()
  const t = useTranslations('BookingForm')
  const tb = useTranslations('Bookings')
  const locale = useLocale()
  const router = useRouter()
  const params = useParams<{ locale: string; guideId: string }>()
  const guideId = params?.guideId

  const [guide, setGuide] = useState<GuideInfo | null>(null)
  const [loadingGuide, setLoadingGuide] = useState(true)
  const [guideError, setGuideError] = useState<string | null>(null)

  const [missionType, setMissionType] = useState<MissionTypeValue>('full_day')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [durationHours, setDurationHours] = useState(2)
  const [meetingPoint, setMeetingPoint] = useState('')
  const [destination, setDestination] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [touristMessage, setTouristMessage] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)

  useEffect(() => {
    if (!guideId || authLoading || !isAuthenticated) return
    let cancelled = false

    apiFetchCached<{ guide?: GuideInfo }>(`/api/guides/${guideId}`, {
      cacheKey: `public-guide-${guideId}`,
      ttlMs: 10 * 60 * 1000,
    })
      .then((result) => {
        if (cancelled) return
        if (!result.ok || !result.data?.guide) {
          setGuideError(result.error || t('error_guide'))
          return
        }
        const g = result.data.guide
        setGuide(g)
        // Présélectionne la première formule pour laquelle le guide publie un tarif.
        const firstPriced = MISSION_TYPES.find((m) => rateForMission(g, m) !== null)
        if (firstPriced) setMissionType(firstPriced)
      })
      .catch((err: unknown) => !cancelled && setGuideError(getUserFriendlyError(err)))
      .finally(() => !cancelled && setLoadingGuide(false))

    return () => {
      cancelled = true
    }
  }, [guideId, t, authLoading, isAuthenticated])

  const estimate = useMemo(
    () => (guide ? estimateBookingAmount(guide, missionType, durationHours) : null),
    [guide, missionType, durationHours],
  )

  const isVirtual = missionType === 'virtual'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guideId) return
    setSubmitError(null)

    if (!startDate) return setSubmitError(t('error_date'))
    if (!isVirtual && !meetingPoint.trim()) return setSubmitError(t('error_meeting_point'))
    if (!acceptTerms) return setSubmitError(t('error_terms'))

    setSubmitting(true)
    try {
      const result = await apiFetch<{ booking?: { reference: string } }>('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guide_id: guideId,
          mission_type: missionType,
          start_date: startDate,
          start_time: startTime,
          duration_hours: missionType === 'hourly' ? durationHours : undefined,
          meeting_point: meetingPoint,
          destination,
          tourist_message: touristMessage,
          group_size: groupSize,
          special_needs: specialNeeds,
        }),
      })

      if (!result.ok) {
        const err = result.error || t('error_generic')
        setSubmitError(err)
        toast.error(err)
        return
      }

      setReference(result.data?.booking?.reference ?? '')
      toast.success(t('success_title'))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const userErr = getUserFriendlyError(err)
      setSubmitError(userErr)
      toast.error(userErr)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || !isAuthenticated || loadingGuide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (guideError || !guide) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 pt-24 text-center">
        <AlertCircle className="h-10 w-10 text-primary" />
        <h1 className="font-serif text-2xl font-bold">{t('guide_unavailable')}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{guideError || t('error_guide')}</p>
        <Link href="/guides" className="btn-brand">{t('back_to_directory')}</Link>
      </main>
    )
  }

  const rating = Number(guide.avg_rating)
  const availableDates = guide.availability.map((a) => a.available_date.slice(0, 10))

  if (reference !== null) {
    return (
      <main className="min-h-screen bg-background px-4 pb-32 pt-28">
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-8 text-center sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-bold sm:text-3xl">{t('success_title')}</h1>
          {reference && <p className="mt-2 text-sm font-semibold text-primary">{tb('reference', { ref: reference })}</p>}
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t('success_desc', { name: guide.profile.full_name })}</p>
          <ol className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm">
            {(['how_2', 'how_3', 'how_4'] as const).map((key, idx) => (
              <li key={key} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">{idx + 2}</span>
                <span className="text-foreground/85">{t(key)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" onClick={() => router.push('/dashboard/tourist?tab=bookings')} className="btn-brand">
              {t('success_cta')}
            </button>
            <Link href="/guides" className="btn-outline-brand">{t('back_to_directory')}</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-32 pt-24 text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link href={`/guides/${guide.id}`} className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" />
          {t('back_to_profile')}
        </Link>

        <header className="mt-6 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">{t('kicker')}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('title', { name: guide.profile.full_name })}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('subtitle')}</p>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-8" noValidate>
            {/* 1. Formule */}
            <fieldset className="rounded-xl border border-border bg-card p-6">
              <legend className="sr-only">{t('section_visit')}</legend>
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">1</span>
                {t('section_visit')}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {MISSION_TYPES.map((type) => {
                  const rate = rateForMission(guide, type)
                  const selected = missionType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMissionType(type)}
                      aria-pressed={selected}
                      className={`flex flex-col items-start rounded-lg border p-3 text-left transition-colors ${
                        selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-sm font-bold">{tb(`mission.${type}`)}</span>
                      <span className="mt-0.5 text-[11px] text-muted-foreground">{t(`mission_desc.${type}`)}</span>
                      <span className={`mt-2 text-xs font-bold ${rate ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {rate ? `${formatXof(rate, locale)}${type === 'hourly' ? t('per_hour') : ''}` : t('on_quote')}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="field-label flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-primary" />{t('date')} *</span>
                  <input
                    type="date"
                    min={isoDate(0)}
                    max={isoDate(MAX_BOOKING_HORIZON_DAYS)}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="field"
                    required
                  />
                </label>
                <label className="block">
                  <span className="field-label flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />{t('time')}</span>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="field" />
                </label>
                {missionType === 'hourly' ? (
                  <label className="block">
                    <span className="field-label flex items-center gap-1.5"><Timer className="h-3.5 w-3.5 text-primary" />{t('duration')}</span>
                    <select value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} className="field">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>{tb('fields.duration_value', { hours: h })}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label className="block">
                    <span className="field-label flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />{t('group')}</span>
                    <input
                      type="number"
                      min={1}
                      max={MAX_GROUP_SIZE}
                      value={groupSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setGroupSize(Number.isNaN(val) ? 1 : Math.max(1, Math.min(MAX_GROUP_SIZE, val)))
                      }}
                      className="field"
                    />
                  </label>
                )}
              </div>
              {missionType === 'hourly' && (
                <label className="mt-4 block sm:w-1/3">
                  <span className="field-label flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-primary" />{t('group')}</span>
                  <input
                    type="number"
                    min={1}
                    max={MAX_GROUP_SIZE}
                    value={groupSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10)
                      setGroupSize(Number.isNaN(val) ? 1 : Math.max(1, Math.min(MAX_GROUP_SIZE, val)))
                    }}
                    className="field"
                  />
                </label>
              )}

              {availableDates.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold text-muted-foreground">{t('suggested_dates')}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {availableDates.slice(0, 8).map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setStartDate(date)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                          startDate === date ? 'border-forest bg-forest text-white' : 'border-border hover:border-forest'
                        }`}
                      >
                        {formatBookingDate(date, locale, { weekday: 'short', day: 'numeric', month: 'short' })}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>

            {/* 2. Logistique */}
            <fieldset className="rounded-xl border border-border bg-card p-6">
              <legend className="sr-only">{t('section_logistics')}</legend>
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">2</span>
                {t('section_logistics')}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {isVirtual ? t('meeting_point_virtual') : `${t('meeting_point')} *`}
                  </span>
                  <input
                    type="text"
                    maxLength={200}
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    placeholder={isVirtual ? t('meeting_point_virtual_placeholder') : t('meeting_point_placeholder')}
                    className="field"
                  />
                </label>
                <label className="block">
                  <span className="field-label flex items-center gap-1.5"><Compass className="h-3.5 w-3.5 text-primary" />{t('destination')}</span>
                  <input
                    type="text"
                    maxLength={200}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={t('destination_placeholder')}
                    className="field"
                  />
                </label>
              </div>
              {guide.coverage_zones.length > 0 && (
                <p className="mt-3 text-[11px] text-muted-foreground">{t('zones_hint', { zones: guide.coverage_zones.join(', ') })}</p>
              )}
            </fieldset>

            {/* 3. Message */}
            <fieldset className="rounded-xl border border-border bg-card p-6">
              <legend className="sr-only">{t('section_message')}</legend>
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">3</span>
                {t('section_message')}
              </h2>
              <label className="mt-4 block">
                <span className="field-label flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5 text-primary" />{t('message')}</span>
                <textarea
                  value={touristMessage}
                  onChange={(e) => setTouristMessage(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder={t('message_placeholder')}
                  className="field resize-none"
                />
              </label>
              <label className="mt-4 block">
                <span className="field-label">{t('special_needs')}</span>
                <input
                  type="text"
                  maxLength={500}
                  value={specialNeeds}
                  onChange={(e) => setSpecialNeeds(e.target.value)}
                  placeholder={t('special_needs_placeholder')}
                  className="field"
                />
              </label>
            </fieldset>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="checkbox checkbox-sm checkbox-primary mt-0.5 rounded"
              />
              <span className="text-foreground/85">
                {t.rich('accept_terms', {
                  link: (chunks) => (
                    <Link href="/cgu" target="_blank" className="font-semibold text-primary underline underline-offset-2">
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            </label>

            {submitError && (
              <p role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {submitError}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-brand min-h-12 w-full text-base">
              {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {t('submit')}
            </button>
            <p className="text-center text-xs text-muted-foreground">{t('submit_note')}</p>
          </form>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <PartyAvatar name={guide.profile.full_name} url={guide.profile.avatar_url} />
                <div className="min-w-0">
                  <p className="truncate font-serif font-bold">{guide.profile.full_name}</p>
                  <p className="flex items-center gap-1 text-xs font-semibold text-forest dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('verified')}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                <div>
                  <dt className="text-[10px] font-semibold uppercase text-muted-foreground">{t('stat_rating')}</dt>
                  <dd className="mt-0.5 flex items-center justify-center gap-1 text-sm font-bold">
                    {guide.total_reviews > 0 ? (
                      <>
                        <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                        {rating.toFixed(1)}
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">{t('new_guide')}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase text-muted-foreground">{t('stat_missions')}</dt>
                  <dd className="mt-0.5 text-sm font-bold">{guide.total_missions}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase text-muted-foreground">{t('stat_experience')}</dt>
                  <dd className="mt-0.5 text-sm font-bold">{t('years', { count: guide.experience_years })}</dd>
                </div>
              </dl>
              {guide.languages.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">{t('languages', { list: guide.languages.join(', ') })}</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('estimate_title')}</p>
              {estimate !== null ? (
                <>
                  <p className="mt-1 font-serif text-3xl font-bold">{formatXof(estimate, locale)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tb(`mission.${missionType}`)}
                    {missionType === 'hourly' && ` · ${tb('fields.duration_value', { hours: durationHours })}`}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t('estimate_hint')}</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t('estimate_none')}</p>
              )}
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-5">
              <p className="flex items-center gap-2 text-sm font-bold">
                <Info className="h-4 w-4 text-primary" />
                {t('how_title')}
              </p>
              <ol className="mt-3 space-y-2.5 text-xs">
                {(['how_1', 'how_2', 'how_3', 'how_4'] as const).map((key, idx) => (
                  <li key={key} className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-card text-[10px] font-bold text-primary ring-1 ring-border">{idx + 1}</span>
                    <span className="leading-relaxed text-foreground/85">{t(key)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
