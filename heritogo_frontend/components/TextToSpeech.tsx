'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { useLocale } from 'next-intl'

interface TextToSpeechProps {
  text: string
  className?: string
}

const LANG_MAP: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  es: 'es-ES',
  zh: 'zh-CN',
}

export default function TextToSpeech({ text, className }: TextToSpeechProps) {
  const locale = useLocale()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading]   = useState(false)
  const [supported] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return 'speechSynthesis' in window
  })
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [text, locale])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis?.cancel()
      }
    }
  }, [])

  const toggleSpeech = () => {
    if (!supported) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    setIsLoading(true)
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = LANG_MAP[locale] || 'fr-FR'
    utterance.rate  = 0.92
    utterance.pitch = 1.0
    utterance.volume = 1.0

    // Chercher une voix locale de qualité
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith(LANG_MAP[locale]?.split('-')[0] || 'fr') &&
      v.localService
    ) || voices.find(v =>
      v.lang.startsWith(LANG_MAP[locale]?.split('-')[0] || 'fr')
    )
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => {
      setIsLoading(false)
      setIsSpeaking(true)
    }
    utterance.onend   = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsLoading(false)
      setIsSpeaking(false)
    }

    utteranceRef.current = utterance

    // Workaround Chrome bug — voices pas prêtes immédiatement
    setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 100)
  }

  if (!supported) return null

  return (
    <button
      onClick={toggleSpeech}
      aria-label={isSpeaking ? 'Arrêter la lecture' : 'Écouter'}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white transition-all active:scale-95 ${className}`}
      style={{
        background: isSpeaking ? '#BF360C' : '#3B2519',
      }}
    >
      {isLoading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : isSpeaking
          ? <VolumeX className="h-4 w-4" />
          : <Volume2 className="h-4 w-4" />
      }
      {isLoading
        ? 'Chargement...'
        : isSpeaking
          ? 'Arrêter'
          : 'Écouter'
      }
    </button>
  )
}
