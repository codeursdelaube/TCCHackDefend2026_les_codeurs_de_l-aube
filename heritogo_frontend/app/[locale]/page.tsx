'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Camera, ChevronLeft, ChevronRight,
  Compass, Headphones, Landmark, MapPin, Pause, Play,
  Search, Sparkles, Star, Utensils, WifiOff,
  Castle, Trees, Waves, BookOpenText, Users, Navigation
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import AuthGuardLink from '@/components/AuthGuardLink'
import PwaInstallButton from '@/components/PwaInstallButton'
import { Link } from '@/i18n/navigation'
import { monuments } from '@/app/LieuxT/site'

const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] w-full items-center justify-center rounded-2xl border border-border bg-[#F5F5F0] dark:bg-[#182B1E]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#1B7E4B] border-t-transparent" />
        <p className="text-xs font-semibold text-[#767676] dark:text-[#9CA89E]">Chargement de la carte...</p>
      </div>
    </div>
  ),
})

interface SlideItem {
  image: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  link: string
}

const TV = {
  savane:   '#1B7E4B',
  laterite: '#C85C2D',
  or:       '#E8A923',
  sable:    '#F5F5F0',
  blanc:    '#FFFFFF',
  texte:    '#1A1A1A',
  gris:     '#767676',
} as const

import { getSiteRating } from '@/lib/constants/ratings'

function StarRating({ rating, count, small }: { rating: number; count: number; small?: boolean }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'}
            style={{
              fill: i <= full ? TV.or : i === full + 1 && half ? TV.or : 'transparent',
              color: i <= full || (i === full + 1 && half) ? TV.or : '#D1D1CC',
            }}
          />
        ))}
      </div>
      {!small && <span className="text-xs font-bold text-[#767676] dark:text-[#9CA89E]">({count})</span>}
    </div>
  )
}

export default function AccueilPage() {
  const t = useTranslations('Accueil')
  const tMonuments = useTranslations('Monuments')
  const [isOnline, setIsOnline]         = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchQuery, setSearchQuery]   = useState('')
  const [selectedMapRegion, setSelectedMapRegion] = useState<string>('all')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [speechLang, setSpeechLang] = useState('fr-FR')

  const slides = useMemo<SlideItem[]>(() => [
    {
      image: '/deuxlions.png',
      title:       t('slides.0.title'),
      subtitle:    t('slides.0.subtitle'),
      description: t('slides.0.description'),
      buttonText:  t('slides.0.buttonText'),
      link: '/scan',
    },
    {
      image: '/Hero2.png',
      title:       t('slides.1.title'),
      subtitle:    t('slides.1.subtitle'),
      description: t('slides.1.description'),
      buttonText:  t('slides.1.buttonText'),
      link: '/lieux',
    },
    {
      image: '/fufuhero.png',
      title:       t('slides.2.title'),
      subtitle:    t('slides.2.subtitle'),
      description: t('slides.2.description'),
      buttonText:  t('slides.2.buttonText'),
      link: '/cuisine',
    },
  ], [t])

  const categories = useMemo(() => [
    { href: '/lieux',   key: 'monuments', icon: Landmark   },
    { href: '/regions', key: 'tamberma',  icon: Castle     },
    { href: '/lieux',   key: 'nature',    icon: Trees      },
    { href: '/cuisine', key: 'cuisine',   icon: Utensils   },
    { href: '/guides',  key: 'guides',    icon: Users      },
    { href: '/scan',    key: 'scan',      icon: Camera     },
    { href: '/lieux',   key: 'plages',    icon: Waves      },
    { href: '/histoire',key: 'histoire',  icon: BookOpenText },
  ], [])

  const regionsList = useMemo(() => [
    { id: 'maritime',  name: t('regions.maritime.name'),  tag: t('regions.maritime.tag'),  badge: t('regions.maritime.badge'),  image: '/Sites/palais_de_lome.webp', filter: 'Maritime' },
    { id: 'plateaux',  name: t('regions.plateaux.name'),  tag: t('regions.plateaux.tag'),  badge: t('regions.plateaux.badge'),  image: '/Sites/kpalimé.jpg',         filter: 'Plateaux' },
    { id: 'kara',      name: t('regions.kara.name'),      tag: t('regions.kara.tag'),      badge: t('regions.kara.badge'),      image: '/Sites/koutamakou.jpg',      filter: 'Kara'     },
    { id: 'centrale',  name: t('regions.centrale.name'),  tag: t('regions.centrale.tag'),  badge: t('regions.centrale.badge'),  image: '/Hero1.jpg',                 filter: 'Centrale' },
    { id: 'savanes',   name: t('regions.savanes.name'),   tag: t('regions.savanes.tag'),   badge: t('regions.savanes.badge'),   image: '/Sites/yikpa.jpg',           filter: 'Savanes'  },
  ], [t])

  const filteredMapMonuments = useMemo(() => {
    if (selectedMapRegion === 'all') return monuments
    return monuments.filter(m => m.région.toLowerCase().includes(selectedMapRegion.toLowerCase()))
  }, [selectedMapRegion])

  const guides = useMemo(() => [
    { initials: 'KA', name: t('guides.0.name'), rating: 4.8, languages: t('guides.0.languages'), zone: t('guides.0.zone') },
    { initials: 'EA', name: t('guides.1.name'), rating: 4.9, languages: t('guides.1.languages'), zone: t('guides.1.zone') },
    { initials: 'MA', name: t('guides.2.name'), rating: 5.0, languages: t('guides.2.languages'), zone: t('guides.2.zone') },
  ], [t])

  const toggleAudioGuide = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    if (isPlayingAudio) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
    } else {
      window.speechSynthesis.cancel()
      const textToSpeak = `${t('audioguide_sample_title')}. ${t('audioguide_sample_location')}. ${t('audioguide_sample_desc')}`
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = speechLang
      utterance.rate = 0.95
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => setIsPlayingAudio(false)
      window.speechSynthesis.speak(utterance)
      setIsPlayingAudio(true)
    }
  }

  useEffect(() => {
    const id = window.setInterval(() => setCurrentSlide(s => (s + 1) % slides.length), 5200)
    return () => window.clearInterval(id)
  }, [slides.length])

  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine)
    sync()
    window.addEventListener('online',  sync)
    window.addEventListener('offline', sync)
    return () => {
      window.removeEventListener('online',  sync)
      window.removeEventListener('offline', sync)
    }
  }, [])

  const slide = slides[currentSlide]

  return (
    <main className="min-h-screen bg-white dark:bg-[#0F1F16] pb-24 pt-16 text-[#1A1A1A] dark:text-[#F0F0EC]">

      {/* ── Offline banner ── */}
      {!isOnline && (
        <div className="fixed inset-x-4 top-20 z-[60] mx-auto flex max-w-sm items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-xl">
          <WifiOff className="h-4 w-4 shrink-0" />
          {t('offline_banner')}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          HERO — Barre de Recherche Centrale TripAdvisor-style
      ══════════════════════════════════════════════════ */}
      <section className="relative h-[500px] w-full overflow-hidden md:h-[560px]" style={{ background: TV.savane }}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={slide.image}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Image src={slide.image} alt={slide.title} fill priority sizes="100vw" className="object-cover" />
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/70" />

        {/* Hero content — centered search bar */}
        <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6">
          
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8A923]"
          >
            {t('header_kicker')}
          </motion.p>

          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.title}
              className="mt-3 max-w-2xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {slide.title}
            </motion.h1>
          </AnimatePresence>

          {/* Search Bar — TripAdvisor style */}
          <div className="mt-8 w-full max-w-2xl">
            <div className="flex items-center gap-0 overflow-hidden rounded-2xl bg-white dark:bg-[#0F1F16] shadow-2xl ring-1 ring-white/20">
              <div className="flex flex-1 items-center gap-3 px-4">
                <Search className="h-5 w-5 shrink-0 text-[#767676] dark:text-[#9CA89E]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Monuments, plats, régions du Togo..."
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm font-medium text-[#1A1A1A] dark:text-[#F0F0EC] outline-none placeholder:text-[#767676] dark:text-[#9CA89E]"
                />
              </div>
              <AuthGuardLink
                href={searchQuery ? `/lieux?q=${encodeURIComponent(searchQuery)}` : '/lieux'}
                className="flex h-14 items-center gap-2 px-6 text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: TV.savane }}
              >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Rechercher</span>
              </AuthGuardLink>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <AuthGuardLink
              href="/scan"
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ background: TV.laterite }}
            >
              <Camera className="h-4 w-4" />
              {t('cta_scan')}
            </AuthGuardLink>
            <AuthGuardLink
              href="/lieux"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/80 px-5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/15 dark:bg-[#0F1F16]/15 active:scale-95"
            >
              <MapPin className="h-4 w-4" />
              {t('cta_discover')}
            </AuthGuardLink>
            <PwaInstallButton className="border-white/30 bg-white/15 dark:bg-[#0F1F16]/15 text-white hover:bg-white dark:bg-[#0F1F16] hover:text-[#1A1A1A] dark:text-[#F0F0EC]" />
          </div>
        </div>

        {/* Slide arrows */}
        <button
          onClick={() => setCurrentSlide(s => (s - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/25 p-2 text-white backdrop-blur-sm transition hover:bg-black/45 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide(s => (s + 1) % slides.length)}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/25 p-2 text-white backdrop-blur-sm transition hover:bg-black/45 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.image}
              onClick={() => setCurrentSlide(i)}
              className={i === currentSlide
                ? 'h-2 w-7 rounded-full bg-white dark:bg-[#0F1F16] transition-all cursor-pointer'
                : 'h-2 w-2 rounded-full bg-white/40 dark:bg-[#0F1F16]/40 transition-all hover:bg-white/65 dark:bg-[#0F1F16]/65 cursor-pointer'
              }
            />
          ))}
        </div>
      </section>

      {/* ── Stats rapides ── */}
      <section className="border-b border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#0F1F16] px-4 py-4 shadow-sm">
        <div className="mx-auto grid max-w-4xl grid-cols-4 gap-4 text-center">
          {[
            { value: '120+', label: t('stats_short.sites') },
            { value: '5',    label: t('stats_short.regions') },
            { value: '4',    label: t('stats_short.languages') },
            { value: '100%', label: 'Gratuit' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-2xl font-black leading-none text-[#1B7E4B] sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-[#767676] dark:text-[#9CA89E]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-10 sm:px-6">

        {/* ══════════════════════════════════════════════════
            CATÉGORIES — Scroll horizontal style TripAdvisor
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-2xl">Explorer par catégorie</h2>
            <Link href="/lieux" className="text-xs font-bold text-[#1B7E4B] hover:underline">{t('incontournables_see_all')} →</Link>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {categories.map((cat) => {
              const CatIcon = cat.icon
              const label = t(`categories.${cat.key}`)
              return (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#0F1F16] p-3 text-center transition-all hover:border-[#1B7E4B]/40 hover:shadow-md active:scale-95"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5F5F0] dark:bg-[#182B1E] text-[#1B7E4B] group-hover:bg-[#1B7E4B] group-hover:text-white transition-all">
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold leading-tight text-[#1A1A1A] dark:text-[#F0F0EC]">{label}</span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            INCONTOURNABLES — Cards avec notes (TripAdvisor)
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-2xl">{t('treasures_title')}</h2>
              <div className="togo-underline" />
            </div>
            <Link href="/lieux" className="text-xs font-bold text-[#1B7E4B] hover:underline">{t('incontournables_see_all')} →</Link>
          </div>

          {/* Horizontal scroll strip */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
            {monuments.map((site) => {
              const ratingData = getSiteRating(site.id)
              return (
                <Link
                  key={site.id}
                  href={`/lieux/${site.id}`}
                  className="group relative flex h-56 w-48 shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#182B1E] shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <Image
                    src={site.image}
                    alt={tMonuments(`${site.id}.nom`)}
                    fill
                    sizes="192px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  
                  <div className="relative z-10 p-2">
                    <span className="rounded-md bg-[#1B7E4B] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                      {site.région}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-1 p-3">
                    <h3 className="truncate text-sm font-bold leading-tight text-white">
                      {tMonuments(`${site.id}.nom`)}
                    </h3>
                    <div className="flex items-center justify-between">
                      <StarRating rating={ratingData.rating} count={ratingData.count} small />
                      <span className="text-[10px] font-bold text-[#E8A923]">{ratingData.rating}</span>
                    </div>
                    <p className="flex items-center gap-1 text-[10px] text-white/75">
                      <MapPin className="h-2.5 w-2.5" />
                      {site.localite}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            TOP SITES — Grid TripAdvisor Cards (Grandes cartes)
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-2xl">Nos destinations phares</h2>
              <div className="togo-underline" />
            </div>
            <Link href="/lieux" className="text-xs font-bold text-[#1B7E4B] hover:underline">Tout voir →</Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {monuments.slice(0, 6).map((site) => {
              const ratingData = getSiteRating(site.id)
              return (
                <Link
                  key={site.id}
                  href={`/lieux/${site.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#0F1F16] shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden bg-[#F5F5F0] dark:bg-[#182B1E]">
                    <Image
                      src={site.image}
                      alt={tMonuments(`${site.id}.nom`)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-lg bg-[#1B7E4B] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
                      {site.région}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4 space-y-2">
                    <div>
                      <h3 className="font-bold text-[#1A1A1A] dark:text-[#F0F0EC] leading-snug">
                        {tMonuments(`${site.id}.nom`)}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#767676] dark:text-[#9CA89E]">
                        <MapPin className="h-3.5 w-3.5 text-[#1B7E4B] shrink-0" />
                        {site.localite}, Togo
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#E5E5E0] dark:border-[#243B2C] pt-2">
                      <div className="flex flex-col gap-0.5">
                        <StarRating rating={ratingData.rating} count={ratingData.count} />
                      </div>
                      <span className="rounded-lg bg-[#1B7E4B] px-2.5 py-1 text-xs font-black text-white">
                        {ratingData.rating}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            LES 5 RÉGIONS
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-2xl">{t('regions_section_title')}</h2>
              <div className="togo-underline" />
            </div>
            <Link href="/regions" className="text-xs font-bold text-[#1B7E4B] hover:underline">Explorer les régions →</Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regionsList.map((reg) => (
              <Link
                key={reg.id}
                href={`/regions`}
                className="group relative flex h-56 flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#182B1E] shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={reg.image}
                  alt={reg.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />

                <div className="relative z-10 flex justify-between items-center p-3">
                  <span className="rounded-lg bg-[#E8A923] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#1A1A1A] dark:text-[#F0F0EC]">
                    {reg.badge}
                  </span>
                  <span className="rounded-lg bg-black/40 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/90">
                    {reg.tag}
                  </span>
                </div>

                <div className="relative z-10 p-4">
                  <h3 className="font-serif text-lg font-bold text-white">{reg.name}</h3>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-white/80">
                    <ArrowRight className="h-3 w-3" /> {t('pill_discover_region')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            AUDIOGUIDE — Section style app mobile
        ══════════════════════════════════════════════════ */}
        <section className="overflow-hidden rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-[#F5F5F0] dark:bg-[#182B1E]">
          <div className="grid lg:grid-cols-2">
            
            {/* Carte Photo + Player */}
            <div className="relative h-64 lg:h-auto">
              <Image
                src="/Sites/monuments_independance.jpg"
                alt={t('audioguide_sample_title')}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Ondes */}
              <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center gap-1">
                {[40, 75, 90, 60, 100, 45, 80, 65, 95, 50, 70, 85].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-300 ${isPlayingAudio ? 'animate-pulse' : 'opacity-30'}`}
                    style={{ height: isPlayingAudio ? `${h}%` : '15%', maxHeight: '20px', minHeight: '5px', backgroundColor: TV.or }}
                  />
                ))}
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] font-bold text-[#E8A923]">{t('audioguide_sample_location')}</p>
                <h3 className="font-serif text-lg font-bold">{t('audioguide_sample_title')}</h3>
              </div>
            </div>

            {/* Infos & Contrôles */}
            <div className="flex flex-col justify-center p-6 space-y-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1B7E4B]/10 px-3 py-1 text-xs font-bold text-[#1B7E4B]">
                  <Headphones className="h-3.5 w-3.5" />
                  {t('audioguide_tts_badge')}
                </span>
                <h2 className="mt-2 text-2xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-3xl">
                  {t('audioguides_section_title')}
                </h2>
                <p className="mt-1 text-sm text-[#767676] dark:text-[#9CA89E] leading-relaxed">
                  {t('audioguides_section_desc')}
                </p>
              </div>

              {/* Langues */}
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'fr-FR', label: 'Français' },
                  { code: 'en-US', label: 'English' },
                  { code: 'es-ES', label: 'Español' },
                  { code: 'zh-CN', label: '中文' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSpeechLang(lang.code)
                      if (isPlayingAudio) { window.speechSynthesis.cancel(); setIsPlayingAudio(false) }
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      speechLang === lang.code
                        ? 'bg-[#1B7E4B] text-white'
                        : 'bg-white dark:bg-[#0F1F16] border border-[#E5E5E0] dark:border-[#243B2C] text-[#1A1A1A] dark:text-[#F0F0EC] hover:border-[#1B7E4B]/40'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              <button
                onClick={toggleAudioGuide}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-bold text-white transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                style={{ background: TV.savane }}
              >
                {isPlayingAudio ? <><Pause className="h-4 w-4 fill-current" /><span>{t('audioguide_pause')}</span></> : <><Play className="h-4 w-4 fill-current" /><span>{t('audioguide_play')}</span></>}
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            CARTE INTERACTIVE
        ══════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-2xl">{t('interactive_map_title')}</h2>
              <div className="togo-underline" />
            </div>
            <Link
              href="/lieux"
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white hover:brightness-110 transition-all"
              style={{ background: TV.savane }}
            >
              <Navigation className="h-3 w-3" />
              <span>{t('interactive_map_open_view')}</span>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {['all','Maritime','Plateaux','Centrale','Kara','Savanes'].map(rf => (
              <button
                key={rf}
                onClick={() => setSelectedMapRegion(rf)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  selectedMapRegion === rf
                    ? 'border-[#1B7E4B] bg-[#1B7E4B] text-white shadow-xs'
                    : 'border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#0F1F16] text-[#1A1A1A] dark:text-[#F0F0EC] hover:border-[#1B7E4B]/50'
                }`}
              >
                {rf === 'all' ? t('interactive_map_all_regions') : rf}
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] shadow-sm">
            <DynamicCarte monumentsList={filteredMapMonuments} />
          </div>
        </section>

{/* ══════════════════════════════════════════════════
            GUIDES CERTIFIÉS — TripAdvisor style
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A] dark:text-[#F0F0EC] sm:text-2xl">{t('guides_title')}</h2>
              <div className="togo-underline" />
            </div>
            <AuthGuardLink href="/guides" className="text-xs font-bold text-[#1B7E4B] hover:underline">
              {t('guides.view_all')} →
            </AuthGuardLink>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {guides.map(guide => (
              <article
                key={guide.name}
                className="flex flex-col rounded-2xl border border-[#E5E5E0] dark:border-[#243B2C] bg-white dark:bg-[#0F1F16] p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black text-white"
                    style={{ background: TV.savane }}
                  >
                    {guide.initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F0F0EC] truncate">{guide.name}</h3>
                    <p className="text-xs text-[#767676] dark:text-[#9CA89E]">{guide.zone}</p>
                  </div>
                </div>

                <StarRating rating={guide.rating} count={0} />

                <div className="mt-3 flex items-center justify-between border-t border-[#E5E5E0] dark:border-[#243B2C] pt-3">
                  <span className="text-xs text-[#767676] dark:text-[#9CA89E]">{guide.languages}</span>
                  <AuthGuardLink
                    href="/guides"
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 transition-all"
                    style={{ background: TV.savane }}
                  >
                    {t('guides.reserve')}
                  </AuthGuardLink>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}
