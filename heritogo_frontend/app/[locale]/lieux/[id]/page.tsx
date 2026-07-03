'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, BedDouble, BookOpen, Check, MapPin, Navigation, Share2, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { monuments } from '@/app/LieuxT/site'
import hotels from '@/app/nearbyhotels/hotels'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadiusKm = 6371
  const toRad = (degree: number) => (degree * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

interface PageProps {
  params: Promise<{ id: string }>
}

import TextToSpeech from '@/components/TextToSpeech'

function ShareButton({ title, shareLabel, copiedLabel }: { title: string; shareLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {}
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button type="button" onClick={share} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[20px] border border-border bg-base-200 px-5 text-sm font-black text-base-content transition-all hover:border-secondary/50 active:scale-95">
      {copied ? <Check className="h-5 w-5 text-secondary" /> : <Share2 className="h-5 w-5 text-secondary" />}
      {copied ? copiedLabel : shareLabel}
    </button>
  )
}

export default function SiteDetailPage({ params }: PageProps) {
  const t = useTranslations('Lieux')
  const tMonuments = useTranslations('Monuments')
  const resolvedParams = use(params)
  const site = monuments.find((item) => item.id === resolvedParams.id)
  if (!site) notFound()

  const siteLat = Number(site.lat)
  const siteLng = Number(site.lng)
  const siteName = tMonuments(`${site.id}.nom`)
  const siteDescription = tMonuments(`${site.id}.description`)
  const siteHistory = tMonuments(`${site.id}.histoire`)

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

  const nearbyHotels = hotels
    .map((hotel) => ({ ...hotel, distance_km: haversine(siteLat, siteLng, hotel.lat, hotel.lng) }))
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 6)

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${siteLat},${siteLng}`

  return (
    <main className="min-h-screen bg-base-100 pb-28 text-base-content">
      <section className="relative min-h-[62vh] overflow-hidden">
        <Image src={site.image} alt={siteName} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/45" />

        <div className="absolute left-4 right-4 top-20 z-10 mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/lieux" className="inline-flex h-12 w-12 items-center justify-center rounded-[20px] bg-white/90 text-stone-950 shadow-sm transition-all hover:bg-white active:scale-95" aria-label={t('back_to_sites')}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="rounded-2xl bg-secondary px-3 py-2 text-[11px] font-black uppercase tracking-wide text-secondary-content">{getRegionName(site.région)}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-8">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-2xl bg-white/12 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur-md">
              <MapPin className="h-4 w-4 text-secondary" />
              {site.localite}
            </p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-6xl">{siteName}</h1>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 rounded-[32px] border border-border bg-base-200 p-5 shadow-xl sm:grid-cols-3 sm:p-6">
          <div className="rounded-[24px] bg-base-100 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-base-content/45">{t('rating')}</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-black"><Star className="h-5 w-5 fill-secondary text-secondary" />4.7</p>
          </div>
          <div className="rounded-[24px] bg-base-100 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-base-content/45">{t('visits_per_year')}</p>
            <p className="mt-2 text-2xl font-black">12 400</p>
          </div>
          <div className="rounded-[24px] bg-base-100 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-base-content/45">{t('distance')}</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-black"><MapPin className="h-5 w-5 text-secondary" />{site.localite}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <div className="space-y-5">
          {/* TTS + Share — juste sous le titre, avant la description */}
          <div className="flex flex-wrap items-center gap-3">
            <TextToSpeech text={`${siteName}. ${siteDescription}. ${siteHistory}`} />
            <ShareButton title={siteName} shareLabel={t('share')} copiedLabel={t('copied')} />
          </div>

          <article className="rounded-[32px] border border-border bg-base-200 p-5 shadow-sm sm:p-7">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-normal"><BookOpen className="h-5 w-5 text-secondary" />{t('desc_title')}</h2>
            <p className="m-0 text-sm font-medium leading-7 text-base-content/68">{siteDescription}</p>
          </article>

          <article className="rounded-[32px] border border-border bg-base-200 p-5 shadow-sm sm:p-7">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-normal"><BookOpen className="h-5 w-5 text-secondary" />{t('history_title')}</h2>
            <p className="m-0 whitespace-pre-line text-sm font-medium leading-7 text-base-content/68">{siteHistory}</p>
          </article>

          <article className="rounded-[32px] border border-border bg-base-200 p-5 shadow-sm sm:p-7">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-normal"><BedDouble className="h-5 w-5 text-secondary" />{t('hotels_nearby')}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {nearbyHotels.map((hotel) => (
                <div key={hotel.id} className="rounded-[24px] border border-border bg-base-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black">{hotel.nom}</h3>
                      <p className="mt-1 text-xs font-semibold text-base-content/50">{formatDistance(hotel.distance_km)}</p>
                    </div>
                    <BedDouble className="h-5 w-5 text-secondary" />
                  </div>
                  <p className="mt-3 text-sm font-black text-secondary">{hotel.nuit_fcfa_min.toLocaleString('fr-FR')} FCFA</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="h-fit rounded-[32px] border border-border bg-base-200 p-5 shadow-sm lg:sticky lg:top-24">
          <div className="space-y-3">
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-secondary px-5 text-sm font-black text-secondary-content transition-all hover:-translate-y-0.5 active:scale-95">
              <Navigation className="h-5 w-5" />
              {t('gps_action')}
            </a>
          </div>
        </aside>
      </section>
    </main>
  )
}
