'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Camera, ChevronLeft, ChevronRight, MapPin, Scan, Utensils, WifiOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface SlideItem {
  image: string
  title: string
  subtitle: string
  description: string
  buttonText: string
  link: string
}

export default function AcceuilPage() {
  const t = useTranslations('Accueil')
  const [isOnline, setIsOnline] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = useMemo<SlideItem[]>(() => [
    {
      image: '/deuxlions.png',
      title: t('slides.0.title'),
      subtitle: t('slides.0.subtitle'),
      description: t('slides.0.description'),
      buttonText: t('slides.0.buttonText'),
      link: '/scan',
    },
    {
      image: '/Hero2.png',
      title: t('slides.1.title'),
      subtitle: t('slides.1.subtitle'),
      description: t('slides.1.description'),
      buttonText: t('slides.1.buttonText'),
      link: '/lieux',
    },
    {
      image: '/fufuhero.png',
      title: t('slides.2.title'),
      subtitle: t('slides.2.subtitle'),
      description: t('slides.2.description'),
      buttonText: t('slides.2.buttonText'),
      link: '/cuisine',
    },
  ], [t])

  const featureCards = [
    { href: '/scan', icon: Scan, title: t('features.scan_title'), description: t('features.scan_desc'), tag: t('features.scan_tag') },
    { href: '/lieux', icon: MapPin, title: t('features.geo_title'), description: t('features.geo_desc'), tag: t('features.geo_tag') },
    { href: '/cuisine', icon: Utensils, title: t('features.cuisine_title'), description: t('features.cuisine_desc'), tag: t('features.cuisine_tag') },
  ]

  const stats = [
    { value: '120+', label: t('stats.lieux') },
    { value: '7', label: t('stats.regions') },
    { value: '500+', label: t('stats.explorers') },
    { value: '4.8', label: t('stats.rating') },
  ]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((value) => (value + 1) % slides.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  const activeSlide = slides[currentSlide]

  return (
    <main className="min-h-screen bg-base-100 px-4 pb-28 pt-20 text-base-content sm:px-6 lg:px-8">
      {!isOnline && (
        <div className="fixed left-4 right-4 top-20 z-[60] mx-auto flex max-w-md items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs font-black text-secondary-content shadow-xl">
          <WifiOff className="h-4 w-4" />
          {t('offline_banner')}
        </div>
      )}

      <section className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <div className="flex min-h-[460px] flex-col justify-between rounded-[32px] border border-border bg-base-200 p-5 shadow-sm sm:p-7 lg:min-h-[600px]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-border bg-base-100 px-3 py-2 text-[11px] font-black uppercase tracking-wide text-base-content/65">
              <Camera className="h-4 w-4 text-secondary" />
              {t('hackathon_badge')}
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-[1.02] tracking-normal text-base-content sm:text-6xl lg:text-7xl">
              {activeSlide.title}
            </h1>
            <p className="mt-3 text-xl font-bold text-secondary sm:text-2xl">{activeSlide.subtitle}</p>
            <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-base-content/65 sm:text-base">
              {activeSlide.description}
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Link href={activeSlide.link} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[22px] bg-primary px-6 py-4 text-sm font-black uppercase tracking-wide text-primary-content shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] dark:bg-secondary dark:text-secondary-content">
              {activeSlide.buttonText}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/lieux" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[22px] border border-border bg-base-100 px-5 py-4 text-sm font-black text-base-content transition-all hover:border-secondary/50 active:scale-[0.98]">
              {t('discover')}
              <MapPin className="h-4 w-4 text-secondary" />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[440px] overflow-hidden rounded-[32px] bg-stone-950 shadow-2xl lg:min-h-[600px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={activeSlide.image}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0"
            >
              <Image src={activeSlide.image} alt={activeSlide.title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div className="min-w-0 text-white">
              <p className="text-[11px] font-black uppercase tracking-wider text-white/65">{t('scroll')}</p>
              <p className="mt-1 line-clamp-2 text-xl font-black leading-tight sm:text-2xl">{activeSlide.title}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => setCurrentSlide((value) => (value - 1 + slides.length) % slides.length)} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-stone-950 transition-all hover:bg-white active:scale-95" aria-label={t('previous_slide')}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setCurrentSlide((value) => (value + 1) % slides.length)} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-stone-950 transition-all hover:bg-white active:scale-95" aria-label={t('next_slide')}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-5 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[28px] border border-border bg-base-200 p-5 shadow-sm">
            <p className="text-3xl font-black text-base-content">{stat.value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-base-content/55">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-5 md:grid-cols-3">
        {featureCards.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Link key={feature.href} href={feature.href} className={`group rounded-[32px] border border-border bg-base-200 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${index === 0 ? 'md:col-span-1 md:row-span-2' : ''}`}>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-primary-content dark:bg-secondary dark:text-secondary-content">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-black uppercase tracking-wide text-secondary-content">{feature.tag}</span>
              </div>
              <h2 className="text-xl font-black tracking-normal text-base-content">{feature.title}</h2>
              <p className="mt-3 line-clamp-4 text-sm font-medium leading-6 text-base-content/62">{feature.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-secondary">
                {t('features.access')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          )
        })}
      </section>
    </main>
  )
}
