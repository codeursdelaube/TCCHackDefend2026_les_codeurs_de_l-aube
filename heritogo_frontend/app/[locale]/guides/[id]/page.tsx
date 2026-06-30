'use client'

/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getInitials } from '@/lib/auth/redirect'
import { COLORS } from '@/lib/constants/colors'
import { 
  Star, Compass, MapPin, ShieldCheck, Heart, 
  AlertCircle, Loader2, ArrowLeft, Calendar, BadgeCent, 
  Briefcase, AlertTriangle, CheckCircle, 
  Languages
} from 'lucide-react'
import ReportModal from '@/components/ReportModal'
import TextToSpeech from '@/components/TextToSpeech'
import { getUserFriendlyError } from '@/lib/utils/errors'

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
    try {
      const favs = localStorage.getItem('heritogo_favorites')
      if (!favs) return false
      return (JSON.parse(favs) as string[]).includes(guideId || '')
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!guideId) return

    const fetchGuideDetails = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/guides/${guideId}`)
        const data = await response.json()
        if (!response.ok) {
          setError(data.error || 'Erreur lors de la récupération du guide')
          return
        }
        setGuide(data.guide)
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
    const favs = localStorage.getItem('heritogo_favorites')
    let favList: string[] = favs ? JSON.parse(favs) : []
    
    if (favList.includes(guideId)) {
      favList = favList.filter(id => id !== guideId)
      setIsFavorite(false)
    } else {
      favList.push(guideId)
      setIsFavorite(true)
    }
    localStorage.setItem('heritogo_favorites', JSON.stringify(favList))
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" style={{ color: COLORS.forest }} />
          <p className="text-sm font-semibold text-base-content/60">Chargement du profil de votre guide...</p>
        </div>
      </div>
    )
  }

  if (error || !guide) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center bg-base-100">
        <AlertCircle className="mx-auto h-12 w-12 text-error mb-4" />
        <h2 className="font-serif text-2xl font-bold mb-2">Guide introuvable</h2>
        <p className="text-sm text-base-content/60 mb-6">{error || 'Le guide demandé n\'existe pas ou a été désactivé.'}</p>
        <Link 
          href="/guides"
          className="btn btn-primary rounded-2xl text-white border-none font-bold"
          style={{ backgroundColor: COLORS.forest }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour à l'annuaire
        </Link>
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-24 text-base-content sm:px-6 lg:px-8 bg-base-100">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          href="/guides" 
          className="inline-flex items-center gap-2 text-xs font-bold text-base-content/60 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux guides
        </Link>
      </div>

      {/* Header Profile Banner */}
      <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-emerald-950/20 via-base-200 to-base-200 border border-border p-6 sm:p-8 md:p-10 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div 
              className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-3xl text-2xl sm:text-3xl font-black text-white shadow-md relative"
              style={{ backgroundColor: COLORS.forest }}
            >
              {guide.profile.avatar_url ? (
                <Image
                  src={guide.profile.avatar_url}
                  alt={guide.profile.full_name}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover rounded-3xl"
                />
              ) : (
                getInitials(guide.profile.full_name)
              )}
              <div className="absolute -bottom-1 -right-1 bg-success text-white p-1 rounded-xl border-4 border-base-200">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="font-serif text-3xl font-bold tracking-tight">
                  {guide.profile.full_name}
                </h1>
                <span className="badge badge-success badge-md text-white font-extrabold uppercase py-3 px-2.5 rounded-lg text-[10px]">
                  Guide Certifié
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-base-content/75 font-semibold">
                <span className="flex items-center gap-1">
                  <Star className="h-4.5 w-4.5 fill-current text-amber-500" />
                  <span className="font-black text-base-content text-sm">{Number(guide.avg_rating).toFixed(1)}</span>
                  <span className="text-base-content/50">({guide.total_reviews} avis)</span>
                </span>
                <span className="text-base-content/25 hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-base-content/65">
                  <Briefcase className="h-4 w-4" />
                  {guide.experience_years} {guide.experience_years > 1 ? 'ans d\'expérience' : 'an d\'expérience'}
                </span>
              </div>

              {guide.profile.preferred_lang && (
                <p className="text-xs font-semibold text-base-content/60">
                  Langue préférée de communication : <span className="text-base-content font-bold capitalize">{guide.profile.preferred_lang}</span>
                </p>
              )}
            </div>
          </div>

          {/* Action buttons on Top */}
          <div className="flex sm:flex-row md:flex-col lg:flex-row gap-3 w-full sm:w-auto shrink-0 self-center">
            <button
              onClick={toggleFavorite}
              className="btn btn-outline rounded-2xl flex-1 sm:flex-initial text-xs font-bold gap-2"
            >
              <Heart className={`h-4.5 w-4.5 transition-colors ${isFavorite ? 'fill-red-500 stroke-red-500' : ''}`} />
              {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
            </button>
            <Link
              href={`/booking/${guide.id}`}
              className="btn text-white rounded-2xl border-none font-bold shadow-md hover:shadow-lg transition-all flex-1 sm:flex-initial"
              style={{ backgroundColor: COLORS.forest }}
            >
              Réserver ce guide
            </Link>
          </div>

        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left column: Bio, Specialties, Languages, Zones */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio Section */}
          <div className="rounded-[28px] border border-border bg-base-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" style={{ color: COLORS.forest }} />
                À propos de {guide.profile.full_name}
              </h3>
              <TextToSpeech text={guide.profile.bio || 'Ce guide certifié n\'a pas encore fourni de description détaillée, mais a été validé par notre équipe pour assurer des visites touristiques authentiques et sécurisées.'} className="w-fit min-h-10 px-4 py-2 text-xs" />
            </div>
            <p className="text-sm leading-6 text-base-content/85 whitespace-pre-line font-medium">
              {guide.profile.bio || 'Ce guide certifié n\'a pas encore fourni de description détaillée, mais a été validé par notre équipe pour assurer des visites touristiques authentiques et sécurisées.'}
            </p>
          </div>

          {/* Details Section */}
          <div className="rounded-[28px] border border-border bg-base-200 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-serif text-xl font-bold mb-2">Compétences & Zones</h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Languages */}
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-base-content/50">
                  <Languages className="h-4 w-4" /> Langues parlées
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {guide.languages.length > 0 ? (
                    guide.languages.map((l) => (
                      <span key={l} className="badge bg-base-100 border-border text-base-content font-bold px-3 py-2.5 rounded-lg text-xs">
                        {l}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-base-content/50 italic">Non spécifié</span>
                  )}
                </div>
              </div>

              {/* Zones */}
              <div className="space-y-2">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-base-content/50">
                  <MapPin className="h-4 w-4" /> Zones de couverture
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {guide.coverage_zones.length > 0 ? (
                    guide.coverage_zones.map((z) => (
                      <span key={z} className="badge bg-base-100 border-border text-base-content font-bold px-3 py-2.5 rounded-lg text-xs">
                        {z}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-base-content/50 italic">Toutes les zones</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border/55 pt-6">
              <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-base-content/50 mb-3">
                <Compass className="h-4 w-4" /> Spécialités touristiques
              </span>
              <div className="flex flex-wrap gap-2">
                {guide.specialties.length > 0 ? (
                  guide.specialties.map((s) => (
                    <span key={s} className="badge text-white font-extrabold px-3.5 py-3 rounded-xl text-xs border-none shadow-sm" style={{ backgroundColor: COLORS.rust }}>
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="badge bg-base-100 border-border text-base-content font-bold px-3 py-2.5 rounded-lg text-xs">
                    Tourisme Culturel
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Availability Calendar */}
          <div className="rounded-[28px] border border-border bg-base-200 p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif text-xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" style={{ color: COLORS.forest }} />
              Disponibilités planifiées
            </h3>
            <p className="text-xs text-base-content/65 mb-4">
              Voici les prochaines dates de disponibilité confirmées par ce guide. Vous pouvez soumettre une demande pour ces créneaux.
            </p>
            
            {guide.availability && guide.availability.length > 0 ? (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 pt-2">
                {guide.availability.map((av) => {
                  const dateObj = new Date(av.available_date)
                  return (
                    <div 
                      key={av.available_date}
                      className="rounded-2xl border border-border bg-base-100 p-3 text-center shadow-xs"
                    >
                      <p className="text-[10px] font-black uppercase text-base-content/40">
                        {dateObj.toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </p>
                      <p className="text-base font-extrabold text-base-content mt-0.5">
                        {dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[9px] font-black text-emerald-600 mt-1 uppercase">Disponible</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-base-100 p-6 text-center">
                <p className="text-sm font-semibold text-base-content/50">Aucune date planifiée spécifique.</p>
                <p className="text-xs text-base-content/40 mt-1">Vous pouvez quand même effectuer une demande de réservation libre en cliquant sur Réserver.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Tariff, Report Guide, Safety tips */}
        <div className="space-y-8">
          {/* Pricing Details Card */}
          <div className="rounded-[28px] border border-border bg-base-200 p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-lg font-bold flex items-center gap-2">
              <BadgeCent className="h-5 w-5 text-primary" style={{ color: COLORS.forest }} />
              Grille tarifaire indicative
            </h3>
            
            <div className="space-y-4">
              {guide.full_day_rate && (
                <div className="flex justify-between items-center pb-3 border-b border-border/55">
                  <span className="text-sm font-medium text-base-content/75">Journée complète</span>
                  <span className="font-black text-base-content text-base">
                    {Number(guide.full_day_rate).toLocaleString()} XOF
                  </span>
                </div>
              )}

              {guide.half_day_rate && (
                <div className="flex justify-between items-center pb-3 border-b border-border/55">
                  <span className="text-sm font-medium text-base-content/75">Demi-journée</span>
                  <span className="font-black text-base-content text-base">
                    {Number(guide.half_day_rate).toLocaleString()} XOF
                  </span>
                </div>
              )}

              {guide.hourly_rate && (
                <div className="flex justify-between items-center pb-3 border-b border-border/55">
                  <span className="text-sm font-medium text-base-content/75">Tarif Horaire</span>
                  <span className="font-black text-base-content text-base">
                    {Number(guide.hourly_rate).toLocaleString()} XOF
                  </span>
                </div>
              )}

              {guide.virtual_rate && (
                <div className="flex justify-between items-center pb-3 border-b border-border/55">
                  <span className="text-sm font-medium text-base-content/75">Visite virtuelle</span>
                  <span className="font-black text-base-content text-base">
                    {Number(guide.virtual_rate).toLocaleString()} XOF
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-base-100 p-4 border border-border/60">
              <p className="text-xs text-base-content/70 leading-5">
                💡 Les tarifs sont fixés par le guide et peuvent varier légèrement selon la complexité du circuit proposé ou le nombre de personnes.
              </p>
            </div>
            
            <Link
              href={`/booking/${guide.id}`}
              className="btn btn-block text-white rounded-2xl border-none font-bold"
              style={{ backgroundColor: COLORS.forest }}
            >
              Faire une demande de devis
            </Link>
          </div>

          {/* Safety & Trust Card */}
          <div className="rounded-[28px] border border-border bg-base-200 p-6 shadow-sm space-y-4">
            <h4 className="font-serif text-sm font-bold flex items-center gap-1.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />
              Charte confiance Heritogo
            </h4>
            <ul className="text-xs space-y-2.5 text-base-content/70 font-semibold pl-1.5 list-disc list-inside">
              <li>Identité et casier vérifiés par nos soins.</li>
              <li>Paiement sécurisé via Flooz ou TMoney.</li>
              <li>Fonds bloqués jusqu'à la fin de la mission.</li>
              <li>Assistance Heritogo 24h/7j en cas de besoin.</li>
            </ul>
          </div>

          {/* Report Action Card */}
          <div className="rounded-[28px] border border-red-500/20 bg-red-500/5 p-6 shadow-sm space-y-4 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <AlertTriangle className="h-5 w-5 text-error" />
              <h4 className="font-serif text-sm font-bold text-error">Un problème avec ce profil ?</h4>
            </div>
            <p className="text-xs text-base-content/65 leading-5 font-semibold">
              Si vous constatez un profil suspect, de fausses informations, ou si le guide a eu un comportement inapproprié, signalez-le immédiatement.
            </p>
            
            {reportSuccess ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-xs font-bold text-emerald-600">
                Signalement envoyé avec succès. Merci !
              </div>
            ) : (
              <button
                onClick={() => setIsReportOpen(true)}
                className="btn btn-outline btn-error btn-sm rounded-xl w-full text-xs font-bold gap-1.5 active:scale-95"
              >
                Signaler ce guide
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Report Modal Component */}
      <ReportModal
        reportedId={guide.id}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={() => setReportSuccess(true)}
      />
    </main>
  )
}
