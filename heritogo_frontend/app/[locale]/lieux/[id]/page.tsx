'use client'

import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, BedDouble, Camera, Check, Clock, Compass, Eye, Footprints, Headphones,
  History, Info, Landmark, Loader2, MapPin, Navigation, Pause, Play, Share2,
  ShieldCheck, ShoppingBag, Sun, Utensils, Users,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import AuthGuardLink from '@/components/AuthGuardLink'
import hotels from '@/lib/data/hotels'
import { getSiteExtraDetails, type SiteActivity } from '@/lib/constants/siteDetails'
import Badge from '@/components/ui/Badge'
import SiteCard from '@/components/ui/SiteCard'
import { useDishes, usePlaces } from '@/hooks/useCatalog'
import { findLocalPlace } from '@/lib/catalog/places'
import AdSlot from '@/components/ads/AdSlot'

const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-lg bg-muted" />,
})

const VOICE_LANGS: Record<string, string> = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', zh: 'zh-CN' }

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
  const className = 'h-4 w-4 text-primary'
  switch (icon) {
    case 'camera': return <Camera className={className} />
    case 'footsteps': return <Footprints className={className} />
    case 'eye': return <Eye className={className} />
    case 'compass': return <Compass className={className} />
    case 'shopping': return <ShoppingBag className={className} />
    case 'history': return <History className={className} />
    case 'sun': return <Sun className={className} />
    default: return <Landmark className={className} />
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SiteDetailPage({ params }: PageProps) {
  const t = useTranslations('Lieux')
  const locale = useLocale()
  const resolvedParams = use(params)
  const { places, loading: placesLoading } = usePlaces()
  const { dishes } = useDishes()
  const site =
    places.find((item) => item.id === resolvedParams.id || item.slug === resolvedParams.id) ||
    findLocalPlace(resolvedParams.id, locale)

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

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

  const siteLat = Number(site.lat)
  const siteLng = Number(site.lng)
  const extraDetails = getSiteExtraDetails(resolvedParams.id, site.région || 'Maritime')
  const relatedDishes = dishes.filter((p) => (site.relatedDishSlugs?.length ? site.relatedDishSlugs : extraDetails.dishesIds).includes(p.id)).slice(0, 3)

  const regionKey = (site.région || '').toLowerCase()
  const regionName = ['maritime', 'plateaux', 'kara', 'centrale', 'savanes'].includes(regionKey) ? t(`regions.${regionKey}`) : site.région

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    if (isPlayingAudio) {
      setIsPlayingAudio(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(`${site.nom}. ${site.description}. ${site.histoire || ''}`)
    utterance.lang = VOICE_LANGS[locale] ?? 'fr-FR'
    utterance.rate = 0.95
    utterance.onend = () => setIsPlayingAudio(false)
    utterance.onerror = () => setIsPlayingAudio(false)
    window.speechSynthesis.speak(utterance)
    setIsPlayingAudio(true)
  }

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: site.nom, url }).catch(() => {})
      return
    }
    await navigator.clipboard?.writeText(url).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const nearbyHotels = hotels
    .map((hotel) => ({ ...hotel, distance_km: haversine(siteLat, siteLng, hotel.lat, hotel.lng) }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 3)

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${siteLat},${siteLng}`
  const sameRegion = places.filter((m) => m.id !== site.id && m.région === site.région).slice(0, 3)
  const otherSites = sameRegion.length > 0 ? sameRegion : places.filter((m) => m.id !== site.id).slice(0, 3)

  const practical = [
    { icon: Sun, label: t('best_time_title'), value: site.bestTime || extraDetails.practicalInfo.bestTime },
    { icon: Clock, label: t('duration_title'), value: site.duration || extraDetails.practicalInfo.duration },
    { icon: Footprints, label: t('outfit_title'), value: site.outfit || extraDetails.practicalInfo.outfit },
    { icon: Navigation, label: t('access_title'), value: site.access || extraDetails.practicalInfo.access },
    { icon: Info, label: t('fee_title'), value: site.fee || extraDetails.practicalInfo.fee },
  ]

  return (
    <main className="min-h-screen bg-background pb-32 pt-20 text-foreground">
      {/* En-tête photo */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate h-[22rem] overflow-hidden rounded-xl border border-border sm:h-[28rem]">
          <Image src={site.image} alt={site.nom} fill priority sizes="(max-width: 1152px) 100vw, 1152px" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/25 to-black/30" />

          <div className="flex items-center justify-between p-4">
            <Link
              href="/lieux"
              className="inline-flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/55"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('back_to_sites')}
            </Link>
            <button
              type="button"
              onClick={share}
              aria-label={t('share')}
              className="inline-flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/55"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? t('link_copied') : t('share')}
            </button>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {site.isUnesco && <Badge variant="unesco">{t('unesco_badge_full')}</Badge>}
              <span className="inline-flex items-center gap-1 text-sm text-white/85">
                <MapPin className="h-4 w-4" />
                {site.localite} · {regionName}
              </span>
            </div>
            <h1 className="mt-2 max-w-3xl font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">{site.nom}</h1>
            {extraDetails.tags.length > 0 && (
              <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-white/75">
                {extraDetails.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="space-y-6 lg:col-span-8">
          {/* Présentation + audio */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-bold">{t('desc_title')}</h2>
              <button
                type="button"
                onClick={toggleAudio}
                aria-pressed={isPlayingAudio}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:border-primary hover:text-primary"
              >
                {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <Headphones className="h-4 w-4 text-primary" />
                {isPlayingAudio ? t('audio_stop') : t('listen_monument')}
              </button>
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground/85">{site.description}</p>
            {site.histoire && (
              <>
                <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-primary">{t('history_extended')}</h3>
                <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-foreground/85">{site.histoire}</p>
              </>
            )}
          </section>

          {/* Activités */}
          {extraDetails.activities.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold">{t('things_to_do')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t('things_to_do_sub')}</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {extraDetails.activities.map((act) => (
                  <div key={act.title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <ActivityIcon icon={act.icon} />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{act.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Carte */}
          <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-2xl font-bold">{t('tab_carte')}</h2>
              <span className="text-xs text-muted-foreground">
                {t('gps_coords')} <strong className="text-foreground">{siteLat.toFixed(5)}, {siteLng.toFixed(5)}</strong>
              </span>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <DynamicCarte monumentsList={[site]} />
            </div>
          </section>

          {/* Gastronomie liée */}
          {relatedDishes.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-serif text-2xl font-bold">
                  <Utensils className="h-5 w-5 text-primary" />
                  {t('eat_nearby')}
                </h2>
                <Link href="/cuisine" className="text-xs font-bold text-primary hover:underline">{t('gastro_guide')}</Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {relatedDishes.map((dish) => (
                  <Link key={dish.id} href={`/cuisine/${dish.id}`} className="group overflow-hidden rounded-lg border border-border">
                    <div className="relative aspect-4/3 overflow-hidden bg-muted">
                      <Image src={dish.image} alt={dish.nom} fill sizes="240px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-bold">{dish.nom}</p>
                      <p className="text-xs text-muted-foreground">{dish.catégorie}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <AdSlot slot="places-detail-slot" format="auto" />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-bold">{t('practical_tips')}</h2>
            <dl className="mt-4 space-y-4">
              {practical.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline-brand mt-5 w-full">
              <Navigation className="h-4 w-4" />
              {t('gps_button')}
            </a>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
              <ShieldCheck className="h-4 w-4" />
              {t('certified_guide_badge')}
            </p>
            <p className="mt-2 font-serif text-lg font-bold">{t('guided_tour_title')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('guided_tour_desc')}</p>
            <AuthGuardLink href="/guides" className="btn-brand mt-4 w-full">
              <Users className="h-4 w-4" />
              {t('find_guide_btn')}
            </AuthGuardLink>
          </div>

          {nearbyHotels.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
                <BedDouble className="h-5 w-5 text-primary" />
                {t('hotels_nearby')}
              </h2>
              <ul className="mt-3 divide-y divide-border">
                {nearbyHotels.map((hotel) => (
                  <li key={hotel.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{hotel.nom}</p>
                      <p className="text-xs text-muted-foreground">{formatDistance(hotel.distance_km)} {t('distance')}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-foreground">
                      {t('hotel_from', { price: hotel.nuit_fcfa_min.toLocaleString(locale === 'zh' ? 'zh-CN' : locale) })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>

      {otherSites.length > 0 && (
        <section className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold">{t('other_treasures')}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t('continue_explore', { city: regionName })}</p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherSites.map((ps) => (
              <SiteCard
                key={ps.id}
                id={ps.id}
                nom={ps.nom}
                region={ps.région}
                localite={ps.localite}
                description={ps.description}
                image={ps.image}
                isUnesco={ps.isUnesco}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
