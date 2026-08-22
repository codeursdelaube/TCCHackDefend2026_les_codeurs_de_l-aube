'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Sparkles } from 'lucide-react'

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Vérifier si le splash a déjà été affiché dans la session
    const hasSeenSplash = sessionStorage.getItem('heritogo_splash_seen')
    
    if (hasSeenSplash) {
      setIsVisible(false)
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(false)
      sessionStorage.setItem('heritogo_splash_seen', 'true')
    }, 1400)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#2A1C14] text-[#FDFBF8] select-none"
        >
          {/* Aura lumineuse subtile */}
          <div className="absolute h-72 w-72 rounded-full bg-[#C99A3E]/15 blur-3xl" />

          {/* Logo animé */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center"
          >
            <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#A9754A] to-[#3B2519] p-0.5 shadow-2xl border border-[#C99A3E]/30">
              <div className="flex h-full w-full items-center justify-center rounded-[26px] bg-[#2A1C14]">
                <Compass className="h-10 w-10 text-[#C99A3E] animate-spin-slow" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-1 -top-1"
              >
                <Sparkles className="h-5 w-5 text-[#C99A3E]" />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Heri<span className="text-[#C99A3E]">Togo</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#F1E7D8]"
            >
              Votre compagnon de voyage
            </motion.p>

            {/* Barre de progression subtile */}
            <div className="mt-8 h-1 w-32 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#C99A3E] to-transparent"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
