'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, BedDouble, Camera, Check, ChevronDown, ChevronUp,
  Clock, Compass, Eye, Footprints, Headphones, History, Info,
  MapPin, Navigation, Pause, Play, Share2, ShieldCheck,
  ShoppingBag, Landmark, Sun, Utensils, Users, ArrowRight, Loader2,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import AuthGuardLink from '@/components/AuthGuardLink'
import hotels from '@/app/nearbyhotels/hotels'
import { getSiteRating } from '@/lib/constants/ratings'
import { getSiteExtraDetails, SiteActivity } from '@/lib/constants/siteDetails'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'
import { useDishes, usePlaces } from '@/hooks/useCatalog'
import { findLocalPlace } from '@/lib/catalog/places'

const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-border bg-card animate-pulse">
      <span className="text-xs font-semibold text-muted-foreground">
        Chargement de la carte interactive…
      </span>
    </div>
  ),
})

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

function ActivityIcon({ icon }: { icon: SiteActivity['icon'] }) {
  switch (icon) {
    case 'camera': return <Camera className="h-4 w-4 text-primary" />
    case 'footsteps': return <Footprints className="h-4 w-4 text-primary" />
    case 'eye': return <Eye className="h-4 w-4 text-primary" />
    case 'compass': return <Compass className="h-4 w-4 text-primary" />
    case 'shopping': return <ShoppingBag className="h-4 w-4 text-primary" />
    case 'sparkles': return <Landmark className="h-4 w-4 text-primary" />
    case 'history': return <History className="h-4 w-4 text-primary" />
    case 'sun': return <Sun className="h-4 w-4 text-primary" />
    default: return <Landmark className="h-4 w-4 text-primary" />
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

const TABS = ['apercu', 'activites', 'guide_pratique', 'carte', 'similaires'] as const
type Tab = (typeof TABS)[number]

export default function SiteDetailPage({ params }: PageProps) {
  const t = useTranslations('Lieux')
  const locale = useLocale()
  const resolvedParams = use(params)
  const { places, loading: placesLoading } = usePlaces()
  const { dishes } = useDishes()
  const site =
    places.find((item) => item.id === resolvedParams.id || item.slug === resolvedParams.id) ||
    findLocalPlace(resolvedParams.id, locale)

  const [activeTab, setActiveTab] = useState<Tab>('apercu')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [selectedLang, setSelectedLang] = useState('fr-FR')
  const [showFullText, setShowFullText] = useState(false)
  const [copied, setCopied] = useState(false)

  const siteLat = Number(site?.lat)
  const siteLng = Number(site?.lng)
  const siteName = site?.nom || ''
  const siteDescription = site?.description || ''
  const siteHistory = site?.histoire || ''

  const ratingData = getSiteRating(resolvedParams.id)
  const extraDetails = getSiteExtraDetails(resolvedParams.id, site?.région || 'Maritime')
  const isKoutammakou = site?.isUnesco || resolvedParams.id === 'koutamakou'

  const relatedDishes = dishes.filter((p) => (site?.relatedDishSlugs || extraDetails.dishesIds).includes(p.id))

  const getRegionName = (region: string): string => {
    switch (region) {
      case 'Maritime': return t('regions.maritime')
      case 'Plateaux': return t('regions.plateaux')
      case 'Kara': return t('regions.kara')
      case 'Centrale': return t('regions.centrale')
      case 'Savanes': return t('regions.savanes')
      default: return region
    }
  }

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
    } else {
      window.speechSynthesis.cancel()
      const text = `${siteName}. ${siteDescription}. ${siteHistory}`
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedLang
      utterance.rate = 0.95
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
      setIsPlayingAudio(true)
    }
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: siteName, url })
      } catch {}
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const nearbyHotels = hotels
    .map((hotel) => ({ ...hotel, distance_km: haversine(siteLat, siteLng, hotel.lat, hotel.lng) }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 3)

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${siteLat},${siteLng}`
  const previewSites = places.filter((m) => m.id !== site?.id && m.région === site?.région).slice(0, 4)
  const otherSites = previewSites.length > 0 ? previewSites : places.filter((m) => m.id !== site?.id).slice(0, 4)

  const tabLabels: Record<Tab, string> = {
    apercu: t('tab_apercu'),
    activites: t('tab_activites'),
    guide_pratique: t('tab_guide_pratique'),
    carte: t('tab_carte'),
    similaires: t('tab_similaires'),
  }

  if (!site && placesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!site) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background pb-28 pt-8 text-foreground">
      {/* ── HERO PHOTO plein format ── */}
      <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8">
        <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-border sm:h-96 md:h-[420px] shadow-lg">
          <Image
            src={site.image}
            alt={siteName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

          {/* Bouton retour */}
          <div className="absolute left-4 top-4 z-10">
            <Link
              href="/lieux"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* Bouton Partager */}
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              onClick={share}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Titre & Note en bas du hero */}
          <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              {isKoutammakou ? (
                <Badge variant="unesco">{t('unesco_badge_full')}</Badge>
              ) : (
                <Badge variant="primary">{getRegionName(site.région)}</Badge>
              )}
              <span className="text-xs font-semibold text-white/90">
                · {site.localite}
              </span>
            </div>

            <h1 className="font-serif text-2xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl drop-shadow-sm">
              {siteName}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <StarRating rating={ratingData.rating} count={ratingData.count} size="md" />
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                {ratingData.rating} / 5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── CORPS DE LA PAGE ── */}
      <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Tags d'intérêt touristique */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {extraDetails.tags.map((tag) => (
            <span
              key={tag}
              className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-bold text-foreground shadow-xs"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Bouton GPS & Itinéraire principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-bold text-white shadow-md transition hover:bg-primary-dark active:scale-[0.98]"
          >
            <Navigation className="h-4 w-4" />
            <span>{t('gps_button')}</span>
          </a>

          <AuthGuardLink
            href="/guides"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 font-bold text-foreground transition hover:border-primary hover:text-primary active:scale-[0.98] shadow-xs"
          >
            <Users className="h-4 w-4 text-primary" />
            <span>{t('reserve_guide_here')}</span>
          </AuthGuardLink>
        </div>

        {/* Onglets de navigation interactifs */}
        <div className="flex gap-2 overflow-x-auto border-b border-border pb-2 scrollbar-none sticky top-14 bg-background/95 backdrop-blur-md z-20 pt-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════
            TAB 1: APERÇU GÉNÉRAL & NARRATION
        ══════════════════════════════════════════════════ */}
        {activeTab === 'apercu' && (
          <div className="space-y-6">
            {/* Audioguide TTS interactif compact */}
            <div className="app-card flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-xs shrink-0">
                  <Headphones className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary truncate">{t('vocal_narration')}</p>
                  <p className="text-sm font-bold text-foreground font-serif truncate">{t('listen_monument')}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                {['fr-FR', 'en-US', 'es-ES'].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setSelectedLang(l)
                      if (isPlayingAudio) {
                        window.speechSynthesis.cancel()
                        setIsPlayingAudio(false)
                      }
                    }}
                    className={`rounded-lg px-2 py-1 text-[11px] font-bold cursor-pointer transition-all ${
                      selectedLang === l
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-card text-muted-foreground border border-border hover:border-primary/50'
                    }`}
                  >
                    {l.split('-')[0].toUpperCase()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={toggleAudio}
                  aria-label={isPlayingAudio ? 'Pause' : 'Play'}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-white transition hover:scale-105 active:scale-95 cursor-pointer shadow-md ml-1 shrink-0"
                >
                  {isPlayingAudio ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Barre audio animée */}
            {isPlayingAudio && (
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[40, 75, 90, 60, 100, 45, 80, 65, 95, 50, 70, 85, 60, 90].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-primary animate-pulse"
                    style={{ height: `${h}%`, maxHeight: '24px', minHeight: '6px', animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            )}

            {/* Fiche Description & Histoire */}
            <div className="app-card p-6 space-y-4">
              <h2 className="font-serif text-xl font-bold text-foreground">{t('desc_title')}</h2>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-medium">
                {siteDescription}
              </p>
              {siteHistory && (
                <div className={`mt-4 pt-4 border-t border-border space-y-2 ${showFullText ? 'block' : 'hidden'}`}>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">{t('history_extended')}</p>
                  <p className="text-sm sm:text-base leading-relaxed text-muted-foreground font-medium">
                    {siteHistory}
                  </p>
                </div>
              )}
              {siteHistory && (
                <button
                  type="button"
                  onClick={() => setShowFullText(!showFullText)}
                  className="pt-2 flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {showFullText ? (
                    <><span>{t('read_less')}</span><ChevronUp className="h-3.5 w-3.5" /></>
                  ) : (
                    <><span>{t('read_more')}</span><ChevronDown className="h-3.5 w-3.5" /></>
                  )}
                </button>
              )}
            </div>

            {/* Expériences recommandées */}
            <div className="app-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-foreground">
                  {t('recommended_experiences')}
                </h2>
                <button
                  onClick={() => setActiveTab('activites')}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {t('see_all_activities', { count: extraDetails.activities.length })}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {extraDetails.activities.slice(0, 2).map((act, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4 border border-border">
                    <div className="p-2.5 rounded-xl bg-card border border-border shrink-0 mt-0.5">
                      <ActivityIcon icon={act.icon} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-snug">{act.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spécialités culinaires à proximité */}
            {relatedDishes.length > 0 && (
              <div className="app-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    <h2 className="font-serif text-xl font-bold text-foreground">
                      {t('eat_nearby')}
                    </h2>
                  </div>
                  <Link href="/cuisine" className="text-xs font-bold text-primary hover:underline">
                    {t('gastro_guide')}
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedDishes.map((dish) => (
                    <Link
                      key={dish.id}
                      href={`/cuisine/${dish.id}`}
                      className="group overflow-hidden rounded-2xl border border-border bg-card hover:shadow-md transition-all"
                    >
                      <div className="relative h-28 overflow-hidden">
                        <Image
                          src={dish.image}
                          alt={dish.nom}
                          fill
                          sizes="200px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3">
                        <p className="truncate text-xs font-bold text-foreground">{dish.nom}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{dish.catégorie}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Hôtels & Hébergements proches */}
            {nearbyHotels.length > 0 && (
              <div className="app-card p-6 space-y-4">
                <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-foreground">
                  <BedDouble className="h-5 w-5 text-primary" />
                  {t('hotels_nearby')}
                </h2>
                <div className="space-y-2.5">
                  {nearbyHotels.map((hotel) => (
                    <div key={hotel.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3.5 text-xs">
                      <div>
                        <p className="font-bold text-foreground text-sm">{hotel.nom}</p>
                        <p className="text-muted-foreground">{formatDistance(hotel.distance_km)} {t('distance')}</p>
                      </div>
                      <span className="font-bold text-primary text-sm">{hotel.nuit_fcfa_min.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avis Voyageurs */}
            <div className="app-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-foreground">{t('explorer_reviews')}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={ratingData.rating} count={ratingData.count} size="md" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {extraDetails.reviews.map((rev, i) => (
                  <div key={i} className="rounded-2xl bg-card p-4 border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{rev.author} <span className="text-[11px] text-muted-foreground font-normal">({rev.origin})</span></span>
                      <span className="text-[11px] text-muted-foreground">{rev.date}</span>
                    </div>
                    <StarRating rating={rev.rating} size="sm" showCount={false} />
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed font-medium">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 2: ACTIVITÉS & QUE FAIRE SUR PLACE
        ══════════════════════════════════════════════════ */}
        {activeTab === 'activites' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">{t('things_to_do')}</h2>
              <p className="text-sm text-muted-foreground">{t('things_to_do_sub')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {extraDetails.activities.map((act, i) => (
                <div key={i} className="app-card p-5 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-primary/10 shrink-0">
                      <ActivityIcon icon={act.icon} />
                    </div>
                    <h3 className="font-bold text-base text-foreground font-serif">{act.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground font-medium pl-11">{act.desc}</p>
                </div>
              ))}
            </div>

            {/* Bannière guide */}
            <div className="app-card p-6 border-primary/30 bg-gradient-to-r from-primary/10 via-card to-accent/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold uppercase text-primary flex items-center justify-center sm:justify-start gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> {t('certified_guide_badge')}
                </p>
                <p className="text-base font-bold text-foreground font-serif">{t('guided_tour_title')}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{t('guided_tour_desc')}</p>
              </div>
              <AuthGuardLink
                href="/guides"
                className="shrink-0 rounded-full bg-primary px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition-all"
              >
                {t('find_guide_btn')}
              </AuthGuardLink>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: GUIDE PRATIQUE & CONSEILS TOURISTES
        ══════════════════════════════════════════════════ */}
        {activeTab === 'guide_pratique' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">{t('practical_tips')}</h2>
              <p className="text-sm text-muted-foreground">{t('practical_tips_sub')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="app-card p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                  <Sun className="h-4 w-4" />
                  <span>{t('best_time_title')}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{site.bestTime || extraDetails.practicalInfo.bestTime}</p>
              </div>

              <div className="app-card p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                  <Clock className="h-4 w-4" />
                  <span>{t('duration_title')}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{site.duration || extraDetails.practicalInfo.duration}</p>
              </div>

              <div className="app-card p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                  <Footprints className="h-4 w-4" />
                  <span>{t('outfit_title')}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{site.outfit || extraDetails.practicalInfo.outfit}</p>
              </div>

              <div className="app-card p-5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
                  <Navigation className="h-4 w-4" />
                  <span>{t('access_title')}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{site.access || extraDetails.practicalInfo.access}</p>
              </div>
            </div>

            <div className="app-card p-5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                <Info className="h-4 w-4 text-primary" />
                <span>{t('fee_title')}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{site.fee || extraDetails.practicalInfo.fee}</p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 4: CARTE & GPS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'carte' && (
          <div className="space-y-4">
            <div className="app-card overflow-hidden p-2">
              <div className="overflow-hidden rounded-2xl border border-border">
                <DynamicCarte monumentsList={[site]} />
              </div>
            </div>

            <div className="app-card flex items-center justify-between p-4 text-xs">
              <span className="text-muted-foreground">{t('gps_coords')} <strong className="text-foreground">{siteLat.toFixed(5)}, {siteLng.toFixed(5)}</strong></span>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary hover:underline"
              >
                {t('start_nav')}
              </a>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 5: SITES SIMILAIRES & PROCHES
        ══════════════════════════════════════════════════ */}
        {activeTab === 'similaires' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">{t('other_treasures')}</h2>
              <p className="text-sm text-muted-foreground">{t('continue_explore', { city: site.localite })}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {otherSites.map((ps) => {
                const pr = getSiteRating(ps.id)
                return (
                  <Link
                    key={ps.id}
                    href={`/lieux/${ps.id}`}
                    className="app-card group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <Image
                        src={ps.image}
                        alt={ps.nom}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-md">
                        {ps.localite}
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <p className="truncate text-base font-bold font-serif">{ps.nom}</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between border-t border-border">
                      <StarRating rating={pr.rating} count={pr.count} />
                      <span className="text-xs font-bold text-primary flex items-center gap-1">
                        <span>{t('explore_link')}</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
