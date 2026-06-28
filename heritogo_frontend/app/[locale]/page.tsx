'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, BadgeCheck, BookOpenText, Building2, BusFront, CalendarDays,
  Check, Crown, ExternalLink, Hotel, ImageIcon, Landmark, Languages, Mail,
  MapPin, Megaphone, Palette, Plane, Scan, Star, Users, Utensils, WifiOff,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

/* ─── Types ─────────────────────────────────────────────── */
interface SlideItem {
  image: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  link: string
}

/* ─── Tokens couleur — palette Stitch officielle ─────────── */
const C = {
  forest: '#004D40',
  rust:   '#BF360C',
  gold:   '#F57F17',
  cream:  '#F3F0DC',
  ink:    '#0A0A0A',
} as const

/* ════════════════════════════════════════════════════════════
   PAGE ACCUEIL
════════════════════════════════════════════════════════════ */
export default function AccueilPage() {
  const t = useTranslations('Accueil')
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

  /* ── Données statiques ── */
  const categories = [
    { icon: Landmark,     label: t('categories.places.label'),    sub: t('categories.places.sub'),    href: '/lieux' },
    { icon: Palette,      label: t('categories.cultures.label'),  sub: t('categories.cultures.sub'),  href: '/histoire' },
    { icon: BookOpenText, label: t('categories.stories.label'),   sub: t('categories.stories.sub'),   href: '/histoire' },
    { icon: CalendarDays, label: t('categories.events.label'),    sub: t('categories.events.sub'),    href: '/lieux' },
    { icon: Users,        label: t('categories.community.label'), sub: t('categories.community.sub'), href: '/guides' },
  ]

  const featureCards = [
    {
      href: '/scan', icon: Scan, isPremium: true,
      title:       t('features.scan_title'),
      description: t('features.scan_desc'),
      tag:         t('features.scan_tag'),
      badge:       t('features.scan_badge'),
      cta:         t('features.scan_cta'),
    },
    {
      href: '/lieux', icon: MapPin, isPremium: false,
      title:       t('features.geo_title'),
      description: t('features.geo_desc'),
      tag:         t('features.geo_tag'),
      cta:         t('features.geo_cta'),
    },
    {
      href: '/cuisine', icon: Utensils, isPremium: false,
      title:       t('features.cuisine_title'),
      description: t('features.cuisine_desc'),
      tag:         t('features.cuisine_tag'),
      cta:         t('features.cuisine_cta'),
    },
  ]

  const guides = [
    { initials: 'KA', name: t('guides.0.name'), rating: '4.8', languages: t('guides.0.languages'), bg: C.forest },
    { initials: 'EA', name: t('guides.1.name'), rating: '4.9', languages: t('guides.1.languages'), bg: C.rust   },
    { initials: 'MA', name: t('guides.2.name'), rating: '5.0', languages: t('guides.2.languages'), bg: C.gold   },
  ]

  const subFeatures = [
    t('subscription.features.scans'),
    t('subscription.features.audio'),
    t('subscription.features.history'),
    t('subscription.features.offline'),
  ]

  const stats = [
    { value: '120+', label: t('stats_short.sites') },
    { value: '7',    label: t('stats_short.regions') },
    { value: '4',    label: t('stats_short.languages') },
    { value: '500+', label: t('stats_short.explorers') },
  ]

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

  /* ════════════════════════════════════════════════════════
     JSX
  ════════════════════════════════════════════════════════ */
  return (
    <main className="min-h-screen bg-background pb-28 pt-16 text-foreground">

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

          {/* Titre animé — élément signature */}
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/scan"
              className="inline-flex min-h-[52px] items-center justify-center gap-2
                         rounded-lg px-7 py-3 text-sm font-black uppercase tracking-wider
                         text-white shadow-lg transition-all
                         hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98]"
              style={{ background: C.rust }}
            >
              <Scan className="h-5 w-5" />
              {t('cta_scan')}
            </Link>
            <Link
              href="/lieux"
              className="inline-flex min-h-[52px] items-center justify-center gap-2
                         rounded-lg border border-white/80 px-7 py-3 text-sm font-black
                         uppercase tracking-wider text-white transition-all
                         hover:bg-white/10 active:scale-[0.98]"
            >
              <MapPin className="h-5 w-5" />
              {t('cta_discover')}
            </Link>
          </div>
        </div>

        {/* Flèches */}
        <button
          onClick={() => setCurrentSlide(s => (s - 1 + slides.length) % slides.length)}
          aria-label="Slide précédent"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full
                     bg-black/25 p-2 text-white backdrop-blur-sm transition
                     hover:bg-black/45 sm:left-5"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide(s => (s + 1) % slides.length)}
          aria-label="Slide suivant"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full
                     bg-black/25 p-2 text-white backdrop-blur-sm transition
                     hover:bg-black/45 sm:right-5"
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
                  ? 'h-2 w-8 rounded-full bg-white transition-all'
                  : 'h-2 w-2 rounded-full bg-white/40 transition-all hover:bg-white/65'
              }
            />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATÉGORIES
      ══════════════════════════════════════════════════ */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-5xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map(cat => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex min-h-[88px] items-center gap-3 border-b-2
                           border-transparent px-3 py-4 transition-all
                           hover:border-primary sm:px-4"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: C.cream, color: C.forest }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-black text-foreground">
                    {cat.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                    {cat.sub}
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════
          TICKER
      ══════════════════════════════════════════════════ */}
      <div className="overflow-hidden py-3" style={{ background: C.cream }}>
        <div className="flex items-center gap-4">
          <Megaphone className="ml-5 h-4 w-4 shrink-0" style={{ color: C.rust }} />
          <motion.p
            className="flex gap-16 whitespace-nowrap text-xs font-black uppercase tracking-wider"
            style={{ color: C.forest }}
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 1, 2, 3].map(n => <span key={n}>{t('ticker')}</span>)}
          </motion.p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════ */}
      <section className="px-4 py-8" style={{ background: C.forest }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="text-center">
              <p
                className="font-serif text-5xl font-bold italic leading-none sm:text-6xl"
                style={{ color: C.gold }}
              >
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-wide text-white/75">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl space-y-20 px-4 py-16 sm:px-8">

        {/* ── FONCTIONNALITÉS ── */}
        <section>
          <div className="mb-8">
            <p
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: C.rust }}
            >
              {t('features_header.tag')}
            </p>
            <h2 className="mt-2 font-serif text-4xl font-bold italic text-foreground sm:text-5xl">
              {t('features_title')}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              {t('features_header.description')}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featureCards.map(card => {
              const Icon = card.icon
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group flex min-h-[340px] flex-col rounded-xl border border-border
                             bg-card p-6 shadow-sm transition-all
                             hover:-translate-y-1 hover:border-primary hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg text-white"
                      style={{ background: C.forest }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
                      style={{ background: C.cream, color: C.forest }}
                    >
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold italic text-foreground">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {card.description}
                  </p>

                  {card.isPremium && card.badge && (
                    <span
                      className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full
                                 px-3 py-1.5 text-xs font-black text-white"
                      style={{ background: C.rust }}
                    >
                      <Crown className="h-3.5 w-3.5" />
                      {card.badge}
                    </span>
                  )}

                  <span
                    className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm
                               font-black transition-all group-hover:gap-3"
                    style={{ color: C.rust }}
                  >
                    {card.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── GUIDES CERTIFIÉS ── */}
        <section>
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: C.rust }}
              >
                {t('guides.tag')}
              </p>
              <h2 className="mt-2 font-serif text-4xl font-bold italic text-foreground sm:text-5xl">
                {t('guides_title')}
              </h2>
            </div>
            <Link
              href="/guides"
              className="inline-flex items-center gap-2 text-sm font-black
                         transition-all hover:gap-3"
              style={{ color: C.rust }}
            >
              {t('guides.view_all')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {guides.map(guide => (
              <article
                key={guide.name}
                className="rounded-xl border border-border bg-card p-6 shadow-sm
                           transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center
                               rounded-full text-lg font-black text-white"
                    style={{ background: guide.bg }}
                  >
                    {guide.initials}
                  </div>
                  <div>
                    <h3 className="font-black text-foreground">{guide.name}</h3>
                    <span
                      className="mt-1.5 inline-flex items-center gap-1 rounded-full
                                 px-2.5 py-1 text-[11px] font-black text-white"
                      style={{ background: C.forest }}
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      {t('guides.certified')}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-sm font-black text-foreground">
                  <Star className="h-4 w-4" style={{ fill: C.gold, color: C.gold }} />
                  {guide.rating}
                </div>

                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Languages className="h-4 w-4 shrink-0" style={{ color: C.rust }} />
                  {guide.languages}
                </p>

                <p className="mt-5 text-xl font-black text-foreground">
                  {t('guides.price')}
                </p>

                <Link
                  href="/guides"
                  className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center
                             rounded-lg text-sm font-black text-white transition-all
                             hover:brightness-110 active:scale-[0.98]"
                  style={{ background: C.forest }}
                >
                  {t('guides.reserve')}
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ── ABONNEMENT PREMIUM ── */}
        <section
          className="rounded-2xl p-7 text-white shadow-xl sm:p-10"
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
              <h2 className="mt-5 font-serif text-4xl font-bold italic sm:text-5xl">
                {t('subscribe_title')}
              </h2>
              <p className="mt-4 text-3xl font-black" style={{ color: C.gold }}>
                {t('subscribe_price')}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 p-6">
              <ul className="space-y-3">
                {subFeatures.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm font-bold">
                    <Check className="h-5 w-5 shrink-0" style={{ color: C.gold }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/subscription"
                className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center
                           rounded-lg text-sm font-black text-white transition-all
                           hover:brightness-110 active:scale-[0.98]"
                style={{ background: C.rust }}
              >
                {t('subscribe_cta')}
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section
          className="rounded-2xl p-8 text-white shadow-xl sm:p-10"
          style={{ background: C.ink }}
        >
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: C.gold }}
              >
                {t('final_cta.tag')}
              </p>
              <h2 className="mt-3 max-w-lg font-serif text-3xl font-bold italic sm:text-4xl">
                {t('final_cta.title')}
              </h2>
            </div>
            <Link
              href="/lieux"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg px-7 py-4
                         text-sm font-black transition-all
                         hover:brightness-110 active:scale-[0.98]"
              style={{ background: C.gold, color: C.ink }}
            >
              {t('final_cta.cta')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

      </div>
    </main>
  )
}