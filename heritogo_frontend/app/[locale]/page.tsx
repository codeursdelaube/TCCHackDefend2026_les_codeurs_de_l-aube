'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Globe2, Landmark, Languages, MapPin, Utensils, Users, Wifi } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type Slide = {
  image: string
  title: string
  subtitle: string
  description: string
  cta: string
  href: '/scan' | '/lieux' | '/cuisine'
  icon: typeof Camera
}

const destinations = [
  { image: '/Sites/palais_de_lome.webp', key: 'maritime', href: '/regions' as const },
  { image: '/Sites/kpalimé.jpg', key: 'plateaux', href: '/regions' as const },
  { image: '/Sites/koutamakou.jpg', key: 'kara', href: '/regions' as const },
]

export default function AccueilPage() {
  const t = useTranslations('Accueil')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [paused, setPaused] = useState(false)

  const slides = useMemo<Slide[]>(() => [
    { image: '/deuxlions.png', title: t('slides.0.title'), subtitle: t('slides.0.subtitle'), description: t('slides.0.description'), cta: t('slides.0.buttonText'), href: '/scan', icon: Camera },
    { image: '/Hero2.png', title: t('slides.1.title'), subtitle: t('slides.1.subtitle'), description: t('slides.1.description'), cta: t('slides.1.buttonText'), href: '/lieux', icon: MapPin },
    { image: '/fufuhero.png', title: t('slides.2.title'), subtitle: t('slides.2.subtitle'), description: t('slides.2.description'), cta: t('slides.2.buttonText'), href: '/cuisine', icon: Utensils },
  ], [t])

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => setCurrentSlide((index) => (index + 1) % slides.length), 5500)
    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  const previous = () => setCurrentSlide((index) => (index - 1 + slides.length) % slides.length)
  const next = () => setCurrentSlide((index) => (index + 1) % slides.length)
  const slide = slides[currentSlide]
  const SlideIcon = slide.icon

  const categories = [
    { href: '/lieux' as const, label: t('categories.monuments'), icon: Landmark },
    { href: '/scan' as const, label: t('categories.scan'), icon: Camera },
    { href: '/cuisine' as const, label: t('categories.cuisine'), icon: Utensils },
    { href: '/guides' as const, label: t('categories.guides'), icon: Users },
  ]

  return (
    <main className="min-h-screen bg-background pb-28 pt-16 text-foreground">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 sm:px-6 lg:px-8">
        <section>
          <div
            className="app-card relative isolate min-h-[360px] overflow-hidden sm:min-h-[520px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.image}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <Image src={slide.image} alt="" fill priority sizes="(max-width: 768px) 100vw, 1152px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-scrim via-scrim/45 to-transparent" />
              </motion.div>
            </AnimatePresence>

            <div className="relative flex min-h-[360px] flex-col justify-end p-5 pb-4 text-card sm:min-h-[520px] sm:justify-between sm:p-8">

              <AnimatePresence mode="wait">
                <motion.div key={slide.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }} className="max-w-xl">
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"><SlideIcon className="h-3.5 w-3.5" /> {slide.subtitle}</span>
                  <h2 className="mb-2 text-3xl font-bold leading-none text-card sm:mb-3 sm:text-6xl">{slide.title}</h2>
                  <p className="mb-4 max-w-md text-xs font-medium leading-relaxed text-card/90 sm:mb-6 sm:text-base">{slide.description}</p>
                  <Link href={slide.href} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] focus-visible:scale-[1.02]">
                    {slide.cta}<ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 flex items-center justify-between gap-3 sm:mt-0">
                <div className="flex gap-2" aria-label="Choisir une expérience">
                  {slides.map((item, index) => (
                    <button key={item.image} type="button" onClick={() => setCurrentSlide(index)} aria-label={t('go_to_slide', { index: index + 1 })} aria-current={index === currentSlide} className={`h-2.5 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-primary' : 'w-2.5 bg-card/70 hover:bg-card'}`} />
                  ))}
                </div>
                <div className="hidden gap-2 sm:flex">
                  <button type="button" onClick={previous} aria-label={t('previous_slide')} className="grid h-10 w-10 place-items-center rounded-full bg-card/90 text-foreground transition-colors hover:bg-card"><ChevronLeft className="h-5 w-5" /></button>
                  <button type="button" onClick={next} aria-label={t('next_slide')} className="grid h-10 w-10 place-items-center rounded-full bg-card/90 text-foreground transition-colors hover:bg-card"><ChevronRight className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: '29', label: t('stats_short.sites'), icon: Landmark },
            { value: '5', label: t('stats_short.regions'), icon: Globe2 },
            { value: '4', label: t('stats_short.languages'), icon: Languages },
            { value: 'PWA', label: t('stats_subs.pwa'), icon: Wifi },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} className="app-card flex min-h-24 items-center gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
              <div><p className="text-xl font-bold leading-none text-foreground">{value}</p><p className="mt-1 text-[11px] font-semibold leading-tight text-muted-foreground">{label}</p></div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{t('app_name')}</p><h2 className="text-2xl font-bold">{t('treasures_title')}</h2></div><Link href="/lieux" className="text-sm font-bold text-primary hover:underline">{t('incontournables_see_all')}</Link></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="app-card group flex min-h-32 flex-col justify-between p-4 transition-transform hover:-translate-y-1"><span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="h-5 w-5" /></span><span className="text-sm font-bold leading-snug">{label}</span></Link>)}
          </div>
        </section>

        <section className="space-y-4">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{t('destinations_subtitle')}</p><h2 className="text-2xl font-bold">{t('destinations_title')}</h2></div>
          <div className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {destinations.map(({ image, key, href }) => <Link key={key} href={href} className="app-card relative h-72 w-[78vw] shrink-0 snap-start overflow-hidden sm:w-auto"><Image src={image} alt="" fill sizes="(max-width: 640px) 78vw, 33vw" className="object-cover" /><div className="absolute inset-0 bg-linear-to-t from-scrim/80 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5 text-card"><span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">{t(`regions.${key}.badge`)}</span><h3 className="text-xl font-bold">{t(`regions.${key}.name`)}</h3><p className="mt-1 text-sm text-card/85">{t(`regions.${key}.tag`)}</p></div></Link>)}
          </div>
        </section>

        <section className="app-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">{t('scanner_section.badge')}</p><h2 className="mt-1 text-2xl font-bold">{t('scanner_section.title')}</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t('scanner_section.desc')}</p></div>
          <Link href="/scan" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"><Camera className="h-4 w-4" />{t('scanner_section.cta')}</Link>
        </section>
      </div>
    </main>
  )
}