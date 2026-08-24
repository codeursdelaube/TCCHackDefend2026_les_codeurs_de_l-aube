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
    if (!guideId) return

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
  }, [guideId])

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Chargement du profil de votre guide...</p>
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
          Guide momentanément indisponible
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Erreur de chargement. Vérifiez votre connexion internet
          et réessayez dans quelques instants.
        </p>
        <Link
          href="/guides"
          className="rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-dark mt-2"
        >
          ← Retour à l'annuaire
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
            <span>Retour aux guides</span>
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
                  <Badge variant="forest">Guide Certifié</Badge>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-semibold">
                  <StarRating rating={Number(guide.avg_rating) || 4.8} count={guide.total_reviews} size="md" />
                  <span className="text-muted-foreground hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span>{guide.experience_years} {guide.experience_years > 1 ? 'ans d’expérience' : 'an d’expérience'}</span>
                  </span>
                </div>

                {guide.profile.preferred_lang && (
                  <p className="text-xs font-semibold text-muted-foreground">
                    Langue d’échange : <span className="text-foreground font-bold capitalize">{guide.profile.preferred_lang}</span>
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
                <span>{isFavorite ? 'Favori' : 'Ajouter aux favoris'}</span>
              </button>
              <button
                onClick={shareGuide}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:border-primary transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Partager</span>
              </button>
              <AuthGuardLink
                href={`/booking/${guide.id}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition-all"
              >
                <span>Réserver ce guide</span>
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
                  <span>À propos de {guide.profile.full_name}</span>
                </h3>
                <TextToSpeech text={guide.profile.bio || 'Guide certifié togolais validé pour assurer des visites authentiques et sécurisées.'} className="min-h-9 px-3 text-xs" />
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line font-medium">
                {guide.profile.bio || 'Ce guide certifié a été validé par notre équipe pour assurer des visites touristiques et patrimoniales immersives, sécurisées et authentiques.'}
              </p>
            </div>

            {/* Details Section */}
            <div className="app-card p-6 sm:p-8 space-y-6">
              <h3 className="font-serif text-xl font-bold text-foreground">Compétences & Zones</h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Languages */}
                <div className="space-y-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Languages className="h-4 w-4 text-primary" />
                    <span>Langues parlées</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {guide.languages.length > 0 ? (
                      guide.languages.map((l) => (
                        <span key={l} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
                          {l}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Non spécifié</span>
                    )}
                  </div>
                </div>

                {/* Zones */}
                <div className="space-y-2">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Zones de couverture</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {guide.coverage_zones.length > 0 ? (
                      guide.coverage_zones.map((z) => (
                        <span key={z} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
                          {z}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Toutes les zones</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Compass className="h-4 w-4 text-primary" />
                  <span>Spécialités touristiques</span>
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
                      Tourisme Culturel & Nature
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="app-card p-6 sm:p-8 space-y-4">
              <h3 className="font-serif text-xl font-bold flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Disponibilités prévues</span>
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Dates confirmées par le guide. Vous pouvez également soumettre une demande libre.
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
                          {dateObj.toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </p>
                        <p className="text-base font-bold text-foreground font-serif mt-0.5">
                          {dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">Disponible</p>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">Réservation disponible sur demande libre.</p>
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
                <span>Grille tarifaire indicative</span>
              </h3>
              
              <div className="space-y-3 text-xs">
                {guide.full_day_rate && (
                  <div className="flex justify-between items-center pb-2.5 border-b border-border">
                    <span className="font-medium text-muted-foreground">Journée complète</span>
                    <span className="font-bold text-foreground text-sm">
                      {Number(guide.full_day_rate).toLocaleString()} XOF
                    </span>
                  </div>
                )}

                {guide.half_day_rate && (
                  <div className="flex justify-between items-center pb-2.5 border-b border-border">
                    <span className="font-medium text-muted-foreground">Demi-journée</span>
                    <span className="font-bold text-foreground text-sm">
                      {Number(guide.half_day_rate).toLocaleString()} XOF
                    </span>
                  </div>
                )}

                {guide.hourly_rate && (
                  <div className="flex justify-between items-center pb-2.5 border-b border-border">
                    <span className="font-medium text-muted-foreground">Tarif horaire</span>
                    <span className="font-bold text-foreground text-sm">
                      {Number(guide.hourly_rate).toLocaleString()} XOF
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-muted/40 p-4 border border-border flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Paiement sécurisé avec validation à la fin de la visite.
                </p>
              </div>
              
              <AuthGuardLink
                href={`/booking/${guide.id}`}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 font-bold text-white shadow-md hover:bg-primary-dark transition-all text-sm"
              >
                <span>Faire une demande de devis</span>
              </AuthGuardLink>
            </div>

            {/* Safety & Trust Card */}
            <div className="app-card p-6 space-y-3">
              <h4 className="font-serif text-sm font-bold flex items-center gap-1.5 text-foreground">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Charte confiance HeriTogo</span>
              </h4>
              <ul className="text-xs space-y-2 text-muted-foreground font-medium pl-1.5 list-disc list-inside">
                <li>Guide certifié et identité vérifiée.</li>
                <li>Paiement sécurisé (Flooz / T-Money).</li>
                <li>Fonds bloqués jusqu'à la fin de la visite.</li>
                <li>Assistance support HeriTogo 24h/7j.</li>
              </ul>
            </div>

            {/* Report Action Card */}
            <div className="app-card p-5 space-y-3 border-red-300 bg-red-50/20 dark:bg-red-950/10">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h4 className="font-serif text-sm font-bold text-red-700 dark:text-red-300">Signaler ce profil</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Un problème avec ce profil ou un comportement inapproprié ? Signalez-le à l’équipe.
              </p>
              
              {reportSuccess ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-600">
                  Signalement envoyé. Merci !
                </div>
              ) : (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="rounded-full border border-red-300 px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500 hover:text-white transition-all w-full cursor-pointer"
                >
                  Signaler ce guide
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
