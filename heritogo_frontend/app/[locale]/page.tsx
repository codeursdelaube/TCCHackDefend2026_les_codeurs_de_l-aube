'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe2,
  Headphones,
  Landmark,
  Languages,
  MapPin,
  Sparkles,
  TreePine,
  Users,
  Utensils,
  Wifi,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import AuthGuardLink from '@/components/AuthGuardLink'

type Slide = {
  image: string
  title: string
  subtitle: string
  description: string
  cta: string
  href: '/scan' | '/lieux' | '/cuisine' | '/regions'
  icon: typeof Camera
  tag: string
  badgeBg?: string
}

export default function AccueilPage() {
  const t = useTranslations('Accueil')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [paused, setPaused] = useState(false)

  const slides = useMemo<Slide[]>(() => [
    {
      image: '/Hero2.png',
      title: t('slides.1.title'),
      subtitle: t('slides.1.subtitle'),
      description: t('slides.1.description'),
      cta: t('slides.1.buttonText'),
      href: '/lieux',
      icon: Landmark,
      tag: 'UNESCO & Monuments',
    },
    {
      image: '/deuxlions.png',
      title: t('slides.0.title'),
      subtitle: t('slides.0.subtitle'),
      description: t('slides.0.description'),
      cta: t('slides.0.buttonText'),
      href: '/scan',
      icon: Camera,
      tag: 'Innovation IA',
    },
    {
      image: '/fufuhero.png',
      title: t('slides.2.title'),
      subtitle: t('slides.2.subtitle'),
      description: t('slides.2.description'),
      cta: t('slides.2.buttonText'),
      href: '/cuisine',
      icon: Utensils,
      tag: 'Gastronomie & Terroir',
    },
  ], [t])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  const previous = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const next = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const slide = slides[currentSlide]
  const SlideIcon = slide.icon

  const categories = [
    { href: '/lieux' as const, label: t('categories.monuments'), icon: Landmark, count: '29 sites' },
    { href: '/scan' as const, label: t('categories.scan'), icon: Camera, count: 'Reconnaissance IA', highlight: true },
    { href: '/cuisine' as const, label: t('categories.cuisine'), icon: Utensils, count: '31 plats' },
    { href: '/loisirs' as const, label: 'Parcs & Loisirs', icon: TreePine, count: '16 espaces' },
    { href: '/guides' as const, label: t('categories.guides'), icon: Users, count: 'Guides certifiés' },
  ]

  const featuredDestinations = [
    {
      title: 'Koutammakou',
      region: 'Kara',
      tag: 'UNESCO',
      image: '/Sites/koutamakou.jpg',
      desc: 'Paysage culturel et architecture fortifiée des Tata Somba.',
      href: '/lieux' as const,
    },
    {
      title: 'Palais de Lomé',
      region: 'Maritime',
      tag: 'Art & Histoire',
      image: '/Sites/palais_de_lome.webp',
      desc: 'Ancien palais des gouverneurs transformé en centre culturel majeur.',
      href: '/lieux' as const,
    },
    {
      title: 'Cascade de Kpimé',
      region: 'Plateaux',
      tag: 'Écotourisme',
      image: '/Sites/kpime.jpg',
      desc: 'Plus haute chute d’eau du Togo au cœur d’une végétation luxuriante.',
      href: '/lieux' as const,
    },
  ]

  return (
    <main className="min-h-screen bg-background pb-28 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        
        {/* ══════════════════════════════════════════════════
            HERO SECTION — ART DIRECTION TERRACOTTA & OR
        ══════════════════════════════════════════════════ */}
        <section className="relative">
          <div
            className="group relative isolate min-h-[480px] sm:min-h-[560px] lg:min-h-[600px] overflow-hidden rounded-3xl border border-border bg-[#171009] shadow-xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Background Images with smooth Fade / Parallax */}
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.image}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-cover object-center brightness-[0.88] contrast-[1.05]"
                />
                {/* Warm earthy gradient scrim for contrast and atmosphere */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#171009] via-[#171009]/55 to-[#171009]/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#171009]/80 via-transparent to-transparent sm:max-w-3xl" />
              </motion.div>
            </AnimatePresence>

            {/* Top Bar inside Hero with Status Badge */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold text-white/90">Patrimoine togolais en direct</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-950/60 px-3.5 py-1.5 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] font-bold text-amber-200">Patrimoine UNESCO</span>
              </div>
            </div>

            {/* Slide Content */}
            <div className="relative z-10 flex min-h-[480px] sm:min-h-[560px] lg:min-h-[600px] flex-col justify-end p-6 sm:p-10 lg:p-14 text-white">
              <div className="max-w-2xl space-y-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45 }}
                    className="space-y-3"
                  >
                    {/* Tag / Category Badge */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                        <SlideIcon className="h-3.5 w-3.5" />
                        {slide.subtitle}
                      </span>
                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
                        {slide.tag}
                      </span>
                    </div>

                    {/* Headline */}
                    <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-[#FBF6EF] drop-shadow-sm">
                      {slide.title}
                    </h1>

                    {/* Description */}
                    <p className="max-w-lg text-sm sm:text-base leading-relaxed text-[#FBF6EF]/85 font-sans">
                      {slide.description}
                    </p>

                    {/* Primary CTA & Secondary Action */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Link
                        href={slide.href}
                        className="inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>{slide.cta}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      <Link
                        href="/scan"
                        className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/20 px-5 py-3.5 text-sm font-bold text-amber-200 backdrop-blur-md transition-all hover:bg-accent/30 hover:border-accent"
                      >
                        <Camera className="h-4 w-4 text-accent" />
                        <span>Scanner IA</span>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slider Navigation & Indicators */}
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                {/* Dots / Bars */}
                <div className="flex items-center gap-2">
                  {slides.map((item, index) => (
                    <button
                      key={item.image}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      aria-label={t('go_to_slide', { index: index + 1 })}
                      aria-current={index === currentSlide}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentSlide
                          ? 'w-10 bg-primary shadow-sm'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                    />
                  ))}
                </div>

                {/* Arrows for Desktop */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={previous}
                    aria-label={t('previous_slide')}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label={t('next_slide')}
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            STATS & ENGAGEMENT TICKER
        ══════════════════════════════════════════════════ */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {[
            { value: '29', label: 'Sites Patrimoniaux', sub: 'Monuments répertoriés', icon: Landmark },
            { value: '5', label: 'Régions Touristiques', sub: 'Du Littoral aux Savanes', icon: Globe2 },
            { value: '31', label: 'Spécialités Culinaires', sub: 'Recettes & Terroirs', icon: Utensils },
            { value: '100%', label: 'PWA Hors-Ligne', sub: 'Accès sans réseau', icon: Wifi },
          ].map(({ value, label, sub, icon: Icon }) => (
            <div
              key={label}
              className="app-card flex flex-col justify-between p-4 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-serif text-2xl font-bold text-primary sm:text-3xl">{value}</span>
              </div>
              <div className="mt-3">
                <p className="font-bold text-xs sm:text-sm text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ══════════════════════════════════════════════════
            EXPLORATION PAR CATÉGORIES (PHOTO-FIRST)
        ══════════════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Explorez le Togo
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Que souhaitez-vous découvrir ?
              </h2>
            </div>
            <Link
              href="/lieux"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:text-primary-dark transition-colors"
            >
              <span>{t('incontournables_see_all')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map(({ href, label, icon: Icon, count, highlight }) => (
              <Link
                key={href}
                href={href}
                className={`app-card group relative flex flex-col justify-between p-4 transition-all duration-300 hover:-translate-y-1 ${
                  highlight
                    ? 'border-accent/50 bg-amber-50/40 dark:bg-amber-950/20'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-2xl transition-colors ${
                      highlight
                        ? 'bg-accent text-[#241A08]'
                        : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {highlight && (
                    <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                      Signature IA
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {label}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground font-medium">{count}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            DESTINATIONS EMBLÉMATIQUES (KOUTAMMAKOU UNESCO ETC)
        ══════════════════════════════════════════════════ */}
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 mb-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Compass className="h-3.5 w-3.5" />
                <span>Patrimoine Vivant</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Trésors Incontournables
              </h2>
            </div>
            <Link
              href="/lieux"
              className="text-xs sm:text-sm font-bold text-primary hover:underline"
            >
              Tous les 29 sites →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDestinations.map((dest) => (
              <Link
                key={dest.title}
                href={dest.href}
                className="app-card group relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Photo Header */}
                <div className="relative h-56 w-full overflow-hidden bg-muted">
                  <Image
                    src={dest.image}
                    alt={dest.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {/* UNESCO or Category Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {dest.tag === 'UNESCO' ? (
                      <span className="unesco-badge rounded-full px-3 py-1 text-[11px] uppercase tracking-wider">
                        ✦ Patrimoine UNESCO
                      </span>
                    ) : (
                      <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        {dest.tag}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-200">
                      <MapPin className="h-3 w-3" />
                      Région {dest.region}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-white leading-tight">
                      {dest.title}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {dest.desc}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs font-semibold text-primary">Explorer la fiche</span>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:translate-x-1">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            SIGNATURE FEATURE — SCANNER IA & AUDIO GUIDE
        ══════════════════════════════════════════════════ */}
        <section className="app-card relative overflow-hidden p-6 sm:p-8 lg:p-10 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="space-y-4 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3.5 py-1 text-xs font-bold text-[#8A3A20] dark:text-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span>Fonctionnalité Signature</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                Photographiez un monument, l’IA vous raconte son histoire.
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                Pointez votre appareil vers un monument historique togolais ou importez une photo. Notre modèle de vision par ordinateur identifie l’édifice et lance la synthèse vocale immersive en direct.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/scan"
                  className="inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark"
                >
                  <Camera className="h-4 w-4" />
                  <span>Essayer le Scanner IA</span>
                </Link>

                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Headphones className="h-4 w-4 text-primary" />
                  <span>Audio-guide multilingue inclus</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="relative h-64 w-full max-w-sm overflow-hidden rounded-2xl border border-border shadow-lg bg-black/10">
                <Image
                  src="/deuxlions.png"
                  alt="Scanner IA HeriTogo"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-2.5 py-1 text-[11px] font-bold">
                    <span>99.4% confiance</span>
                  </div>
                  <p className="mt-1 font-serif text-base font-bold">Monument des Deux Lions</p>
                  <p className="text-xs text-white/80">Lomé, Région Maritime</p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}