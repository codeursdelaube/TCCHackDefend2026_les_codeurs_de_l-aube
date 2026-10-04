'use client'

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getInitials } from '@/lib/auth/redirect'
import { 
  Compass, MapPin, ShieldCheck, Heart, 
  Loader2, ArrowLeft, Calendar, BadgeCent, 
  Briefcase, AlertTriangle, CheckCircle, 
  Languages, Share2, Info, UserCheck
} from 'lucide-react'
import ReportModal from '@/components/ReportModal'
import TextToSpeech from '@/components/TextToSpeech'
import { getUserFriendlyError } from '@/lib/utils/errors'
import { apiFetchCached } from '@/lib/utils/http'
import { safeJsonParse, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils/storage'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import AuthGuardLink from '@/components/AuthGuardLink'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useTranslations } from 'next-intl'

interface GuideDetail {
  id: string
  user_id: string
  experience_years: number
  specialties: string[]
  languages: string[]
  coverage_zones: string[]
  hourly_rate?: string
  half_day_rate?: string
  full_day_rate?: string
  virtual_rate?: string
  avg_rating: string
  total_reviews: number
  profile: {
    full_name: string
    avatar_url?: string
    phone?: string
    preferred_lang?: string
    bio?: string
  }
  availability: {
    available_date: string
  }[]
}

export default function GuideDetailPage() {
  const t = useTranslations('GuidesPage')
  const { isAuthenticated, loading: authLoading } = useRequireAuth()
  const params = useParams<{ locale: string; id: string }>()
  const guideId = params?.id

  const [guide, setGuide] = useState<GuideDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals state
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  // Favorites
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), []).includes(guideId || '')
  })

  useEffect(() => {
    if (!guideId || authLoading || !isAuthenticated) return

    const fetchGuideDetails = async () => {
      setLoading(true)
      try {
        const result = await apiFetchCached<{ guide?: GuideDetail }>(`/api/guides/${guideId}`, {
          cacheKey: `public-guide-${guideId}`,
          ttlMs: 10 * 60 * 1000,
        })
        if (!result.ok || !result.data?.guide) {
          setError(result.error || 'Erreur lors de la récupération du guide')
          return
        }
        setGuide(result.data.guide)
      } catch (err: unknown) {
        console.error(err)
        setError(getUserFriendlyError(err))
      } finally {
        setLoading(false)
      }
    }

    fetchGuideDetails()
  }, [guideId, authLoading, isAuthenticated])

  const toggleFavorite = () => {
    if (!guideId) return
    let favList = safeJsonParse<string[]>(safeLocalStorageGet('heritogo_favorites'), [])
    
    if (favList.includes(guideId)) {
      favList = favList.filter(id => id !== guideId)
      setIsFavorite(false)
    } else {
      favList.push(guideId)
      setIsFavorite(true)
    }
    safeLocalStorageSet('heritogo_favorites', JSON.stringify(favList))
  }

  const shareGuide = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: `Guide ${guide?.profile.full_name} — HeriTogo`,
        text: `Je vous recommande ce guide certifié sur HeriTogo !`,
        url,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">{t('loading_profile')}</p>
        </div>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pt-24 text-center bg-background">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border text-muted-foreground">
          <UserCheck className="h-8 w-8 opacity-40" />
        </div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {t('guide_unavailable')}
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t('error_loading_sub')}
        </p>
        <Link
          href="/guides"
          className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark mt-2"
        >
          {t('back_to_directory')}
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-32 pt-8 text-foreground">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back button */}
        <div>
          <Link 
            href="/guides" 
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('back_to_guides')}</span>
          </Link>
        </div>

        {/* Header Profile Banner */}
        <section className="app-card relative overflow-hidden p-6 sm:p-8 md:p-10 shadow-lg bg-gradient-to-br from-card via-card to-primary/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="relative">
                {guide.profile.avatar_url ? (
                  <Image
                    src={guide.profile.avatar_url}
                    alt={guide.profile.full_name}
                    width={112}
                    height={112}
                    className="h-28 w-28 object-cover rounded-3xl border border-border shadow-md"
                  />
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl text-3xl font-serif font-bold text-white bg-primary shadow-md">
                    {getInitials(guide.profile.full_name)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-xl border-2 border-card" title="Certifié État togolais">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
                   <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {guide.profile.full_name}
                  </h1>
                  <Badge variant="forest">{t('certified')}</Badge>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-semibold">
                  <StarRating rating={Number(guide.avg_rating) || 4.8} count={guide.total_reviews} size="md" />
                  <span className="text-muted-foreground hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span>{t('experience_years', { years: guide.experience_years })}</span>
                  </span>
                </div>

                {guide.profile.preferred_lang && (
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t('exchange_language')} <span className="text-foreground font-bold capitalize">{guide.profile.preferred_lang}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Action buttons on Top */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0 self-center">
              <button
                onClick={toggleFavorite}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:border-primary transition-colors cursor-pointer"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{isFavorite ? t('in_favorites') : t('add_to_favorites')}</span>
              </button>
              <button
                onClick={shareGuide}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:border-primary transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>{t('share_guide')}</span>
              </button>
              <AuthGuardLink
                href={`/booking/${guide.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition-all"
              >
                <span>{t('book_guide')}</span>
              </AuthGuardLink>
            </div>
          </div>
        </section>

        {/* Main Grid Content */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Left column: Bio, Specialties, Languages, Zones */}
          <div className="lg:col-span-8 space-y-8">
            {/* Bio Section */}
            <div className="app-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-foreground">
                  <Compass className="h-5 w-5 text-primary" />
                  <span>{t('about_guide')}</span>
                </h3>
                <TextToSpeech text={guide.profile.bio || t('default_bio')} className="min-h-9 px-3 text-xs" />
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line font-medium">
                {guide.profile.bio || t('default_bio')}
              </p>
            </div>

            {/* Details Section */}
            <div className="app-card p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-xl font-bold text-foreground">{t('skills_and_zones')}</h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Languages */}
                <div className="space-y-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Languages className="h-4 w-4 text-primary" />
                    <span>{t('spoken_languages')}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {guide.languages.length > 0 ? (
                      guide.languages.map((l) => (
                        <span key={l} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
                          {l}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">{t('not_specified')}</span>
                    )}
                  </div>
                </div>

                {/* Zones */}
                <div className="space-y-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{t('coverage_zones')}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {guide.coverage_zones.length > 0 ? (
                      guide.coverage_zones.map((z) => (
                        <span key={z} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
                          {z}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">{t('all_zones')}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Compass className="h-4 w-4 text-primary" />
                  <span>{t('tourist_specialties')}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {guide.specialties.length > 0 ? (
                    guide.specialties.map((s) => (
                      <span key={s} className="rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-white shadow-xs">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-primary px-3.5 py-1 text-xs font-bold text-white">
                      {t('default_specialty')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="app-card p-6 sm:p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{t('planned_availabilities')}</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {t('availability_sub')}
              </p>
              
              {guide.availability && guide.availability.length > 0 ? (
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 pt-2">
                  {guide.availability.map((av) => {
                    const dateObj = new Date(av.available_date)
                    return (
                      <div 
                        key={av.available_date}
                        className="rounded-2xl border border-border bg-muted/40 p-3 text-center"
                      >
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">
                          {dateObj.toLocaleDateString(undefined, { weekday: 'short' })}
                        </p>
                        <p className="text-base font-bold text-foreground font-serif mt-0.5">
                          {dateObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">{t('available')}</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">{t('on_request')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Tariff, Report Guide, Safety tips */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Pricing Details Card */}
            <div className="app-card p-6 space-y-6">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2 text-foreground">
                <BadgeCent className="h-5 w-5 text-primary" />
                <span>{t('indicative_pricing')}</span>
              </h3>
              
              <div className="space-y-3 text-xs">
                {guide.full_day_rate && (
                  <div className="flex justify-between items-center pb-2.5 border-b border-border">
                    <span className="font-medium text-muted-foreground">{t('full_day')}</span>
                    <span className="font-bold text-foreground text-sm">
                      {Number(guide.full_day_rate).toLocaleString()} XOF
                    </span>
                  </div>
                )}

                {guide.half_day_rate && (
                  <div className="flex justify-between items-center pb-2.5 border-b border-border">
                    <span className="font-medium text-muted-foreground">{t('half_day')}</span>
                    <span className="font-bold text-foreground text-sm">
                      {Number(guide.half_day_rate).toLocaleString()} XOF
                    </span>
                  </div>
                )}

                {guide.hourly_rate && (
                  <div className="flex justify-between items-center pb-2.5 border-b border-border">
                    <span className="font-medium text-muted-foreground">{t('hourly_rate')}</span>
                    <span className="font-bold text-foreground text-sm">
                      {Number(guide.hourly_rate).toLocaleString()} XOF
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-muted/40 p-4 border border-border flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t('secure_payment_note')}
                </p>
              </div>
              
              <AuthGuardLink
                href={`/booking/${guide.id}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-bold text-white shadow-md hover:bg-primary-dark transition-all text-sm"
              >
                <span>{t('quote_request')}</span>
              </AuthGuardLink>
            </div>

            {/* Safety & Trust Card */}
            <div className="app-card p-6 space-y-3">
              <h4 className="font-serif text-sm font-bold flex items-center gap-1.5 text-foreground">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{t('trust_charter')}</span>
              </h4>
              <ul className="text-xs space-y-2 text-muted-foreground font-medium pl-1.5 list-disc list-inside">
                <li>{t('trust_1')}</li>
                <li>{t('trust_2')}</li>
                <li>{t('trust_3')}</li>
                <li>{t('trust_4')}</li>
              </ul>
            </div>

            {/* Report Action Card */}
            <div className="app-card p-5 space-y-3 border-red-300 bg-red-50/20 dark:bg-red-950/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h4 className="font-serif text-sm font-bold text-red-700 dark:text-red-300">{t('report_profile')}</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('report_sub')}
              </p>
              
              {reportSuccess ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-600">
                  {t('report_success')}
                </div>
              ) : (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500 hover:text-white transition-all w-full cursor-pointer"
                >
                  {t('report_guide')}
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
