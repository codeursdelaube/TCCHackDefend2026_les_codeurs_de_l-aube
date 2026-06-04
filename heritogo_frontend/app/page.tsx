'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Scan, Map, Utensils, Sparkles, ArrowRight,
  PlayCircle, Volume2, ChevronDown, Users,
  MapPin, Camera, Mic2, Star
} from 'lucide-react'

import HeroBanner1 from '@/public/Hero1.jpg'
import HeroBanner2 from '@/public/Hero2.jpg'
import HeroBanner3 from '@/public/Hero3.jpg'

import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import { StaticImageData } from 'next/image'


/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface SlideItem {
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  image: StaticImageData
  accent: string
}

interface FeatureCardItem {
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
  link: string
  step: number
  color: string
  borderColor: string
}

interface StatItem {
  value: string
  label: string
  icon: React.ReactNode
}

/* ─────────────────────────────────────────────────────────────────────────────
   SOUS-COMPOSANTS
───────────────────────────────────────────────────────────────────────────── */

/** Compteur animé (0 → valeur finale) */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 1400
    const steps = 40
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

/** Carte feature avec animation au scroll */
function FeatureCard({ feature, index }: { feature: FeatureCardItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-3xl overflow-hidden
                 bg-base-200 border border-base-content/8
                 hover:border-base-content/20 hover:-translate-y-1.5
                 transition-all duration-300 shadow-sm hover:shadow-xl"
    >
      {/* Bande colorée supérieure */}
      <div className={`h-1 w-full ${feature.color}`} />

      <div className="flex flex-col flex-1 p-7 md:p-8">
        {/* Numéro d'étape */}
        <span className="text-7xl font-black text-base-content/5 leading-none select-none mb-4">
          {String(feature.step).padStart(2, '0')}
        </span>

        {/* Icône */}
        <div className={`p-3.5 w-fit rounded-2xl mb-5
                         bg-base-300 border border-base-content/5
                         group-hover:scale-105 transition-transform duration-300
                         ${feature.borderColor}`}>
          {feature.icon}
        </div>

        {/* Titre + badge */}
        <div className="flex flex-wrap items-start gap-2 mb-3">
          <h4 className="text-lg font-bold text-base-content group-hover:text-green-500
                         transition-colors leading-tight">
            {feature.title}
          </h4>
          {feature.badge && (
            <span className="text-[10px] font-mono font-semibold
                             bg-base-300 border border-base-content/10
                             text-base-content/40 px-2 py-0.5 rounded-md mt-0.5">
              {feature.badge}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-base-content/55 text-sm leading-relaxed flex-1 mb-6">
          {feature.description}
        </p>

        {/* CTA bas */}
        <Link
          href={feature.link}
          className="inline-flex items-center gap-1.5 text-xs font-bold
                     text-base-content/40 group-hover:text-green-500
                     transition-all duration-200 group-hover:gap-2.5 w-fit"
        >
          <span>Accéder</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────────────────────────────────────── */
export default function AcceuilPage() {

  const [activeSlide, setActiveSlide] = useState(0)
  const [ctaVisible, setCtaVisible] = useState(false)

  // Affiche le bouton CTA flottant après avoir scrollé
  useEffect(() => {
    const onScroll = () => setCtaVisible(window.scrollY > window.innerHeight * 0.6)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Données ── */
  const slides: SlideItem[] = [
    {
      title: "Heritogo",
      subtitle: "Le Guide Touristique Intelligent",
      description: "Identifiez les monuments nationaux en un instant grâce à notre IA Gemini. Pointez votre caméra, découvrez l'histoire.",
      buttonText: "Scanner un monument",
      buttonLink: "/scan",
      image: HeroBanner1,
      accent: "from-emerald-500 to-green-600"
    },
    {
      title: "Explorez",
      subtitle: "Naviguez vers l'Inconnu",
      description: "Découvrez les sites secrets du Togo grâce à la géolocalisation. Les lieux les plus proches s'affichent en temps réel.",
      buttonText: "Explorer les lieux",
      buttonLink: "/lieux",
      image: HeroBanner2,
      accent: "from-amber-500 to-orange-500"
    },
    {
      title: "Savourez",
      subtitle: "Le Patrimoine Culinaire",
      description: "Fufu, Ablo, Kom… Découvrez les saveurs authentiques du Togo et les restaurants qui les perpétuent près de chez vous.",
      buttonText: "Découvrir la cuisine",
      buttonLink: "/cuisine",
      image: HeroBanner3,
      accent: "from-emerald-400 to-teal-500"
    }
  ]

  const stats: StatItem[] = [
    {
      value: '',
      label: 'Sites répertoriés',
      icon: <MapPin size={18} className="text-green-500" />
    },
    {
      value: '',
      label: 'Photos analysées',
      icon: <Camera size={18} className="text-amber-500" />
    },
    {
      value: '',
      label: 'Utilisateurs actifs',
      icon: <Users size={18} className="text-emerald-500" />
    },
    {
      value: '',
      label: 'Note moyenne',
      icon: <Star size={18} className="text-yellow-400" />
    }
  ]

  const statsData = [
    { target: 120, suffix: '+', label: 'Sites répertoriés', icon: <MapPin size={18} className="text-green-500" /> },
    { target: 4800, suffix: '+', label: 'Photos analysées', icon: <Camera size={18} className="text-amber-500" /> },
    { target: 1200, suffix: '+', label: 'Utilisateurs actifs', icon: <Users size={18} className="text-emerald-500" /> },
    { target: 4, suffix: '.8★', label: 'Note moyenne', icon: <Star size={18} className="text-yellow-400" /> }
  ]

  const features: FeatureCardItem[] = [
    {
      title: "Scanner Intelligent Gemini IA",
      description: "Prenez ou importez une photo d'un monument historique. Notre app transmet l'image à l'API Gemini 1.5 Flash, analyse l'élément en temps réel et vous renvoie son histoire complète.",
      icon: <Scan className="h-5 w-5 text-green-500" />,
      badge: "Gemini 1.5 Flash",
      link: "/scan",
      step: 1,
      color: "bg-gradient-to-r from-green-500/70 to-emerald-400/70",
      borderColor: "group-hover:border-green-500/30"
    },
    {
      title: "Géolocalisation & Proximité",
      description: "Explorez la base de données des sites togolais. L'app utilise vos coordonnées GPS pour calculer les distances en kilomètres via la formule de Haversine.",
      icon: <Map className="h-5 w-5 text-amber-500" />,
      badge: "Algorithme Haversine",
      link: "/lieux",
      step: 2,
      color: "bg-gradient-to-r from-amber-500/70 to-orange-400/70",
      borderColor: "group-hover:border-amber-500/30"
    },
    {
      title: "Patrimoine Culinaire & Restos",
      description: "Découvrez l'histoire des plats traditionnels (Fufu, Ablo, Kom). Sélectionnez une spécialité pour lister les maquis et restaurants les plus proches.",
      icon: <Utensils className="h-5 w-5 text-teal-500" />,
      badge: "FastAPI Backend",
      link: "/cuisine",
      step: 3,
      color: "bg-gradient-to-r from-teal-500/70 to-emerald-500/70",
      borderColor: "group-hover:border-teal-500/30"
    }
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Ouvrez l'app",
      description: "Accédez à Heritogo depuis votre navigateur, sans installation requise.",
      icon: <Sparkles size={20} className="text-green-500" />
    },
    {
      step: "02",
      title: "Scannez ou explorez",
      description: "Prenez une photo d'un monument ou activez la géolocalisation pour découvrir les sites proches.",
      icon: <Scan size={20} className="text-amber-500" />
    },
    {
      step: "03",
      title: "Écoutez l'histoire",
      description: "L'IA identifie le lieu et la synthèse vocale vous en raconte l'histoire à voix haute.",
      icon: <Mic2 size={20} className="text-emerald-500" />
    }
  ]

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-base-100">

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO CARROUSEL PLEIN ÉCRAN
          Animations gérées via Framer Motion + état activeSlide
          (plus fiable que les classes CSS Swiper)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen w-full overflow-hidden">
        <Swiper
          spaceBetween={0}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          centeredSlides
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          modules={[Autoplay, EffectFade, Pagination]}
          onSlideChange={(swiper) => setActiveSlide(swiper.activeIndex)}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="relative h-full w-full">
              {/* Image de fond */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>

              {/* Overlay dégradé — toujours sombre pour lisibilité */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10 z-10" />

              {/* Grain subtil */}
              <div className="absolute inset-0 z-10 opacity-[0.03]"
                   style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* ── Contenu Hero — superposé, animé via activeSlide ── */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center pointer-events-auto"
            >
              {/* Pill catégorie */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6
                           rounded-full border border-white/20 bg-white/8
                           backdrop-blur-sm text-white/80 text-xs font-semibold tracking-widest uppercase"
              >
                <Sparkles size={11} className="text-green-400" />
                {slides[activeSlide].subtitle}
              </motion.div>

              {/* Titre principal */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.55 }}
                className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter
                           text-white leading-[0.9] mb-6"
              >
                {slides[activeSlide].title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="max-w-lg text-base md:text-lg text-white/70 leading-relaxed mb-10"
              >
                {slides[activeSlide].description}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 items-center"
              >
                <Link href={slides[activeSlide].buttonLink}>
                  <button className={`
                    btn btn-lg rounded-full px-8 border-none text-white font-bold
                    bg-gradient-to-r ${slides[activeSlide].accent}
                    hover:scale-105 active:scale-95
                    shadow-2xl transition-all duration-200
                    flex items-center gap-2
                  `}>
                    <PlayCircle size={18} />
                    {slides[activeSlide].buttonText}
                  </button>
                </Link>
                <a href="#fonctionnalites">
                  <button className="btn btn-lg rounded-full border border-white/30
                                     bg-white/8 backdrop-blur-sm text-white/90
                                     hover:bg-white/15 hover:border-white/50
                                     px-8 transition-all duration-200">
                    Découvrir
                  </button>
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Indicateur scroll ── */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30
                     flex flex-col items-center gap-2 text-white/40"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-mono tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </motion.div>

        {/* Badge Hackathon */}
        <div className="absolute top-6 right-6 z-30 hidden md:block">
          <div className="px-3 py-1.5 rounded-full border border-white/15
                          bg-white/5 backdrop-blur-sm text-[10px] font-mono
                          text-white/40 tracking-wider">
            #TCCHackDefend2026
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2 — BANDE STATS
          Compteurs animés pour crédibiliser l'app
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-base-200 border-y border-base-content/8 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
          {statsData.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center
                                    md:border-r md:last:border-r-0 border-base-content/8 px-4">
              <div className="flex items-center gap-1.5 mb-1">
                {stat.icon}
                <span className="text-2xl font-black text-base-content">
                  <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                </span>
              </div>
              <span className="text-xs text-base-content/50 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3 — FONCTIONNALITÉS
          Cards avec animations scroll-triggered
      ═══════════════════════════════════════════════════════════════════════ */}
      <section
        id="fonctionnalites"
        className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-6"
      >
        {/* Halos décoratifs */}
        <div className="absolute top-1/3 left-0 w-96 h-96 bg-green-500/4
                        blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-amber-500/4
                        blur-[100px] rounded-full pointer-events-none" />

        {/* En-tête */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold text-green-500 uppercase tracking-[0.2em] mb-3
                       flex items-center justify-center gap-1.5"
          >
            <Sparkles size={12} />
            Valorisation du patrimoine national
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black tracking-tight text-base-content uppercase"
          >
            Trois outils,<br />
            <span className="text-green-500">une expérience</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-base-content/50 max-w-lg mx-auto text-sm md:text-base leading-relaxed"
          >
            Heritogo combine IA et géolocalisation pour une immersion complète
            au cœur de la culture et de la gastronomie togolaise.
          </motion.p>
        </div>

        {/* Grille des cartes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>

        {/* ── Bannière Audio TTS ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-base-content/8
                     bg-gradient-to-r from-base-200 via-emerald-500/5 to-base-200 p-7 md:p-8"
        >
          <div className="absolute inset-0 opacity-[0.015]"
               style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Ccircle cx='30' cy='30' r='1' fill='%23fff'/%3E%3C/svg%3E\")" }} />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-md animate-pulse" />
                <div className="relative p-4 bg-emerald-500/15 border border-emerald-500/25
                                rounded-2xl text-emerald-400">
                  <Volume2 size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-base-content mb-1">
                  Synthèse Vocale Intégrée
                </h4>
                <p className="text-sm text-base-content/55 max-w-md leading-relaxed">
                  Écoutez {"l'"}histoire des monuments directement dans votre navigateur.
                  Aucune installation — le TTS natif parle à votre place.
                </p>
              </div>
            </div>
            <Link href="/scan" className="shrink-0">
              <button className="btn rounded-full px-6 bg-emerald-500/15 border-emerald-500/30
                                 text-emerald-400 hover:bg-emerald-500/25 font-semibold text-sm
                                 transition-all flex items-center gap-2">
                Essayer
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4 — COMMENT ÇA MARCHE
          Parcours utilisateur en 3 étapes
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-base-200 border-t border-base-content/8">
        <div className="max-w-5xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em] mb-3">
              Simple & rapide
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-base-content uppercase tracking-tight">
              Comment ça marche ?
            </h2>
          </div>

          {/* Étapes */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Ligne de connexion (desktop) */}
            <div className="hidden md:block absolute top-12 left-[17%] right-[17%] h-px
                            bg-gradient-to-r from-transparent via-base-content/15 to-transparent" />

            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                {/* Cercle numéro */}
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-full bg-base-100 border-2 border-base-content/10
                                  flex items-center justify-center z-10 relative
                                  shadow-sm">
                    {step.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 text-[10px] font-black
                                   bg-base-content/8 text-base-content/40
                                   w-5 h-5 rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-base-content mb-2">{step.title}</h3>
                <p className="text-sm text-base-content/50 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA central */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-14"
          >
            <Link href="/scan">
              <button className="btn btn-lg rounded-full px-10 border-none text-white font-bold
                                 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-500
                                 hover:scale-105 active:scale-95
                                 shadow-xl shadow-green-500/20 transition-all duration-200
                                 flex items-center gap-2 mx-auto">
                <Sparkles size={18} />
                {"Commencer l'aventure"}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          CTA FLOTTANT — apparaît après scroll du hero
          Donne un accès permanent à l'action principale
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {ctaVisible && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Link href="/scan">
              <button className="btn rounded-full px-5 py-3 h-auto border-none
                                 bg-gradient-to-r from-emerald-500 to-green-600
                                 text-white font-bold shadow-2xl shadow-green-500/30
                                 hover:scale-105 active:scale-95
                                 transition-all duration-200
                                 flex items-center gap-2 text-sm">
                <Scan size={16} />
                Scanner
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  )
}
