'use client'

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { getInitials } from '@/lib/auth/redirect'
import { useTranslations } from 'next-intl'
import { 
  ArrowLeft, Calendar, Clock, MapPin, Users, MessageSquare, 
  Loader2, AlertCircle, CheckCircle, ShieldCheck
} from 'lucide-react'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetch, apiFetchCached } from '@/lib/utils/http'
import { toast } from 'sonner'
import StarRating from '@/components/ui/StarRating'

interface GuideInfo {
  id: string
  experience_years: number
  specialties: string[]
  languages: string[]
  full_day_rate?: string
  half_day_rate?: string
  hourly_rate?: string
  virtual_rate?: string
  avg_rating: string
  profile: {
    full_name: string
    avatar_url?: string
    bio?: string
  }
}

export default function BookingPage() {
  const t = useTranslations('Booking')
  const params = useParams<{ locale: string; guideId: string }>()
  const guideId = params?.guideId

  const [guide, setGuide] = useState<GuideInfo | null>(null)
  const [loadingGuide, setLoadingGuide] = useState(true)
  const [guideError, setGuideError] = useState<string | null>(null)

  // Form State
  const [missionType, setMissionType] = useState('full_day')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [touristMessage, setTouristMessage] = useState('')
  const [specialNeeds, setSpecialNeeds] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!guideId) return

    const fetchGuide = async () => {
      setLoadingGuide(true)
      try {
        const result = await apiFetchCached<{ guide?: GuideInfo }>(`/api/guides/${guideId}`, {
          cacheKey: `public-guide-${guideId}`,
          ttlMs: 10 * 60 * 1000,
        })
        if (!result.ok || !result.data?.guide) {
          setGuideError(result.error || t('error_fetching_guide'))
          return
        }
        setGuide(result.data.guide)
      } catch (err: unknown) {
        setGuideError(getUserFriendlyError(err))
      } finally {
        setLoadingGuide(false)
      }
    }

    fetchGuide()
  }, [guideId, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guideId) return

    if (!startDate) {
      setSubmitError(t('error_start_date'))
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const result = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guide_id: guideId,
          mission_type: missionType,
          start_date: startDate,
          start_time: startTime,
          meeting_point: meetingPoint,
          tourist_message: touristMessage,
          group_size: groupSize,
          special_needs: specialNeeds
        })
      })

      if (!result.ok) {
        const err = result.error || t('error_generic')
        setSubmitError(err)
        toast.error(err)
        return
      }

      setSuccess(true)
      toast.success(t('request_sent'))
      setTimeout(() => {
        window.location.href = `/${params.locale}/dashboard/tourist?booking_created=true`
      }, 2000)
    } catch (err: unknown) {
      console.error(err)
      const userErr = getUserFriendlyError(err)
      setSubmitError(userErr)
      toast.error(userErr)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingGuide) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (guideError || !guide) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pt-24 text-center bg-background">
        <AlertCircle className="h-12 w-12 text-primary" />
        <h2 className="font-serif text-2xl font-bold">{t('guide_not_found')}</h2>
        <p className="text-sm text-muted-foreground max-w-sm">{guideError || t('guide_not_available')}</p>
        <Link 
          href="/guides"
          className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark"
        >
          ← {t('back_to_directory')}
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-32 pt-8 text-foreground">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back button */}
        <div>
          <Link 
            href={`/guides/${guide.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('back_to_profile')}</span>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Booking Form Card */}
          <div className="app-card p-6 sm:p-8 lg:col-span-8 space-y-6">
            <div className="border-b border-border pb-4 space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                {t('booking_request')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('form_subtitle', { name: guide.profile.full_name })}
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="rounded-full bg-emerald-500/15 p-4 text-emerald-600 animate-bounce">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">{t('request_sent')}</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t('success_message')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Type de mission */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('mission_type_label')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'full_day', label: t('types.full_day.label'), desc: t('types.full_day.desc') },
                      { value: 'half_day', label: t('types.half_day.label'), desc: t('types.half_day.desc') },
                      { value: 'hourly', label: t('types.hourly.label'), desc: t('types.hourly.desc') },
                      { value: 'virtual', label: t('types.virtual.label'), desc: t('types.virtual.desc') }
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setMissionType(item.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          missionType === item.value 
                            ? 'border-primary bg-primary/10 text-primary shadow-xs' 
                            : 'border-border bg-card text-foreground hover:border-primary/50'
                        }`}
                      >
                        <span className="text-xs font-bold">{item.label}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Heure */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{t('date_label')}</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>{t('start_time_label')}</span>
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                {/* Lieu de rencontre & Taille de groupe */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{t('meeting_point_label')}</span>
                    </label>
                    <input
                      type="text"
                      value={meetingPoint}
                      onChange={(e) => setMeetingPoint(e.target.value)}
                      placeholder={t('meeting_point_placeholder')}
                      className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <span>{t('group_size_label')}</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={groupSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setGroupSize(isNaN(val) ? 1 : Math.max(1, Math.min(50, val)))
                      }}
                      className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <span>{t('message_label')}</span>
                  </label>
                  <textarea
                    value={touristMessage}
                    onChange={(e) => setTouristMessage(e.target.value)}
                    placeholder={t('message_placeholder')}
                    rows={3}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Besoins spécifiques */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('special_needs_label')}
                  </label>
                  <input
                    type="text"
                    value={specialNeeds}
                    onChange={(e) => setSpecialNeeds(e.target.value)}
                    placeholder={t('special_needs_placeholder')}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-sm font-medium text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {submitError && (
                  <div className="rounded-2xl border border-red-300 bg-red-50/40 dark:bg-red-950/20 px-4 py-3 text-xs font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-bold text-white shadow-md hover:bg-primary-dark transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>{t('send_request')}</span>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar Summary Info */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Guide Card Mini */}
            <div className="app-card p-5 space-y-4">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t('sidebar_guide')}
              </h3>
              <div className="flex items-center gap-3">
                {guide.profile.avatar_url ? (
                  <Image
                    src={guide.profile.avatar_url}
                    alt={guide.profile.full_name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-2xl object-cover border border-border"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-serif font-bold text-white bg-primary">
                    {getInitials(guide.profile.full_name)}
                  </div>
                )}
                <div>
                  <h4 className="font-serif font-bold text-foreground text-sm">{guide.profile.full_name}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{t('certified')}</span>
                    <span>•</span>
                    <StarRating rating={Number(guide.avg_rating) || 4.8} size="sm" showCount={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="app-card p-5 space-y-3">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {t('pricing_title')}
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">{t('full_day')}</span>
                  <span className="font-bold text-foreground">{guide.full_day_rate ? `${Number(guide.full_day_rate).toLocaleString()} XOF` : '20 000 XOF'}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">{t('half_day')}</span>
                  <span className="font-bold text-foreground">{guide.half_day_rate ? `${Number(guide.half_day_rate).toLocaleString()} XOF` : '12 000 XOF'}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-3">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t('warning_text')}
                </p>
              </div>
            </div>
          </aside>

        </div>

      </div>
    </main>
  )
}
