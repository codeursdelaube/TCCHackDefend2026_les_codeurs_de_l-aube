'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const SPLASH_KEY = 'heritogo_splash_shown'
const SPLASH_MS = 2800

export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_KEY)) {
      setVisible(false)
      return
    }

    const id = window.setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, '1')
      setVisible(false)
    }, SPLASH_MS)

    return () => window.clearTimeout(id)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: '#FBF6EF' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: 'easeOut' }}
        >
          <div className="flex flex-col items-center px-6">
            <motion.div
              initial={reduceMotion ? false : { scale: 0.96 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-28 w-28 items-center justify-center"
            >
              <span className="absolute inset-0 rounded-full border border-accent/35" />
              <span className="absolute inset-2 rounded-full bg-white shadow-[0_12px_40px_rgba(42,30,22,0.08)]" />
              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                <Image
                  src="/icons/icon-512x512.png"
                  alt="HeriTogo"
                  fill
                  priority
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            </motion.div>

            <div className="mt-7 text-center">
              <p className="font-serif text-3xl font-semibold tracking-tight text-[#2A1E16]">
                HeriTogo
              </p>
              <p className="mt-2 text-sm font-medium tracking-wide text-[#7A6A5C]">
                Patrimoine &amp; voyages au Togo
              </p>
            </div>
          </div>

          <div className="absolute bottom-16 left-1/2 w-32 -translate-x-1/2 overflow-hidden rounded-full bg-[#B5502E]/15">
            <motion.div
              className="h-[3px] rounded-full bg-[#B5502E]"
              initial={{ width: reduceMotion ? '100%' : '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: reduceMotion ? 0 : 1.9, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
