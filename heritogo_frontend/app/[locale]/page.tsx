'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, BadgeCheck, Camera, Compass,
  Crown, Headphones, Landmark, Languages, MapPin,
  Play, Pause, Sparkles, Star, Utensils, WifiOff,
  ChevronLeft, ChevronRight, Castle, Trees, Waves, BookOpenText,
  Download, Navigation, Globe
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import AuthGuardLink from '@/components/AuthGuardLink'
import PwaInstallButton from '@/components/PwaInstallButton'
import { Link } from '@/i18n/navigation'
import { monuments } from '@/app/LieuxT/site'

/* ─── Dynamic Leaflet Map ────────────────────────────────────── */
const DynamicCarte = dynamic(() => import('@/app/_components/Carte'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] w-full items-center justify-center rounded-[28px] border border-border bg-base-200">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#3B2519] border-t-transparent dark:border-[#C99A3E]" />
        <p className="text-xs font-bold text-base-content/60">Chargement de la carte...</p>
      </div>
    </div>
  ),
})

/* ─── Types ─────────────────────────────────────────────────── */
interface SlideItem {
  image: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  link: string
}

/* ─── Tokens couleur — palette Café & Blanc ───────────────────── */
const C = {
  espresso: '#3B2519',
  caramel:  '#A9754A',
  crema:    '#C99A3E',
  latte:    '#F1E7D8',
  milk:     '#FDFBF8',
  forest:   '#3B2519',
  rust:     '#A9754A',
  gold:     '#C99A3E',
} as const

export default function AccueilPage() {
  const t = useTranslations('Accueil')
  const tMonuments = useTranslations('Monuments')
  const [isOnline, setIsOnline]         = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  /* ── État de la carte interactive ── */
  const [selectedMapRegion, setSelectedMapRegion] = useState<string>('all')

  /* ── État de l'audioguide interactif TTS ── */
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [speechLang, setSpeechLang] = useState('fr-FR')

  /* ── Slides hero ── */
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

  /* ── Les 8 Catégories (Squircle Grid) ── */
  const categories = useMemo(() => [
    { href: '/lieux', key: 'monuments', count: t('category_counts.monuments'), icon: Landmark },
    { href: '/lieux', key: 'tamberma', count: t('category_counts.tamberma'), icon: Castle },
    { href: '/lieux', key: 'nature', count: t('category_counts.nature'), icon: Trees },
    { href: '/cuisine', key: 'cuisine', count: t('category_counts.cuisine'), icon: Utensils },
    { href: '/guides', key: 'guides', count: t('category_counts.guides'), icon: Compass },
    { href: '/scan', key: 'scan', count: t('category_counts.scan'), icon: Camera },
    { href: '/lieux', key: 'plages', count: t('category_counts.plages'), icon: Waves },
    { href: '/histoire', key: 'histoire', count: t('category_counts.histoire'), icon: BookOpenText },
  ], [t])

  /* ── Les 5 Régions ── */
  const regionsList = useMemo(() => [
    {
      id: 'maritime',
      name: t('regions.maritime.name'),
      tag: t('regions.maritime.tag'),
      badge: t('regions.maritime.badge'),
      image: '/Sites/palais_de_lome.webp',
      filter: 'Maritime',
    },
    {
      id: 'plateaux',
      name: t('regions.plateaux.name'),
      tag: t('regions.plateaux.tag'),
      badge: t('regions.plateaux.badge'),
      image: '/Sites/kpalimé.jpg',
      filter: 'Plateaux',
    },
    {
      id: 'kara',
      name: t('regions.kara.name'),
      tag: t('regions.kara.tag'),
      badge: t('regions.kara.badge'),
      image: '/Sites/koutamakou.jpg',
      filter: 'Kara',
    },
    {
      id: 'centrale',
      name: t('regions.centrale.name'),
      tag: t('regions.centrale.tag'),
      badge: t('regions.centrale.badge'),
      image: '/Hero1.jpg',
      filter: 'Centrale',
    },
    {
      id: 'savanes',
      name: t('regions.savanes.name'),
      tag: t('regions.savanes.tag'),
      badge: t('regions.savanes.badge'),
      image: '/Sites/yikpa.jpg',
      filter: 'Savanes',
    },
  ], [t])

  /* ── Monuments filtrés pour la carte interactive ── */
  const filteredMapMonuments = useMemo(() => {
    if (selectedMapRegion === 'all') return monuments
    return monuments.filter(m => m.région.toLowerCase().includes(selectedMapRegion.toLowerCase()))
  }, [selectedMapRegion])

  /* ── Guides certifiés ── */
  const guides = useMemo(() => [
    { initials: 'KA', name: t('guides.0.name'), rating: '4.8', languages: t('guides.0.languages'), bg: C.forest, zone: t('guides.0.zone') },
    { initials: 'EA', name: t('guides.1.name'), rating: '4.9', languages: t('guides.1.languages'), bg: C.rust,   zone: t('guides.1.zone') },
    { initials: 'MA', name: t('guides.2.name'), rating: '5.0', languages: t('guides.2.languages'), bg: C.gold,   zone: t('guides.2.zone') },
  ], [t])

  const stats = useMemo(() => [
    { value: '120+', label: t('stats_short.sites') },
    { value: '5',    label: t('stats_short.regions') },
    { value: '4',    label: t('stats_short.languages') },
    { value: '100%', label: t('pwa_label') },
  ], [t])

  /* ── Gestion de la synthèse vocale pour l'audioguide ── */
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
    const id = window.setInterval(
      () => setCurrentSlide(s => (s + 1) % slides.length),
      5200,
    )
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
    <main className="min-h-screen bg-base-100 pb-24 pt-16 text-base-content">

      {/* ── Bandeau hors ligne ── */}
      {!isOnline && (
        <div className="fixed inset-x-4 top-20 z-[60] mx-auto flex max-w-sm items-center
                        gap-2 rounded-xl bg-destructive px-4 py-3 text-sm font-bold
                        text-destructive-foreground shadow-xl">
          <WifiOff className="h-4 w-4 shrink-0" />
          {t('offline_banner')}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          HERO — VISUEL PUNCHY
      ══════════════════════════════════════════════════ */}
      <section
        className="relative h-[480px] w-full overflow-hidden md:h-[540px]"
        style={{ background: C.forest }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={slide.image}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1,  scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1C14]/95 via-[#2A1C14]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col justify-center px-5 sm:px-8">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C99A3E]">
            {t('header_kicker')}
          </p>

          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.title}
              className="mt-3 max-w-xl font-serif text-[2.6rem] font-bold italic leading-[0.95] text-white sm:text-6xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1,  y: 0 }}
              exit={{ opacity: 0,    y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {slide.title}
            </motion.h1>
          </AnimatePresence>

          <p className="mt-3 text-base font-black sm:text-lg text-[#C99A3E]">
            {t('tagline')}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <AuthGuardLink
              href="/scan"
              className="inline-flex min-h-[48px] items-center justify-center gap-2
                         rounded-2xl px-6 py-2.5 text-xs font-black uppercase tracking-wider
                         text-white shadow-lg transition-all
                         hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
              style={{ background: C.rust }}
            >
              <Camera className="h-4 w-4" />
              {t('cta_scan')}
            </AuthGuardLink>
            <AuthGuardLink
              href="/lieux"
              className="inline-flex min-h-[48px] items-center justify-center gap-2
                         rounded-2xl border border-white/80 px-6 py-2.5 text-xs font-black
                         uppercase tracking-wider text-white transition-all
                         hover:bg-white/10 active:scale-[0.98]"
            >
              <MapPin className="h-4 w-4" />
              {t('cta_discover')}
            </AuthGuardLink>
            <PwaInstallButton className="border-white/30 bg-white/15 text-white hover:bg-white hover:text-black" />
          </div>
        </div>

        {/* Flèches */}
        <button
          onClick={() => setCurrentSlide(s => (s - 1 + slides.length) % slides.length)}
          aria-label={t('previous_slide')}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full
                     bg-black/25 p-2 text-white backdrop-blur-sm transition
                     hover:bg-black/45 sm:left-5 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide(s => (s + 1) % slides.length)}
          aria-label={t('next_slide')}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full
                     bg-black/25 p-2 text-white backdrop-blur-sm transition
                     hover:bg-black/45 sm:right-5 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.image}
              onClick={() => setCurrentSlide(i)}
              aria-label={t('go_to_slide', { index: i + 1 })}
              className={
                i === currentSlide
                  ? 'h-2 w-8 rounded-full bg-white transition-all cursor-pointer'
                  : 'h-2 w-2 rounded-full bg-white/40 transition-all hover:bg-white/65 cursor-pointer'
              }
            />
          ))}
        </div>
      </section>

      {/* ── BARRE DE STATS ÉPURÉE ── */}
      <section className="border-b border-border/80 bg-base-200 px-4 py-5 shadow-xs">
        <div className="mx-auto grid max-w-5xl grid-cols-4 gap-4 text-center">
          {stats.map(stat => (
            <div key={stat.label}>
              <p className="font-serif text-2xl font-bold italic leading-none sm:text-3xl text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-base-content/75">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CONTENU PRINCIPAL STRUCTURÉ (5 ÉCRANS DE RÉFÉRENCE)
      ══════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl space-y-20 px-4 py-12 sm:px-8">

        {/* ══════════════════════════════════════════════════
            🟢 ÉCRAN 1 — NOS DESTINATIONS & TÉLÉCHARGÉS HORS-LIGNE
        ══════════════════════════════════════════════════ */}
        <section className="rounded-[32px] bg-[#3B2519] p-6 text-white shadow-xl sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#C99A3E]">
                {t('app_name')}
              </span>
              <h2 className="font-serif text-2xl font-bold italic text-white sm:text-3xl">
                {t('destinations_title')}
              </h2>
            </div>
            <Link
              href="/lieux"
              className="text-xs font-bold text-[#C99A3E] hover:underline"
            >
              {t('destinations_see_all')} →
            </Link>
          </div>

          {/* Cartes Verticales 3:4 avec Bouton Pilule DÉCOUVRIR */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {monuments.slice(0, 3).map((site) => (
              <div
                key={site.id}
                className="group relative flex h-92 flex-col justify-between overflow-hidden rounded-[26px] border border-white/10 bg-black/40 p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={site.image}
                  alt={tMonuments(`${site.id}.nom`)}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />

                <div className="relative z-10 flex justify-end">
                  <span className="rounded-xl bg-black/45 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md border border-white/20">
                    {site.région}
                  </span>
                </div>

                <div className="relative z-10 space-y-3">
                  <div>
                    <p className="text-[11px] font-bold text-[#C99A3E]">{site.localite}</p>
                    <h3 className="font-serif text-xl font-bold leading-tight text-white">
                      {tMonuments(`${site.id}.nom`)}
                    </h3>
                  </div>

                  <Link
                    href={`/lieux/${site.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FDFBF8] py-2.5 text-xs font-black uppercase tracking-wider text-[#3B2519] shadow-md transition-all hover:bg-[#C99A3E] hover:text-white active:scale-95"
                  >
                    <span>{t('pill_discover')}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Mes destinations hors-ligne */}
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-3.5 w-3.5 text-[#C99A3E]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  {t('downloaded_title')}
                </h3>
              </div>
              <span className="text-[10px] text-white/60 font-semibold">
                {t('downloaded_badge')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {monuments.slice(3, 7).map((site) => (
                <Link
                  key={site.id}
                  href={`/lieux/${site.id}`}
                  className="group flex items-center gap-2.5 rounded-xl bg-white/10 p-2 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={site.image}
                      alt={tMonuments(`${site.id}.nom`)}
                      fill
                      sizes="40px"
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white">
                      {tMonuments(`${site.id}.nom`)}
                    </p>
                    <span className="text-[9px] text-[#C99A3E] font-semibold">
                      ● {t('downloaded_badge')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            🟢 ÉCRAN 2 — GRILLE SQUIRCLE 4x2 & INCONTOURNABLES
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
              {t('treasures_title')}
            </h2>
            <Link href="/lieux" className="text-xs font-bold text-secondary hover:underline">
              {t('incontournables_see_all')} →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((cat) => {
              const CatIcon = cat.icon
              const label = t(`categories.${cat.key}`)

              return (
                <Link
                  key={cat.key}
                  href={cat.href}
                  className="group flex flex-col items-center justify-center gap-2 rounded-[22px] border border-[#E6D9C4] dark:border-border bg-[#F1E7D8]/60 dark:bg-base-200 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F1E7D8] shadow-xs active:scale-95"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white dark:bg-base-100 text-[#3B2519] dark:text-[#C99A3E] shadow-xs transition-transform group-hover:scale-105">
                    <CatIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#3B2519] dark:text-base-content">
                      {label}
                    </h3>
                    <span className="text-[10px] font-semibold text-[#6E5B4C] dark:text-base-content/60">
                      {cat.count}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Slider Incontournables */}
          <div className="mt-8">
            <p className="mb-3 text-xs font-black uppercase tracking-wider text-secondary">
              {t('incontournables_title')}
            </p>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
              {monuments.map((site) => (
                <Link
                  key={site.id}
                  href={`/lieux/${site.id}`}
                  className="group relative h-40 w-56 shrink-0 snap-start overflow-hidden rounded-[20px] border border-border bg-stone-900 shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <Image
                    src={site.image}
                    alt={tMonuments(`${site.id}.nom`)}
                    fill
                    sizes="224px"
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold text-[#C99A3E]">{site.localite}</span>
                    <h4 className="truncate font-serif text-sm font-bold">{tMonuments(`${site.id}.nom`)}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            🟢 ÉCRAN 3 — LES 5 GRANDES RÉGIONS DU TOGO
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
              {t('regions_section_title')}
            </h2>
            <Link href="/lieux" className="text-xs font-bold text-secondary hover:underline">
              {t('incontournables_see_all')} →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regionsList.map((reg) => (
              <div
                key={reg.id}
                className="group relative flex h-72 flex-col justify-between overflow-hidden rounded-[26px] border border-border/40 bg-stone-900 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <Image
                  src={reg.image}
                  alt={reg.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                <div className="relative z-10 flex justify-between items-center">
                  <span className="rounded-xl bg-[#C99A3E] px-2.5 py-0.5 text-[10px] font-black uppercase text-[#2A1C14]">
                    {reg.badge}
                  </span>
                  <span className="rounded-xl bg-black/40 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-white/20">
                    {reg.tag}
                  </span>
                </div>

                <div className="relative z-10 space-y-2.5">
                  <h3 className="font-serif text-xl font-bold text-white">
                    {reg.name}
                  </h3>
                  <Link
                    href={`/lieux?region=${reg.filter}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FDFBF8] py-2 text-xs font-black uppercase tracking-wider text-[#3B2519] shadow-xs transition-all hover:bg-[#C99A3E] hover:text-white"
                  >
                    <span>{t('pill_discover_region')}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            🟢 ÉCRAN 4 — AUDIOGUIDES & LECTEUR AUDIO MINIMALISTE
        ══════════════════════════════════════════════════ */}
        <section className="rounded-[32px] bg-[#2A1C14] p-6 text-white shadow-xl sm:p-8 border border-[#C99A3E]/30">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            
            {/* Carte Photo + Equalizer */}
            <div className="relative overflow-hidden rounded-[24px] border border-white/20 bg-black/40 p-4">
              <div className="relative h-44 w-full overflow-hidden rounded-xl">
                <Image
                  src="/Sites/monuments_independance.jpg"
                  alt={t('audioguide_sample_title')}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <p className="text-[10px] font-bold text-[#C99A3E]">{t('audioguide_sample_location')}</p>
                  <h3 className="font-serif text-lg font-bold">{t('audioguide_sample_title')}</h3>
                </div>
              </div>

              {/* Ondes audio animées */}
              <div className="mt-3 flex items-center justify-center gap-1 py-1">
                {[40, 75, 90, 60, 100, 45, 80, 65, 95, 50, 70, 85].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full bg-[#C99A3E] transition-all duration-300 ${
                      isPlayingAudio ? 'animate-pulse' : 'opacity-30'
                    }`}
                    style={{
                      height: isPlayingAudio ? `${h}%` : '15%',
                      maxHeight: '24px',
                      minHeight: '6px'
                    }}
                  />
                ))}
              </div>

              {/* Bouton Play/Pause */}
              <button
                onClick={toggleAudioGuide}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C99A3E] py-2.5 text-xs font-black uppercase tracking-wider text-[#2A1C14] transition-all hover:brightness-110 active:scale-95 cursor-pointer"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="h-4 w-4 fill-current" />
                    <span>{t('audioguide_pause')}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>{t('audioguide_play')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Infos & Langues */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C99A3E]/20 px-3 py-1 text-[11px] font-black uppercase text-[#C99A3E]">
                <Headphones className="h-3.5 w-3.5" />
                {t('audioguide_tts_badge')}
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold italic text-white sm:text-3xl">
                {t('audioguides_section_title')}
              </h2>
              <p className="mt-2 text-xs text-white/80 leading-relaxed">
                {t('audioguides_section_desc')}
              </p>

              {/* Langues */}
              <div className="mt-4 flex flex-wrap gap-1.5">
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
                      if (isPlayingAudio) {
                        window.speechSynthesis.cancel()
                        setIsPlayingAudio(false)
                      }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      speechLang === lang.code
                        ? 'bg-[#C99A3E] text-[#2A1C14]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            🟢 ÉCRAN 5 — CARTE INTERACTIVE GÉOLOCALISÉE
        ══════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
              {t('interactive_map_title')}
            </h2>
            <Link
              href="/lieux"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-black text-white hover:brightness-110"
            >
              <Navigation className="h-3 w-3 text-[#C99A3E]" />
              <span>{t('interactive_map_open_view')}</span>
            </Link>
          </div>

          {/* Filtres Rapides Régions */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: t('interactive_map_all_regions') },
              { id: 'Maritime', label: 'Maritime' },
              { id: 'Plateaux', label: 'Plateaux' },
              { id: 'Centrale', label: 'Centrale' },
              { id: 'Kara', label: 'Kara' },
              { id: 'Savanes', label: 'Savanes' },
            ].map((rf) => (
              <button
                key={rf.id}
                onClick={() => setSelectedMapRegion(rf.id)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                  selectedMapRegion === rf.id
                    ? 'bg-[#3B2519] text-white dark:bg-[#C99A3E] dark:text-[#2A1C14] shadow-xs'
                    : 'bg-base-200 text-base-content/75 hover:bg-base-300'
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>

          {/* Carte Leaflet */}
          <div className="overflow-hidden rounded-[28px] border border-border shadow-md">
            <DynamicCarte monumentsList={filteredMapMonuments} />
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            GUIDES CERTIFIÉS & CTA
        ══════════════════════════════════════════════════ */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
              {t('guides_title')}
            </h2>
            <AuthGuardLink
              href="/guides"
              className="text-xs font-bold text-secondary hover:underline"
            >
              {t('guides.view_all')} →
            </AuthGuardLink>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {guides.map(guide => (
              <article
                key={guide.name}
                className="flex items-center justify-between rounded-[22px] border border-border bg-base-200 p-4 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                    style={{ background: guide.bg }}
                  >
                    {guide.initials}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-base-content">{guide.name}</h3>
                    <p className="text-[11px] text-base-content/60 font-semibold">{guide.zone}</p>
                  </div>
                </div>

                <AuthGuardLink
                  href="/guides"
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:brightness-110"
                >
                  {t('guides.reserve')}
                </AuthGuardLink>
              </article>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}