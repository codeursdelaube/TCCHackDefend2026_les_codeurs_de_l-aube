'use client'

import { use, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, MapPin, Navigation,
  Volume2, VolumeX, Share2, Check,
  BedDouble, Star, Banknote, Info, BookOpen
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'

import { monuments } from '@/app/LieuxT/site'
import hotels from '@/app/nearbyhotels/hotels'

type MonumentWithRegionAlias = { region?: string }

// Utilitaires de distance
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

interface PageProps {
  params: Promise<{ id: string }>
}

// TTS Button
function TTSButton({ text, playLabel, stopLabel }: { text: string; playLabel: string; stopLabel: string }) {
  const locale = useLocale()
  const [speaking, setSpeaking] = useState(false)
  
  const toggle = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const u = new SpeechSynthesisUtterance(text)
    
    if (locale === 'fr') u.lang = 'fr-FR'
    else if (locale === 'en') u.lang = 'en-US'
    else if (locale === 'es') u.lang = 'es-ES'
    else if (locale === 'zh') u.lang = 'zh-CN'
    else u.lang = 'fr-FR'

    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(u)
    setSpeaking(true)
  }
  
  return (
    <button onClick={toggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
                  border transition-all duration-200
                  ${speaking
                    ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                    : 'bg-base-300 border-base-content/10 text-base-content/50 hover:text-base-content hover:border-base-content/20'}`}>
      {speaking ? <><VolumeX size={13} className="animate-pulse" /> {stopLabel}</> : <><Volume2 size={13} /> {playLabel}</>}
    </button>
  )
}

// Share Button
function ShareButton({ nom, shareLabel, copiedLabel }: { nom: string; shareLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: nom, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  return (
    <button onClick={share}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold
                 bg-base-300 border border-base-content/10 text-base-content/50
                 hover:text-base-content hover:border-base-content/20 transition-all duration-200">
      {copied ? <><Check size={13} className="text-green-500" /> {copiedLabel}</> : <><Share2 size={13} /> {shareLabel}</>}
    </button>
  )
}

export default function SiteDetailPage({ params }: PageProps) {
  const t = useTranslations('Lieux')
  const tMonuments = useTranslations('Monuments')
  const resolvedParams = use(params)
  const site = monuments.find((m) => m.id === resolvedParams.id)
  if (!site) notFound()

  const siteRegion = site.région || (site as MonumentWithRegionAlias).region
  const siteLat = Number(site.lat)
  const siteLng = Number(site.lng)

  const siteNom = tMonuments(`${site.id}.nom`)
  const siteDescription = tMonuments(`${site.id}.description`)
  const siteHistoire = tMonuments(`${site.id}.histoire`)

  const getRegionName = (reg: string): string => {
    switch (reg) {
      case 'Maritime': return t('regions.maritime')
      case 'Plateaux': return t('regions.plateaux')
      case 'Kara':     return t('regions.kara')
      case 'Centrale': return t('regions.centrale')
      case 'Savanes':  return t('regions.savanes')
      default:         return reg
    }
  }

  // HÔTELS
  const allHotelsWithDist = hotels.map((h) => ({
    ...h,
    distance_km: haversine(siteLat, siteLng, h.lat, h.lng)
  }))

  const hotelsProches = allHotelsWithDist
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, 6)

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${siteLat},${siteLng}`

  return (
    <main className="relative min-h-screen w-full bg-base-100 text-base-content overflow-x-hidden pb-24">

      {/* HERO */}
      <section className="relative h-[50vh] w-full overflow-hidden">
        <Image src={site.image} alt={siteNom} fill priority sizes="100vw"
          className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60" />

        <div className="absolute top-0 left-0 right-0 z-20 pt-4 px-4 flex items-center justify-between">
          <Link href="/lieux">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full
                       bg-white/20 backdrop-blur-md border border-white/30
                       text-white text-xs font-semibold hover:bg-white/30 transition-all">
              <ArrowLeft size={14} />
            </div>
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4">
          <h1 className="text-3xl font-black text-white uppercase leading-none">
            {siteNom}
          </h1>
        </div>
      </section>

      {/* CARD FLOTTANTE AVEC INFO */}
      <section className="relative z-30 -mt-16 px-4">
        <div className="bg-white rounded-3xl p-5 shadow-lg border border-base-content/10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-orange-500 font-bold">
                <Star size={16} className="fill-orange-500" />
                <span>4.7</span>
              </div>
              <span className="text-xs text-base-content/50">{t('rating')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-orange-500 font-bold">
                <span>12 400</span>
              </div>
              <span className="text-xs text-base-content/50">{t('visits_per_year')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-orange-500 font-bold">
                <MapPin size={14} />
                <span>0.3 km</span>
              </div>
              <span className="text-xs text-base-content/50">{t('distance')}</span>
            </div>
          </div>

          {/* Tag période */}
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs font-medium mb-4">
            {t('period_tag')}
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors">
              <BookOpen size={16} />
              {t('history_btn')}
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white border border-base-content/20 text-base-content font-bold text-sm hover:bg-base-content/5 transition-colors">
              <Info size={16} className="text-blue-500" />
              {t('info_btn')}
            </button>
          </div>
        </div>
      </section>

      {/* DESCRIPTION */}
      <section className="px-4 py-6">
        <p className="text-sm text-base-content/70 leading-relaxed">
          {siteDescription}
        </p>
      </section>

      {/* HISTOIRE */}
      <section className="px-4 py-4">
        <h2 className="text-lg font-bold text-base-content mb-3">Histoire</h2>
        <p className="text-sm text-base-content/70 leading-relaxed whitespace-pre-line">
          {siteHistoire}
        </p>
      </section>

      {/* HÔTELS À PROXIMITÉ */}
      <section className="px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <BedDouble size={20} className="text-orange-500" />
          <h2 className="text-lg font-bold text-base-content">{t('hotels_nearby')}</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {hotelsProches.map((hotel) => (
            <div
              key={hotel.id}
              className="flex-shrink-0 w-64 bg-base-200 rounded-2xl overflow-hidden border border-base-content/10"
            >
              <div className="relative h-32 w-full bg-base-300">
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🏨
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-base-content mb-1">{hotel.nom}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-orange-500 font-bold text-sm">
                    {hotel.nuit_fcfa_min.toLocaleString('fr-FR')} FCFA
                  </span>
                  <span className="text-xs text-base-content/50">{formatDistance(hotel.distance_km)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIONS RAPIDES */}
      <section className="px-4 py-6 pb-24">
        <div className="flex flex-wrap items-center gap-2">
          <TTSButton text={`${siteNom}. ${siteDescription}. ${siteHistoire}`} playLabel={t('listen')} stopLabel={t('stop')} />
          <ShareButton nom={siteNom} shareLabel={t('share')} copiedLabel={t('copied')} />
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                               text-xs font-bold border-none text-white
                               bg-orange-500 hover:bg-orange-600 transition-colors">
              <Navigation size={13} /> {t('gps_action')}
            </button>
          </a>
        </div>
      </section>

    </main>
  )
}