'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, BedDouble, Camera, Check, ChevronDown, ChevronUp,
  Clock, Compass, Eye, Footprints, Headphones, Heart, History, Info,
  MapPin, MessageSquare, Navigation, Pause, Play, Share2, ShieldCheck,
  ShoppingBag, Landmark, Star, Sun, Utensils, Users
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { monuments } from '@/app/LieuxT/site'
import platsTogolais from '@/app/Plats/plat'
import hotels from '@/app/nearbyhotels/hotels'
import { getSiteRating } from '@/lib/constants/ratings'
import { getSiteExtraDetails, SiteActivity } from '@/lib/constants/siteDetails'

const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-border bg-secondary animate-pulse">
      <span className="text-xs font-semibold text-muted-foreground">Chargement de la carte interactive…</span>
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

function StarRow({ rating, count, size = 'sm' }: { rating: number; count?: number; size?: 'sm' | 'md' | 'lg' }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  const sz = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={sz}
            style={{
              fill: i <= full ? 'var(--primary)' : i === full + 1 && half ? 'var(--primary)' : 'transparent',
              color: i <= full || (i === full + 1 && half) ? 'var(--primary)' : 'var(--border)',
            }}
          />
        ))}
      </div>
      {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  )
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
  const tMonuments = useTranslations('Monuments')
  const tPlats = useTranslations('Plats')
  const resolvedParams = use(params)
  const site = monuments.find((item) => item.id === resolvedParams.id)
  if (!site) notFound()

  const [activeTab, setActiveTab] = useState<Tab>('apercu')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [selectedLang, setSelectedLang] = useState('fr-FR')
  const [showFullText, setShowFullText] = useState(false)
  const [copied, setCopied] = useState(false)

  const siteLat = Number(site.lat)
  const siteLng = Number(site.lng)
  const siteName = tMonuments(`${site.id}.nom`)
  const siteDescription = tMonuments(`${site.id}.description`)
  const siteHistory = tMonuments(`${site.id}.histoire`)

  const ratingData = getSiteRating(site.id)
  const extraDetails = getSiteExtraDetails(site.id, site.région)

  // Spécialités culinaires associées à ce site
  const relatedDishes = platsTogolais.filter((p) => extraDetails.dishesIds.includes(p.id))

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
  const previewSites = monuments.filter((m) => m.id !== site.id && m.région === site.région).slice(0, 4)
  const otherSites = previewSites.length > 0 ? previewSites : monuments.filter((m) => m.id !== site.id).slice(0, 4)

  const tabLabels: Record<Tab, string> = {
    apercu: 'Aperçu',
    activites: 'Que faire ici ?',
    guide_pratique: 'Guide Malin',
    carte: 'Carte & GPS',
    similaires: 'À proximité',
  }

  return (
    <main className="min-h-screen bg-card pb-28 pt-16 text-foreground">
      
      {/* ── HERO PHOTO plein format ── */}
      <div className="relative h-72 w-full overflow-hidden sm:h-80 md:h-96">
        <Image src={site.image} alt={siteName} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

        {/* Bouton retour */}
        <div className="absolute left-4 top-4 z-10">
          <Link
            href="/lieux"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card/95 text-foreground shadow-md transition hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        {/* Bouton Partager */}
        <div className="absolute right-4 top-4 z-10">
          <button
            type="button"
            onClick={share}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card/95 text-foreground shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Titre & Note en bas du hero */}
        <div className="absolute bottom-5 left-5 right-5 z-10 text-white space-y-1.5">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              {getRegionName(site.région)}
            </span>
            <span className="text-xs font-semibold text-white/90">
              · {site.localite}
            </span>
          </div>

          <h1 className="font-serif text-2xl font-bold leading-tight text-white sm:text-4xl drop-shadow-sm">
            {siteName}
          </h1>

          <div className="flex items-center gap-2 pt-0.5">
            <StarRow rating={ratingData.rating} count={ratingData.count} size="md" />
            <span className="rounded-lg bg-primary px-2 py-0.5 text-xs font-black text-white shadow-xs">
              {ratingData.rating} / 5
            </span>
          </div>
        </div>
      </div>

      {/* ── CORPS DE LA PAGE ── */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 space-y-6">

        {/* Tags d'intérêt touristique */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {extraDetails.tags.map((tag) => (
            <span
              key={tag}
              className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold text-foreground"
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
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-sm transition hover:brightness-110 active:scale-98"
            style={{ background: 'var(--primary)' }}
          >
            <Navigation className="h-4 w-4" />
            <span>Itinéraire Google Maps (GPS)</span>
          </a>

          <Link
            href="/guides"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary font-bold text-foreground transition hover:bg-primary active:scale-98"
          >
            <Users className="h-4 w-4 text-primary" />
            <span>Réserver un guide pour ce lieu</span>
          </Link>
        </div>

        {/* Onglets de navigation interactifs */}
        <div className="flex gap-0 overflow-x-auto border-b border-border scrollbar-none sticky top-14 bg-card/95 backdrop-blur-md z-20">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 border-b-2 px-4 py-3 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'border-border text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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

            {/* Audioguide TTS interactif */}
            <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary p-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-xs">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Narration Vocale</p>
                  <p className="text-sm font-black text-foreground">Écouter l&apos;histoire du monument</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                    className={`rounded-xl px-2 py-1 text-[11px] font-black cursor-pointer transition-all ${
                      selectedLang === l
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-card text-muted-foreground border border-border hover:border-border'
                    }`}
                  >
                    {l.split('-')[0].toUpperCase()}
                  </button>
                ))}
                <button
                  onClick={toggleAudio}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm ml-1"
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
                    style={{ height: `${h}%`, maxHeight: '20px', minHeight: '6px', animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            )}

            {/* Fiche Description & Histoire */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Présentation &amp; Histoire</h2>
              <p className="text-sm leading-relaxed text-foreground font-medium">
                {siteDescription}
              </p>
              {siteHistory && (
                <div className={`mt-3 pt-3 border-t border-border space-y-2 ${showFullText ? 'block' : 'hidden'}`}>
                  <p className="text-xs font-black uppercase tracking-wide text-primary">Contexte Historique</p>
                  <p className="text-sm leading-relaxed text-foreground font-medium">
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
                    <><span>Réduire</span><ChevronUp className="h-3.5 w-3.5" /></>
                  ) : (
                    <><span>Lire toute l&apos;histoire complète…</span><ChevronDown className="h-3.5 w-3.5" /></>
                  )}
                </button>
              )}
            </div>

            {/* Ce qu'il faut faire en bref */}
            <div className="rounded-2xl border border-border bg-secondary p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Expériences recommandées
                </h2>
                <button
                  onClick={() => setActiveTab('activites')}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Tout voir ({extraDetails.activities.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {extraDetails.activities.slice(0, 2).map((act, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-card p-3.5 border border-border">
                    <div className="p-2 rounded-xl bg-secondary shrink-0 mt-0.5">
                      <ActivityIcon icon={act.icon} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-snug">{act.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spécialités culinaires à proximité */}
            {relatedDishes.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-primary" />
                    <h2 className="text-xs font-black uppercase tracking-wider text-foreground">
                      À déguster dans les environs
                    </h2>
                  </div>
                  <Link href="/cuisine" className="text-xs font-bold text-primary hover:underline">
                    Guide gastronomique →
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {relatedDishes.map((dish) => (
                    <Link
                      key={dish.id}
                      href={`/cuisine/${dish.id}`}
                      className="group overflow-hidden rounded-xl border border-border bg-secondary hover:shadow-sm transition-all"
                    >
                      <div className="relative h-24 overflow-hidden">
                        <Image
                          src={dish.image}
                          alt={tPlats(`${dish.id}.nom`)}
                          fill
                          sizes="180px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2">
                        <p className="truncate text-xs font-bold text-foreground">{tPlats(`${dish.id}.nom`)}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{dish.catégorie}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Hôtels & Hébergements proches */}
            {nearbyHotels.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-foreground">
                  <BedDouble className="h-4 w-4 text-primary" />
                  {t('hotels_nearby')}
                </h2>
                <div className="space-y-2">
                  {nearbyHotels.map((hotel) => (
                    <div key={hotel.id} className="flex items-center justify-between rounded-xl bg-secondary p-3 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{hotel.nom}</p>
                        <p className="text-muted-foreground">{formatDistance(hotel.distance_km)} du monument</p>
                      </div>
                      <span className="font-bold text-primary">{hotel.nuit_fcfa_min.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Avis Voyageurs */}
            <div className="rounded-2xl border border-border bg-secondary p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-foreground">Avis des explorateurs</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <StarRow rating={ratingData.rating} count={ratingData.count} size="md" />
                    <span className="text-xs font-black text-primary">{ratingData.rating}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {extraDetails.reviews.map((rev, i) => (
                  <div key={i} className="rounded-xl bg-card p-3.5 border border-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{rev.author} <span className="text-[10px] text-muted-foreground font-normal">({rev.origin})</span></span>
                      <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                    </div>
                    <StarRow rating={rev.rating} size="sm" />
                    <p className="text-xs text-foreground leading-relaxed font-medium">{rev.comment}</p>
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
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground">Activités &amp; Choses à faire</h2>
              <p className="text-xs text-muted-foreground">Suggestions pour tirer le meilleur parti de votre visite sur ce site</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {extraDetails.activities.map((act, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-2 shadow-xs hover:border-border transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-secondary shrink-0">
                      <ActivityIcon icon={act.icon} />
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{act.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground pl-10 font-medium">{act.desc}</p>
                </div>
              ))}
            </div>

            {/* Bannière guide */}
            <div className="rounded-2xl border border-border bg-primary p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-black uppercase text-primary flex items-center justify-center sm:justify-start gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Guide Local Certifié
                </p>
                <p className="text-sm font-bold text-foreground">Vous souhaitez une visite guidée personnalisée ?</p>
                <p className="text-xs text-muted-foreground">Réservez un guide togolais certifié pour des explications immersives.</p>
              </div>
              <Link
                href="/guides"
                className="shrink-0 rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
                style={{ background: 'var(--primary)' }}
              >
                Trouver un guide
              </Link>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 3: GUIDE PRATIQUE & CONSEILS TOURISTES
        ══════════════════════════════════════════════════ */}
        {activeTab === 'guide_pratique' && (
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground">Conseils Pratiques du Voyageur</h2>
              <p className="text-xs text-muted-foreground">Toutes les informations utiles pour organiser votre venue sereinement</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-secondary p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-primary">
                  <Sun className="h-4 w-4" />
                  <span>Meilleur moment</span>
                </div>
                <p className="text-xs font-bold text-foreground">{extraDetails.practicalInfo.bestTime}</p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-primary">
                  <Clock className="h-4 w-4" />
                  <span>Durée recommandée</span>
                </div>
                <p className="text-xs font-bold text-foreground">{extraDetails.practicalInfo.duration}</p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-primary">
                  <Footprints className="h-4 w-4" />
                  <span>Tenue &amp; Équipement</span>
                </div>
                <p className="text-xs font-bold text-foreground">{extraDetails.practicalInfo.outfit}</p>
              </div>

              <div className="rounded-2xl border border-border bg-secondary p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-primary">
                  <Navigation className="h-4 w-4" />
                  <span>Accès &amp; Transport</span>
                </div>
                <p className="text-xs font-bold text-foreground">{extraDetails.practicalInfo.access}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-muted-foreground">
                <Info className="h-4 w-4 text-primary" />
                <span>Tarif &amp; Entrée</span>
              </div>
              <p className="text-xs font-bold text-foreground">{extraDetails.practicalInfo.fee}</p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 4: CARTE & GPS
        ══════════════════════════════════════════════════ */}
        {activeTab === 'carte' && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
              <DynamicCarte monumentsList={[site]} />
            </div>

            <div className="flex items-center justify-between rounded-xl bg-secondary p-3 text-xs">
              <span className="text-muted-foreground">Coordonnées GPS : <strong className="text-foreground">{siteLat.toFixed(5)}, {siteLng.toFixed(5)}</strong></span>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary hover:underline"
              >
                Lancer le guidage →
              </a>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB 5: SITES SIMILAIRES & PROCHES
        ══════════════════════════════════════════════════ */}
        {activeTab === 'similaires' && (
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <h2 className="text-lg font-black text-foreground">Autres trésors dans la région</h2>
              <p className="text-xs text-muted-foreground">Continuez votre exploration à proximité de {site.localite}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              {otherSites.map((ps) => {
                const pr = getSiteRating(ps.id)
                return (
                  <Link
                    key={ps.id}
                    href={`/lieux/${ps.id}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="relative h-36 overflow-hidden bg-secondary">
                      <Image
                        src={ps.image}
                        alt={tMonuments(`${ps.id}.nom`)}
                        fill
                        sizes="280px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute left-2.5 top-2.5 rounded-md bg-primary px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow-xs">
                        {ps.localite}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="truncate text-xs font-bold text-foreground">{tMonuments(`${ps.id}.nom`)}</p>
                      <StarRow rating={pr.rating} count={pr.count} />
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
