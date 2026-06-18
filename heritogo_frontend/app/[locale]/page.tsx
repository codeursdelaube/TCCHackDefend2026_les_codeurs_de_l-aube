'use client'

/**
 * Page d'accueil (Homepage)
 * Présentation de l'application HériTogo avec :
 * - Section hero avec logo et CTA
 * - Statistiques de l'application
 * - Fonctionnalités principales
 * - CTA pour commencer
 */
import React, { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import {
  Scan, Map, Utensils, Sparkles, ArrowRight,
  Users, MapPin, Star, Trophy, Globe, WifiOff, ChevronLeft, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

export default function AcceuilPage() {
  const t = useTranslations('Accueil')
  const [isOnline, setIsOnline] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: '/deuxlions.png',
      title: t('slides.0.title'),
      description: t('slides.0.description'),
      buttonText: t('slides.0.buttonText'),
      link: '/scan'
    },
    {
      image: '/Hero2.png',
      title: t('slides.1.title'),
      description: t('slides.1.description'),
      buttonText: t('slides.1.buttonText'),
      link: '/lieux'
    },
    {
      image: '/fufuhero.png',
      title: t('slides.2.title'),
      description: t('slides.2.description'),
      buttonText: t('slides.2.buttonText'),
      link: '/cuisine'
    }
  ]

  // Auto-play slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  // Détecter le statut de connexion
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update) }
  }, [])

  const features = [
    {
      title: t('features.scan_title'),
      description: t('features.scan_desc'),
      icon: <Scan className="h-6 w-6 text-heritage-emerald" />,
      link: '/scan',
      tag: t('features.scan_tag'),
      tagColor: 'bg-heritage-emerald/10 text-heritage-emerald',
      iconBg: 'bg-heritage-emerald/10',
    },
    {
      title: t('features.geo_title'),
      description: t('features.geo_desc'),
      icon: <Map className="h-6 w-6 text-heritage-ochre" />,
      link: '/lieux',
      tag: t('features.geo_tag'),
      tagColor: 'bg-heritage-ochre/10 text-heritage-ochre',
      iconBg: 'bg-heritage-ochre/10',
    },
    {
      title: t('features.cuisine_title'),
      description: t('features.cuisine_desc'),
      icon: <Utensils className="h-6 w-6 text-heritage-coral" />,
      link: '/cuisine',
      tag: t('features.cuisine_tag'),
      tagColor: 'bg-heritage-coral/10 text-heritage-coral',
      iconBg: 'bg-heritage-coral/10',
    },
  ]

  const statsData = [
    { target: 120, suffix: '+', label: t('stats.lieux'), icon: <MapPin size={20} className="text-heritage-emerald" /> },
    { target: 7, suffix: '', label: t('stats.regions'), icon: <Globe size={20} className="text-heritage-ochre" /> },
    { target: 500, suffix: '+', label: t('stats.explorers'), icon: <Users size={20} className="text-heritage-coral" /> },
    { target: 4, suffix: '.8★', label: t('stats.rating'), icon: <Star size={20} className="text-heritage-emerald" /> },
  ]

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-base-100 pb-24">

      {/* Bandeau offline */}
      {!isOnline && (
        <div className="fixed top-12 left-0 right-0 z-[9999] flex items-center justify-center
                     gap-2 py-2 px-4 bg-heritage-coral text-white text-xs font-medium">
          <WifiOff size={12} />
          {t('offline_banner')}
        </div>
      )}

      {/* Hero Section with Carousel */}
      <section className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-base-200">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]"
            >
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-2xl"
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-base md:text-lg text-white/80 mb-6 leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                  <Link href={slides[currentSlide].link}>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white bg-heritage-emerald hover:bg-heritage-emerald-light active:scale-95 transition-all duration-200 shadow-lg">
                      {slides[currentSlide].buttonText}
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-200"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all duration-200"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentSlide === index ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-base-100 border-y border-base-content/10 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsData.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 mb-2">
                {stat.icon}
                <span className="text-3xl font-black text-base-content">
                  {stat.target}{stat.suffix}
                </span>
              </div>
              <span className="text-xs text-base-content/60 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-base-content mb-4">
            {t.rich('features_header.title', {
              highlight: (chunks) => <span className="text-heritage-emerald">{chunks}</span>
            })}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-base-100 rounded-3xl p-6 border border-base-content/10 hover:border-heritage-emerald/30 hover:shadow-lg transition-all duration-300">
              <div className={`p-3 w-fit rounded-2xl mb-4 ${feature.iconBg}`}>
                {feature.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full mb-3 inline-block ${feature.tagColor}`}>
                {feature.tag}
              </span>
              <h3 className="text-lg font-bold text-base-content mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-base-content/60 mb-4 leading-relaxed">
                {feature.description}
              </p>
              <Link href={feature.link} className="inline-flex items-center gap-2 text-xs font-bold text-heritage-emerald hover:gap-3 transition-all">
                {t('features.access')}
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-heritage-emerald to-heritage-emerald-light rounded-3xl p-8 sm:p-12 text-white">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            {t('how_it_works.start')}
          </h2>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            {t('how_it_works.footer_info')}
          </p>
          <Link href="/scan">
            <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-heritage-emerald bg-base-100 hover:bg-base-content/90 active:scale-95 transition-all duration-200 shadow-xl mx-auto">
              <Sparkles size={18} />
              {t('slides.0.buttonText')}
            </button>
          </Link>
        </div>
      </section>

    </main>
  )
}