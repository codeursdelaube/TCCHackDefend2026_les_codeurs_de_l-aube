'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const KEY = 'heritogo_splash_shown'
    if (!sessionStorage.getItem(KEY)) {
      setVisible(true)
      sessionStorage.setItem(KEY, '1')
      const id = window.setTimeout(() => setVisible(false), 2400)
      return () => window.clearTimeout(id)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#1B7E4B' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.05 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-2xl">
              <Image src="/logo.png" alt="HeriTogo" fill className="object-contain p-2" priority />
            </div>

            <div className="text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white">HeriTogo</h1>
              <p className="mt-1 text-sm font-medium text-white/75">Découvrez le Togo authentique</p>
            </div>
          </motion.div>

          {/* Barre de progression */}
          <motion.div
            className="absolute bottom-14 left-0 right-0 mx-auto w-28 overflow-hidden rounded-full bg-white/20"
            style={{ height: 3 }}
          >
            <motion.div
              className="h-full rounded-full bg-white"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-7 text-[11px] font-semibold text-white/50 tracking-widest uppercase"
          >
            TCC Hack &amp; Defend 2026
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
