'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, BadgeCheck, BookOpen, Camera, Check, Compass,
  Crown, Headphones, Landmark, Languages, MapPin,
  ShieldCheck, Sparkles, Star, Utensils, WifiOff,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import AuthGuardLink from '@/components/AuthGuardLink'
import PwaInstallButton from '@/components/PwaInstallButton'
import { Link } from '@/i18n/navigation'
import { monuments } from '@/app/LieuxT/site'

/* ─── Types ─────────────────────────────────────────────── */
interface SlideItem {
  image: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  link: string
}

/* ─── Tokens couleur — palette officielle HeriTogo ───────── */
const C = {
  forest: '#004D40',
  rust:   '#BF360C',
  gold:   '#F57F17',
  cream:  '#F3F0DC',
  ink:    '#0A0A0A',
} as const

/* ════════════════════════════════════════════════════════════
   PAGE ACCUEIL HERITOGO
════════════════════════════════════════════════════════════ */
export default function AccueilPage() {
  const t = useTranslations('Accueil')
  const tMonuments = useTranslations('Monuments')
  const [isOnline, setIsOnline]         = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

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

  /* ── Les 4 piliers d'expérience ── */
  const pillars = useMemo(() => [
    {
      href: '/scan',
      icon: Camera,
      badge: t('pillars.scan.badge'),
      isPremium: true,
      title: t('pillars.scan.title'),
      description: t('pillars.scan.desc'),
      action: t('pillars.scan.action'),
      accent: C.rust,
    },
    {
      href: '/lieux',
      icon: MapPin,
      badge: t('pillars.geo.badge'),
      title: t('pillars.geo.title'),
      description: t('pillars.geo.desc'),
      action: t('pillars.geo.action'),
      accent: C.forest,
    },
    {
      href: '/cuisine',
      icon: Utensils,
      badge: t('pillars.food.badge'),
      title: t('pillars.food.title'),
      description: t('pillars.food.desc'),
      action: t('pillars.food.action'),
      accent: C.gold,
    },
    {
      href: '/guides',
      icon: Compass,
      badge: t('pillars.guides.badge'),
      title: t('pillars.guides.title'),
      description: t('pillars.guides.desc'),
      action: t('pillars.guides.action'),
      accent: C.forest,
    },
  ], [t])

  /* ── Les 3 étapes de fonctionnement ── */
  const steps = useMemo(() => [
    {
      number: '01',
      icon: Camera,
      title: t('steps.0.title'),
      description: t('steps.0.desc'),
    },
    {
      number: '02',
      icon: Sparkles,
      title: t('steps.1.title'),
      description: t('steps.1.desc'),
    },
    {
      number: '03',
      icon: Headphones,
      title: t('steps.2.title'),
      description: t('steps.2.desc'),
    },
  ], [t])

  /* ── Sites emblématiques sélectionnés ── */
  const showcaseSites = useMemo(() => {
    return monuments.slice(0, 4)
  }, [])

  /* ── Guides certifiés d'exemple ── */
  const guides = useMemo(() => [
    { initials: 'KA', name: t('guides.0.name'), rating: '4.8', languages: t('guides.0.languages'), bg: C.forest, zone: t('guides.0.zone') },
    { initials: 'EA', name: t('guides.1.name'), rating: '4.9', languages: t('guides.1.languages'), bg: C.rust,   zone: t('guides.1.zone') },
    { initials: 'MA', name: t('guides.2.name'), rating: '5.0', languages: t('guides.2.languages'), bg: C.gold,   zone: t('guides.2.zone') },
  ], [t])

  const subFeatures = useMemo(() => [
    t('subscription.features.scans'),
    t('subscription.features.audio'),
    t('subscription.features.history'),
    t('subscription.features.offline'),
  ], [t])

  const stats = useMemo(() => [
    { value: '120+', label: t('stats_short.sites'), sub: t('stats_subs.sites') },
    { value: '5',    label: t('stats_short.regions'), sub: t('stats_subs.regions') },
    { value: '4',    label: t('stats_short.languages'), sub: t('stats_subs.languages') },
    { value: '100%', label: t('pwa_label'), sub: t('pwa_sub') },
  ], [t])

  /* ── Effets ── */
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
    <main className="min-h-screen bg-base-100 pb-28 pt-16 text-base-content">

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
          HERO — Carousel
      ══════════════════════════════════════════════════ */}
      <section
        className="relative h-[520px] w-full overflow-hidden md:h-[580px]"
        style={{ background: C.forest }}
      >
        {/* Image de fond animée */}
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

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#004D40]/92 via-[#004D40]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

        {/* Contenu */}
        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col
                        justify-center px-5 sm:px-8">

          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">
            {t('hero_kicker')}
          </p>

          {/* Titre animé */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={slide.title}
              className="mt-3 max-w-2xl font-serif text-[2.8rem] font-bold italic
                         leading-[0.95] text-white sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1,  y: 0 }}
              exit={{ opacity: 0,    y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {slide.title}
            </motion.h1>
          </AnimatePresence>

          <p className="mt-4 text-lg font-black sm:text-xl" style={{ color: C.gold }}>
            {t('hero_motto')}
          </p>

          <p className="mt-3 max-w-lg text-base font-medium leading-7 text-white/80">
            {slide.description}
          </p>

          {/* Boutons CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AuthGuardLink
              href="/scan"
              className="inline-flex min-h-[52px] items-center justify-center gap-2
                         rounded-2xl px-7 py-3 text-sm font-black uppercase tracking-wider
                         text-white shadow-lg transition-all
                         hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
              style={{ background: C.rust }}
            >
              <Camera className="h-5 w-5" />
              {t('cta_scan')}
            </AuthGuardLink>
            <AuthGuardLink
              href="/lieux"
              className="inline-flex min-h-[52px] items-center justify-center gap-2
                         rounded-2xl border border-white/80 px-7 py-3 text-sm font-black
                         uppercase tracking-wider text-white transition-all
                         hover:bg-white/10 active:scale-[0.98]"
            >
              <MapPin className="h-5 w-5" />
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

      {/* ══════════════════════════════════════════════════
          STATS BAR ÉLÉGANTE
      ══════════════════════════════════════════════════ */}
      <section className="border-b border-border/80 bg-base-200 px-4 py-8 shadow-sm">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p
                className="font-serif text-4xl font-bold italic leading-none sm:text-5xl"
                style={{ color: C.forest }}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-base-content">
                {stat.label}
              </p>
              <p className="text-[11px] font-medium text-base-content/55">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CONTENU PRINCIPAL STRUCTURÉ
      ══════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl space-y-24 px-4 py-16 sm:px-8">

        {/* ── LES 4 PILIERS DE L'APPLICATION ── */}
        <section>
          <div className="mb-10 text-center sm:text-left">
            <span
              className="inline-flex items-center gap-2 rounded-2xl bg-secondary/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-secondary"
            >
              <Sparkles className="h-4 w-4" />
              {t('pillars_section.badge')}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold italic sm:text-5xl">
              {t('pillars_section.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-base-content/65 sm:text-base">
              {t('pillars_section.desc')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <AuthGuardLink
                  key={pillar.href}
                  href={pillar.href}
                  className="group relative flex flex-col justify-between rounded-[32px] border border-border bg-base-200 p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
                >
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm"
                        style={{ backgroundColor: pillar.accent }}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <span className="rounded-2xl border border-border bg-base-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-base-content/75">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-base-content group-hover:text-primary transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="mt-3 text-sm font-medium leading-7 text-base-content/65">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-sm font-black text-secondary">
                    <span>{pillar.action}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                  </div>
                </AuthGuardLink>
              )
            })}
          </div>
        </section>

        {/* ── COMMENT ÇA MARCHE (SCAN IA) ── */}
        <section className="rounded-[36px] border border-border bg-base-200 p-8 sm:p-12 shadow-sm">
          <div className="mb-10 text-center">
            <span
              className="inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-primary dark:text-secondary"
            >
              <Camera className="h-4 w-4" />
              {t('scanner_section.badge')}
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold italic sm:text-4xl">
              {t('scanner_section.title')}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-base-content/60">
              {t('scanner_section.desc')}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const StepIcon = step.icon
              return (
                <div
                  key={step.number}
                  className="relative flex flex-col rounded-[28px] border border-border bg-base-100 p-6 shadow-xs"
                >
                  <span className="text-3xl font-black text-secondary/30">
                    {step.number}
                  </span>
                  <div className="my-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                    <StepIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-base-content">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs font-medium leading-6 text-base-content/65">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <AuthGuardLink
              href="/scan"
              className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl px-8 py-3 text-sm font-black text-white shadow-md transition-all hover:scale-105"
              style={{ backgroundColor: C.forest }}
            >
              <Camera className="h-4 w-4" />
              {t('scanner_section.cta')}
            </AuthGuardLink>
          </div>
        </section>

        {/* ── TRÉSORS DU TOGO (MONUMENTS EN VEDETTE) ── */}
        <section>
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-2xl bg-secondary/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-secondary"
              >
                <Landmark className="h-4 w-4" />
                {t('monuments_section.badge')}
              </span>
              <h2 className="mt-3 font-serif text-3xl font-bold italic sm:text-5xl">
                {t('monuments_section.title')}
              </h2>
            </div>
            <Link
              href="/lieux"
              className="inline-flex items-center gap-2 text-sm font-black text-secondary transition-all hover:gap-3"
            >
              {t('monuments_section.view_all', { count: monuments.length })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {showcaseSites.map((site) => (
              <Link
                key={site.id}
                href={`/lieux/${site.id}`}
                className="group flex flex-col overflow-hidden rounded-[28px] border border-border bg-base-200 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 w-full overflow-hidden bg-base-300">
                  <Image
                    src={site.image}
                    alt={tMonuments(`${site.id}.nom`)}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 rounded-xl bg-secondary px-2.5 py-1 text-[10px] font-black uppercase text-secondary-content">
                    {site.région}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="line-clamp-1 font-bold text-base text-base-content group-hover:text-primary transition-colors">
                    {tMonuments(`${site.id}.nom`)}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-base-content/55">
                    <MapPin className="h-3 w-3 text-secondary shrink-0" />
                    <span className="truncate">{site.localite}</span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-base-content/65">
                    {tMonuments(`${site.id}.description`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── GUIDES CERTIFIÉS ── */}
        <section>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p
                className="text-xs font-black uppercase tracking-widest text-secondary"
              >
                {t('guides.tag')}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold italic sm:text-5xl">
                {t('guides_title')}
              </h2>
              <p className="mt-2 text-xs font-semibold text-base-content/55">
                {t('guides.sample_disclaimer')}
              </p>
            </div>
            <AuthGuardLink
              href="/guides"
              className="inline-flex items-center gap-2 text-sm font-black text-secondary transition-all hover:gap-3"
            >
              {t('guides.view_all')}
              <ArrowRight className="h-4 w-4" />
            </AuthGuardLink>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {guides.map(guide => (
              <article
                key={guide.name}
                className="rounded-[30px] border border-border bg-base-200 p-6 shadow-sm
                           transition-all hover:border-primary/40 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center
                                 rounded-2xl text-lg font-black text-white shadow-sm"
                      style={{ background: guide.bg }}
                    >
                      {guide.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-base-content">{guide.name}</h3>
                      <span
                        className="mt-1 inline-flex items-center gap-1 rounded-full
                                   px-2.5 py-0.5 text-[10px] font-black text-white"
                        style={{ background: C.forest }}
                      >
                        <BadgeCheck className="h-3 w-3" />
                        {t('guides.certified')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-base-content">
                    <Star className="h-4 w-4" style={{ fill: C.gold, color: C.gold }} />
                    <span>{guide.rating}</span>
                    <span className="text-base-content/40">• {guide.zone}</span>
                  </div>

                  <p className="mt-3 flex items-center gap-2 text-xs text-base-content/65">
                    <Languages className="h-4 w-4 shrink-0 text-secondary" />
                    <span>{guide.languages}</span>
                  </p>
                </div>

                <div className="mt-6 border-t border-border/60 pt-4">
                  <div className="mb-3 flex justify-between items-baseline">
                    <span className="text-[10px] font-black uppercase tracking-wider text-base-content/45">{t('guide_daily_rate')}</span>
                    <span className="text-sm font-black text-base-content">{t('guides.price')}</span>
                  </div>
                  <AuthGuardLink
                    href="/guides"
                    className="inline-flex min-h-[44px] w-full items-center justify-center
                               rounded-2xl text-xs font-black text-white transition-all
                               hover:brightness-110 active:scale-[0.98]"
                    style={{ background: C.forest }}
                  >
                    {t('guides.reserve')}
                  </AuthGuardLink>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── ABONNEMENT PREMIUM (2 000 FCFA) ── */}
        <section
          className="rounded-[36px] p-8 text-white shadow-2xl sm:p-12"
          style={{ background: C.forest }}
        >
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full bg-white/10
                           px-4 py-2 text-xs font-black uppercase tracking-wide"
              >
                <Crown className="h-4 w-4" style={{ color: C.gold }} />
                {t('subscription.tag')}
              </span>
              <h2 className="mt-5 font-serif text-3xl font-bold italic sm:text-5xl leading-tight">
                {t('subscribe_title')}
              </h2>
              <p className="mt-4 text-3xl font-black" style={{ color: C.gold }}>
                {t('subscribe_price')}
              </p>
              <p className="mt-2 text-xs text-white/70">
                {t('subscribe_ideal')}
              </p>
            </div>

            <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 sm:p-8 backdrop-blur-xs">
              <ul className="space-y-3.5">
                {subFeatures.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold">
                    <Check className="h-5 w-5 shrink-0" style={{ color: C.gold }} />
                    {f}
                  </li>
                ))}
              </ul>
              <AuthGuardLink
                href="/subscription"
                className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center
                           rounded-2xl text-sm font-black uppercase tracking-wide text-white transition-all
                           hover:brightness-110 active:scale-[0.98] shadow-lg cursor-pointer"
                style={{ background: C.rust }}
              >
                {t('subscribe_cta')}
              </AuthGuardLink>
            </div>
          </div>
        </section>

        {/* ── APPEL À L'AVENTURE FINAL ── */}
        <section
          className="rounded-[36px] border border-border bg-base-200 p-8 text-base-content sm:p-12 shadow-sm"
        >
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p
                className="text-xs font-black uppercase tracking-widest text-secondary"
              >
                {t('final_cta.tag')}
              </p>
              <h2 className="mt-2 max-w-lg font-serif text-2xl font-bold italic sm:text-4xl">
                {t('final_cta.title')}
              </h2>
              <p className="mt-2 text-xs text-base-content/60">
                {t('final_cta_sub')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <PwaInstallButton />
              <AuthGuardLink
                href="/lieux"
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl px-8 py-4
                           text-sm font-black text-white transition-all shadow-md
                           hover:brightness-110 active:scale-[0.98] cursor-pointer"
                style={{ background: C.forest }}
              >
                {t('final_cta.cta')}
                <ArrowRight className="h-4 w-4" />
              </AuthGuardLink>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}